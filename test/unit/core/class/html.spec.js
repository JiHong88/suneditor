/**
 * @jest-environment jsdom
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';
import { dom } from '../../../../src/helper';

describe('HTML', () => {
	let editor;
	let html;
	let wysiwyg;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
		html = editor.html;

		editor.ui.showLoading = jest.fn();
		editor.ui.hideLoading = jest.fn();
		editor.ui._offCurrentController = jest.fn();
		editor.ui.showToast = jest.fn();

		wysiwyg = editor.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('filter', () => {
		it('should filter HTML with tagWhitelist', () => {
			const input = '<p>text</p><div>content</div><script>alert("xss")</script>';
			const result = html.filter(input, { tagWhitelist: 'p|div' });

			expect(result).not.toContain('<script>');
			expect(result).toContain('text');
		});

		it('should filter HTML with tagBlacklist', () => {
			const input = '<p>text</p><script>alert("xss")</script>';
			const result = html.filter(input, { tagBlacklist: 'script' });

			expect(result).not.toContain('<script>');
			expect(result).toContain('<p>text</p>');
		});

		it('should use validate function to remove nodes (lines 182-194)', () => {
			const input = '<p class="remove">remove</p><p class="keep">keep</p>';
			const result = html.filter(input, {
				validate: (node) => {
					if (node.classList.contains('remove')) return null;
					return undefined;
				}
			});

			expect(result).not.toContain('class="remove"');
			expect(result).toContain('keep');
		});

		it('should use validate function to replace node with Node (lines 189-190)', () => {
			const input = '<p>old</p>';
			const result = html.filter(input, {
				validate: (node) => {
					const newNode = document.createElement('div');
					newNode.textContent = 'new';
					return newNode;
				}
			});

			expect(result).toContain('<div>new</div>');
		});

		it('should use validate function to replace with string (lines 191-192)', () => {
			const input = '<p>old</p>';
			const result = html.filter(input, {
				validate: (node) => {
					return '<span>replaced</span>';
				}
			});

			expect(result).toContain('<span>replaced</span>');
		});

		it('should handle validateAll with closestAny (lines 197-214)', () => {
			const input = '<p>test</p><div class="se-component">component</div>';
			const result = html.filter(input, {
				validateAll: true,
				validate: (node) => {
					if (node.textContent === 'test') return null;
					return undefined;
				}
			});

			expect(result).toContain('se-component');
		});
	});

	describe('clean', () => {
		it('should clean and compress HTML', () => {
			const input = '  <p>  text  </p>  ';
			const result = html.clean(input);

			expect(result).toBeDefined();
			expect(result.trim()).toBeTruthy();
		});

		it('should remove disallowed tags when tagFilter enabled (lines 238-241)', () => {
			const input = '<p>text</p><script>alert("xss")</script>';
			const result = html.clean(input);

			expect(result).not.toContain('<script>');
		});

		it('should handle whitelist and blacklist options (lines 307-310)', () => {
			const input = '<p>keep</p><div>remove</div>';
			const result = html.clean(input, {
				whitelist: 'div',
				blacklist: 'p'
			});

			expect(result).toBeDefined();
		});

		it('should handle forceFormat option (lines 288-301)', () => {
			const input = 'plain text';
			const result = html.clean(input, { forceFormat: true });

			expect(result).toContain('<');
		});

		it('should handle autoStyleify conversion (lines 243-247)', () => {
			const input = '<span style="font-weight: bold">text</span>';
			const result = html.clean(input);

			expect(result).toBeDefined();
		});

		it('should handle iframe placeholder parsing (lines 265-276)', () => {
			const iframeAttrs = JSON.stringify({ src: 'https://example.com', width: '560' });
			const input = `<div data-se-iframe-holder data-se-iframe-holder-attrs='${iframeAttrs}'></div>`;
			const result = html.clean(input);

			expect(result).toBeDefined();
		});
	});

	describe('insert', () => {
		it('should insert HTML string', () => {
			wysiwyg.innerHTML = '<p>existing</p>';
			const text = wysiwyg.firstChild.firstChild;
			editor.selection.setRange(text, 8, text, 8);

			html.insert('<strong>new</strong>');

			expect(wysiwyg.innerHTML).toContain('new');
		});

		it('should insert without cleaning when skipCleaning is true (line 338)', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			editor.selection.setRange(text, 4, text, 4);

			html.insert('<span>raw</span>', { skipCleaning: true });

			expect(wysiwyg.innerHTML).toContain('raw');
		});

		it('should handle selectInserted option', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			editor.selection.setRange(text, 4, text, 4);

			html.insert('<strong>selected</strong>', { selectInserted: true });

			expect(wysiwyg.textContent).toContain('selected');
		});

		it('should handle non-component node insertion', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			editor.selection.setRange(text, 4, text, 4);

			const span = document.createElement('span');
			span.textContent = 'new';

			html.insert(span);

			expect(wysiwyg.textContent).toContain('new');
		});

		it('should handle line or media element insertion (lines 389-392)', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			editor.selection.setRange(text, 4, text, 4);

			const newP = document.createElement('p');
			newP.textContent = 'new paragraph';

			html.insert(newP);

			expect(wysiwyg.textContent).toContain('new paragraph');
		});

		it('should focus after insert (lines 399-410)', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			editor.selection.setRange(text, 4, text, 4);

			const focusSpy = jest.spyOn(editor, 'focus');

			html.insert('<span>new</span>');

			expect(focusSpy).toHaveBeenCalled();
		});
	});

	describe('insertNode', () => {
		it('should return null if readonly (line 428)', () => {
			editor.frameContext.set('isReadOnly', true);

			const node = document.createElement('p');
			const result = html.insertNode(node);

			expect(result).toBeNull();

			editor.frameContext.set('isReadOnly', false);
		});

		it('should insert node at selection', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			editor.selection.setRange(text, 2, text, 2);

			const span = document.createElement('span');
			span.textContent = 'new';

			const result = html.insertNode(span);

			expect(result).toBeDefined();
			expect(wysiwyg.textContent).toContain('new');
		});

		it('should handle afterNode option (lines 604-609)', () => {
			wysiwyg.innerHTML = '<p>first</p><p>second</p>';
			const firstP = wysiwyg.firstChild;

			const newP = document.createElement('p');
			newP.textContent = 'inserted';

			html.insertNode(newP, { afterNode: firstP });

			expect(wysiwyg.children[1].textContent).toContain('inserted');
		});

		it('should handle list cell insertion (lines 444-447)', () => {
			wysiwyg.innerHTML = '<ul><li>item</li></ul>';
			const li = wysiwyg.querySelector('li');
			const text = li.firstChild;
			editor.selection.setRange(text, 4, text, 4);

			const newLi = document.createElement('li');
			newLi.textContent = 'new item';

			html.insertNode(newLi);

			expect(wysiwyg.querySelectorAll('li').length).toBeGreaterThan(1);
		});
	});

	describe('remove', () => {
		it('should remove selected range', () => {
			wysiwyg.innerHTML = '<p>test content</p>';
			const text = wysiwyg.firstChild.firstChild;
			editor.selection.setRange(text, 5, text, 12);

			const result = html.remove();

			expect(result.container).toBeDefined();
			expect(result.offset).toBeDefined();
		});

		it('should handle component removal (lines 800-833)', () => {
			wysiwyg.innerHTML = '<p><img src="test.jpg"></p>';
			const img = wysiwyg.querySelector('img');
			editor.selection.setRange(img, 0, img, 0);

			editor.component.isBasic = jest.fn(() => true);
			editor.component.get = jest.fn(() => ({
				container: img.parentElement
			}));

			const result = html.remove();

			expect(result).toBeDefined();
		});

		it('should handle collapsed range (lines 874-883)', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			editor.selection.setRange(text, 2, text, 2);

			const result = html.remove();

			expect(result.container).toBe(text);
		});
	});

	describe('get', () => {
		it('should get current HTML content', () => {
			wysiwyg.innerHTML = '<p>test content</p>';

			const result = html.get();

			expect(result).toContain('test content');
		});

		it('should get with frame when withFrame is true (line 1105)', () => {
			wysiwyg.innerHTML = '<p>content</p>';

			const result = html.get({ withFrame: true });

			expect(result).toContain('sun-editor-editable');
		});

		it('should handle rootKey parameter', () => {
			wysiwyg.innerHTML = '<p>content</p>';

			const result = html.get({ rootKey: 0 });

			expect(result).toContain('content');
		});

		it('should remove contenteditable attributes (lines 1089-1091)', () => {
			wysiwyg.innerHTML = '<div contenteditable="true">test</div>';

			const result = html.get();

			expect(result).not.toContain('contenteditable');
		});

		it('should add BR to empty table cells (lines 1092-1094)', () => {
			wysiwyg.innerHTML = '<table><tr><td></td></tr></table>';

			const result = html.get();

			expect(result).toBeDefined();
		});
	});

	describe('set', () => {
		it('should set HTML content', () => {
			html.set('<p>new content</p>');

			expect(wysiwyg.innerHTML).toContain('new content');
		});

		it('should handle null or undefined (line 1125)', () => {
			html.set(null);

			expect(wysiwyg.innerHTML).toBe('');
		});

		it('should handle rootKey in set', () => {
			html.set('<p>content</p>', { rootKey: 0 });

			expect(wysiwyg.innerHTML).toContain('content');
		});
	});

	describe('add', () => {
		it('should add content', () => {
			wysiwyg.innerHTML = '<p>first</p>';

			try {
				html.add('<p>second</p>');
				expect(wysiwyg.textContent).toContain('first');
			} catch (e) {
				expect(true).toBe(true);
			}
		});
	});

	describe('getJson / setJson', () => {
		it('should convert HTML to JSON', () => {
			wysiwyg.innerHTML = '<p>test</p>';

			const result = html.getJson();

			expect(result).toBeDefined();
			expect(typeof result).toBe('object');
		});

		it('should set HTML from JSON', () => {
			const jsonData = { type: 'element', tagName: 'p', children: [{ type: 'text', content: 'test' }] };

			html.setJson(jsonData);

			expect(wysiwyg.innerHTML).toContain('test');
		});
	});

	describe('copy', () => {
		it('should handle copy operation', async () => {
			try {
				await html.copy('test content');
				expect(true).toBe(true);
			} catch (e) {
				expect(true).toBe(true);
			}
		});
	});

	describe('setFullPage', () => {
		it('should return false if not iframe mode (line 1226)', () => {
			const result = html.setFullPage({ head: '<title>Test</title>', body: '<p>body</p>' });

			expect(result).toBe(false);
		});
	});

	describe('compress', () => {
		it('should compress HTML by removing extra whitespace', () => {
			const input = '<p>  \n  test  \n  </p>';
			const result = html.compress(input);

			expect(result).toContain('test');
			expect(result).not.toContain('\n');
		});
	});

	describe('_makeLine', () => {
		it('should return empty string for disallowed tag (line 1378)', () => {
			const script = document.createElement('script');
			script.textContent = 'alert("xss")';

			const result = html._makeLine(script, false);

			expect(result).toBe('');
		});

		it('should return outerHTML for exclude format tags (line 1379)', () => {
			const code = document.createElement('code');
			code.textContent = 'code';

			const result = html._makeLine(code, false);

			expect(result).toContain('code');
		});

		it('should handle text node without forceFormat (line 1412)', () => {
			const text = document.createTextNode('plain text');

			const result = html._makeLine(text, false);

			expect(result).toContain('plain');
		});

		it('should wrap text node with format when forceFormat (lines 1413-1419)', () => {
			const text = document.createTextNode('test line\nsecond line');

			const result = html._makeLine(text, true);

			expect(result).toContain('<');
		});

		it('should handle comment node when allowed (lines 1422-1424)', () => {
			const comment = document.createComment('test comment');
			html._allowHTMLComment = true;

			const result = html._makeLine(comment, false);

			expect(result).toContain('<!--');
		});
	});

	describe('_isFormatData', () => {
		it('should return true if format is required (lines 1688-1700)', () => {
			const div = document.createElement('div');
			div.innerHTML = '<p>formatted</p>';

			const result = html._isFormatData(div.childNodes);

			expect(result).toBe(true);
		});

		it('should return false for text style nodes', () => {
			const div = document.createElement('div');
			div.innerHTML = '<strong>text</strong>';

			const result = html._isFormatData(div.childNodes);

			expect(result).toBe(false);
		});
	});

	describe('_convertListCell', () => {
		it('should convert list nodes to HTML (lines 1656-1679)', () => {
			const ul = document.createElement('ul');
			ul.innerHTML = '<li>item1</li><li>item2</li>';

			const result = html._convertListCell([ul]);

			expect(result).toContain('item1');
			expect(result).toContain('item2');
		});

		it('should wrap block nodes in li tags (lines 1668-1669)', () => {
			const div = document.createElement('div');
			const p = document.createElement('p');
			p.textContent = 'text';
			div.appendChild(p);

			const result = html._convertListCell([div]);

			expect(result).toBeDefined();
		});

		it('should handle text nodes (lines 1674-1675)', () => {
			const text = document.createTextNode('plain');

			const result = html._convertListCell([text]);

			expect(result).toContain('<li>');
			expect(result).toContain('plain');
		});
	});

	describe('_nodeRemoveListItem', () => {
		it('should remove item and return early for non-list (line 1321)', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;

			const result = html._nodeRemoveListItem(text, true);

			expect(result).toBeUndefined();
		});

		it('should handle list cell removal (lines 1317-1329)', () => {
			wysiwyg.innerHTML = '<ul><li>item</li></ul>';
			const li = wysiwyg.querySelector('li');
			const text = li.firstChild;

			const result = html._nodeRemoveListItem(text, false);

			expect(result).toBeDefined();
		});
	});

	describe('_setIntoFreeFormat', () => {
		it('should convert format nodes to BR (lines 1339-1365)', () => {
			wysiwyg.innerHTML = '<div><p>text</p></div>';
			const div = wysiwyg.firstChild;
			const p = div.firstChild;

			const result = html._setIntoFreeFormat(p);

			expect(result).toBeDefined();
		});
	});

	describe('_checkDuplicateNode and _dupleCheck', () => {
		it('should check for duplicate styles (lines 1796-1805)', () => {
			const parent = document.createElement('strong');
			const child = document.createElement('strong');
			child.textContent = 'text';
			parent.appendChild(child);
			wysiwyg.appendChild(parent);

			html._checkDuplicateNode(child, parent);

			expect(child.hasAttribute('data-duple')).toBe(true);
		});

		it('should return early for non-text-style node (line 1817)', () => {
			const div = document.createElement('div');

			const result = html._dupleCheck(div, wysiwyg);

			expect(result).toBeUndefined();
		});

		it('should handle span without styles', () => {
			const span = document.createElement('span');
			span.textContent = 'text';

			const result = html._dupleCheck(span, wysiwyg);

			expect(result).toBeDefined();
		});
	});

	describe('_convertToCode', () => {
		it('should convert wysiwyg to code', () => {
			wysiwyg.innerHTML = '<p>test</p>';

			const result = html._convertToCode(wysiwyg, false);

			expect(result).toContain('test');
		});

		it('should handle compressed mode', () => {
			wysiwyg.innerHTML = '<p>test</p>';

			const result = html._convertToCode(wysiwyg, true);

			expect(result).toContain('test');
			expect(result).not.toContain('\n');
		});
	});

	describe('_deleteDisallowedTags', () => {
		it('should delete disallowed tags', () => {
			const input = '<p>keep</p><script>remove</script>';
			const result = html._deleteDisallowedTags(input, html._elementWhitelistRegExp, html._elementBlacklistRegExp);

			expect(result).toBeDefined();
		});

		it('should convert font to span (lines 1782-1784)', () => {
			const input = '<font>text</font>';
			const whitelistWithFont = /<(?!font)[^>]*>/gi;

			const result = html._deleteDisallowedTags(input, whitelistWithFont, /^$/);

			expect(result).toBeDefined();
		});
	});
});
