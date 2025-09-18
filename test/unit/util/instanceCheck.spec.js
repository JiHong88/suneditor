import InstanceCheck from '../../../src/core/util/instanceCheck';

describe('InstanceCheck', () => {
	let instanceCheck;
	let mockEditor;
	let mockWindow;

	beforeEach(() => {
		mockWindow = {
			Node: window.Node,
			Element: window.Element,
			Range: window.Range,
			Selection: window.Selection
		};

		mockEditor = {
			frameContext: {
				get: jest.fn().mockReturnValue(mockWindow)
			}
		};

		instanceCheck = new InstanceCheck(mockEditor);
	});

	describe('constructor', () => {
		it('should create an instance with editor reference', () => {
			expect(instanceCheck).toBeInstanceOf(InstanceCheck);
			expect(instanceCheck.editor).toBe(mockEditor);
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

		it('should use frame window for instanceof check', () => {
			instanceCheck.isNode(document.createElement('div'));
			expect(mockEditor.frameContext.get).toHaveBeenCalledWith('_ww');
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

		it('should use frame window for instanceof check', () => {
			instanceCheck.isElement(document.createElement('div'));
			expect(mockEditor.frameContext.get).toHaveBeenCalledWith('_ww');
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

		it('should use frame window for instanceof check', () => {
			instanceCheck.isRange(document.createRange());
			expect(mockEditor.frameContext.get).toHaveBeenCalledWith('_ww');
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

		it('should use frame window for instanceof check', () => {
			instanceCheck.isSelection(window.getSelection());
			expect(mockEditor.frameContext.get).toHaveBeenCalledWith('_ww');
		});
	});

	describe('_getFrameWindow', () => {
		it('should call frameContext.get with "_ww" parameter', () => {
			const result = instanceCheck._getFrameWindow();

			expect(mockEditor.frameContext.get).toHaveBeenCalledWith('_ww');
			expect(result).toBe(mockWindow);
		});
	});

	describe('iframe safety', () => {
		let iframeWindow;
		let iframeInstanceCheck;

		beforeEach(() => {
			const iframe = document.createElement('iframe');
			document.body.appendChild(iframe);
			iframeWindow = iframe.contentWindow;

			const iframeMockEditor = {
				frameContext: {
					get: jest.fn().mockReturnValue(iframeWindow)
				}
			};

			iframeInstanceCheck = new InstanceCheck(iframeMockEditor);
		});

		afterEach(() => {
			const iframe = document.querySelector('iframe');
			if (iframe) {
				document.body.removeChild(iframe);
			}
		});

		it('should correctly identify elements from different iframe contexts', () => {
			if (!iframeWindow) {
				pending('Iframe not accessible in test environment');
				return;
			}

			const mainWindowDiv = document.createElement('div');
			const iframeDiv = iframeWindow.document.createElement('div');

			expect(instanceCheck.isElement(mainWindowDiv)).toBe(true);
			expect(instanceCheck.isElement(iframeDiv)).toBe(false);

			expect(iframeInstanceCheck.isElement(iframeDiv)).toBe(true);
			expect(iframeInstanceCheck.isElement(mainWindowDiv)).toBe(false);
		});

		it('should correctly identify ranges from different iframe contexts', () => {
			if (!iframeWindow) {
				pending('Iframe not accessible in test environment');
				return;
			}

			const mainWindowRange = document.createRange();
			const iframeRange = iframeWindow.document.createRange();

			expect(instanceCheck.isRange(mainWindowRange)).toBe(true);
			expect(instanceCheck.isRange(iframeRange)).toBe(false);

			expect(iframeInstanceCheck.isRange(iframeRange)).toBe(true);
			expect(iframeInstanceCheck.isRange(mainWindowRange)).toBe(false);
		});
	});

	describe('edge cases', () => {
		it('should handle null frameContext gracefully', () => {
			const brokenEditor = {
				frameContext: null
			};
			const brokenInstanceCheck = new InstanceCheck(brokenEditor);

			expect(() => brokenInstanceCheck.isNode(document.createElement('div'))).toThrow();
		});

		it('should handle missing _ww in frameContext', () => {
			const editorWithMissingWw = {
				frameContext: {
					get: jest.fn().mockReturnValue(null)
				}
			};
			const instanceCheckWithMissingWw = new InstanceCheck(editorWithMissingWw);

			expect(() => instanceCheckWithMissingWw.isNode(document.createElement('div'))).toThrow();
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

		it('should call frameContext.get for each method call', () => {
			const div = document.createElement('div');

			instanceCheck.isNode(div);
			instanceCheck.isElement(div);

			expect(mockEditor.frameContext.get).toHaveBeenCalledTimes(2);
		});
	});
});
