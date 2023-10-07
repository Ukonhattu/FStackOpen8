import { gql, useQuery } from '@apollo/client'
import { useState } from 'react'

const ALL_BOOKS = gql`
  query allBooks($genre: String) {
    allBooks(genre: $genre) {
      title
      author {
        name
      }
      published
      genres
    }
  }
`

const Books = (props) => {
  const [genre, setGenre] = useState('')
  const query = useQuery(ALL_BOOKS, {
    variables: { genre },
    pollInterval: 2000,
  })
  if (!props.show) {
    return null
  }
  if (query.loading) {
    return <div>loading...</div>
  }
  const books = query.data.allBooks
  const genres = [...new Set(books.map((b) => b.genres).flat())]

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button onClick={() => setGenre('')}>all genres</button>
        {genres.map((g) => (
          <button key={g} onClick={() => setGenre(g)}>
            {g}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Books
