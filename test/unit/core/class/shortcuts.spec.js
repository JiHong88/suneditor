import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';

describe('Core - Shortcuts', () => {
	let editor;
	let shortcuts;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
		shortcuts = editor.shortcuts;
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('command method', () => {
		let mockEvent;
		let mockRange;
		let mockLine;

		beforeEach(() => {
			mockEvent = {
				key: 'b',
				code: 'KeyB',
				preventDefault: jest.fn(),
				stopPropagation: jest.fn(),
			};
			mockRange = document.createRange();
			mockLine = document.createElement('p');
		});

		it('should return false when shortcuts are disabled', () => {
			shortcuts.disable();
			const result = shortcuts.command(mockEvent, false, false, 'KeyB', 'b', false, mockLine, mockRange);
			expect(result).toBe(false);
		});

		it('should return false when no matching shortcut is found', () => {
			const result = shortcuts.command(mockEvent, false, false, 'KeyX', 'x', false, mockLine, mockRange);
			expect(result).toBe(false);
		});

		it('should handle ctrl+key shortcuts', () => {
			// Setup a test shortcut and mock plugin
			editor.plugins['bold'] = { action: jest.fn() };
			const mockInfo = {
				command: 'bold',
				type: 'command',
				button: null,
				c: true,
				s: false,
				space: false,
				enter: false,
			};
			shortcuts.keyMap.set('KeyB', mockInfo);

			const result = shortcuts.command(mockEvent, true, false, 'KeyB', 'b', false, mockLine, mockRange);

			expect(result).toBe(true);
			expect(editor.plugins['bold'].action).toHaveBeenCalled();
		});

		it('should handle ctrl+shift+key shortcuts', () => {
			editor.plugins['testCommand'] = { action: jest.fn() };
			const mockInfo = {
				command: 'testCommand',
				type: 'command',
				button: null,
				c: true,
				s: true,
				space: false,
				enter: false,
			};
			shortcuts.keyMap.set('KeyB1000', mockInfo);

			const result = shortcuts.command(mockEvent, true, true, 'KeyB', 'b', false, mockLine, mockRange);

			expect(result).toBe(true);
			expect(editor.plugins['testCommand'].action).toHaveBeenCalled();
		});

		it('should handle text-based shortcuts', () => {
			editor.plugins['testText'] = { action: jest.fn() };
			const mockInfo = {
				command: 'testText',
				type: 'command',
				button: null,
				c: false,
				s: false,
				space: false,
				enter: false,
			};
			shortcuts.keyMap.set('##', mockInfo);
			mockEvent.key = '#';

			const result = shortcuts.command(mockEvent, false, false, 'Digit3', '##', false, mockLine, mockRange);

			expect(result).toBe(true);
			expect(editor.plugins['testText'].action).toHaveBeenCalled();
		});

		it('should return false if shift is required but not pressed', () => {
			const mockInfo = {
				command: 'testShift',
				type: 'command',
				button: null,
				c: false,
				s: true,
				space: false,
				enter: false,
			};
			shortcuts.keyMap.set('KeyA', mockInfo);

			const result = shortcuts.command(mockEvent, false, false, 'KeyA', 'a', false, mockLine, mockRange);

			expect(result).toBe(false);
		});

		it('should return false if space is required but not pressed', () => {
			const mockInfo = {
				command: 'testSpace',
				type: 'command',
				button: null,
				c: false,
				s: false,
				space: true,
				enter: false,
			};
			shortcuts.keyMap.set('test', mockInfo);

			const result = shortcuts.command(mockEvent, false, false, 'KeyA', 'test', false, mockLine, mockRange);

			expect(result).toBe(false);
		});

		it('should return false if enter is required but not pressed', () => {
			const mockInfo = {
				command: 'testEnter',
				type: 'command',
				button: null,
				c: false,
				s: false,
				space: false,
				enter: true,
			};
			shortcuts.keyMap.set('test', mockInfo);

			const result = shortcuts.command(mockEvent, false, false, 'KeyA', 'test', false, mockLine, mockRange);

			expect(result).toBe(false);
		});

		it('should return false if edge is required but not at edge', () => {
			const mockInfo = {
				command: 'testEdge',
				type: 'command',
				button: null,
				c: false,
				s: false,
				space: false,
				enter: false,
				edge: true,
			};
			shortcuts.keyMap.set('test', mockInfo);

			const result = shortcuts.command(mockEvent, false, false, 'KeyA', 'test', false, mockLine, mockRange);

			expect(result).toBe(false);
		});

		it('should return false if textTrigger is required but key has no text', () => {
			const mockInfo = {
				command: 'testText',
				type: 'command',
				button: null,
				c: false,
				s: false,
				space: false,
				enter: false,
				textTrigger: true,
			};
			shortcuts.keyMap.set('test', mockInfo);
			mockEvent.key = ' ';

			const result = shortcuts.command(mockEvent, false, false, 'Space', 'test', false, mockLine, mockRange);

			expect(result).toBe(false);
		});

		it('should call plugin method when method is a string', () => {
			const mockPluginMethod = jest.fn();
			editor.plugins['testPlugin'] = {
				testMethod: mockPluginMethod,
			};

			const mockInfo = {
				plugin: 'testPlugin',
				method: 'testMethod',
				c: false,
				s: false,
				space: false,
				enter: false,
			};
			shortcuts.keyMap.set('test', mockInfo);

			const result = shortcuts.command(mockEvent, false, false, 'KeyA', 'test', false, mockLine, mockRange);

			expect(result).toBe(true);
			expect(mockPluginMethod).toHaveBeenCalledWith({
				range: mockRange,
				line: mockLine,
				info: mockInfo,
				event: mockEvent,
				keyCode: 'KeyA',
			});
		});

		it('should call method function when method is a function', () => {
			const mockMethod = jest.fn();
			const mockInfo = {
				method: mockMethod,
				c: false,
				s: false,
				space: false,
				enter: false,
			};
			shortcuts.keyMap.set('test', mockInfo);

			const result = shortcuts.command(mockEvent, false, false, 'KeyA', 'test', false, mockLine, mockRange);

			expect(result).toBe(true);
			expect(mockMethod).toHaveBeenCalledWith({
				range: mockRange,
				line: mockLine,
				info: mockInfo,
				event: mockEvent,
				keyCode: 'KeyA',
				editor: editor,
			});
		});

		it('should handle text + event.key combination shortcuts', () => {
			editor.plugins['testCombo'] = { action: jest.fn() };
			const mockInfo = {
				command: 'testCombo',
				type: 'command',
				button: null,
				c: false,
				s: false,
				space: false,
				enter: false,
			};
			shortcuts.keyMap.set('ab', mockInfo);
			mockEvent.key = 'b';

			const result = shortcuts.command(mockEvent, false, false, 'KeyB', 'a', false, mockLine, mockRange);

			expect(result).toBe(true);
			expect(editor.plugins['testCombo'].action).toHaveBeenCalled();
		});
	});
});
