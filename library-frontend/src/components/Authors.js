import { gql, useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'
import Select from 'react-select'

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`
const EDIT_AUTHOR_BORN = gql`
  mutation editAuthorBorn($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
    }
  }
`

const EditAuthorBorn = (props) => {
  const [born, setBorn] = useState('')
  const [name, setName] = useState('')

  const [changeBorn] = useMutation(EDIT_AUTHOR_BORN, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })

  const submit = (event) => {
    event.preventDefault()

    changeBorn({ variables: { name: name, setBornTo: Number(born) } })

    setBorn('')
  }

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          name{' '}
          <Select
            value={props.name}
            onChange={(a) => setName(a.value)}
            options={props.authors.map((a) => ({ value: a.name, label: a.name }))}
          />
        </div>
        <div>
          born{' '}
          <input
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}


const Authors = (props) => {
  const query = useQuery(ALL_AUTHORS, {
    pollInterval: 2000,
  })


  if (!props.show) {
    return null
  }
  if (query.loading) {
    return <div>loading...</div>
  }
  const authors = query.data.allAuthors

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <EditAuthorBorn authors={authors} />
    </div>
  )
}

export default Authors
