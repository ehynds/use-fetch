import { useState } from "react";

type FetchState<D> = {
  loading: boolean;
  data: D | null;
  error: Error | null;
};

type UseFetchState<D> = FetchState<D> & {
  setData: (data: D) => void;
  setError: (error: Error) => void;
  setLoading: (loading: boolean) => void;
};

export const useFetchState = <D>(initialState?: Partial<FetchState<D>>): UseFetchState<D> => {
  const [state, setState] = useState<FetchState<D>>({
    loading: false,
    error: null,
    data: null,
    ...initialState
  });

  return {
    ...state,
    setData: (data) => setState((state) => ({...state, loading: false, data})),
    setError: (error: Error) => setState((state) => ({...state, loading: false, error})),
    setLoading: (loading: boolean) => setState((state) => ({...state, loading})),
  };
};
