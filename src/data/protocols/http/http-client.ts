/**
 * Data Protocol: HttpClient
 *
 * Abstraction for HTTP operations. In this template, axios is used directly
 * via the Better Auth client, but this interface is available for when you
 * need a generic HTTP layer (e.g., for custom API calls outside auth).
 */
export type HttpMethod = 'post' | 'get' | 'put' | 'delete';

export type HttpRequest = {
  url: string;
  method: HttpMethod;
  body?: any;
  headers?: any;
};

export interface HttpClient<R = any> {
  request: (data: HttpRequest) => Promise<HttpResponse<R>>;
}

export enum HttpStatusCode {
  ok = 200,
  created = 201,
  noContent = 204,
  badRequest = 400,
  unauthorized = 401,
  forbidden = 403,
  notFound = 404,
  serverError = 500
}

export type HttpResponse<T = any> = {
  statusCode: HttpStatusCode;
  body?: T;
};
