/**
 * @fileoverview The code block language comes from the content (`<pre class="language-xxx">`),
 * so it must only be accepted as an identifier and written into the hover UI as text (GHSA-j4jp-7r3h-rf28).
 * The browser PoC is in `test/e2e/security.xss.spec.js`; jsdom serializes attributes differently.
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';
import { codeBlock } from '../../src/plugins';

describe('codeBlock language', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor({ plugins: { codeBlock }, buttonList: [['codeBlock']] });
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	/** Puts the HTML in the editing area without the sanitizer, then hovers and opens the language menu. */
	function hover(html) {
		const ww = editor.$.frameContext.get('wysiwyg');
		ww.innerHTML = html;
		const pre = ww.querySelector('pre');
		editor.$.plugins.codeBlock.onMouseMove({ event: { target: pre } });
		const button = document.querySelector('.se-code-lang-button');
		button.click();
		const menu = Array.from(document.querySelectorAll('.se-select-item'), (li) => li.textContent);
		return { button, label: button.querySelector('.se-code-lang-text').textContent, menu };
	}

	it('ignores a language that is not an identifier', () => {
		const { button, label, menu } = hover(`<pre class="language-&lt;img/src=x/onerror=alert(1)&gt;">code</pre>`);

		expect(button.querySelector('img')).toBeNull();
		expect(document.querySelector('.se-select-item img')).toBeNull();
		expect(label).toBe(editor.$.lang.codeLanguage);
		expect(menu.some((t) => t.includes('img'))).toBe(false);
	});

	it.each(['c++', 'c#', 'vb.net', 'objective-c', 'my_lang'])('shows the identifier language %s', (lang) => {
		const { label, menu } = hover(`<pre class="language-${lang}">code</pre>`);

		expect(label).toBe(lang);
		expect(menu).toContain(lang);
	});

	it('keeps a valid language and drops an invalid one in the input filter', () => {
		const clean = (html) => editor.$.html.clean(html, { forceFormat: true });

		expect(clean('<pre><code class="language-c#">x</code></pre>')).toBe('<pre class="language-c#" data-se-lang="c#">x</pre>');
		expect(clean('<pre class="language-c++">x</pre>')).toBe('<pre class="language-c++">x</pre>');
		expect(clean('<pre><code class="language-a/b=c">x</code></pre>')).toBe('<pre>x</pre>');
		expect(clean('<pre class="language-a/b=c">x</pre>')).toBe('<pre>x</pre>');
	});
});
