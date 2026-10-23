import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

const href = (editor, value) => {
	const node = document.createElement('div');
	node.innerHTML = editor.$.html.clean(`<p><a href="${value}" onclick="alert(1)">link</a></p>`);
	expect(node.querySelector('a').hasAttribute('onclick')).toBe(false);
	return node.querySelector('a').getAttribute('href');
};

describe('Additional URL protocols', () => {
	let editor;
	let defaultEditor;

	beforeAll(async () => {
		editor = createTestEditor({
			buttonList: [['bold']],
			allowedURLProtocols: ['zoommtg', ' Slack ', 'vscode', 'my-app+ext.v1', 'javascript', 'VBSCRIPT', 'data', '.*', 'bad:', ''],
			attributeWhitelist: { img: 'srcset' },
		});
		defaultEditor = createTestEditor({ buttonList: [['bold']] });
		await Promise.all([waitForEditorReady(editor), waitForEditorReady(defaultEditor)]);
	});

	afterAll(() => {
		destroyTestEditor(editor);
		destroyTestEditor(defaultEditor);
	});

	it.each(['zoommtg://zoom.us/join', 'SLACK://channel', 'vscode://file/test', 'my-app+ext.v1:open'])('preserves %s without disabling attribute filtering', (url) => {
		expect(href(editor, url)).toBe(url);
		expect(href(defaultEditor, url)).toBeNull();
	});

	it.each(['https://example.com', 'mailto:test@example.com', '/relative', '#anchor'])('preserves the built-in URL policy for %s', (url) => {
		expect(href(editor, url)).toBe(url);
	});

	it.each(['javascript:alert(1)', 'java&#x09;script:alert(1)', 'javascript&colon;alert(1)', 'vbscript:msgbox(1)', 'data:text/html,test', 'unknown:open', 'zoommtg-evil:open'])('rejects %s even with additional protocols configured', (url) => {
		expect(href(editor, url)).toBeNull();
	});

	it('checks each URL in a srcset list', () => {
		const node = document.createElement('div');
		node.innerHTML = editor.$.html.clean('<img src="https://example.com/a.png" srcset="zoommtg:one 1x, slack:two 2x">');
		expect(node.querySelector('img').getAttribute('srcset')).toBe('zoommtg:one 1x, slack:two 2x');
		node.innerHTML = editor.$.html.clean('<img src="https://example.com/a.png" srcset="zoommtg:one 1x, javascript:alert(1) 2x">');
		expect(node.querySelector('img').hasAttribute('srcset')).toBe(false);
	});

	it('uses the same URL policy for clipboard iframe placeholders', () => {
		const placeholder = document.createElement('span');
		placeholder.textContent = 'iframe';
		placeholder.setAttribute('data-se-iframe-holder', '1');
		placeholder.setAttribute('data-se-iframe-holder-attrs', JSON.stringify({ src: 'zoommtg:open', srcdoc: 'unsafe' }));
		const node = document.createElement('div');
		node.innerHTML = editor.$.html.clean(placeholder.outerHTML);
		expect(node.querySelector('iframe').getAttribute('src')).toBe('zoommtg:open');
		expect(node.querySelector('iframe').hasAttribute('srcdoc')).toBe(false);
	});

	it('keeps the creation-time policy when resetOptions attempts to replace it', () => {
		const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
		try {
			editor.resetOptions({ allowedURLProtocols: ['other'] });
			expect(warn).toHaveBeenCalledWith(expect.stringContaining('allowedURLProtocols'));
			expect(href(editor, 'zoommtg:open')).toBe('zoommtg:open');
			expect(href(editor, 'other:open')).toBeNull();
		} finally {
			warn.mockRestore();
		}
	});
});
