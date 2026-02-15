/**
 * @jest-environment jsdom
 */

import { createMockEditor } from '../../../../__mocks__/editorMock';
import NodeTransform from '../../../../../src/core/logic/dom/nodeTransform';
import { dom } from '../../../../../src/helper';

describe('Core Logic - NodeTransform', () => {
	let kernel;
	let nodeTransform;
	let wysiwyg;

	beforeEach(() => {
		kernel = createMockEditor();
		nodeTransform = new NodeTransform(kernel);
		wysiwyg = kernel.$.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('constructor', () => {
		it('should instantiate NodeTransform class', () => {
			expect(nodeTransform).toBeDefined();
		});

		it('should have required methods', () => {
			expect(typeof nodeTransform.split).toBe('function');
			expect(typeof nodeTransform.createNestedNode).toBe('function');
		});
	});
});
