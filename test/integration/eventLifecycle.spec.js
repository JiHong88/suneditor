import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('Owned work at editor destruction', () => {
	let editor;
	let other;

	afterEach(() => {
		if (editor) destroyTestEditor(editor);
		if (other) destroyTestEditor(other);
		jest.clearAllTimers();
		jest.useRealTimers();
		jest.restoreAllMocks();
		editor = other = null;
	});

	it.each(['focus', 'blur'])('cancels deferred %s work without cancelling another editor', async (event) => {
		editor = createTestEditor({ mode: 'inline', buttonList: [['bold']] });
		await waitForEditorReady(editor);
		other = createTestEditor({ mode: 'inline', buttonList: [['bold']] });
		await waitForEditorReady(other);
		jest.useFakeTimers();
		const $ = editor.$;
		const root = $.frameContext.get('wysiwyg');
		if (event === 'blur') {
			root.dispatchEvent(new FocusEvent('focus'));
			jest.runOnlyPendingTimers();
		}
		const show = jest.spyOn($.toolbar, 'show');
		const hide = jest.spyOn($.toolbar, 'hide');
		const otherFocus = jest.fn();
		other.$.eventManager.events.onFocus = otherFocus;
		root.dispatchEvent(new FocusEvent(event));
		other.$.frameContext.get('wysiwyg').dispatchEvent(new FocusEvent('focus'));
		editor.destroy();
		editor = null;
		show.mockClear();
		hide.mockClear();
		expect(() => jest.runOnlyPendingTimers()).not.toThrow();
		expect(show).not.toHaveBeenCalled();
		expect(hide).not.toHaveBeenCalled();
		expect(otherFocus).toHaveBeenCalledTimes(1);
	});

});
