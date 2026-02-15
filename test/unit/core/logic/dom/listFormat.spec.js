/**
 * @jest-environment jsdom
 */

import { createMockEditor } from '../../../../__mocks__/editorMock';
import ListFormat from '../../../../../src/core/logic/dom/listFormat';
import { dom } from '../../../../../src/helper';

describe('Core Logic - ListFormat', () => {
	let kernel;
	let listFormat;
	let wysiwyg;

	beforeEach(() => {
		kernel = createMockEditor();
		listFormat = new ListFormat(kernel);
		wysiwyg = kernel.$.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('constructor', () => {
		it('should instantiate ListFormat class', () => {
			expect(listFormat).toBeDefined();
		});

		it('should have required methods', () => {
			expect(typeof listFormat.apply).toBe('function');
		});
	});
});
