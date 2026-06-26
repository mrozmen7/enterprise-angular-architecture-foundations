export type RequestState<T> =
  | {
      readonly status: 'idle';
      readonly data: T;
    }
  | {
      readonly status: 'loading';
      readonly data: T;
    }
  | {
      readonly status: 'success';
      readonly data: T;
    }
  | {
      readonly status: 'error';
      readonly data: T;
      readonly message: string;
    };

export function idleRequest<T>(data: T): RequestState<T> {
  return Object.freeze({
    status: 'idle',
    data,
  });
}

export function loadingRequest<T>(data: T): RequestState<T> {
  return Object.freeze({
    status: 'loading',
    data,
  });
}

export function successRequest<T>(data: T): RequestState<T> {
  return Object.freeze({
    status: 'success',
    data,
  });
}

export function failedRequest<T>(data: T, error: unknown): RequestState<T> {
  return Object.freeze({
    status: 'error',
    data,
    message: error instanceof Error ? error.message : 'An unexpected operation error occurred.',
  });
}
