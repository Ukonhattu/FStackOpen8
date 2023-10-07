const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')
require('dotenv').config()
const bookModel = require('./models/book')
const authorModel = require('./models/author')
const userModel = require('./models/user')
const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')


/*
  you can remove the placeholder query once your first one has been implemented 
*/

const typeDefs = `
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }
  type Mutation {
    addBook(
        title: String!
        published: Int!
        author: String!
        genres: [String!]!
    ): Book

    editAuthor(
        name: String!
        setBornTo: Int!
    ): Author

    createUser(
      username: String!
      favoriteGenre: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token

    }

    type Book {
        title: String!
        published: Int!
        author: Author!
        id: ID!
        genres: [String!]!
    }

    type Author {
        name: String!
        id: ID!
        born: Int
        bookCount: Int!
    }

    type User {
      username: String!
      favoriteGenre: String!
      id: ID!
    }
    
    type Token {
      value: String!
    }
`

//mongo client
const url = process.env.MONGODB_URI
mongoose.set('strictQuery', false)
mongoose.connect(url)

const resolvers = {
  Query: {
    bookCount: () => bookModel.collection.countDocuments(),
    authorCount: () => authorModel.collection.countDocuments(),
    allBooks: (root, args) => {
      const author_id = authorModel.findOne({ name: args.author })
      try {
        if (!args.author && !args.genre) {
          return bookModel.find({}).populate('author').exec()
      }
      if (args.author && !args.genre) {
          return bookModel.find({ author: author_id }).populate('author').exec()
      }
      if (!args.author && args.genre) {
          return bookModel.find({ genres: { $in: [args.genre] } }).populate('author').exec()
      }
      if (args.author && args.genre) {
          return bookModel.find({ author: author_id, genres: { $in: [args.genre] } }).populate('author').exec()
      }
        
      } catch (error) {
        throw new GraphQLError('Error in allBooks resolver', {
          extensions: {
            error: error.message
          }
        })
      }

    },
    allAuthors: async () => {
      try {
        const authors = await authorModel.find({}).exec()
        const books = await bookModel.find({}).exec()
        return authors.map(author => {
            const bookCount = books.filter(book => book.author.toString() === author.id.toString()).length
            return { ...author._doc, bookCount }
        })
      } catch (error) {
        throw new GraphQLError('Error in allAuthors resolver', {
          extensions: {
            error: error.message
          }
        })
      }
    },
    me: (root, args, context) => {
      console.log(context)
      return context.currentUser
    }
  },
    Mutation: {
        addBook: async (root, args) => {
            const author = await authorModel.find({ name: args.author })
            if (author.length === 0) {
                const newAuthor = new authorModel({ name: args.author })
                try {
                await newAuthor.save()
                } catch (error) {
                  throw new GraphQLError('Error in addBook resolver when saving new author', {
                    extensions: {
                      error: error.message
                    }
                  })
                }
            }
            const authorToSave = await authorModel.findOne({ name: args.author })
            const book = { ...args, author: authorToSave }
            const newBook = new bookModel(book)
            try {
              await newBook.save()
            } catch (error) {
              throw new GraphQLError('Error in addBook resolver when saving new book', {
                extensions: {
                  error: error.message
                }
              })
            }
            return newBook
        },
        editAuthor: async (root, args) => {
          try {
            const author = await authorModel.findOne({ name: args.name })
            if (!author) {
                return null
            }
            author.born = args.setBornTo
            return authorModel.findByIdAndUpdate(author.id, author, { new: true })
          } catch (error) {
            throw new GraphQLError('Error in editAuthor resolver', {
              extensions: {
                error: error.message
              }
            })
          }
        },
        login: async (root, args) => {
          const user = await userModel.findOne({ username: args.username })
          if (!user || args.password !== 'secret') {
            throw new UserInputError('Wrong credentials')
          }
          const userForToken = {
            username: user.username,
            id: user._id
          }
          return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
        },
        createUser: async (root, args) => {
          const user = new userModel({ username: args.username, favoriteGenre: args.favoriteGenre })
          try {
            await user.save()
          } catch (error) {
            throw new UserInputError(error.message, {
              extensions: {
                error: error.message
              }
            })
          }
          return user
        }
    },
}





const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  introspection: true,
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), process.env.JWT_SECRET
      )
      const currentUser = await userModel
        .findById(decodedToken.id)
      return { currentUser }
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
