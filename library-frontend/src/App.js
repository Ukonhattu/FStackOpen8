import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Logout from './components/Logout'
import { useEffect } from 'react'
import { useQuery, gql } from '@apollo/client'
import Recommended from './components/Recommended'

const ME = gql`
  query {
    me {
      username
      favoriteGenre
    }
  }
`

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const query = useQuery(ME)
  console.log(query)

  useEffect(() => {
    const token = localStorage.getItem('library-user-token')
    if (token) {
      setToken(token)
    }
  }, [])

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token != null || <button onClick={() => setPage('login')}>login</button>}
        {token != null && <button onClick={() => setPage('add')}>add book</button>}
        {token != null && query.data && <button onClick={() => setPage('recommended')}>recommended</button>}
        {token != null && <Logout setToken={setToken} />}
      </div>

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} />

      <LoginForm show={page === 'login'} setToken={setToken} token={token} />

      <Recommended show={page === 'recommended'} genre={query.data && query.data.me.favoriteGenre} />
    </div>
  )
}

export default App
