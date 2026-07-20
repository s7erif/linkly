export interface SuccessEnvelope<T> {
  success: true;
  data: T;
}
export interface ErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Readonly<Record<string, unknown>>;
  };
}
export interface RouteResult<T> {
  data: T;
  status?: number;
  headers?: HeadersInit;
}
