import { useQuery, gql } from "@apollo/client";

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
    `;

    const Recommended = (props) => {

        const query = useQuery(ALL_BOOKS, {
            variables: { genre: props.genre },
            pollInterval: 2000,
        });
        if (!props.show) {
            return null;
        }
        if (query.loading) {
            return <div>loading...</div>;
        }
        const books = query.data.allBooks;

        return (
            <div>
                <h2>recommended books</h2>

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
            </div>
        );
    }

    export default Recommended;