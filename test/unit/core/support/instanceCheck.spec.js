import InstanceCheck from '../../../../src/core/services/instanceCheck';

describe('InstanceCheck', () => {
	let instanceCheck;
	let mockFrameContext;
	let mockWindow;

	beforeEach(() => {
		mockWindow = {
			Node: window.Node,
			Element: window.Element,
			Range: window.Range,
			Selection: window.Selection,
		};

		mockFrameContext = {
			get: jest.fn().mockReturnValue(mockWindow),
		};

		instanceCheck = new InstanceCheck(mockFrameContext);
	});

	describe('constructor', () => {
		it('should create an instance', () => {
			expect(instanceCheck).toBeInstanceOf(InstanceCheck);
		});
	});

	describe('isNode', () => {
		it('should return true for Node instances', () => {
			const textNode = document.createTextNode('text');
			const elementNode = document.createElement('div');

			expect(instanceCheck.isNode(textNode)).toBe(true);
			expect(instanceCheck.isNode(elementNode)).toBe(true);
		});

		it('should return false for non-Node objects', () => {
			expect(instanceCheck.isNode({})).toBe(false);
			expect(instanceCheck.isNode('string')).toBe(false);
			expect(instanceCheck.isNode(123)).toBe(false);
			expect(instanceCheck.isNode(null)).toBe(false);
			expect(instanceCheck.isNode(undefined)).toBe(false);
		});

		it('should check nodeType first for cross-context compatibility', () => {
			const div = document.createElement('div');
			expect(instanceCheck.isNode(div)).toBe(true);
			expect(mockFrameContext.get).not.toHaveBeenCalled();
		});

		it('should fallback to instanceof check when nodeType is absent', () => {
			// Mock an object without nodeType that should fallback to instanceof
			const mockNode = { fake: 'node' };
			instanceCheck.isNode(mockNode);
			expect(mockFrameContext.get).toHaveBeenCalledWith('_ww');
		});
	});

	describe('isElement', () => {
		it('should return true for Element instances', () => {
			const div = document.createElement('div');
			const span = document.createElement('span');

			expect(instanceCheck.isElement(div)).toBe(true);
			expect(instanceCheck.isElement(span)).toBe(true);
		});

		it('should return false for non-Element nodes', () => {
			const textNode = document.createTextNode('text');
			const commentNode = document.createComment('comment');

			expect(instanceCheck.isElement(textNode)).toBe(false);
			expect(instanceCheck.isElement(commentNode)).toBe(false);
		});

		it('should return false for non-Node objects', () => {
			expect(instanceCheck.isElement({})).toBe(false);
			expect(instanceCheck.isElement('string')).toBe(false);
			expect(instanceCheck.isElement(123)).toBe(false);
			expect(instanceCheck.isElement(null)).toBe(false);
			expect(instanceCheck.isElement(undefined)).toBe(false);
		});

		it('should check nodeType === 1 first for cross-context compatibility', () => {
			const div = document.createElement('div');
			expect(instanceCheck.isElement(div)).toBe(true);
			expect(mockFrameContext.get).not.toHaveBeenCalled();
		});

		it('should fallback to instanceof check when nodeType check fails', () => {
			// Mock an object without nodeType === 1 that should fallback to instanceof
			const mockElement = { nodeType: 3 }; // Text node type
			instanceCheck.isElement(mockElement);
			expect(mockFrameContext.get).toHaveBeenCalledWith('_ww');
		});
	});

	describe('isRange', () => {
		it('should return true for Range instances', () => {
			const range = document.createRange();

			expect(instanceCheck.isRange(range)).toBe(true);
		});

		it('should return false for non-Range objects', () => {
			expect(instanceCheck.isRange({})).toBe(false);
			expect(instanceCheck.isRange(document.createElement('div'))).toBe(false);
			expect(instanceCheck.isRange('string')).toBe(false);
			expect(instanceCheck.isRange(123)).toBe(false);
			expect(instanceCheck.isRange(null)).toBe(false);
			expect(instanceCheck.isRange(undefined)).toBe(false);
		});

		it('should check constructor name first for cross-context compatibility', () => {
			const range = document.createRange();
			expect(instanceCheck.isRange(range)).toBe(true);
			expect(mockFrameContext.get).not.toHaveBeenCalled();
		});

		it('should fallback to instanceof check when constructor name is not Range', () => {
			// Mock an object without constructor name 'Range' that should fallback to instanceof
			const mockRange = { constructor: { name: 'NotRange' } };
			instanceCheck.isRange(mockRange);
			expect(mockFrameContext.get).toHaveBeenCalledWith('_ww');
		});
	});

	describe('isSelection', () => {
		it('should return true for Selection instances', () => {
			const selection = window.getSelection();

			expect(instanceCheck.isSelection(selection)).toBe(true);
		});

		it('should return false for non-Selection objects', () => {
			expect(instanceCheck.isSelection({})).toBe(false);
			expect(instanceCheck.isSelection(document.createElement('div'))).toBe(false);
			expect(instanceCheck.isSelection(document.createRange())).toBe(false);
			expect(instanceCheck.isSelection('string')).toBe(false);
			expect(instanceCheck.isSelection(123)).toBe(false);
			expect(instanceCheck.isSelection(null)).toBe(false);
			expect(instanceCheck.isSelection(undefined)).toBe(false);
		});

		it('should check constructor name first for cross-context compatibility', () => {
			const selection = window.getSelection();
			expect(instanceCheck.isSelection(selection)).toBe(true);
			expect(mockFrameContext.get).not.toHaveBeenCalled();
		});

		it('should fallback to instanceof check when constructor name is not Selection', () => {
			// Mock an object without constructor name 'Selection' that should fallback to instanceof
			const mockSelection = { constructor: { name: 'NotSelection' } };
			instanceCheck.isSelection(mockSelection);
			expect(mockFrameContext.get).toHaveBeenCalledWith('_ww');
		});
	});

	describe('iframe safety', () => {
		let iframeWindow;
		let iframeInstanceCheck;

		beforeEach(() => {
			const iframe = document.createElement('iframe');
			document.body.appendChild(iframe);
			iframeWindow = iframe.contentWindow;

			const iframeMockFrameContext = {
				get: jest.fn().mockReturnValue(iframeWindow),
			};

			iframeInstanceCheck = new InstanceCheck(iframeMockFrameContext);
		});

		afterEach(() => {
			const iframe = document.querySelector('iframe');
			if (iframe) {
				document.body.removeChild(iframe);
			}
		});

		it('should identify elements from different iframe contexts using nodeType', () => {
			if (!iframeWindow) {
				pending('Iframe not accessible in test environment');
				return;
			}

			const mainWindowDiv = document.createElement('div');
			const iframeDiv = iframeWindow.document.createElement('div');

			// Both should return true because nodeType check works across contexts
			expect(instanceCheck.isElement(mainWindowDiv)).toBe(true);
			expect(instanceCheck.isElement(iframeDiv)).toBe(true);

			expect(iframeInstanceCheck.isElement(iframeDiv)).toBe(true);
			expect(iframeInstanceCheck.isElement(mainWindowDiv)).toBe(true);
		});

		it('should identify ranges from different iframe contexts using constructor name', () => {
			if (!iframeWindow) {
				pending('Iframe not accessible in test environment');
				return;
			}

			const mainWindowRange = document.createRange();
			const iframeRange = iframeWindow.document.createRange();

			// Both should return true because constructor.name check works across contexts
			expect(instanceCheck.isRange(mainWindowRange)).toBe(true);
			expect(instanceCheck.isRange(iframeRange)).toBe(true);

			expect(iframeInstanceCheck.isRange(iframeRange)).toBe(true);
			expect(iframeInstanceCheck.isRange(mainWindowRange)).toBe(true);
		});
	});

	describe('edge cases', () => {
		it('should handle null frameContext when nodeType check succeeds', () => {
			const brokenFrameContext = null;
			const brokenInstanceCheck = new InstanceCheck(brokenFrameContext);

			// Should still return true because nodeType check happens first
			const div = document.createElement('div');
			expect(brokenInstanceCheck.isNode(div)).toBe(true);
			expect(brokenInstanceCheck.isElement(div)).toBe(true);
		});

		it('should throw when accessing frameContext for fallback check', () => {
			const brokenFrameContext = null;
			const brokenInstanceCheck = new InstanceCheck(brokenFrameContext);

			// When nodeType check fails, it will try to access frameContext and throw
			expect(() => brokenInstanceCheck.isNode({ fake: 'object' })).toThrow();
		});

		it('should handle missing _ww when nodeType check succeeds', () => {
			const frameContextWithMissingWw = {
				get: jest.fn().mockReturnValue(null),
			};
			const instanceCheckWithMissingWw = new InstanceCheck(frameContextWithMissingWw);

			// Should still return true because nodeType check happens first
			const div = document.createElement('div');
			expect(instanceCheckWithMissingWw.isElement(div)).toBe(true);
		});

		it('should throw when using instanceof with missing _ww', () => {
			const frameContextWithMissingWw = {
				get: jest.fn().mockReturnValue(null),
			};
			const instanceCheckWithMissingWw = new InstanceCheck(frameContextWithMissingWw);

			// When nodeType check fails, it will try to use instanceof and throw
			expect(() => instanceCheckWithMissingWw.isElement({ nodeType: 3 })).toThrow();
		});

		it('should maintain constructor reference', () => {
			expect(instanceCheck.constructor).toBe(InstanceCheck);
		});
	});

	describe('method chaining and multiple calls', () => {
		it('should consistently return correct results on multiple calls', () => {
			const div = document.createElement('div');
			const textNode = document.createTextNode('text');
			const range = document.createRange();

			for (let i = 0; i < 3; i++) {
				expect(instanceCheck.isElement(div)).toBe(true);
				expect(instanceCheck.isNode(textNode)).toBe(true);
				expect(instanceCheck.isRange(range)).toBe(true);
			}
		});

		it('should not call frameContext.get when nodeType/constructor.name checks succeed', () => {
			const div = document.createElement('div');

			instanceCheck.isNode(div);
			instanceCheck.isElement(div);

			// Should not call frameContext.get since nodeType checks succeed
			expect(mockFrameContext.get).not.toHaveBeenCalled();
		});

		it('should call frameContext.get only when fallback is needed', () => {
			const mockObj = { fake: 'object' };

			try {
				instanceCheck.isNode(mockObj);
			} catch (e) {
				// Expected to throw
			}

			// Should have called frameContext.get for instanceof fallback
			expect(mockFrameContext.get).toHaveBeenCalledWith('_ww');
		});
	});
});
