import { renderHook, act } from '@testing-library/react-hooks'
import { useFetch } from './useFetch';

beforeEach(() => jest.clearAllMocks());

[
  'GET',
  'POST',
  'HEAD',
  'PUT',
  'DEL'
].forEach((verb) => describe(verb, () => {
  const method = verb.toLowerCase();

  it(`performs a ${verb} request`, () => {
    const { result } = renderHook(() => useFetch());

    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({
      status: 200,
      json: async () => ({success: true})
    }));

    act(() => {
      result.current[method]('https://foo.com/');
      const [url, params] = (global.fetch as jest.Mock).mock.calls[0];
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(url).toBe('https://foo.com/');
      expect(params.method).toBe(verb === 'DEL' ? 'DELETE' : verb);
    });
  });

  it('returns the response and a json-parsed body', (done) => {
    const { result } = renderHook(() => useFetch());

    const mockRes = {
      status: 200,
      json: async () => ({success: true})
    };

    global.fetch = jest.fn().mockImplementation(() => Promise.resolve(mockRes));

    act(() => {
      const { req } = result.current[method]('https://foo.com/');

      req.then(({ res, json }) => {
        expect(res).toEqual(mockRes);
        expect(json).toEqual({success: true});
        done();
      });
    });
  });

  it('returns an abort signal', () => {
    const { result } = renderHook(() => useFetch());

    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({
      status: 200,
      json: async () => ({success: true})
    }));

    act(() => {
      const { abort } = result.current[method]('https://foo.com/');
      expect(typeof abort).toBe('function');
    });
  });

  it('overwrites default options', () => {
    const { result } = renderHook(() => useFetch());

    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({
      status: 200,
      json: async () => ({success: true})
    }));

    act(() => {
      const args = [
        'https://foo.com',
        method === 'del' ? undefined : {},
        { headers: { 'content-type': 'text/plain' } }
      ].filter(item => item);
      result.current[method](...args);
      const [, params] = (global.fetch as jest.Mock).mock.calls[0];
      expect(params.headers['content-type']).toBe('text/plain');
    });
  });

  it('throws if the status code is 4xx', (done) => {
    const { result } = renderHook(() => useFetch());

    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({
      status: 400
    }));

    act(() => {
      const { req } = result.current[method]('https://foo.com');

      req.catch((err: Error) => {
        expect(err).toBeInstanceOf(Error);
        done();
      });
    });
  });

  it('throws if the status code is 5xx', (done) => {
    const { result } = renderHook(() => useFetch());

    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({
      status: 500
    }));

    act(() => {
      const { req } = result.current[method]('https://foo.com');

      req.catch((err: Error) => {
        expect(err).toBeInstanceOf(Error);
        done();
      });
    });
  });
}));

describe('GET', () => {
  it('passes query params', () => {
    const { result } = renderHook(() => useFetch());

    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({
      status: 200,
      json: async () => ({success: true})
    }));

    act(() => {
      result.current.get('https://foo.com/?existing=yes', {
        foo: true,
        bar: [1, 2],
        baz: 'test'
      });
      const [url] = (global.fetch as jest.Mock).mock.calls[0];
      expect(url).toBe('https://foo.com/?existing=yes&foo=true&bar=bar%5B%5D%3D1%26bar%5B%5D%3D2&baz=test');
    });
  });
});

describe('POST', () => {
  it('passes a request body', () => {
    const { result } = renderHook(() => useFetch());

    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({
      status: 200,
      json: async () => ({success: true})
    }));

    const body = {
      foo: 1,
      bar: {
        baz: true
      }
    };

    act(() => {
      result.current.post('https://foo.com/', body);
      const [url, params] = (global.fetch as jest.Mock).mock.calls[0];
      expect(url).toBe('https://foo.com/');
      expect(params.body).toBe(JSON.stringify(body));
    });
  });
});

