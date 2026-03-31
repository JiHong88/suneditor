/**
 * @fileoverview Integration tests for core/logic/panel/finder.js
 * Tests Find/Replace through real editor instance
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';

// JSDOM lacks scrollIntoView — stub it globally
if (!Element.prototype.scrollIntoView) {
	Element.prototype.scrollIntoView = function () {};
}

describe('Finder Integration Tests', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor({
			buttonList: [['bold', 'italic']],
			finder_panel: true,
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	function setContent(html) {
		const ww = editor.$.frameContext.get('wysiwyg');
		ww.innerHTML = html;
	}

	// ──────────────────────────────────────────────────
	// Open / Close lifecycle
	// ──────────────────────────────────────────────────

	describe('open / close lifecycle', () => {
		it('should expose finder via editor.$', () => {
			expect(editor.$.finder).toBeDefined();
		});

		it('isOpen should be false initially', () => {
			expect(editor.$.finder.isOpen).toBe(false);
		});

		it('open() should set isOpen to true', () => {
			editor.$.finder.open();
			expect(editor.$.finder.isOpen).toBe(true);
		});

		it('close() should set isOpen to false', () => {
			editor.$.finder.open();
			editor.$.finder.close();
			expect(editor.$.finder.isOpen).toBe(false);
		});

		it('close() on already-closed finder should be a no-op', () => {
			expect(editor.$.finder.isOpen).toBe(false);
			editor.$.finder.close(); // should not throw
			expect(editor.$.finder.isOpen).toBe(false);
		});

		it('should not open in codeView mode', () => {
			editor.$.frameContext.set('isCodeView', true);
			editor.$.finder.open();
			expect(editor.$.finder.isOpen).toBe(false);
			editor.$.frameContext.set('isCodeView', false);
		});
	});

	// ──────────────────────────────────────────────────
	// Headless search API
	// ──────────────────────────────────────────────────

	describe('search() — headless API', () => {
		it('should find simple text matches', () => {
			setContent('<p>hello world hello</p>');
			const count = editor.$.finder.search('hello');
			expect(count).toBe(2);
			expect(editor.$.finder.matchInfo.total).toBe(2);
		});

		it('should return 0 for no matches', () => {
			setContent('<p>hello world</p>');
			const count = editor.$.finder.search('xyz');
			expect(count).toBe(0);
			expect(editor.$.finder.matchInfo.total).toBe(0);
		});

		it('should handle empty search term', () => {
			setContent('<p>hello</p>');
			const count = editor.$.finder.search('');
			expect(count).toBe(0);
		});

		it('should be case-insensitive by default', () => {
			setContent('<p>Hello HELLO hello</p>');
			const count = editor.$.finder.search('hello');
			expect(count).toBe(3);
		});

		it('matchCase option should restrict to exact case', () => {
			setContent('<p>Hello HELLO hello</p>');
			const count = editor.$.finder.search('hello', { matchCase: true });
			expect(count).toBe(1);
		});

		it('wholeWord option should match word boundaries', () => {
			setContent('<p>cat concatenate catalog</p>');
			const count = editor.$.finder.search('cat', { wholeWord: true });
			expect(count).toBe(1);
		});

		it('regex option should support regex patterns', () => {
			setContent('<p>abc 123 def 456</p>');
			const count = editor.$.finder.search('\\d+', { regex: true });
			expect(count).toBe(2);
		});

		it('invalid regex should return 0 matches gracefully', () => {
			setContent('<p>hello</p>');
			const count = editor.$.finder.search('[invalid', { regex: true });
			expect(count).toBe(0);
		});

		it('should search across inline elements within same line', () => {
			setContent('<p><strong>hel</strong>lo world</p>');
			const count = editor.$.finder.search('hello');
			expect(count).toBe(1);
		});

		it('should NOT match across different line elements', () => {
			setContent('<p>hello</p><p>world</p>');
			const count = editor.$.finder.search('helloworld');
			expect(count).toBe(0);
		});

		it('should escape special regex chars in non-regex mode', () => {
			setContent('<p>price is $100.00</p>');
			const count = editor.$.finder.search('$100.00');
			expect(count).toBe(1);
		});
	});

	// ──────────────────────────────────────────────────
	// Navigation
	// ──────────────────────────────────────────────────

	describe('findNext / findPrev — navigation', () => {
		it('findNext should advance current index', () => {
			setContent('<p>aaa aaa aaa</p>');
			editor.$.finder.search('aaa');
			expect(editor.$.finder.matchInfo.current).toBe(1);

			editor.$.finder.findNext();
			expect(editor.$.finder.matchInfo.current).toBe(2);
		});

		it('findNext should wrap around to first match', () => {
			setContent('<p>ab ab</p>');
			editor.$.finder.search('ab');
			expect(editor.$.finder.matchInfo.total).toBe(2);

			editor.$.finder.findNext(); // → 2
			editor.$.finder.findNext(); // → 1 (wrap)
			expect(editor.$.finder.matchInfo.current).toBe(1);
		});

		it('findPrev should go backward', () => {
			setContent('<p>ab ab ab</p>');
			editor.$.finder.search('ab');
			// current = 1
			editor.$.finder.findPrev(); // wrap → 3
			expect(editor.$.finder.matchInfo.current).toBe(3);
		});

		it('findNext / findPrev should be no-op when no matches', () => {
			setContent('<p>hello</p>');
			editor.$.finder.search('xyz');

			editor.$.finder.findNext();
			expect(editor.$.finder.matchInfo.current).toBe(0);
			editor.$.finder.findPrev();
			expect(editor.$.finder.matchInfo.current).toBe(0);
		});

		it('findNext / findPrev should be no-op when not open', () => {
			editor.$.finder.findNext(); // should not throw
			editor.$.finder.findPrev();
		});
	});

	// ──────────────────────────────────────────────────
	// Replace
	// ──────────────────────────────────────────────────

	describe('replace() / replaceAll() — headless API', () => {
		it('replace() should replace current match', () => {
			setContent('<p>foo bar foo</p>');
			editor.$.finder.search('foo');
			editor.$.finder.replace('baz');

			const text = editor.$.frameContext.get('wysiwyg').textContent;
			expect(text).toContain('baz');
			// One "foo" replaced, one remaining
			expect(editor.$.finder.matchInfo.total).toBe(1);
		});

		it('replaceAll() should replace all matches', () => {
			setContent('<p>foo bar foo baz foo</p>');
			editor.$.finder.search('foo');
			expect(editor.$.finder.matchInfo.total).toBe(3);

			editor.$.finder.replaceAll('x');

			const text = editor.$.frameContext.get('wysiwyg').textContent;
			expect(text).not.toContain('foo');
			expect(editor.$.finder.matchInfo.total).toBe(0);
		});

		it('replace() should be no-op when no matches', () => {
			setContent('<p>hello</p>');
			editor.$.finder.search('xyz');
			editor.$.finder.replace('abc'); // should not throw
			expect(editor.$.frameContext.get('wysiwyg').textContent).toBe('hello');
		});

		it('replaceAll() should be no-op when no matches', () => {
			setContent('<p>hello</p>');
			editor.$.finder.search('xyz');
			editor.$.finder.replaceAll('abc'); // should not throw
			expect(editor.$.frameContext.get('wysiwyg').textContent).toBe('hello');
		});

		it('replace with empty string should delete match', () => {
			setContent('<p>hello world</p>');
			editor.$.finder.search('world');
			editor.$.finder.replace('');

			const text = editor.$.frameContext.get('wysiwyg').textContent.trim();
			expect(text).toBe('hello');
		});

		it('replaceAll across inline elements should work', () => {
			setContent('<p><strong>he</strong>llo <em>he</em>llo</p>');
			editor.$.finder.search('hello');
			expect(editor.$.finder.matchInfo.total).toBe(2);

			editor.$.finder.replaceAll('bye');
			const text = editor.$.frameContext.get('wysiwyg').textContent;
			expect(text).not.toContain('hello');
		});
	});

	// ──────────────────────────────────────────────────
	// matchInfo
	// ──────────────────────────────────────────────────

	describe('matchInfo', () => {
		it('should reflect current/total after search', () => {
			setContent('<p>a b a b a</p>');
			editor.$.finder.search('a');
			expect(editor.$.finder.matchInfo).toEqual({ current: 1, total: 3 });
		});

		it('should update after navigation', () => {
			setContent('<p>x y x y x</p>');
			editor.$.finder.search('x');
			editor.$.finder.findNext();
			expect(editor.$.finder.matchInfo).toEqual({ current: 2, total: 3 });
		});

		it('should reset after close', () => {
			setContent('<p>test test</p>');
			editor.$.finder.search('test');
			editor.$.finder.close();
			expect(editor.$.finder.matchInfo).toEqual({ current: 0, total: 0 });
		});
	});

	// ──────────────────────────────────────────────────
	// refresh
	// ──────────────────────────────────────────────────

	describe('refresh()', () => {
		it('should be no-op when not open', () => {
			editor.$.finder.refresh(); // should not throw
		});

		it('should be no-op when searchTerm is empty', () => {
			editor.$.finder.open();
			editor.$.finder.refresh(); // no term set → no-op
		});

		it('should re-run search after content change', (done) => {
			setContent('<p>test test</p>');
			editor.$.finder.search('test');
			expect(editor.$.finder.matchInfo.total).toBe(2);

			// Simulate content change
			setContent('<p>test test test</p>');
			editor.$.finder.refresh();

			// refresh is debounced at 300ms
			setTimeout(() => {
				expect(editor.$.finder.matchInfo.total).toBe(3);
				done();
			}, 400);
		});
	});

	// ──────────────────────────────────────────────────
	// Panel DOM
	// ──────────────────────────────────────────────────

	describe('panel DOM', () => {
		it('panel should be inserted in container', () => {
			const rootFc = editor.$.frameRoots.values().next().value;
			const container = rootFc.get('container');
			const panel = container.querySelector('.se-find-replace');
			expect(panel).not.toBeNull();
		});

		it('panel should be placed before .se-wrapper (top toolbar)', () => {
			const rootFc = editor.$.frameRoots.values().next().value;
			const container = rootFc.get('container');
			const panel = container.querySelector('.se-find-replace');
			const wrapper = container.querySelector('.se-wrapper');
			// panel should be a preceding sibling of wrapper
			expect(panel.compareDocumentPosition(wrapper) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		});

		it('open() should add se-find-replace-open class', () => {
			editor.$.finder.open();
			const rootFc = editor.$.frameRoots.values().next().value;
			const panel = rootFc.get('container').querySelector('.se-find-replace');
			expect(panel.classList.contains('se-find-replace-open')).toBe(true);
		});

		it('close() should remove se-find-replace-open class', () => {
			editor.$.finder.open();
			editor.$.finder.close();
			const rootFc = editor.$.frameRoots.values().next().value;
			const panel = rootFc.get('container').querySelector('.se-find-replace');
			expect(panel.classList.contains('se-find-replace-open')).toBe(false);
		});
	});
});

describe('Finder with finder_panel: false', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor({
			buttonList: [],
			finder_panel: false,
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	it('headless API should still work without panel', () => {
		const ww = editor.$.frameContext.get('wysiwyg');
		ww.innerHTML = '<p>hello hello</p>';
		const count = editor.$.finder.search('hello');
		expect(count).toBe(2);
	});

	it('replace should work without panel', () => {
		const ww = editor.$.frameContext.get('wysiwyg');
		ww.innerHTML = '<p>foo bar foo</p>';
		editor.$.finder.search('foo');
		editor.$.finder.replaceAll('x');
		expect(ww.textContent).not.toContain('foo');
	});

	it('close should work without panel', () => {
		editor.$.finder.open();
		editor.$.finder.close(); // should not throw
		expect(editor.$.finder.isOpen).toBe(false);
	});

	it('no panel element should exist in container', () => {
		const rootFc = editor.$.frameRoots.values().next().value;
		const container = rootFc.get('container');
		const panel = container.querySelector('.se-find-replace');
		expect(panel).toBeNull();
	});
});

describe('Finder with bottom toolbar', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor({
			buttonList: [['bold']],
			finder_panel: true,
			mode: 'classic:bottom',
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	it('store.mode.isBottom should be true', () => {
		expect(editor.$.store.mode.isBottom).toBe(true);
	});

	it('panel should be placed before the toolbar (bottom mode)', () => {
		const rootFc = editor.$.frameRoots.values().next().value;
		const container = rootFc.get('container');
		const panel = container.querySelector('.se-find-replace');
		const toolbar = editor.$.context.get('toolbar_main');
		// panel should be immediately before toolbar
		expect(panel.compareDocumentPosition(toolbar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
	});

	it('headless search should work in bottom mode', () => {
		const ww = editor.$.frameContext.get('wysiwyg');
		ww.innerHTML = '<p>test test test</p>';
		const count = editor.$.finder.search('test');
		expect(count).toBe(3);
	});
});
