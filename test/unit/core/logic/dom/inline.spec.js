/**
 * @jest-environment jsdom
 */

import { createMockEditor } from '../../../../__mocks__/editorMock';
import Inline from '../../../../../src/core/logic/dom/inline';
import { dom } from '../../../../../src/helper';

describe('Core Logic - Inline', () => {
	let kernel;
	let inline;
	let wysiwyg;

	beforeEach(() => {
		kernel = createMockEditor();
		inline = new Inline(kernel);
		wysiwyg = kernel.$.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		// Mock cleanup - no special teardown needed
		jest.clearAllMocks();
	});

	describe('constructor', () => {
		it('should instantiate Inline class', () => {
			expect(inline).toBeDefined();
		});

		it('should have required methods', () => {
			expect(typeof inline.apply).toBe('function');
			expect(typeof inline.remove).toBe('function');
		});
	});
});
