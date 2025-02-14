import { env } from '../helper';

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
 * @constructor
 * @description API Manager
 * @param {*} inst The instance object that called the constructor.
 * @param {ApiManagerParams=} params API options
 */
function ApiManager(inst, params) {
	this.editor = inst.editor;
	this.ui = this.editor.ui;
	this.kind = inst.constructor.key || inst.constructor.name;

	// members
	this._xhr = env.getXMLHttpRequest();
	// members - option
	this.method = params?.method;
	this.url = params?.url;
	this.headers = params?.headers;
	this.data = params?.data;
	this.callBack = params?.callBack;
	this.errorCallBack = params?.errorCallBack;
	this.responseType = params?.responseType;
}

ApiManager.prototype = {
	/**
	 * @description Call API
	 * @param {ApiManagerParams} params
	 */
	call({ method, url, headers, data, callBack, errorCallBack, responseType }) {
		this.cancel();

		method = method || this.method;
		url = this._normalizeUrl(url || this.url);
		headers = headers || this.headers;
		data = data || this.data;
		callBack = callBack || this.callBack;
		errorCallBack = errorCallBack || this.errorCallBack;
		responseType = responseType || this.responseType;

		const xhr = this._xhr;
		if (responseType) xhr.responseType = responseType;
		xhr.onreadystatechange = CallBackApi.bind(this, xhr, callBack, errorCallBack);
		xhr.open(method, url, true);
		if (headers !== null && typeof headers === 'object' && Object.keys(headers).length > 0) {
			for (const key in headers) {
				xhr.setRequestHeader(key, headers[key]);
			}
		}

		xhr.send(data);
	},

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
	asyncCall({ method, url, headers, data, responseType }) {
		this.cancel();

		method = method || this.method;
		url = this._normalizeUrl(url || this.url);
		headers = headers || this.headers;
		data = data || this.data;
		responseType = responseType || this.responseType;

		const xhr = this._xhr;
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
						this.ui.hideLoading();
					}
				} else {
					try {
						const res = !xhr.responseText ? xhr : JSON.parse(xhr.responseText);
						reject(res);
					} finally {
						this.ui.hideLoading();
					}
				}
			};

			xhr.onerror = () => {
				reject(new Error('Network error'));
			};

			xhr.send(data);
		});
	},

	/**
	 * @description Cancel API (xhr.abort())
	 */
	cancel() {
		if (this._xhr) this._xhr.abort();
	},

	/**
	 * @private
	 * @description Remove unnecessary slashes in API URL.
	 * @param {string} url url
	 * @returns
	 */
	_normalizeUrl(url) {
		return url.replace(/([^:])\/+/g, '$1/').replace(/\/(\?|#|$)/, '$1');
	},

	constructor: ApiManager
};

async function CallBackApi(xmlHttp, callBack, errorCallBack) {
	if (xmlHttp.readyState === 4) {
		if (xmlHttp.status === 200) {
			try {
				await callBack(xmlHttp);
			} catch (error) {
				throw Error(`[SUNEDITOR.ApiManager[${this.kind}].upload.callBack.fail] ${error.message}`);
			} finally {
				this.ui.hideLoading();
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
				this.ui.noticeOpen(err);
			} catch (error) {
				throw Error(`[SUNEDITOR.ApiManager[${this.kind}].upload.errorCallBack.fail] ${error.message}`);
			} finally {
				this.ui.hideLoading();
			}
		}
	}
}

export default ApiManager;
