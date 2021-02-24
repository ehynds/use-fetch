# `use-fetch`

![build status](https://github.com/ehynds/use-fetch/workflows/Build/badge.svg)

A small, fully-typed, low-level React hook that wraps the [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

## Install

```bash
$ npm i --save @ehynds/use-fetch

# or

$ yarn add @ehynds/use-fetch
```

## Usage

```js
import { useFetch } from '@ehynds/use-fetch';

const Component = () => {
  const { get /* or head | post | put | del | request */ } = useFetch();

  useEffect(() => {
    get('http://my.api').then(({ json }) => {
      console.log('Result:', json);
    });
  }, []);

  ...
}
```

#### More complex example

* Perform a `GET` request with query parameters
* Response body typings
* Abort in-flight requests when the effect unmounts
* Access to the raw `response` from `fetch`

```ts
import { useFetch } from '@ehynds/use-fetch';

type Book = {
  title: string;
  author: string;
};

const BookList = () => {
  const [ books, setBooks ] = useState<Book[]>([]);
  const { get } = useFetch();

  useEffect(() => {
    const { abort, req } = get<Book[]>('https://my-api.com/books/list', {
      limit: 2
    });

    req.then(({ res, json: books }) => {
      // `json` represents the JSON-parsed response body:
      setBooks(books);

      // Access the raw response through `res`:
      console.log('Status code:', res.status);
    });

    return () => {
      abort();
    };
  }, []);

  ...
}
```

#### Manage state with the `useFetchState` helper

```tsx
import { useFetch, useFetchState } from '@ehynds/use-fetch';

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

const BookList = () => {
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
```

## API

Coming soon!