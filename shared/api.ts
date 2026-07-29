export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

export interface ApiFailure {
  message: string;
  code: string;
  fieldErrors?: Record<string, string>;
}
