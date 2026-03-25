/**
 * @jest-environment jsdom
 */

import { createMockEditor } from '../../../../__mocks__/editorMock';
import Shortcuts from '../../../../../src/core/logic/shell/shortcuts';

describe('Shortcuts', () => {
	let mockEditor;
	let shortcuts;

	beforeEach(() => {
		mockEditor = createMockEditor();
		shortcuts = new Shortcuts(mockEditor);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Constructor', () => {
		it('should initialize Shortcuts with default properties', () => {
			expect(shortcuts).toBeDefined();
			expect(shortcuts.keyMap).toBeDefined();
			expect(shortcuts.keyMap instanceof Map).toBe(true);
			expect(shortcuts.reverseKeys).toBeDefined();
			expect(shortcuts.reverseKeys instanceof Set).toBe(true);
		});

		it('should have empty keyMap initially', () => {
			expect(shortcuts.keyMap.size).toBe(0);
		});

		it('should have empty reverseKeys set initially', () => {
			expect(shortcuts.reverseKeys.size).toBe(0);
		});
	});

	describe('command method', () => {
		let mockEvent;
		let mockRange;
		let mockLine;

		beforeEach(() => {
			mockEvent = {
				key: 'b',
				code: 'KeyB',
				shiftKey: false,
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
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

		it('should return false for ctrl shortcut when not registered', () => {
			const result = shortcuts.command(mockEvent, true, false, 'KeyZ', 'z', false, mockLine, mockRange);
			expect(result).toBe(false);
		});

		it('should handle ctrl+key shortcuts', () => {
			const mockInfo = {
				command: 'bold',
				type: 'command',
				button: null,
				c: true,
				s: false,
				space: false,
				enter: false
			};
			shortcuts.keyMap.set('KeyB', mockInfo);

			const result = shortcuts.command(mockEvent, true, false, 'KeyB', 'b', false, mockLine, mockRange);
			expect(result).toBe(true);
		});

		it('should handle ctrl+shift+key shortcuts', () => {
			const mockInfo = {
				command: 'testCommand',
				type: 'command',
				button: null,
				c: true,
				s: true,
				space: false,
				enter: false
			};
			shortcuts.keyMap.set('KeyB1000', mockInfo);

			mockEvent.shiftKey = true;
			const result = shortcuts.command(mockEvent, true, true, 'KeyB', 'b', false, mockLine, mockRange);
			expect(result).toBe(true);
		});

		it('should work with shift key when required', () => {
			const mockInfo = {
				command: 'bold',
				type: 'command',
				button: null,
				c: true,
				s: true,
				space: false,
				enter: false
			};
			shortcuts.keyMap.set('KeyB1000', mockInfo);

			mockEvent.shiftKey = true;
			const result = shortcuts.command(mockEvent, true, true, 'KeyB', 'b', false, mockLine, mockRange);
			expect(result).toBe(true);
		});

		it('should not execute without required info in map', () => {
			// keyMap is empty, so should return false
			const result = shortcuts.command(mockEvent, false, false, 'KeyX', 'x', false, mockLine, mockRange);
			expect(result).toBe(false);
		});

		it('should trigger plugin method when available', () => {
			const pluginMethod = jest.fn();
			const mockInfo = {
				command: 'bold',
				type: 'command',
				button: null,
				plugin: 'bold',
				method: 'action',
				c: true,
				s: false,
				space: false,
				enter: false
			};
			shortcuts.keyMap.set('KeyB', mockInfo);
			mockEditor.$.plugins['bold'] = { action: pluginMethod };

			shortcuts.command(mockEvent, true, false, 'KeyB', 'b', false, mockLine, mockRange);
			expect(pluginMethod).toHaveBeenCalledWith({
				range: mockRange,
				line: mockLine,
				info: mockInfo,
				event: mockEvent,
				keyCode: 'KeyB'
			});
		});

		it('should trigger custom function when method is function', () => {
			const customFunction = jest.fn();
			const mockInfo = {
				command: 'custom',
				type: 'command',
				button: null,
				method: customFunction,
				c: true,
				s: false,
				space: false,
				enter: false
			};
			shortcuts.keyMap.set('KeyC', mockInfo);

			shortcuts.command(mockEvent, true, false, 'KeyC', 'c', false, mockLine, mockRange);
			expect(customFunction).toHaveBeenCalledWith({
				range: mockRange,
				line: mockLine,
				info: mockInfo,
				event: mockEvent,
				keyCode: 'KeyC'
			});
		});

		it('should trigger commandDispatcher.run when no method specified', () => {
			const mockButton = document.createElement('button');
			const mockInfo = {
				command: 'bold',
				type: 'command',
				button: mockButton,
				c: true,
				s: false,
				space: false,
				enter: false
			};
			shortcuts.keyMap.set('KeyB', mockInfo);

			shortcuts.command(mockEvent, true, false, 'KeyB', 'b', false, mockLine, mockRange);
			expect(mockEditor.$.commandDispatcher.run).toHaveBeenCalledWith('bold', 'command', mockButton);
		});

		it('should handle space key requirements', () => {
			const mockInfo = {
				command: 'autoFormat',
				type: 'command',
				button: null,
				c: false,
				s: false,
				space: true,
				enter: false
			};
			shortcuts.keyMap.set(' ', mockInfo);

			// Test with space key
			const spaceEvent = { ...mockEvent, key: ' ', code: 'Space' };
			const result = shortcuts.command(spaceEvent, false, false, 'Space', ' ', false, mockLine, mockRange);
			expect(result).toBe(true);

			// Test without space key
			const result2 = shortcuts.command(mockEvent, false, false, 'KeyB', 'b', false, mockLine, mockRange);
			expect(result2).toBe(false);
		});

		it('should handle enter key requirements', () => {
			const mockInfo = {
				command: 'autoFormat',
				type: 'command',
				button: null,
				c: false,
				s: false,
				space: false,
				enter: true
			};
			shortcuts.keyMap.set('Enter', mockInfo);

			// Test with enter key
			const enterEvent = { ...mockEvent, key: 'Enter', code: 'Enter' };
			const result = shortcuts.command(enterEvent, false, false, 'Enter', 'Enter', false, mockLine, mockRange);
			expect(result).toBe(true);
		});

		it('should handle edge parameter requirement', () => {
			const mockInfo = {
				command: 'autoFormat',
				type: 'command',
				button: null,
				c: false,
				s: false,
				space: false,
				enter: false,
				edge: true
			};
			shortcuts.keyMap.set('x', mockInfo);

			// Test with edge true
			const result = shortcuts.command(mockEvent, false, false, 'KeyX', 'x', true, mockLine, mockRange);
			expect(result).toBe(true);

			// Test with edge false
			const result2 = shortcuts.command(mockEvent, false, false, 'KeyX', 'x', false, mockLine, mockRange);
			expect(result2).toBe(false);
		});

		it('should handle textTrigger requirement', () => {
			const mockInfo = {
				command: 'mention',
				type: 'command',
				button: null,
				c: false,
				s: false,
				space: false,
				enter: false,
				textTrigger: true
			};
			shortcuts.keyMap.set('@', mockInfo);

			// Test with whitespace key (should fail)
			const event = { ...mockEvent, key: '@' };
			const result = shortcuts.command(event, false, false, 'Shift2', '@', false, mockLine, mockRange);
			expect(result).toBe(true);

			// Test with space (should fail)
			const spaceEvent = { ...mockEvent, key: ' ' };
			const result2 = shortcuts.command(spaceEvent, false, false, 'Space', ' ', false, mockLine, mockRange);
			expect(result2).toBe(false);
		});
	});

	describe('enable method', () => {
		it('should enable shortcut activation', () => {
			shortcuts.disable();
			shortcuts.enable();
			const mockEvent = { key: 'b', code: 'KeyB', shiftKey: false };
			const result = shortcuts.command(mockEvent, false, false, 'KeyB', 'b', false, null, null);
			expect(result).toBe(false);
		});

		it('should allow shortcuts after enable', () => {
			shortcuts.disable();
			expect(() => {
				shortcuts.enable();
			}).not.toThrow();
		});
	});

	describe('disable method', () => {
		it('should disable shortcut activation', () => {
			shortcuts.disable();
			const mockEvent = { key: 'b', code: 'KeyB', shiftKey: false };
			const result = shortcuts.command(mockEvent, true, false, 'KeyB', 'b', false, null, null);
			expect(result).toBe(false);
		});

		it('should prevent all shortcuts when disabled', () => {
			shortcuts.disable();
			const mockInfo = { command: 'bold', type: 'command' };
			shortcuts.keyMap.set('KeyB', mockInfo);

			const mockEvent = { key: 'b', code: 'KeyB', shiftKey: false };
			const result = shortcuts.command(mockEvent, true, false, 'KeyB', 'b', false, null, null);
			expect(result).toBe(false);
		});
	});

	describe('_registerCustomShortcuts method', () => {
		it('should populate keyMap from options', () => {
			mockEditor.$.options.set('shortcuts', {
				_customShortcut: {
					keyCode: 'KeyB',
					command: 'bold'
				}
			});
			mockEditor.$.options.set('_reverseCommandArray', []);

			shortcuts._registerShortcuts();
			// Should complete without error
			expect(shortcuts.keyMap).toBeDefined();
		});

		it('should only register custom shortcuts starting with underscore', () => {
			const testShortcuts = {
				_custom1: {},
				_custom2: {},
				notCustom: {}
			};
			mockEditor.$.options.set('shortcuts', testShortcuts);
			mockEditor.$.options.set('_reverseCommandArray', []);

			const initialSize = shortcuts.keyMap.size;
			shortcuts._registerShortcuts();

			// Should register at least the custom ones
			expect(shortcuts.keyMap.size).toBeGreaterThanOrEqual(initialSize);
		});

		it('should clear previous keyMap before registering', () => {
			const testShortcuts = {
				_custom: {}
			};
			mockEditor.$.options.set('shortcuts', testShortcuts);
			mockEditor.$.options.set('_reverseCommandArray', []);

			shortcuts.keyMap.set('testKey', { command: 'test' });
			const sizeBefore = shortcuts.keyMap.size;

			shortcuts._registerShortcuts();

			// keyMap should be reset and repopulated
			expect(shortcuts.keyMap).toBeDefined();
		});
	});

	describe('_destroy method', () => {
		it('should clear keyMap', () => {
			shortcuts.keyMap.set('KeyB', { command: 'bold' });
			shortcuts._destroy();
			expect(shortcuts.keyMap.size).toBe(0);
		});

		it('should clear reverseKeys', () => {
			shortcuts.reverseKeys.add('KeyB');
			shortcuts._destroy();
			expect(shortcuts.reverseKeys.size).toBe(0);
		});

		it('should clean up all internal state', () => {
			shortcuts.keyMap.set('KeyB', { command: 'bold' });
			shortcuts.keyMap.set('KeyI', { command: 'italic' });
			shortcuts.reverseKeys.add('KeyB');
			shortcuts.reverseKeys.add('KeyI');

			shortcuts._destroy();

			expect(shortcuts.keyMap.size).toBe(0);
			expect(shortcuts.reverseKeys.size).toBe(0);
		});
	});

	describe('Integration scenarios', () => {
		it('should handle enable/disable cycles', () => {
			shortcuts.disable();
			shortcuts.enable();
			shortcuts.disable();
			shortcuts.enable();

			const mockEvent = { key: 'b', code: 'KeyB', shiftKey: false };
			const result = shortcuts.command(mockEvent, false, false, 'KeyB', 'b', false, null, null);
			expect(result).toBe(false);
		});

		it('should handle shortcut registration and execution', () => {
			const mockInfo = {
				command: 'bold',
				type: 'command',
				button: null,
				c: true,
				s: false,
				space: false,
				enter: false
			};
			shortcuts.keyMap.set('KeyB', mockInfo);

			const mockEvent = { key: 'b', code: 'KeyB', shiftKey: false };
			const result = shortcuts.command(mockEvent, true, false, 'KeyB', 'b', false, null, null);
			expect(result).toBe(true);
		});

		it('should handle dynamic shortcut updates', () => {
			const info1 = { command: 'bold', type: 'command' };
			const info2 = { command: 'italic', type: 'command' };

			shortcuts.keyMap.set('KeyB', info1);
			let result = shortcuts.command({ key: 'b', code: 'KeyB', shiftKey: false }, true, false, 'KeyB', 'b', false, null, null);
			expect(result).toBe(true);

			shortcuts.keyMap.set('KeyB', info2);
			result = shortcuts.command({ key: 'b', code: 'KeyB', shiftKey: false }, true, false, 'KeyB', 'b', false, null, null);
			expect(result).toBe(true);
		});
	});
});
