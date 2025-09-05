export default ApiManager;
export type ApiManagerParams = {
	/**
	 * - HTTP method (GET, POST, PUT, DELETE...)
	 */
	method?: string | undefined;
	/**
	 * - API's URL
	 */
	url?: string | undefined;
	/**
	 * - HTTP headers
	 */
	headers?:
		| {
				[x: string]: string;
		  }
		| undefined;
	/**
	 * - API data
	 */
	data?: any | undefined;
	/**
	 * - API success callback
	 */
	callBack?: ((xmlHttp: XMLHttpRequest) => boolean) | undefined;
	/**
	 * - API fail callback
	 */
	errorCallBack?: ((res: any, xmlHttp: XMLHttpRequest) => string) | undefined;
	/**
	 * - XMLHttpRequest.responseType
	 */
	responseType?: XMLHttpRequestResponseType | undefined;
};
/**
 * @typedef ApiManagerParams
 * @property {string=} method - HTTP method (GET, POST, PUT, DELETE...)
 * @property {string=} url - API's URL
 * @property {Object<string, string>=} headers - HTTP headers
 * @property {*=} data - API data
 * @property {(xmlHttp: XMLHttpRequest) => boolean=} callBack - API success callback
 * @property {(res: *, xmlHttp: XMLHttpRequest) => string=} errorCallBack - API fail callback
 * @property {XMLHttpRequestResponseType=} responseType - XMLHttpRequest.responseType
 */
/**
 * @class
 * @description API Manager
 */
declare class ApiManager {
	/**
	 * @constructor
	 * @param {*} inst The instance object that called the constructor.
	 * @param {ApiManagerParams=} params API options
	 */
	constructor(inst: any, params?: ApiManagerParams | undefined);
	/**
	 * @description Editor instance
	 * @type {__se__EditorCore}
	 */
	editor: __se__EditorCore;
	/**
	 * @description UI class
	 * @type {__se__EditorCore["ui"]}
	 */
	ui: __se__EditorCore['ui'];
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
	 */
	call({ method, url, headers, data, callBack, errorCallBack, responseType }: ApiManagerParams): void;
	/**
	 * @description Call Async API
	 * @param {Object} params
	 * @param {string=} params.method - HTTP method (GET, POST, PUT, DELETE...)
	 * @param {string=} params.url - API's URL
	 * @param {Object<string, string>=} params.headers - HTTP headers
	 * @param {*=} params.data - API data
	 * @param {XMLHttpRequestResponseType=} params.responseType - XMLHttpRequest.responseType
	 * @returns {Promise<XMLHttpRequest>}
	 */
	asyncCall({
		method,
		url,
		headers,
		data,
		responseType
	}: {
		method?: string | undefined;
		url?: string | undefined;
		headers?:
			| {
					[x: string]: string;
			  }
			| undefined;
		data?: any | undefined;
		responseType?: XMLHttpRequestResponseType | undefined;
	}): Promise<XMLHttpRequest>;
	/**
	 * @description Cancel API (xhr.abort())
	 */
	cancel(): void;
	#private;
}
