/**
 * @jest-environment jsdom
 */

import { createMockEditor } from '../../../../__mocks__/editorMock';
import Offset from '../../../../../src/core/logic/dom/offset';
import { dom } from '../../../../../src/helper';

describe('Core Logic - Offset', () => {
	let kernel;
	let offset;
	let wysiwyg;

	beforeEach(() => {
		kernel = createMockEditor();
		offset = new Offset(kernel);
		wysiwyg = kernel.$.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('constructor', () => {
		it('should instantiate Offset class', () => {
			expect(offset).toBeDefined();
		});

		it('should have required methods', () => {
			expect(typeof offset).toBe('object');
		});
	});

	describe('getGlobalScroll', () => {
		it('should include the shadow host scroll resolved after construction', () => {
			const before = offset.getGlobalScroll().top;
			// contextProvider.init() resolves shadowRoot after the offset module is constructed
			const host = document.createElement('div');
			Object.defineProperty(host, 'scrollTop', { value: 30 });
			kernel.$.contextProvider.shadowRoot = { host };
			try {
				expect(offset.getGlobalScroll().top).toBe(before + 30);
			} finally {
				kernel.$.contextProvider.shadowRoot = null;
			}
		});
	});
});
