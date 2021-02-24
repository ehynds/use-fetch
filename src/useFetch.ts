import { useMemo } from 'react';

type URLParams = Record<string, unknown>;

type MethodResponse<R = void> = {
  req: Promise<{
    res: Response;
    json: R;
  }>;
  abort: () => void;
};

type HeadMethodResponse = {
  req: Promise<{
    res: Response;
  }>;
  abort: () => void;
};

type UseHttp = {
  get: <R>(url: string, params?: URLParams, options?: RequestInit) => MethodResponse<R>;
  head: (url: string, params?: URLParams, options?: RequestInit) => HeadMethodResponse;
  post: <R>(url: string, body?: unknown, options?: RequestInit) => MethodResponse<R>;
  put: <R>(url: string, body?: unknown, options?: RequestInit) => MethodResponse<R>;
  del: <R>(url: string, options?: RequestInit) => MethodResponse<R>;
  request: (url: RequestInfo, options?: RequestInit) => Promise<Body>;
};

const urlWithParams = (url: string, params: URLParams = {}) => {
  const composedUrl = new URL(url);
  Object.keys(params).forEach((key) => {
    const value = params[key];
    // TODO:
    // 1. The handling of arrays here is opinionated
    // 2. Handle nested objects
    const flattenedValue = Array.isArray(value)
      ? value.map((item) => `${key}[]=${item}`).join('&')
      : String(value);
    composedUrl.searchParams.append(key, flattenedValue);
  });
  return composedUrl.toString();
};

export const useFetch = (defaultOptions?: RequestInit): UseHttp => {
  const client = useMemo(() => {
    const request = async (url: RequestInfo, options?: RequestInit) => {
      const res = await fetch(url, {
        ...defaultOptions,
        ...options,
        headers: {
          'content-type': 'application/json',
          ...defaultOptions?.headers,
          ...options?.headers,
        },
      });
      if (res.status >= 200 && res.status < 300) {
        return res;
      }
      throw new Error(res.statusText || String(res.status));
    };

    const composeMethod = <R = void>(url: string, options?: RequestInit) => {
      const abortController = new AbortController();
      const { abort, signal } = abortController;

      const req = request(url, { ...options, signal })
        .then(res => Promise.all([ res, res.json() as Promise<R> ]))
        .then(([res, json]) => ({ res, json }));

      return { req, abort };
    }

    const get = <R>(
      url: string,
      params?: URLParams,
      options?: RequestInit
    ) => {
      const fetchUrl = urlWithParams(url, params);
      return composeMethod<R>(fetchUrl, {
        ...options,
        method: 'GET',
      });
    };

    const head = (
      url: string,
      params?: URLParams,
      options?: RequestInit
    ) => {
      const fetchUrl = urlWithParams(url, params);
      return composeMethod(fetchUrl, {
        ...options,
        method: 'HEAD',
      });
    }

    const post = <R>(
      url: string,
      body?: unknown,
      options?: RequestInit
    ) => {
      return composeMethod<R>(url, {
        ...options,
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      });
    };

    const put = <R>(
      url: string,
      body?: unknown,
      options?: RequestInit
    ) => {
      return composeMethod<R>(url, {
        ...options,
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      });
    };

    const del = <R>(url: string, options?: RequestInit) => {
      return composeMethod<R>(url, {
        ...options,
        method: 'DELETE'
      });
    };

    return {
      get,
      head,
      post,
      put,
      del,
      request,
    };
  }, [defaultOptions]);

  return client;
};

