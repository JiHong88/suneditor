import { env } from '../../helper';

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
class ApiManager {
	#$;

	/** @type {XMLHttpRequest} */
	#xhr;

	/**
	 * @constructor
	 * @param {*} inst The instance object that called the constructor.
	 * @param {SunEditor.Deps} $ Kernel dependencies
	 * @param {ApiManagerParams} [params] API options
	 */
	constructor(inst, $, params) {
		this.#$ = $;

		/**
		 * @description Caller instance key name
		 * @type {string}
		 */
		this.kind = inst.constructor.key || inst.constructor.name;

		// members
		this.#xhr = env.getXMLHttpRequest();
		// members - option
		this.method = params?.method;
		this.url = params?.url;
		this.headers = params?.headers;
		this.data = params?.data;
		this.callBack = params?.callBack;
		this.errorCallBack = params?.errorCallBack;
		this.responseType = params?.responseType;
	}

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
	call({ method, url, headers, data, callBack, errorCallBack, responseType }) {
		this.cancel();

		method ||= this.method;
		url = this.#normalizeUrl(url || this.url);
		headers ||= this.headers;
		data ||= this.data;
		callBack ||= this.callBack;
		errorCallBack ||= this.errorCallBack;
		responseType ||= this.responseType;

		// Validate required callback parameter
		if (typeof callBack !== 'function') {
			throw new Error(`[SUNEDITOR.ApiManager[${this.kind}].upload.callBack.fail] callBack is not a function`);
		}

		const xhr = this.#xhr;
		if (responseType) xhr.responseType = responseType;
		xhr.onreadystatechange = this.#CallBackApi.bind(this, xhr, callBack, errorCallBack);
		xhr.open(method, url, true);
		if (headers !== null && typeof headers === 'object' && Object.keys(headers).length > 0) {
			for (const key in headers) {
				xhr.setRequestHeader(key, headers[key]);
			}
		}

		xhr.send(data);
	}

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
	asyncCall({ method, url, headers, data, responseType }) {
		this.cancel();

		method ||= this.method;
		url = this.#normalizeUrl(url || this.url);
		headers ||= this.headers;
		data ||= this.data;
		responseType ||= this.responseType;

		const xhr = this.#xhr;
		if (responseType) xhr.responseType = responseType;

		return new Promise((resolve, reject) => {
			xhr.open(method, url, true);
			if (headers !== null && typeof headers === 'object' && Object.keys(headers).length > 0) {
				for (const key in headers) {
					xhr.setRequestHeader(key, headers[key]);
				}
			}
			xhr.onload = () => {
				if (xhr.status === 200) {
					try {
						resolve(xhr);
					} finally {
						this.#$.ui.hideLoading();
					}
				} else {
					try {
						const res = !xhr.responseText ? xhr : JSON.parse(xhr.responseText);
						reject(res);
					} finally {
						this.#$.ui.hideLoading();
					}
				}
			};

			xhr.onerror = () => {
				this.#$.ui.hideLoading();
				reject(new Error('Network error'));
			};

			xhr.send(data);
		});
	}

	/**
	 * @description Cancel API (xhr.abort())
	 */
	cancel() {
		if (this.#xhr) {
			this.#xhr.onreadystatechange = null;
			this.#xhr.onload = null;
			this.#xhr.onerror = null;
			this.#xhr.abort();
		}
	}

	/**
	 * @description Remove unnecessary slashes in API URL.
	 * @param {string} url url
	 * @returns
	 */
	#normalizeUrl(url) {
		return url.replace(/([^:])\/+/g, '$1/').replace(/\/(\?|#|$)/, '$1');
	}

	/**
	 * @description API callback
	 * @param {XMLHttpRequest} xmlHttp - XMLHttpRequest
	 * @param {(xmlHttp: XMLHttpRequest) => Promise<void>} callBack - Callback function
	 * @param {(res: *, xmlHttp: XMLHttpRequest) => Promise<string>} errorCallBack - Error callback function
	 */
	async #CallBackApi(xmlHttp, callBack, errorCallBack) {
		if (xmlHttp.readyState === 4) {
			if (xmlHttp.status === 200) {
				try {
					await callBack(xmlHttp);
				} catch (error) {
					throw Error(`[SUNEDITOR.ApiManager[${this.kind}].upload.callBack.fail] ${error.message}`);
				} finally {
					this.#$.ui.hideLoading();
				}
			} else {
				// exception
				console.error(`[SUNEDITOR.ApiManager[${this.kind}].upload.serverException]`, xmlHttp);
				try {
					const res = !xmlHttp.responseText ? xmlHttp : JSON.parse(xmlHttp.responseText);
					let message = '';
					if (typeof errorCallBack === 'function') {
						message = await errorCallBack(res, xmlHttp);
					}
					const err = `[SUNEDITOR.ApiManager[${this.kind}].upload.serverException] status: ${xmlHttp.status}, response: ${message || res.errorMessage || xmlHttp.responseText}`;
					this.#$.ui.alertOpen(err, 'error');
				} catch (error) {
					throw Error(`[SUNEDITOR.ApiManager[${this.kind}].upload.errorCallBack.fail] ${error.message}`);
				} finally {
					this.#$.ui.hideLoading();
				}
			}
		}
	}
}

export default ApiManager;
