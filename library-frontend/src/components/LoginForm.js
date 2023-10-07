import { gql, useMutation } from '@apollo/client'
import { useState } from 'react'

const LOGIN_USER = gql`
    mutation LoginUser($username: String!, $password: String!) {
        login(username: $username, password: $password) {
        value
        }
    }
    `

const LoginForm = (props) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loginUser, {data, error}] = useMutation(LOGIN_USER)

    if (!props.show) {
        return null
    }

    const submit = async (event) => {
        event.preventDefault()

        loginUser({ variables: { username, password } })

        setUsername('')
        setPassword('')
    }

    if (data && !props.token) {
        const token = data.login.value
        props.setToken(token)
        localStorage.setItem('library-user-token', token)
    }

    if (error) {
        console.log(error)
    }

    return (
        <div>
            <form onSubmit={submit}>
                <div>
                    username
                    <input
                        value={username}
                        onChange={({ target }) => setUsername(target.value)}
                    />
                </div>
                <div>
                    password
                    <input
                        type='password'
                        value={password}
                        onChange={({ target }) => setPassword(target.value)}
                    />
                </div>
                <button type='submit'>login</button>
            </form>
        </div>
    )
}

export default LoginForm