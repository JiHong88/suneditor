import type {} from '../../typedef';
export default ApiManager;
export type ApiManagerParams = {
	/**
	 * - HTTP method (GET, POST, PUT, DELETE...)
	 */
	method?: string;
	/**
	 * - API's URL
	 */
	url?: string;
	/**
	 * - HTTP headers
	 */
	headers?: {
		[x: string]: string;
	};
	/**
	 * - API data
	 */
	data?: any;
	/**
	 * - API success callback
	 */
	callBack?: (xmlHttp: XMLHttpRequest) => boolean;
	/**
	 * - API fail callback
	 */
	errorCallBack?: (res: any, xmlHttp: XMLHttpRequest) => string;
	/**
	 * - XMLHttpRequest.responseType
	 */
	responseType?: XMLHttpRequestResponseType;
};
/**
 * @typedef ApiManagerParams
 * @property {string} [method] - HTTP method (GET, POST, PUT, DELETE...)
 * @property {string} [url] - API's URL
 * @property {Object<string, string>} [headers] - HTTP headers
 * @property {*} [data] - API data
 * @property {(xmlHttp: XMLHttpRequest) => boolean} [callBack] - API success callback
 * @property {(res: *, xmlHttp: XMLHttpRequest) => string} [errorCallBack] - API fail callback
 * @property {XMLHttpRequestResponseType} [responseType] - XMLHttpRequest.responseType
 */
/**
 * @class
 * @description API Manager
 */
declare class ApiManager {
	/**
	 * @constructor
	 * @param {*} inst The instance object that called the constructor.
	 * @param {SunEditor.Deps} $ Kernel dependencies
	 * @param {ApiManagerParams} [params] API options
	 */
	constructor(inst: any, $: SunEditor.Deps, params?: ApiManagerParams);
	/**
	 * @description Caller instance key name
	 * @type {string}
	 */
	kind: string;
	method: string;
	url: string;
	headers: {
		[x: string]: string;
	};
	data: any;
	callBack: (xmlHttp: XMLHttpRequest) => boolean;
	errorCallBack: (res: any, xmlHttp: XMLHttpRequest) => string;
	responseType: XMLHttpRequestResponseType;
	/**
	 * @description Call API
	 * @param {ApiManagerParams} params
	 * @example
	 * // POST with FormData and callbacks
	 * apiManager.call({
	 *   method: 'POST', url: '/upload', headers: { 'x-custom': 'value' },
	 *   data: formData,
	 *   callBack: (xhr) => console.log(xhr.responseText),
	 *   errorCallBack: (res, xhr) => res.errorMessage || 'Upload failed'
	 * });
	 *
	 * // GET request with minimal params (uses constructor defaults for omitted options)
	 * apiManager.call({
	 *   method: 'GET', url: '/api/files',
	 *   callBack: (xhr) => JSON.parse(xhr.responseText)
	 * });
	 */
	call({ method, url, headers, data, callBack, errorCallBack, responseType }: ApiManagerParams): void;
	/**
	 * @description Call Async API
	 * @param {Object} params
	 * @param {string} [params.method] - HTTP method (GET, POST, PUT, DELETE...)
	 * @param {string} [params.url] - API's URL
	 * @param {Object<string, string>} [params.headers] - HTTP headers
	 * @param {*} [params.data] - API data
	 * @param {XMLHttpRequestResponseType} [params.responseType] - XMLHttpRequest.responseType
	 * @returns {Promise<XMLHttpRequest>}
	 * @example
	 * // POST FormData and await the response
	 * const xhr = await apiManager.asyncCall({
	 *   method: 'POST', url: '/upload',
	 *   headers: { 'x-api-key': 'key' }, data: formData
	 * });
	 * const result = JSON.parse(xhr.responseText);
	 *
	 * // Send JSON data (uses constructor defaults for method/url)
	 * const xhr = await apiManager.asyncCall({
	 *   data: JSON.stringify({ fileName: 'doc.pdf', htmlContent })
	 * });
	 */
	asyncCall({
		method,
		url,
		headers,
		data,
		responseType,
	}: {
		method?: string;
		url?: string;
		headers?: {
			[x: string]: string;
		};
		data?: any;
		responseType?: XMLHttpRequestResponseType;
	}): Promise<XMLHttpRequest>;
	/**
	 * @description Cancel API (xhr.abort())
	 */
	cancel(): void;
	#private;
}
