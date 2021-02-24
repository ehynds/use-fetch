import { useEffect } from 'react';
import { useFetch, useFetchState } from './src';

type Book = {
  title: string;
  author: string;
};

const useBooks = () => {
  const { loading, data, error, setLoading, setData, setError } = useFetchState<Book[]>();
  const { get } = useFetch();

  useEffect(() => {
    setLoading(true);
    
    const { abort, req } = get<Book[]>('https://my-api.com/books/list', {
      limit: 2
    });

    req
      .then(({ json: books }) => setData(books))
      .catch(err => setError(err));

    return () => {
      abort();
    };
  }, []);

  return {
    loading,
    data,
    error
  };
}

export const BookList = () => {
  const { loading, data, error } = useBooks();

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>An error occurred: {error.message}</div>;
  }

  return (
    <>
      <h1>My books:</h1>

      <ul>
        {data.map((book) => (
          <li key={book.title}>
            {book.title} by {book.author}
          </li>
        ))}
      </ul>
    </>
  );
};
