import Char from '../../../../src/core/class/char';
import CoreInjector from '../../../../src/editorInjector/_core';
import { _w, isEdge } from '../../../../src/helper/env';
import { addClass, removeClass, hasClass } from '../../../../src/helper/dom/domUtils';

// Mock dependencies
jest.mock('../../../../src/editorInjector/_core');
jest.mock('../../../../src/helper/env');
jest.mock('../../../../src/helper/dom/domUtils');

describe('Char class', () => {
	let charInstance;
	let mockEditor;
	let mockFrameOptions;
	let mockFrameContext;
	let mockWysiwyg;
	let mockSelection;

	beforeEach(() => {
		// Reset mocks
		jest.clearAllMocks();

		// Mock editor and its components
		mockWysiwyg = {
			innerHTML: '<p>test content</p>',
			textContent: 'test content'
		};

		mockFrameOptions = new Map();
		mockFrameContext = new Map();
		mockFrameContext.set('wysiwyg', mockWysiwyg);
		mockFrameContext.set('charCounter', { textContent: '0' });
		mockFrameContext.set('charWrapper', document.createElement('div'));

		mockSelection = {
			_init: jest.fn(),
			getRange: jest.fn(() => ({
				endOffset: 5,
				endContainer: { textContent: 'test content' }
			})),
			getNode: jest.fn(() => ({ textContent: 'test content' })),
			setRange: jest.fn()
		};

		mockEditor = {
			frameOptions: mockFrameOptions,
			frameContext: mockFrameContext,
			selection: mockSelection
		};

		// Create char instance
		charInstance = new Char(mockEditor);
		charInstance.frameOptions = mockFrameOptions;
		charInstance.frameContext = mockFrameContext;
		charInstance.selection = mockSelection;

		// Mock _w.setTimeout
		if (!_w) {
			_w = {};
		}
		if (!_w.setTimeout) {
			_w.setTimeout = jest.fn((fn) => fn());
		} else {
			_w.setTimeout = jest.fn(_w.setTimeout);
		}
	});

	describe('constructor', () => {
		it('should call CoreInjector', () => {
			expect(CoreInjector).toHaveBeenCalledWith(mockEditor);
		});
	});

	describe('check method', () => {
		it('should return true when no charCounter_max is set', () => {
			mockFrameOptions.set('charCounter_max', null);

			const result = charInstance.check('<p>test</p>');

			expect(result).toBe(true);
		});

		it('should return true when content length is within limit', () => {
			mockFrameOptions.set('charCounter_max', 100);
			jest.spyOn(charInstance, 'getLength').mockReturnValue(10);

			const result = charInstance.check('short text');

			expect(result).toBe(true);
		});

		it('should return false when content length exceeds limit', () => {
			mockFrameOptions.set('charCounter_max', 10);
			jest.spyOn(charInstance, 'getLength')
				.mockReturnValueOnce(5) // for input
				.mockReturnValueOnce(20); // for current content

			const result = charInstance.check('test');

			expect(result).toBe(false);
		});

		it('should handle string input', () => {
			mockFrameOptions.set('charCounter_max', 100);
			jest.spyOn(charInstance, 'getLength').mockReturnValue(5);

			const result = charInstance.check('test string');

			expect(result).toBe(true);
			expect(charInstance.getLength).toHaveBeenCalledWith('test string');
		});

		it('should handle HTML element input', () => {
			mockFrameOptions.set('charCounter_max', 100);
			mockFrameOptions.set('charCounter_type', 'char');
			jest.spyOn(charInstance, 'getLength').mockReturnValue(5);

			const element = document.createElement('p');
			element.textContent = 'test';

			const result = charInstance.check(element);

			expect(result).toBe(true);
			expect(charInstance.getLength).toHaveBeenCalledWith('test');
		});

		it('should handle HTML element with byte-html counter type', () => {
			mockFrameOptions.set('charCounter_max', 100);
			mockFrameOptions.set('charCounter_type', 'byte-html');
			jest.spyOn(charInstance, 'getLength').mockReturnValue(5);

			const element = document.createElement('p');
			element.innerHTML = '<span>test</span>';

			const result = charInstance.check(element);

			expect(result).toBe(true);
			expect(charInstance.getLength).toHaveBeenCalledWith('<p><span>test</span></p>');
		});
	});

	describe('getLength method', () => {
		it('should return character length when charCounter_type is char', () => {
			mockFrameOptions.set('charCounter_type', 'char');

			const result = charInstance.getLength('test');

			expect(result).toBe(4);
		});

		it('should return byte length when charCounter_type is byte', () => {
			mockFrameOptions.set('charCounter_type', 'byte');
			jest.spyOn(charInstance, 'getByteLength').mockReturnValue(8);

			const result = charInstance.getLength('test');

			expect(result).toBe(8);
			expect(charInstance.getByteLength).toHaveBeenCalledWith('test');
		});

		it('should use wysiwyg textContent when no content provided', () => {
			mockFrameOptions.set('charCounter_type', 'char');
			mockWysiwyg.textContent = 'editor content';

			const result = charInstance.getLength();

			expect(result).toBe(14);
		});

		it('should use wysiwyg innerHTML when charCounter_type is byte-html and no content provided', () => {
			mockFrameOptions.set('charCounter_type', 'byte-html');
			mockWysiwyg.innerHTML = '<p>editor content</p>';
			jest.spyOn(charInstance, 'getByteLength').mockReturnValue(20);

			const result = charInstance.getLength();

			expect(result).toBe(20);
			expect(charInstance.getByteLength).toHaveBeenCalledWith('<p>editor content</p>');
		});
	});

	describe('getByteLength method', () => {
		beforeEach(() => {
			// Mock TextEncoder
			global.TextEncoder = jest.fn().mockImplementation(() => ({
				encode: jest.fn((text) => new Uint8Array(text.length))
			}));
		});

		it('should return 0 for empty or null input', () => {
			expect(charInstance.getByteLength('')).toBe(0);
			expect(charInstance.getByteLength(null)).toBe(0);
			expect(charInstance.getByteLength(undefined)).toBe(0);
		});

		it('should convert non-string input to string', () => {
			const result = charInstance.getByteLength(123);
			expect(result).toBeGreaterThan(0);
		});

		it('should calculate byte length for Edge browser', () => {
			isEdge.mockReturnValue(true);

			const result = charInstance.getByteLength('test');

			expect(result).toBe(4);
		});

		it('should calculate byte length for non-Edge browsers', () => {
			isEdge.mockReturnValue(false);

			const result = charInstance.getByteLength('test');

			expect(result).toBe(4);
		});

		it('should handle newline characters correctly', () => {
			isEdge.mockReturnValue(false);

			const result = charInstance.getByteLength('test\n\rmore');

			expect(result).toBeGreaterThan(9); // Base length + newline adjustments
		});
	});

	describe('display method', () => {
		it('should update charCounter textContent', async () => {
			const mockCharCounter = { textContent: '0' };
			mockFrameContext.set('charCounter', mockCharCounter);
			jest.spyOn(charInstance, 'getLength').mockReturnValue(15);

			charInstance.display();

			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(mockCharCounter.textContent).toBe(15);
		});

		it('should handle custom frame context', async () => {
			const customFrameContext = new Map();
			const mockCharCounter = { textContent: '0' };
			customFrameContext.set('charCounter', mockCharCounter);
			jest.spyOn(charInstance, 'getLength').mockReturnValue(20);

			charInstance.display(customFrameContext);

			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(mockCharCounter.textContent).toBe(20);
		});

		it('should handle missing charCounter gracefully', () => {
			mockFrameContext.set('charCounter', null);

			expect(() => charInstance.display()).not.toThrow();
		});
	});

	describe('test method', () => {
		beforeEach(() => {
			jest.spyOn(charInstance, 'display').mockImplementation(() => {});
			jest.spyOn(charInstance, 'getLength').mockReturnValue(5);
		});

		it('should return true when no charCounter_max is set', () => {
			mockFrameOptions.set('charCounter_max', 0);

			const result = charInstance.test('input text');

			expect(result).toBe(true);
		});

		it('should return true when within character limit', () => {
			mockFrameOptions.set('charCounter_max', 50);

			const result = charInstance.test('input text');

			expect(result).toBe(true);
		});

		it('should return false when adding text would exceed limit', () => {
			mockFrameOptions.set('charCounter_max', 10);
			charInstance.getLength.mockReturnValueOnce(3).mockReturnValueOnce(8); // input, current

			const result = charInstance.test('input text');

			expect(result).toBe(false);
		});

		it('should handle text removal when current content exceeds limit', () => {
			mockFrameOptions.set('charCounter_max', 10);
			charInstance.getLength.mockReturnValueOnce(2).mockReturnValueOnce(15); // input, current

			const mockRange = {
				endOffset: 5,
				endContainer: { textContent: 'current content' }
			};
			mockSelection.getRange.mockReturnValue(mockRange);
			mockSelection.getNode.mockReturnValue({ textContent: 'current content' });

			const result = charInstance.test('xx', true);

			expect(mockSelection._init).toHaveBeenCalled();
			expect(mockSelection.setRange).toHaveBeenCalled();
		});

		it('should call display method', () => {
			const result = charInstance.test('input');

			expect(charInstance.display).toHaveBeenCalled();
		});
	});

	describe('CounterBlink function (via test method)', () => {
		beforeEach(() => {
			// getLength를 Jest mock 함수로 설정
			charInstance.getLength = jest.fn();
		});

		it('should add blink class when exceeding limit', () => {
			mockFrameOptions.set('charCounter_max', 5);
			charInstance.getLength.mockReturnValueOnce(2).mockReturnValueOnce(10); // input, current
			hasClass.mockReturnValue(false);

			charInstance.test('input');

			expect(addClass).toHaveBeenCalledWith(mockFrameContext.get('charWrapper'), 'se-blink');
		});

		it('should not add blink class if already blinking', () => {
			mockFrameOptions.set('charCounter_max', 5);
			charInstance.getLength.mockReturnValueOnce(2).mockReturnValueOnce(10); // input, current
			hasClass.mockReturnValue(true);

			charInstance.test('input');

			expect(addClass).not.toHaveBeenCalled();
		});
	});
});
