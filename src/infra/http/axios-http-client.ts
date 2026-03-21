/**
 * Infra Adapter: AxiosHttpClient (placeholder)
 *
 * When you need custom API calls (beyond auth), implement this adapter
 * using axios. For now, auth calls go through Better Auth's fetch client.
 *
 * Example usage:
 *   import { HttpClient, HttpRequest, HttpResponse } from '@/data/protocols/http';
 *   import axios from 'axios';
 *
 *   export class AxiosHttpClient implements HttpClient {
 *     async request(data: HttpRequest): Promise<HttpResponse> {
 *       const response = await axios.request({
 *         url: data.url,
 *         method: data.method,
 *         data: data.body,
 *         headers: data.headers,
 *       });
 *       return { statusCode: response.status, body: response.data };
 *     }
 *   }
 */

export {};
