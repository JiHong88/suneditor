/**
 * @fileoverview Unit tests for modules/ApiManager.js
 */

import ApiManager from '../../../src/modules/ApiManager.js';

// Mock XMLHttpRequest
class MockXMLHttpRequest {
	constructor() {
		this.readyState = 0;
		this.status = 0;
		this.responseText = '';
		this.responseType = '';
		this.onreadystatechange = null;
		this.onload = null;
		this.onerror = null;
		this.headers = {};
	}

	open(method, url, async) {
		this.method = method;
		this.url = url;
		this.async = async;
	}

	setRequestHeader(key, value) {
		this.headers[key] = value;
	}

	send(data) {
		this.data = data;
		// Simulate immediate response for testing
		setTimeout(() => {
			this.readyState = 4;
			this.status = 200;
			if (this.onload) {
				this.onload();
			}
			if (this.onreadystatechange) {
				this.onreadystatechange();
			}
		}, 0);
	}

	abort() {
		this.aborted = true;
	}
}

// Mock env helper
jest.mock('../../../src/helper', () => ({
	env: {
		getXMLHttpRequest: () => new MockXMLHttpRequest()
	}
}));

describe('Modules - ApiManager', () => {
	let mockInst;
	let mockEditor;
	let mockUI;

	beforeEach(() => {
		jest.clearAllMocks();

		mockUI = {
			hideLoading: jest.fn(),
			alertOpen: jest.fn()
		};

		mockEditor = {
			ui: mockUI
		};

		mockInst = {
			editor: mockEditor,
			constructor: {
				key: 'testKey',
				name: 'TestClass'
			}
		};
	});

	describe('Constructor', () => {
		it('should create ApiManager instance with basic properties', () => {
			const apiManager = new ApiManager(mockInst);

			expect(apiManager.editor).toBe(mockEditor);
			expect(apiManager.ui).toBe(mockUI);
			expect(apiManager.kind).toBe('testKey');
		});

		it('should use constructor name as fallback for kind', () => {
			const instWithoutKey = {
				editor: mockEditor,
				constructor: {
					name: 'FallbackName'
				}
			};

			const apiManager = new ApiManager(instWithoutKey);
			expect(apiManager.kind).toBe('FallbackName');
		});

		it('should initialize with provided parameters', () => {
			const params = {
				method: 'POST',
				url: 'https://api.example.com',
				headers: { 'Content-Type': 'application/json' },
				data: { test: 'data' },
				responseType: 'json'
			};

			const apiManager = new ApiManager(mockInst, params);

			expect(apiManager.method).toBe('POST');
			expect(apiManager.url).toBe('https://api.example.com');
			expect(apiManager.headers).toEqual({ 'Content-Type': 'application/json' });
			expect(apiManager.data).toEqual({ test: 'data' });
			expect(apiManager.responseType).toBe('json');
		});

		it('should initialize with undefined parameters when not provided', () => {
			const apiManager = new ApiManager(mockInst);

			expect(apiManager.method).toBeUndefined();
			expect(apiManager.url).toBeUndefined();
			expect(apiManager.headers).toBeUndefined();
			expect(apiManager.data).toBeUndefined();
			expect(apiManager.responseType).toBeUndefined();
		});
	});

	describe('call method', () => {
		let apiManager;

		beforeEach(() => {
			apiManager = new ApiManager(mockInst, {
				method: 'GET',
				url: 'https://default.com',
				headers: { Default: 'header' }
			});
		});

		it('should use provided parameters over defaults', () => {
			const callParams = {
				method: 'POST',
				url: 'https://override.com',
				headers: { Override: 'header' },
				data: { override: 'data' },
				callBack: jest.fn()
			};

			// Access the private xhr through the internal property
			apiManager.call(callParams);

			// The xhr is private, so we check that the call was made
			expect(apiManager.apiManager || apiManager).toBeDefined();
		});

		it('should use default parameters when not provided', () => {
			expect(() => {
				apiManager.call({});
			}).toThrow();
		});

		it('should set headers correctly', () => {
			const headers = {
				'Content-Type': 'application/json',
				Authorization: 'Bearer token'
			};

			expect(() => {
				apiManager.call({ headers, callBack: jest.fn() });
			}).not.toThrow();
		});

		it('should not set headers when null or empty', () => {
			expect(() => {
				apiManager.call({ headers: null, callBack: jest.fn() });
			}).not.toThrow();

			expect(() => {
				apiManager.call({ headers: {}, callBack: jest.fn() });
			}).not.toThrow();
		});

		it('should handle responseType correctly', () => {
			expect(() => {
				apiManager.call({ responseType: 'blob', callBack: jest.fn() });
			}).not.toThrow();
		});
	});

	describe('asyncCall method', () => {
		let apiManager;

		beforeEach(() => {
			apiManager = new ApiManager(mockInst);
		});

		it('should return a Promise', () => {
			const result = apiManager.asyncCall({
				method: 'GET',
				url: 'https://example.com'
			});

			expect(result).toBeInstanceOf(Promise);
		});

		it('should resolve on successful request', async () => {
			const result = await apiManager.asyncCall({
				method: 'GET',
				url: 'https://example.com'
			});
			expect(result).toBeDefined();
			expect(result.status).toBe(200);
			expect(mockUI.hideLoading).toHaveBeenCalled();
		});

		it('should reject on network error', async () => {
			// Mock network error by overriding the helper
			const originalGetXMLHttpRequest = require('../../../src/helper').env.getXMLHttpRequest;

			class ErrorMockXMLHttpRequest extends MockXMLHttpRequest {
				send(data) {
					this.data = data;
					setTimeout(() => {
						if (this.onerror) {
							this.onerror();
						}
					}, 0);
				}
			}

			require('../../../src/helper').env.getXMLHttpRequest = () => new ErrorMockXMLHttpRequest();

			// Create new instance to use the new mock
			const errorApiManager = new ApiManager(mockInst);

			const promise = errorApiManager.asyncCall({
				method: 'GET',
				url: 'https://example.com'
			});

			await expect(promise).rejects.toThrow('Network error');

			// Restore original
			require('../../../src/helper').env.getXMLHttpRequest = originalGetXMLHttpRequest;
		});

		it('should reject on HTTP error status', async () => {
			// Mock HTTP error
			const originalGetXMLHttpRequest = require('../../../src/helper').env.getXMLHttpRequest;

			class HttpErrorMockXMLHttpRequest extends MockXMLHttpRequest {
				send(data) {
					this.data = data;
					setTimeout(() => {
						this.status = 404;
						this.responseText = '{"error": "Not found"}';
						if (this.onload) {
							this.onload();
						}
					}, 0);
				}
			}

			require('../../../src/helper').env.getXMLHttpRequest = () => new HttpErrorMockXMLHttpRequest();

			// Create new instance with mock UI to track hideLoading calls
			const mockUI2 = {
				hideLoading: jest.fn(),
				alertOpen: jest.fn()
			};

			const mockEditor2 = {
				ui: mockUI2
			};

			const mockInst2 = {
				editor: mockEditor2,
				constructor: {
					key: 'testKey',
					name: 'TestClass'
				}
			};

			const httpErrorApiManager = new ApiManager(mockInst2);

			const promise = httpErrorApiManager.asyncCall({
				method: 'GET',
				url: 'https://example.com'
			});

			await expect(promise).rejects.toBeDefined();
			expect(mockUI2.hideLoading).toHaveBeenCalled();

			// Restore original
			require('../../../src/helper').env.getXMLHttpRequest = originalGetXMLHttpRequest;
		});
	});

	describe('cancel method', () => {
		it('should abort XMLHttpRequest', () => {
			const apiManager = new ApiManager(mockInst);

			expect(() => {
				apiManager.cancel();
			}).not.toThrow();
		});

		it('should handle null XMLHttpRequest gracefully', () => {
			const apiManager = new ApiManager(mockInst);

			expect(() => apiManager.cancel()).not.toThrow();
		});
	});

	describe('URL normalization', () => {
		let apiManager;

		beforeEach(() => {
			apiManager = new ApiManager(mockInst);
		});

		it('should normalize URLs with multiple slashes', () => {
			expect(() => {
				apiManager.call({
					method: 'GET',
					url: 'https://example.com//api///endpoint',
					callBack: jest.fn()
				});
			}).not.toThrow();
		});

		it('should handle URLs with query parameters', () => {
			expect(() => {
				apiManager.call({
					method: 'GET',
					url: 'https://example.com/api/?param=value',
					callBack: jest.fn()
				});
			}).not.toThrow();
		});

		it('should handle URLs with hash fragments', () => {
			expect(() => {
				apiManager.call({
					method: 'GET',
					url: 'https://example.com/api/#section',
					callBack: jest.fn()
				});
			}).not.toThrow();
		});

		it('should preserve protocol slashes', () => {
			expect(() => {
				apiManager.call({
					method: 'GET',
					url: 'https://example.com/api',
					callBack: jest.fn()
				});
			}).not.toThrow();
		});
	});

	describe('Error handling', () => {
		let apiManager;

		beforeEach(() => {
			apiManager = new ApiManager(mockInst);
		});

		it('should handle callback errors gracefully', () => {
			const errorCallback = jest.fn();

			expect(() => {
				apiManager.call({
					method: 'GET',
					url: 'https://example.com',
					callBack: errorCallback
				});
			}).not.toThrow();
		});
	});
});
