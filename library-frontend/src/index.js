import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { setContext } from '@apollo/client/link/context';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client'

const httpLink = createHttpLink({

  uri: 'http://localhost:4000',

});


const authLink = setContext((_, { headers }) => {

  // get the authentication token from local storage if it exists

  const token = localStorage.getItem('library-user-token');

  // return the headers to the context so httpLink can read them

  return {

    headers: {

      ...headers,

      authorization: token ? `Bearer ${token}` : "",

    }

  }

});
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})


ReactDOM.createRoot(document.getElementById('root')).render(
<ApolloProvider client={client}>
    <App />
</ApolloProvider>
)