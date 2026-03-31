/**
 * @fileoverview Unit tests for modules/manager/ApiManager.js
 * Covers constructor, call, asyncCall, cancel, #normalizeUrl, and #CallBackApi.
 */

import ApiManager from '../../../src/modules/manager/ApiManager.js';

// ---------------------------------------------------------------------------
// Controllable XHR mock
// ---------------------------------------------------------------------------
let mockCapturedXhr;

const mockCreateXhr = () => {
	const xhr = {
		readyState: 0,
		status: 0,
		responseText: '',
		responseType: '',
		onreadystatechange: null,
		onload: null,
		onerror: null,
		headers: {},
		open: jest.fn(),
		setRequestHeader: jest.fn((k, v) => {
			xhr.headers[k] = v;
		}),
		send: jest.fn(), // tests manually fire callbacks
		abort: jest.fn()
	};
	mockCapturedXhr = xhr;
	return xhr;
};

jest.mock('../../../src/helper', () => ({
	env: {
		getXMLHttpRequest: () => mockCreateXhr()
	}
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Creates a minimal `inst` argument for the ApiManager constructor. */
function makeInst(overrides = {}) {
	return {
		constructor: {
			key: 'testKey',
			name: 'TestName',
			...overrides
		}
	};
}

/** Creates the `$` (deps) argument for the ApiManager constructor. */
function makeDeps() {
	return {
		ui: {
			hideLoading: jest.fn(),
			alertOpen: jest.fn()
		}
	};
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Modules - ApiManager', () => {
	let mockDeps;

	beforeEach(() => {
		jest.clearAllMocks();
		mockCapturedXhr = null;
		mockDeps = makeDeps();
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		console.error.mockRestore();
	});

	// -----------------------------------------------------------------------
	// 1. Constructor
	// -----------------------------------------------------------------------
	describe('constructor', () => {
		it('should use inst.constructor.key as kind when available', () => {
			const api = new ApiManager(makeInst({ key: 'myKey', name: 'MyName' }), mockDeps);
			expect(api.kind).toBe('myKey');
		});

		it('should fall back to inst.constructor.name when key is falsy', () => {
			const api = new ApiManager(makeInst({ key: '', name: 'FallbackName' }), mockDeps);
			expect(api.kind).toBe('FallbackName');
		});

		it('should fall back to inst.constructor.name when key is undefined', () => {
			const api = new ApiManager(makeInst({ key: undefined, name: 'FallbackName' }), mockDeps);
			expect(api.kind).toBe('FallbackName');
		});

		it('should set all option members when params is provided', () => {
			const cb = jest.fn();
			const errCb = jest.fn();
			const params = {
				method: 'POST',
				url: 'https://api.example.com/data',
				headers: { 'Content-Type': 'application/json' },
				data: '{"a":1}',
				callBack: cb,
				errorCallBack: errCb,
				responseType: 'json'
			};
			const api = new ApiManager(makeInst(), mockDeps, params);

			expect(api.method).toBe('POST');
			expect(api.url).toBe('https://api.example.com/data');
			expect(api.headers).toEqual({ 'Content-Type': 'application/json' });
			expect(api.data).toBe('{"a":1}');
			expect(api.callBack).toBe(cb);
			expect(api.errorCallBack).toBe(errCb);
			expect(api.responseType).toBe('json');
		});

		it('should leave option members undefined when params is omitted', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			expect(api.method).toBeUndefined();
			expect(api.url).toBeUndefined();
			expect(api.headers).toBeUndefined();
			expect(api.data).toBeUndefined();
			expect(api.callBack).toBeUndefined();
			expect(api.errorCallBack).toBeUndefined();
			expect(api.responseType).toBeUndefined();
		});
	});

	// -----------------------------------------------------------------------
	// 2. call(params)
	// -----------------------------------------------------------------------
	describe('call(params)', () => {
		it('should use provided params over instance defaults', () => {
			const defaultCb = jest.fn();
			const overrideCb = jest.fn();
			const api = new ApiManager(makeInst(), mockDeps, {
				method: 'GET',
				url: 'https://default.com/api',
				headers: { Default: 'yes' },
				data: 'defaultData',
				callBack: defaultCb,
				errorCallBack: jest.fn(),
				responseType: 'text'
			});

			api.call({
				method: 'POST',
				url: 'https://override.com/api',
				headers: { Override: 'yes' },
				data: 'overrideData',
				callBack: overrideCb,
				responseType: 'json'
			});

			expect(mockCapturedXhr.open).toHaveBeenCalledWith('POST', 'https://override.com/api', true);
			expect(mockCapturedXhr.responseType).toBe('json');
			expect(mockCapturedXhr.headers).toEqual({ Override: 'yes' });
			expect(mockCapturedXhr.send).toHaveBeenCalledWith('overrideData');
		});

		it('should fall back to instance defaults when params fields are falsy', () => {
			const cb = jest.fn();
			const api = new ApiManager(makeInst(), mockDeps, {
				method: 'PUT',
				url: 'https://default.com/path',
				headers: { Auth: 'Bearer xxx' },
				data: 'bodyData',
				callBack: cb,
				responseType: 'blob'
			});

			api.call({});

			expect(mockCapturedXhr.open).toHaveBeenCalledWith('PUT', 'https://default.com/path', true);
			expect(mockCapturedXhr.responseType).toBe('blob');
			expect(mockCapturedXhr.headers).toEqual({ Auth: 'Bearer xxx' });
			expect(mockCapturedXhr.send).toHaveBeenCalledWith('bodyData');
		});

		it('should throw when callBack is not a function', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			expect(() => {
				api.call({ method: 'GET', url: 'https://example.com', callBack: 'notAFunction' });
			}).toThrow(/callBack is not a function/);
		});

		it('should throw when callBack is undefined (no fallback)', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			expect(() => {
				api.call({ method: 'GET', url: 'https://example.com' });
			}).toThrow(/callBack is not a function/);
		});

		it('should set xhr.responseType when provided', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({
				method: 'GET',
				url: 'https://example.com',
				callBack: jest.fn(),
				responseType: 'arraybuffer'
			});

			expect(mockCapturedXhr.responseType).toBe('arraybuffer');
		});

		it('should NOT set xhr.responseType when not provided', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({
				method: 'GET',
				url: 'https://example.com',
				callBack: jest.fn()
			});

			expect(mockCapturedXhr.responseType).toBe('');
		});

		it('should set headers when headers is a non-empty object', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({
				method: 'GET',
				url: 'https://example.com',
				headers: { 'X-Custom': 'val1', Authorization: 'Bearer token' },
				callBack: jest.fn()
			});

			expect(mockCapturedXhr.setRequestHeader).toHaveBeenCalledWith('X-Custom', 'val1');
			expect(mockCapturedXhr.setRequestHeader).toHaveBeenCalledWith('Authorization', 'Bearer token');
		});

		it('should NOT set headers when headers is null', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({
				method: 'GET',
				url: 'https://example.com',
				headers: null,
				callBack: jest.fn()
			});

			expect(mockCapturedXhr.setRequestHeader).not.toHaveBeenCalled();
		});

		it('should NOT set headers when headers is an empty object', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({
				method: 'GET',
				url: 'https://example.com',
				headers: {},
				callBack: jest.fn()
			});

			expect(mockCapturedXhr.setRequestHeader).not.toHaveBeenCalled();
		});

		it('should call xhr.send with the provided data', () => {
			const api = new ApiManager(makeInst(), mockDeps);
			const formData = { field: 'value' };

			api.call({
				method: 'POST',
				url: 'https://example.com',
				data: formData,
				callBack: jest.fn()
			});

			expect(mockCapturedXhr.send).toHaveBeenCalledWith(formData);
		});

		it('should call cancel() before setting up new request', () => {
			const api = new ApiManager(makeInst(), mockDeps);
			api.call({ method: 'GET', url: 'https://example.com', callBack: jest.fn() });

			const firstXhr = mockCapturedXhr;

			// Second call should abort the first
			api.call({ method: 'GET', url: 'https://example.com/2', callBack: jest.fn() });

			expect(firstXhr.abort).toHaveBeenCalled();
		});
	});

	// -----------------------------------------------------------------------
	// 2b. #normalizeUrl (tested indirectly via call)
	// -----------------------------------------------------------------------
	describe('#normalizeUrl (via call)', () => {
		it('should collapse duplicate slashes (preserving protocol)', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({
				method: 'GET',
				url: 'https://example.com//api///endpoint',
				callBack: jest.fn()
			});

			expect(mockCapturedXhr.open).toHaveBeenCalledWith('GET', 'https://example.com/api/endpoint', true);
		});

		it('should remove trailing slash before query string', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({
				method: 'GET',
				url: 'https://example.com/api/?key=val',
				callBack: jest.fn()
			});

			expect(mockCapturedXhr.open).toHaveBeenCalledWith('GET', 'https://example.com/api?key=val', true);
		});

		it('should remove trailing slash before hash', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({
				method: 'GET',
				url: 'https://example.com/api/#section',
				callBack: jest.fn()
			});

			expect(mockCapturedXhr.open).toHaveBeenCalledWith('GET', 'https://example.com/api#section', true);
		});

		it('should remove trailing slash at end of URL', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({
				method: 'GET',
				url: 'https://example.com/api/',
				callBack: jest.fn()
			});

			expect(mockCapturedXhr.open).toHaveBeenCalledWith('GET', 'https://example.com/api', true);
		});

		it('should preserve protocol double-slash', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({
				method: 'GET',
				url: 'https://example.com/api',
				callBack: jest.fn()
			});

			expect(mockCapturedXhr.open).toHaveBeenCalledWith('GET', 'https://example.com/api', true);
		});
	});

	// -----------------------------------------------------------------------
	// 3. #CallBackApi — readyState=4, status=200
	// -----------------------------------------------------------------------
	describe('#CallBackApi — success (readyState=4, status=200)', () => {
		it('should call callBack(xmlHttp) on success', async () => {
			const cb = jest.fn();
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({ method: 'GET', url: 'https://example.com', callBack: cb });

			mockCapturedXhr.readyState = 4;
			mockCapturedXhr.status = 200;
			await mockCapturedXhr.onreadystatechange();

			expect(cb).toHaveBeenCalledWith(mockCapturedXhr);
		});

		it('should call hideLoading() after successful callBack', async () => {
			const cb = jest.fn();
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({ method: 'GET', url: 'https://example.com', callBack: cb });

			mockCapturedXhr.readyState = 4;
			mockCapturedXhr.status = 200;
			await mockCapturedXhr.onreadystatechange();

			expect(mockDeps.ui.hideLoading).toHaveBeenCalled();
		});

		it('should re-throw with formatted message when callBack throws', async () => {
			const cb = jest.fn(() => {
				throw new Error('callback boom');
			});
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({ method: 'GET', url: 'https://example.com', callBack: cb });

			mockCapturedXhr.readyState = 4;
			mockCapturedXhr.status = 200;

			await expect(mockCapturedXhr.onreadystatechange()).rejects.toThrow(
				/SUNEDITOR\.ApiManager\[testKey\]\.upload\.callBack\.fail.*callback boom/
			);
		});

		it('should call hideLoading() even when callBack throws', async () => {
			const cb = jest.fn(() => {
				throw new Error('oops');
			});
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({ method: 'GET', url: 'https://example.com', callBack: cb });

			mockCapturedXhr.readyState = 4;
			mockCapturedXhr.status = 200;

			try {
				await mockCapturedXhr.onreadystatechange();
			} catch (_) {
				// expected
			}

			expect(mockDeps.ui.hideLoading).toHaveBeenCalled();
		});
	});

	// -----------------------------------------------------------------------
	// 4. #CallBackApi — readyState=4, status!=200
	// -----------------------------------------------------------------------
	describe('#CallBackApi — error (readyState=4, status!=200)', () => {
		it('should use xmlHttp as res when responseText is empty', async () => {
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({ method: 'GET', url: 'https://example.com', callBack: jest.fn() });

			mockCapturedXhr.readyState = 4;
			mockCapturedXhr.status = 500;
			mockCapturedXhr.responseText = '';

			await mockCapturedXhr.onreadystatechange();

			expect(mockDeps.ui.alertOpen).toHaveBeenCalledWith(
				expect.stringContaining('status: 500'),
				'error'
			);
		});

		it('should JSON.parse responseText when it exists', async () => {
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({ method: 'GET', url: 'https://example.com', callBack: jest.fn() });

			mockCapturedXhr.readyState = 4;
			mockCapturedXhr.status = 400;
			mockCapturedXhr.responseText = JSON.stringify({ errorMessage: 'Bad request body' });

			await mockCapturedXhr.onreadystatechange();

			expect(mockDeps.ui.alertOpen).toHaveBeenCalledWith(
				expect.stringContaining('Bad request body'),
				'error'
			);
		});

		it('should call errorCallBack and use its return value as message', async () => {
			const errCb = jest.fn(() => 'custom error message');
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({
				method: 'GET',
				url: 'https://example.com',
				callBack: jest.fn(),
				errorCallBack: errCb
			});

			mockCapturedXhr.readyState = 4;
			mockCapturedXhr.status = 403;
			mockCapturedXhr.responseText = JSON.stringify({ errorMessage: 'Forbidden' });

			await mockCapturedXhr.onreadystatechange();

			expect(errCb).toHaveBeenCalled();
			expect(mockDeps.ui.alertOpen).toHaveBeenCalledWith(
				expect.stringContaining('custom error message'),
				'error'
			);
		});

		it('should use empty message when errorCallBack is not provided', async () => {
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({
				method: 'GET',
				url: 'https://example.com',
				callBack: jest.fn()
			});

			mockCapturedXhr.readyState = 4;
			mockCapturedXhr.status = 404;
			mockCapturedXhr.responseText = JSON.stringify({ errorMessage: 'Not found' });

			await mockCapturedXhr.onreadystatechange();

			// message is empty, so it falls back to res.errorMessage
			expect(mockDeps.ui.alertOpen).toHaveBeenCalledWith(
				expect.stringContaining('Not found'),
				'error'
			);
		});

		it('should fall back to responseText when no errorMessage and no errorCallBack', async () => {
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({
				method: 'GET',
				url: 'https://example.com',
				callBack: jest.fn()
			});

			mockCapturedXhr.readyState = 4;
			mockCapturedXhr.status = 500;
			mockCapturedXhr.responseText = JSON.stringify({ someField: 'value' });

			await mockCapturedXhr.onreadystatechange();

			// message is empty, errorMessage is undefined, so falls back to JSON stringified response
			expect(mockDeps.ui.alertOpen).toHaveBeenCalledWith(
				expect.stringContaining('{"someField":"value"}'),
				'error'
			);
		});

		it('should call alertOpen with error details', async () => {
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({ method: 'GET', url: 'https://example.com', callBack: jest.fn() });

			mockCapturedXhr.readyState = 4;
			mockCapturedXhr.status = 503;
			mockCapturedXhr.responseText = '';

			await mockCapturedXhr.onreadystatechange();

			expect(mockDeps.ui.alertOpen).toHaveBeenCalledWith(
				expect.stringContaining('SUNEDITOR.ApiManager[testKey].upload.serverException'),
				'error'
			);
		});

		it('should re-throw with formatted message when errorCallBack throws', async () => {
			const errCb = jest.fn(() => {
				throw new Error('errCb boom');
			});
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({
				method: 'GET',
				url: 'https://example.com',
				callBack: jest.fn(),
				errorCallBack: errCb
			});

			mockCapturedXhr.readyState = 4;
			mockCapturedXhr.status = 500;
			mockCapturedXhr.responseText = '';

			await expect(mockCapturedXhr.onreadystatechange()).rejects.toThrow(
				/SUNEDITOR\.ApiManager\[testKey\]\.upload\.errorCallBack\.fail.*errCb boom/
			);
		});

		it('should call hideLoading() even when errorCallBack throws', async () => {
			const errCb = jest.fn(() => {
				throw new Error('errCb boom');
			});
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({
				method: 'GET',
				url: 'https://example.com',
				callBack: jest.fn(),
				errorCallBack: errCb
			});

			mockCapturedXhr.readyState = 4;
			mockCapturedXhr.status = 500;
			mockCapturedXhr.responseText = '';

			try {
				await mockCapturedXhr.onreadystatechange();
			} catch (_) {
				// expected
			}

			expect(mockDeps.ui.hideLoading).toHaveBeenCalled();
		});

		it('should call hideLoading() on error path (no throw)', async () => {
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({ method: 'GET', url: 'https://example.com', callBack: jest.fn() });

			mockCapturedXhr.readyState = 4;
			mockCapturedXhr.status = 500;
			mockCapturedXhr.responseText = '';

			await mockCapturedXhr.onreadystatechange();

			expect(mockDeps.ui.hideLoading).toHaveBeenCalled();
		});
	});

	// -----------------------------------------------------------------------
	// 5. #CallBackApi — readyState!=4
	// -----------------------------------------------------------------------
	describe('#CallBackApi — readyState!=4 (early return)', () => {
		it('should do nothing when readyState is not 4', async () => {
			const cb = jest.fn();
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({ method: 'GET', url: 'https://example.com', callBack: cb });

			mockCapturedXhr.readyState = 2;
			mockCapturedXhr.status = 0;
			await mockCapturedXhr.onreadystatechange();

			expect(cb).not.toHaveBeenCalled();
			expect(mockDeps.ui.hideLoading).not.toHaveBeenCalled();
			expect(mockDeps.ui.alertOpen).not.toHaveBeenCalled();
		});

		it('should do nothing for readyState=1', async () => {
			const cb = jest.fn();
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({ method: 'GET', url: 'https://example.com', callBack: cb });

			mockCapturedXhr.readyState = 1;
			await mockCapturedXhr.onreadystatechange();

			expect(cb).not.toHaveBeenCalled();
		});

		it('should do nothing for readyState=3', async () => {
			const cb = jest.fn();
			const api = new ApiManager(makeInst(), mockDeps);

			api.call({ method: 'GET', url: 'https://example.com', callBack: cb });

			mockCapturedXhr.readyState = 3;
			await mockCapturedXhr.onreadystatechange();

			expect(cb).not.toHaveBeenCalled();
		});
	});

	// -----------------------------------------------------------------------
	// 6. asyncCall(params)
	// -----------------------------------------------------------------------
	describe('asyncCall(params)', () => {
		it('should return a Promise', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			const result = api.asyncCall({ method: 'GET', url: 'https://example.com' });

			expect(result).toBeInstanceOf(Promise);

			// prevent unhandled rejection
			result.catch(() => {});
		});

		it('should resolve with xhr when status is 200', async () => {
			const api = new ApiManager(makeInst(), mockDeps);

			const promise = api.asyncCall({ method: 'GET', url: 'https://example.com' });

			mockCapturedXhr.status = 200;
			mockCapturedXhr.onload();

			const result = await promise;
			expect(result).toBe(mockCapturedXhr);
		});

		it('should call hideLoading() on success', async () => {
			const api = new ApiManager(makeInst(), mockDeps);

			const promise = api.asyncCall({ method: 'GET', url: 'https://example.com' });

			mockCapturedXhr.status = 200;
			mockCapturedXhr.onload();

			await promise;
			expect(mockDeps.ui.hideLoading).toHaveBeenCalled();
		});

		it('should reject with xhr when status!=200 and no responseText', async () => {
			const api = new ApiManager(makeInst(), mockDeps);

			const promise = api.asyncCall({ method: 'GET', url: 'https://example.com' });

			mockCapturedXhr.status = 500;
			mockCapturedXhr.responseText = '';
			mockCapturedXhr.onload();

			await expect(promise).rejects.toBe('status 500');
		});

		it('should reject with parsed JSON when status!=200 and responseText exists', async () => {
			const api = new ApiManager(makeInst(), mockDeps);

			const promise = api.asyncCall({ method: 'GET', url: 'https://example.com' });

			const errorData = { errorMessage: 'Server error', code: 500 };
			mockCapturedXhr.status = 500;
			mockCapturedXhr.responseText = JSON.stringify(errorData);
			mockCapturedXhr.onload();

			await expect(promise).rejects.toEqual(errorData);
		});

		it('should call hideLoading() on error path (status!=200)', async () => {
			const api = new ApiManager(makeInst(), mockDeps);

			const promise = api.asyncCall({ method: 'GET', url: 'https://example.com' });

			mockCapturedXhr.status = 404;
			mockCapturedXhr.responseText = '';
			mockCapturedXhr.onload();

			try {
				await promise;
			} catch (_) {
				// expected
			}

			expect(mockDeps.ui.hideLoading).toHaveBeenCalled();
		});

		it('should reject with Error("Network error") on xhr.onerror', async () => {
			const api = new ApiManager(makeInst(), mockDeps);

			const promise = api.asyncCall({ method: 'GET', url: 'https://example.com' });

			mockCapturedXhr.onerror();

			await expect(promise).rejects.toThrow('Network error');
		});

		it('should call hideLoading() on xhr.onerror', async () => {
			const api = new ApiManager(makeInst(), mockDeps);

			const promise = api.asyncCall({ method: 'GET', url: 'https://example.com' });

			mockCapturedXhr.onerror();

			try {
				await promise;
			} catch (_) {
				// expected
			}

			expect(mockDeps.ui.hideLoading).toHaveBeenCalled();
		});

		it('should set headers when provided', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			const promise = api.asyncCall({
				method: 'POST',
				url: 'https://example.com',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
			});

			expect(mockCapturedXhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
			expect(mockCapturedXhr.setRequestHeader).toHaveBeenCalledWith('Accept', 'application/json');

			// prevent unhandled rejection
			promise.catch(() => {});
		});

		it('should NOT set headers when headers is null', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			const promise = api.asyncCall({
				method: 'GET',
				url: 'https://example.com',
				headers: null
			});

			expect(mockCapturedXhr.setRequestHeader).not.toHaveBeenCalled();

			promise.catch(() => {});
		});

		it('should NOT set headers when headers is an empty object', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			const promise = api.asyncCall({
				method: 'GET',
				url: 'https://example.com',
				headers: {}
			});

			expect(mockCapturedXhr.setRequestHeader).not.toHaveBeenCalled();

			promise.catch(() => {});
		});

		it('should set responseType when provided', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			const promise = api.asyncCall({
				method: 'GET',
				url: 'https://example.com',
				responseType: 'blob'
			});

			expect(mockCapturedXhr.responseType).toBe('blob');

			promise.catch(() => {});
		});

		it('should NOT set responseType when not provided', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			const promise = api.asyncCall({
				method: 'GET',
				url: 'https://example.com'
			});

			expect(mockCapturedXhr.responseType).toBe('');

			promise.catch(() => {});
		});

		it('should call xhr.send with provided data', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			const promise = api.asyncCall({
				method: 'POST',
				url: 'https://example.com',
				data: 'requestBody'
			});

			expect(mockCapturedXhr.send).toHaveBeenCalledWith('requestBody');

			promise.catch(() => {});
		});

		it('should fall back to instance defaults when params fields are falsy', () => {
			const api = new ApiManager(makeInst(), mockDeps, {
				method: 'DELETE',
				url: 'https://default.com/resource',
				headers: { Token: 'abc' },
				data: 'defaultBody',
				responseType: 'json'
			});

			const promise = api.asyncCall({});

			expect(mockCapturedXhr.open).toHaveBeenCalledWith('DELETE', 'https://default.com/resource', true);
			expect(mockCapturedXhr.responseType).toBe('json');
			expect(mockCapturedXhr.headers).toEqual({ Token: 'abc' });
			expect(mockCapturedXhr.send).toHaveBeenCalledWith('defaultBody');

			promise.catch(() => {});
		});

		it('should normalize URL', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			const promise = api.asyncCall({
				method: 'GET',
				url: 'https://example.com//api///v1'
			});

			expect(mockCapturedXhr.open).toHaveBeenCalledWith('GET', 'https://example.com/api/v1', true);

			promise.catch(() => {});
		});

		it('should call cancel() before setting up new request', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			const promise1 = api.asyncCall({ method: 'GET', url: 'https://example.com/1' });
			const firstXhr = mockCapturedXhr;

			const promise2 = api.asyncCall({ method: 'GET', url: 'https://example.com/2' });

			expect(firstXhr.abort).toHaveBeenCalled();

			promise1.catch(() => {});
			promise2.catch(() => {});
		});
	});

	// -----------------------------------------------------------------------
	// 7. cancel()
	// -----------------------------------------------------------------------
	describe('cancel()', () => {
		it('should null out onreadystatechange, onload, and onerror', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			// Set up handlers via call
			api.call({ method: 'GET', url: 'https://example.com', callBack: jest.fn() });

			expect(mockCapturedXhr.onreadystatechange).not.toBeNull();

			api.cancel();

			expect(mockCapturedXhr.onreadystatechange).toBeNull();
			expect(mockCapturedXhr.onload).toBeNull();
			expect(mockCapturedXhr.onerror).toBeNull();
		});

		it('should call xhr.abort()', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			api.cancel();

			expect(mockCapturedXhr.abort).toHaveBeenCalled();
		});

		it('should not throw when called multiple times', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			expect(() => {
				api.cancel();
				api.cancel();
				api.cancel();
			}).not.toThrow();
		});

		it('should null out onload after asyncCall setup', () => {
			const api = new ApiManager(makeInst(), mockDeps);

			const promise = api.asyncCall({ method: 'GET', url: 'https://example.com' });

			expect(mockCapturedXhr.onload).not.toBeNull();
			expect(mockCapturedXhr.onerror).not.toBeNull();

			api.cancel();

			expect(mockCapturedXhr.onload).toBeNull();
			expect(mockCapturedXhr.onerror).toBeNull();

			promise.catch(() => {});
		});
	});
});
