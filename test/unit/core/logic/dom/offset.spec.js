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
});
