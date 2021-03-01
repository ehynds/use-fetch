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

Perform a `GET` request:

```js
const { get } = useFetch();

// Optional query params
const params = {
  limit: 1
};

// Optional options to pass to the `fetch` request
const options = {
  headers: {
    'Authorization': 'Access-Token foo'
  }
};

get('https://my.api', params, options);
```

Each verb method returns an object with an `abort` function and the `req`uest:

```js
const { abort, req } = get('https://my.api');

req.then(({ json, res }) => {
  // `json` is the parsed response body.
  // This lib assumes that you're interfacing with a
  // JSON-based API. If that's not the case, use `res`
  // to handle your response:
  // - res.text()
  // - res.blob()
  console.log('Response body:', json);

  // `res` - the raw fetch response.
  // See the response docs for the full API:
  // https://developer.mozilla.org/en-US/docs/Web/API/Response
  console.log('Response status:', res.status);
  console.log('Response headers', res.headers);
});

// abort the request
abort();
```

`useFetch` exports an object with the following properties:

```js
const {
  get,
  post,
  put,
  del,
  head,
  request // Escape hatch for direect access to `fetch`
} = useFetch();
```

## Examples

#### Basic `GET` request when a component mounts:

```js
import { useFetch } from '@ehynds/use-fetch';

const SomeComponent = () => {
  const { get } = useFetch();

  useEffect() => {
    const params = {
      limit: 2
    };

    const { req } = get('https://my.api', params);

    req
      .then(({ json }) => {
        console.log('Result:', json);
      })
      .catch((err) => {
        console.error('Error:', err);
      });
  }, []);
};
```
#### Cancel a request on cleanup:

```js
const SomeComponent = () => {
  const { get } = useFetch();

  useEffect(() => {
    const { abort, req } = get('https://my.api');

    req.then(({ json }) => {
      console.log('Result:', json);
    });

    return () => {
      abort();
    };
  }, []);
};
```
#### Request a `blob`:

```js
const SomeComponent = () => {
  const { get } = useFetch();

  useEffect(() => {
    get('image.png')
      .then(({ res }) => res.blob())
      .then((imageBlob) => {
        const imageUrl = URL.createObjectURL(imageBlob);
        someImage.src = imageUrl;
      });
  }, []);
};
```
#### Type your responses:

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
    const { req } = get<Book[]>('https://my-api.com/books/list', {
      limit: 2
    });

    req.then(({ json: books }) => {
      setBooks(books);
    });
  }, []);

  ...
}
```
#### Manage state with the `useFetchState` helper:

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