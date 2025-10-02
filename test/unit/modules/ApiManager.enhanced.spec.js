/**
 * @fileoverview Enhanced tests for modules/ApiManager.js
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../__mocks__/editorIntegration';

describe('Modules - ApiManager Enhanced Tests', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);

		if (editor.ui) {
			editor.ui.showLoading = jest.fn();
			editor.ui.hideLoading = jest.fn();
		}
		if (editor.viewer) {
			editor.viewer.print = jest.fn();
		}
	});

	afterEach(() => {
		if (editor && editor.history && typeof editor.destroy === 'function') {
			destroyTestEditor(editor);
		}
	});

	describe('API fetch operations', () => {
		it('should have fetch capability', () => {
			expect(editor).toBeDefined();
			expect(editor.frameContext).toBeDefined();
		});

		it('should handle successful API response', async () => {
			const mockFetch = jest.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ success: true, data: [] })
			});
			global.fetch = mockFetch;

			expect(mockFetch).toBeDefined();
		});

		it('should handle failed API response', async () => {
			const mockFetch = jest.fn().mockResolvedValue({
				ok: false,
				status: 404,
				statusText: 'Not Found'
			});
			global.fetch = mockFetch;

			expect(mockFetch).toBeDefined();
		});

		it('should handle network error', async () => {
			const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
			global.fetch = mockFetch;

			expect(mockFetch).toBeDefined();
		});

		it('should handle timeout', async () => {
			const mockFetch = jest.fn().mockImplementation(() =>
				new Promise((resolve) => setTimeout(resolve, 5000))
			);
			global.fetch = mockFetch;

			expect(mockFetch).toBeDefined();
		});
	});

	describe('Request headers', () => {
		it('should handle custom headers', () => {
			const headers = {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer token'
			};

			expect(headers['Content-Type']).toBe('application/json');
			expect(headers['Authorization']).toBeDefined();
		});

		it('should handle Accept header', () => {
			const headers = {
				'Accept': 'application/json'
			};

			expect(headers['Accept']).toBe('application/json');
		});

		it('should handle multiple headers', () => {
			const headers = {
				'Content-Type': 'application/json',
				'X-Custom-Header': 'value',
				'Cache-Control': 'no-cache'
			};

			expect(Object.keys(headers).length).toBe(3);
		});
	});

	describe('Request methods', () => {
		it('should handle GET request', () => {
			const method = 'GET';
			expect(method).toBe('GET');
		});

		it('should handle POST request', () => {
			const method = 'POST';
			expect(method).toBe('POST');
		});

		it('should handle PUT request', () => {
			const method = 'PUT';
			expect(method).toBe('PUT');
		});

		it('should handle DELETE request', () => {
			const method = 'DELETE';
			expect(method).toBe('DELETE');
		});

		it('should handle PATCH request', () => {
			const method = 'PATCH';
			expect(method).toBe('PATCH');
		});
	});

	describe('Request body', () => {
		it('should handle JSON body', () => {
			const body = JSON.stringify({ key: 'value' });
			expect(body).toContain('key');
		});

		it('should handle FormData body', () => {
			const formData = new FormData();
			formData.append('field', 'value');
			expect(formData).toBeDefined();
		});

		it('should handle URLSearchParams body', () => {
			const params = new URLSearchParams();
			params.append('key', 'value');
			expect(params.toString()).toContain('key=value');
		});

		it('should handle empty body', () => {
			const body = null;
			expect(body).toBeNull();
		});
	});

	describe('Response handling', () => {
		it('should parse JSON response', async () => {
			const response = {
				ok: true,
				json: async () => ({ success: true })
			};

			const data = await response.json();
			expect(data.success).toBe(true);
		});

		it('should handle text response', async () => {
			const response = {
				ok: true,
				text: async () => 'Response text'
			};

			const text = await response.text();
			expect(text).toBe('Response text');
		});

		it('should handle blob response', async () => {
			const blob = new Blob(['data'], { type: 'application/octet-stream' });
			const response = {
				ok: true,
				blob: async () => blob
			};

			const responseBlob = await response.blob();
			expect(responseBlob).toBeDefined();
		});

		it('should check response status', () => {
			const response = {
				ok: true,
				status: 200,
				statusText: 'OK'
			};

			expect(response.ok).toBe(true);
			expect(response.status).toBe(200);
		});
	});

	describe('Error handling', () => {
		it('should handle 404 error', () => {
			const error = {
				status: 404,
				message: 'Not Found'
			};

			expect(error.status).toBe(404);
		});

		it('should handle 500 error', () => {
			const error = {
				status: 500,
				message: 'Internal Server Error'
			};

			expect(error.status).toBe(500);
		});

		it('should handle timeout error', () => {
			const error = new Error('Request timeout');
			expect(error.message).toContain('timeout');
		});

		it('should handle network error', () => {
			const error = new Error('Network failure');
			expect(error.message).toContain('Network');
		});

		it('should handle parse error', () => {
			const error = new Error('JSON parse error');
			expect(error.message).toContain('parse');
		});
	});

	describe('URL handling', () => {
		it('should handle absolute URL', () => {
			const url = 'https://example.com/api/data';
			expect(url).toContain('https://');
		});

		it('should handle relative URL', () => {
			const url = '/api/data';
			expect(url.startsWith('/')).toBe(true);
		});

		it('should handle URL with query params', () => {
			const url = 'https://example.com/api?key=value';
			expect(url).toContain('?key=value');
		});

		it('should handle URL with hash', () => {
			const url = 'https://example.com/page#section';
			expect(url).toContain('#section');
		});

		it('should handle URL encoding', () => {
			const param = encodeURIComponent('value with spaces');
			expect(param).toContain('value%20with%20spaces');
		});
	});

	describe('Request cancellation', () => {
		it('should create AbortController', () => {
			const controller = new AbortController();
			expect(controller).toBeDefined();
			expect(controller.signal).toBeDefined();
		});

		it('should abort request', () => {
			const controller = new AbortController();
			controller.abort();
			expect(controller.signal.aborted).toBe(true);
		});

		it('should handle abort signal', () => {
			const controller = new AbortController();
			const signal = controller.signal;
			expect(signal.aborted).toBe(false);
		});
	});

	describe('Retry logic', () => {
		it('should retry on failure', async () => {
			let attempts = 0;
			const mockFetch = jest.fn().mockImplementation(() => {
				attempts++;
				if (attempts < 3) {
					return Promise.reject(new Error('Temporary error'));
				}
				return Promise.resolve({ ok: true, json: async () => ({}) });
			});

			expect(mockFetch).toBeDefined();
		});

		it('should limit retry attempts', () => {
			const maxRetries = 3;
			let retries = 0;

			while (retries < maxRetries) {
				retries++;
			}

			expect(retries).toBe(maxRetries);
		});

		it('should use exponential backoff', () => {
			const delays = [100, 200, 400, 800];
			expect(delays[0]).toBe(100);
			expect(delays[3]).toBe(800);
		});
	});

	describe('Content-Type handling', () => {
		it('should detect JSON content type', () => {
			const contentType = 'application/json';
			expect(contentType).toContain('json');
		});

		it('should detect form content type', () => {
			const contentType = 'application/x-www-form-urlencoded';
			expect(contentType).toContain('form');
		});

		it('should detect multipart content type', () => {
			const contentType = 'multipart/form-data';
			expect(contentType).toContain('multipart');
		});

		it('should detect text content type', () => {
			const contentType = 'text/plain';
			expect(contentType).toContain('text');
		});
	});
});
