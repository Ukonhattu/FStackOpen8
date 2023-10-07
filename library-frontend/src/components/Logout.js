const Logout = ({setToken}) => {
    const logout = () => {
        setToken(null)
        localStorage.clear()
    }

    return (
        <button onClick={logout}>logout</button>
    )
}

export default Logout