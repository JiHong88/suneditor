import History from '../../../../src/core/base/history';
import { createMockEditor } from '../../../__mocks__/editorMock';

describe('History', () => {
	let mockEditor;
	let history;

	beforeEach(() => {
		mockEditor = createMockEditor({
			historyStackDelayTime: 400,
			defaultLine: 'P'
		});

		mockEditor.status.hasFocus = true;
		// Set unique initial content for each test
		mockEditor.frameContext.get('wysiwyg').innerHTML = `<p>Test content ${Date.now()}</p>`;
		history = History(mockEditor);
		// Initialize history to set up rootStack properly
		history.reset();
	});

	describe('initialization', () => {
		it('should create a history object with required methods', () => {
			expect(history).toHaveProperty('push');
			expect(history).toHaveProperty('check');
			expect(history).toHaveProperty('undo');
			expect(history).toHaveProperty('redo');
			expect(history).toHaveProperty('overwrite');
			expect(history).toHaveProperty('pause');
			expect(history).toHaveProperty('resume');
			expect(history).toHaveProperty('reset');
			expect(history).toHaveProperty('resetButtons');
			expect(history).toHaveProperty('getRootStack');
			expect(history).toHaveProperty('resetDelayTime');
			expect(history).toHaveProperty('destroy');
		});
	});

	describe('push', () => {
		it('should push history immediately when delay is false', () => {
			const mockRange = document.createRange();
			mockEditor.status._range = mockRange;

			// Change content so it gets pushed
			mockEditor.frameContext.get('wysiwyg').innerHTML = '<p>Changed content</p>';

			history.push(false, 'test-frame');

			// Push again to see the changed content (first push creates root with initial content)
			mockEditor.frameContext.get('wysiwyg').innerHTML = '<p>Second change</p>';
			history.push(false, 'test-frame');

			// Check if content was actually pushed to history stack
			const rootStack = history.getRootStack();
			expect(rootStack['test-frame'].value.length).toBeGreaterThan(1);
			// The last push should be at the highest index
			const lastIndex = rootStack['test-frame'].value.length - 1;
			expect(rootStack['test-frame'].value[lastIndex].content).toBe('<p>Second change</p>');
		});

		it('should push history with delay when delay is true', (done) => {
			const mockRange = document.createRange();
			mockEditor.status._range = mockRange;

			history.push(true, 'test-frame');

			setTimeout(() => {
				expect(mockEditor.char.display).toHaveBeenCalled();
				done();
			}, 450);
		});

		it('should use custom delay time when numeric value provided', (done) => {
			const mockRange = document.createRange();
			mockEditor.status._range = mockRange;

			history.push(100, 'test-frame');

			setTimeout(() => {
				expect(mockEditor.char.display).toHaveBeenCalled();
				done();
			}, 110);
		});

		it('should not push when waiting is true', () => {
			history.pause();
			const spy = jest.spyOn(mockEditor, '_resourcesStateChange');

			history.push(false, 'test-frame');

			expect(spy).not.toHaveBeenCalled();
		});
	});

	describe('check', () => {
		it('should immediately push pending history', (done) => {
			const mockRange = document.createRange();
			mockEditor.status._range = mockRange;

			history.push(true, 'test-frame');

			setTimeout(() => {
				const spy = jest.spyOn(mockEditor.char, 'display');
				history.check('test-frame', mockRange);
				expect(spy).toHaveBeenCalled();
				done();
			}, 10);
		});

		it('should do nothing if no pending history', () => {
			const mockRange = document.createRange();
			const spy = jest.spyOn(mockEditor.char, 'display');

			history.check('test-frame', mockRange);

			expect(spy).not.toHaveBeenCalled();
		});
	});

	describe('undo', () => {
		it('should call setContentFromStack when stack index > 0', () => {
			history.push(false, 'test-frame');

			history.undo();

			expect(mockEditor.changeFrameContext).toHaveBeenCalled();
		});

		it('should not undo when at beginning of stack', () => {
			const spy = jest.spyOn(mockEditor, 'changeFrameContext');
			history.undo();
			expect(spy).not.toHaveBeenCalled();
		});
	});

	describe('redo', () => {
		it('should call setContentFromStack when redo is available', () => {
			history.push(false, 'test-frame');
			history.undo();

			const spy = jest.spyOn(mockEditor, 'changeFrameContext');
			history.redo();
			expect(spy).toHaveBeenCalled();
		});

		it('should not redo when at end of stack', () => {
			const spy = jest.spyOn(mockEditor, 'changeFrameContext');
			history.redo();
			expect(spy).not.toHaveBeenCalled();
		});
	});

	describe('overwrite', () => {
		it('should overwrite current history entry', () => {
			// Push initial content (this will create root with beforeEach content)
			mockEditor.frameContext.get('wysiwyg').innerHTML = '<p>Initial content</p>';
			history.push(false, 'test-frame');

			// Push again to get actual content in stack
			mockEditor.frameContext.get('wysiwyg').innerHTML = '<p>Second content</p>';
			history.push(false, 'test-frame');

			// Change content and overwrite current entry
			mockEditor.frameContext.get('wysiwyg').innerHTML = '<p>Modified content</p>';
			history.overwrite('test-frame');

			const rootStack = history.getRootStack();
			// Check that the last entry was overwritten
			expect(rootStack['test-frame'].value[rootStack['test-frame'].index].content).toBe('<p>Modified content</p>');
		});
	});

	describe('pause and resume', () => {
		it('should pause history tracking', () => {
			history.pause();
			const spy = jest.spyOn(mockEditor, '_resourcesStateChange');

			history.push(false, 'test-frame');

			expect(spy).not.toHaveBeenCalled();
		});

		it('should resume history tracking', () => {
			history.pause();
			history.resume();

			// Change content so it gets pushed
			mockEditor.frameContext.get('wysiwyg').innerHTML = '<p>Resume test content</p>';
			history.push(false, 'test-frame');

			// Check if content was pushed after resume
			const rootStack = history.getRootStack();
			expect(rootStack['test-frame'].value.length).toBeGreaterThan(0);
		});

		it('should auto-resume after 5 seconds', () => {
			jest.useFakeTimers();

			history.pause();

			// Fast-forward time by 5 seconds
			jest.advanceTimersByTime(5000);

			// Change content so it gets pushed
			mockEditor.frameContext.get('wysiwyg').innerHTML = '<p>Auto resume test</p>';
			history.push(false, 'test-frame');

			// Check if content was pushed after auto-resume
			const rootStack = history.getRootStack();
			expect(rootStack['test-frame'].value.length).toBeGreaterThan(0);

			jest.useRealTimers();
		});
	});

	describe('reset', () => {
		it('should reset all history state', () => {
			history.push(false, 'test-frame');
			history.reset();

			expect(mockEditor.applyCommandTargets).toHaveBeenCalledWith('undo', expect.any(Function));
			expect(mockEditor.applyCommandTargets).toHaveBeenCalledWith('redo', expect.any(Function));
			expect(mockEditor.applyCommandTargets).toHaveBeenCalledWith('save', expect.any(Function));
			expect(mockEditor.applyFrameRoots).toHaveBeenCalled();

			const rootStack = history.getRootStack();
			expect(rootStack['test-frame']).toEqual({ value: [], index: -1 });
		});
	});

	describe('resetButtons', () => {
		beforeEach(() => {
			mockEditor.frameContext.set('savedIndex', -1);
			mockEditor.frameContext.set('historyIndex', -1);
			mockEditor.frameContext.set('isChanged', false);
		});

		it('should reset button states based on history position', () => {
			history.push(false, 'test-frame');
			history.resetButtons('test-frame', 0);

			expect(mockEditor.applyCommandTargets).toHaveBeenCalledWith('undo', expect.any(Function));
			expect(mockEditor.applyCommandTargets).toHaveBeenCalledWith('redo', expect.any(Function));
			expect(mockEditor.applyCommandTargets).toHaveBeenCalledWith('save', expect.any(Function));
		});

		it('should trigger onResetButtons event', () => {
			history.resetButtons('test-frame', 0);

			expect(mockEditor.triggerEvent).toHaveBeenCalledWith('onResetButtons', { rootKey: 'test-frame' });
		});
	});

	describe('getRootStack', () => {
		it('should return the root stack object', () => {
			history.push(false, 'test-frame');
			const rootStack = history.getRootStack();

			expect(rootStack).toHaveProperty('test-frame');
			expect(rootStack['test-frame']).toHaveProperty('value');
			expect(rootStack['test-frame']).toHaveProperty('index');
		});
	});

	describe('resetDelayTime', () => {
		it('should update the delay time', () => {
			history.resetDelayTime(1000);

			expect(() => history.push(true, 'test-frame')).not.toThrow();
		});
	});

	describe('destroy', () => {
		it('should clean up resources', () => {
			history.push(true, 'test-frame');
			history.destroy();

			expect(history.getRootStack()).toBeNull();
		});
	});

	describe('edge cases', () => {
		it('should handle missing range gracefully', () => {
			mockEditor.status._range = null;

			expect(() => history.push(false, 'test-frame')).not.toThrow();
		});

		it('should handle empty content', () => {
			mockEditor.frameContext.get('wysiwyg').innerHTML = '';

			expect(() => history.push(false, 'test-frame')).not.toThrow();
		});

		it('should handle multiple frame contexts', () => {
			const secondFrame = new Map([
				['wysiwyg', document.createElement('div')],
				['key', 'second-frame']
			]);
			secondFrame.get('wysiwyg').innerHTML = '<p>Second frame content</p>';
			mockEditor.frameRoots.set('second-frame', secondFrame);
			mockEditor.rootKeys.push('second-frame');

			// Re-initialize history with new root keys
			history.reset();

			expect(() => history.push(false, 'second-frame')).not.toThrow();
		});
	});
});