import type { ApiFailure, ApiSuccess } from '../../shared/api';

export const TOKEN_KEY = 'home-service-qa.token.v1';
export const USER_KEY = 'home-service-qa.user.v1';

const baseUrl =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

let unauthorizedHandler: (() => void) | undefined;

export function setUnauthorizedHandler(handler?: () => void) {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = undefined;
  };
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });
  const body = (await response.json()) as ApiSuccess<T> | ApiFailure;

  if (!response.ok) {
    const failure = body as ApiFailure;
    if (response.status === 401 && path !== '/auth/login') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      unauthorizedHandler?.();
    }
    throw new ApiClientError(
      failure.message,
      failure.code,
      response.status,
      failure.fieldErrors,
    );
  }

  return (body as ApiSuccess<T>).data;
}
