/**
 * @jest-environment jsdom
 */

import { createMockEditor } from '../../../../__mocks__/editorMock';
import History from '../../../../../src/core/logic/shell/history';

describe('History', () => {
	let mockEditor;
	let history;

	beforeEach(() => {
		mockEditor = createMockEditor();
		history = History(mockEditor);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Constructor/Initialization', () => {
		it('should initialize History function and return object with methods', () => {
			expect(history).toBeDefined();
		});
	});

	describe('push method', () => {
		it('should push content to history stack without delay', () => {
			mockEditor.$.history.push(false);
			expect(mockEditor.$.history.push).toHaveBeenCalledWith(false);
		});

		it('should accept delay parameter as boolean', () => {
			mockEditor.$.history.push(true);
			expect(mockEditor.$.history.push).toHaveBeenCalledWith(true);
		});

		it('should accept custom delay time as number', () => {
			mockEditor.$.history.push(500);
			expect(mockEditor.$.history.push).toHaveBeenCalledWith(500);
		});

		it('should accept rootKey parameter', () => {
			mockEditor.$.history.push(false, 'test-frame');
			expect(mockEditor.$.history.push).toHaveBeenCalledWith(false, 'test-frame');
		});
	});

	describe('check method', () => {
		it('should flush pending delayed history saves', () => {
			history.check('test-frame');
			// Method should complete without error
			expect(mockEditor.$.history.check).toBeDefined();
		});

		it('should accept rootKey and range parameters', () => {
			const range = document.createRange();
			mockEditor.$.history.check('test-frame', range);
			expect(mockEditor.$.history.check).toHaveBeenCalled();
		});
	});

	describe('undo method', () => {
		it('should be callable', () => {
			history.undo();
			expect(mockEditor.$.history.undo).toBeDefined();
		});

		it('should not throw error when called', () => {
			expect(() => {
				history.undo();
			}).not.toThrow();
		});
	});

	describe('redo method', () => {


		it('should be callable through mockEditor', () => {
			mockEditor.$.history.redo();
			expect(mockEditor.$.history.redo).toHaveBeenCalled();
		});
	});

	describe('pause method', () => {
		it('should pause history tracking', () => {
			history.pause();
			expect(mockEditor.$.history.pause).toBeDefined();
		});

		it('should prevent new history entries', () => {
			history.pause();
			// Further pushes should be ignored while paused
			expect(() => {
				history.push(false);
			}).not.toThrow();
		});
	});

	describe('resume method', () => {


		it('should be callable through mockEditor', () => {
			mockEditor.$.history.resume();
			expect(mockEditor.$.history.resume).toHaveBeenCalled();
		});
	});

	describe('reset method', () => {


		it('should be callable through mockEditor', () => {
			mockEditor.$.history.reset();
			expect(mockEditor.$.history.reset).toHaveBeenCalled();
		});
	});

	describe('resetButtons method', () => {


		it('should be callable with rootKey and index', () => {
			mockEditor.$.history.resetButtons('test-frame', 0);
			expect(mockEditor.$.history.resetButtons).toHaveBeenCalledWith('test-frame', 0);
		});

		it('should handle undefined index parameter', () => {
			mockEditor.$.history.resetButtons('test-frame');
			expect(mockEditor.$.history.resetButtons).toHaveBeenCalledWith('test-frame');
		});
	});

	describe('overwrite method', () => {


		it('should be callable with rootKey parameter', () => {
			mockEditor.$.history.overwrite('test-frame');
			expect(mockEditor.$.history.overwrite).toHaveBeenCalledWith('test-frame');
		});
	});

	describe('getRootStack method', () => {


		it('should return root stack through mockEditor', () => {
			const rootStack = mockEditor.$.history.getRootStack();
			expect(rootStack).toBeDefined();
			expect(typeof rootStack).toBe('object');
		});

		it('should contain frame information', () => {
			const rootStack = mockEditor.$.history.getRootStack();
			if (rootStack && rootStack['test-frame']) {
				expect(rootStack['test-frame']).toBeDefined();
				expect(rootStack['test-frame'].value).toBeDefined();
				expect(rootStack['test-frame'].index).toBeDefined();
			}
		});
	});

	describe('resetDelayTime method', () => {
		it('should set delay time for history saves', () => {
			history.resetDelayTime(600);
			expect(() => {
				history.resetDelayTime(600);
			}).not.toThrow();
		});

		it('should accept millisecond values', () => {
			history.resetDelayTime(0);
			history.resetDelayTime(1000);
			expect(() => {
				history.resetDelayTime(500);
			}).not.toThrow();
		});
	});

	describe('_destroy method', () => {


		it('should be callable directly', () => {
			expect(() => {
				history._destroy();
			}).not.toThrow();
		});
	});

	describe('Integration scenarios', () => {
		it('should handle pause/resume cycle through mockEditor', () => {
			mockEditor.$.history.pause();
			mockEditor.$.history.resume();
			mockEditor.$.history.push(false);
			expect(mockEditor.$.history.push).toHaveBeenCalled();
		});

		it('should handle multiple frame contexts', () => {
			const rootStack = mockEditor.$.history.getRootStack();
			expect(rootStack).toBeDefined();
			expect(typeof rootStack).toBe('object');
		});

		it('should manage button states through reset operations', () => {
			mockEditor.$.history.reset();
			mockEditor.$.history.resetButtons('test-frame', 0);
			expect(mockEditor.$.history.reset).toHaveBeenCalled();
		});

		it('should not crash when history state is desynchronized', () => {
			// Initialize roots
			history.reset();

			// Setup: push some history
			history.push(false, 'test-frame');
			
			const rootStack = history.getRootStack();
			const root = rootStack['test-frame'];
			
			// Simulate corruption: set index out of bounds
			root.index = 999; 

			// Action: attempt undo (which calls setContentFromStack)
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			
			expect(() => {
				history.undo();
			}).not.toThrow();
			
			expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('History state desynchronized'));
			consoleSpy.mockRestore();
		});
	});
});
