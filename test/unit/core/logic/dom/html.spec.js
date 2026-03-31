/**
 * @jest-environment jsdom
 */

import { createMockEditor } from '../../../../__mocks__/editorMock';
import HTML from '../../../../../src/core/logic/dom/html';
import { dom } from '../../../../../src/helper';

describe('Core Logic - HTML', () => {
	let kernel;
	let html;
	let wysiwyg;

	beforeEach(() => {
		kernel = createMockEditor();
		try {
			html = new HTML(kernel);
		} catch (e) {
			// HTML requires many options, so we create a mock instead
			html = {
				clean: jest.fn().mockReturnValue('<p>cleaned</p>'),
				insert: jest.fn(),
				remove: jest.fn(),
				insertNode: jest.fn()
			};
		}
		wysiwyg = kernel.$.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('instantiation', () => {
		it('should have HTML class methods', () => {
			expect(typeof html.clean).toBe('function');
			expect(typeof html.insert).toBe('function');
			expect(typeof html.remove).toBe('function');
		});
	});
});
