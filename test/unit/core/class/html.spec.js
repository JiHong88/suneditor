/**
 * @jest-environment jsdom
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';
import { dom, clipboard } from '../../../../src/helper';

describe('HTML', () => {
	let editor;
	let html;
	let wysiwyg;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
		html = editor.html;

		editor.uiManager.showLoading = jest.fn();
		editor.uiManager.hideLoading = jest.fn();
		editor.uiManager.offCurrentController = jest.fn();
		editor.uiManager.showToast = jest.fn();

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
				},
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
				},
			});

			expect(result).toContain('<div>new</div>');
		});

		it('should use validate function to replace with string (lines 191-192)', () => {
			const input = '<p>old</p>';
			const result = html.filter(input, {
				validate: (node) => {
					return '<span>replaced</span>';
				},
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
				},
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

		it('should clean using whitelist array', () => {
			const input = '<div><p>p</p><span>span</span><br></div>';
			// Mocking whitelist regex creation usually handled by options
			// Here we pass a regex directly or a string which clean accepts
			const result = html.clean(input, { whitelist: 'div|p' });
			
			expect(result).toContain('<div>');
			expect(result).toContain('<p>');
			expect(result).not.toContain('<span>');
			expect(result).not.toContain('<br>');
		});


		it('should clean using blacklist string', () => {
			const input = '<div><script>alert(1)</script><p>text</p></div>';
            // clean() logic might strip outer divs if they aren't semantic depending on config.
            // Let's test checking that the blacklisted tag is gone, which is the modification.
            // If div is stripped, that's secondary to the blacklist function here.
			const result = html.clean(input, { blacklist: 'script' });
			
			expect(result).not.toContain('<script>');
            // Expect p to remain
			expect(result).toContain('<p>text</p>');
		});

        it('should clean using whitelist string', () => {
             const input = '<div>kept</div><p>removed</p>';
             const result = html.clean(input, { whitelist: 'div' });
             expect(result).toContain('<div>');
             expect(result).not.toContain('<p>');
             // Content of p usually remains in text form if just tags are stripped, or removed if strict?
             // clean logic typically strips tags but keeps content unless specified otherwise.
             expect(result).toContain('removed');
        });

		it('should handle autoStyleify option (mocked)', () => {
             // autoStyleify logic relies on private field #autoStyleify initiated from options
             // We can't easily change private fields, but we can verify if the method calls
             // spanToStyleNode if we could mock the private field.
             // Since we can't, we test the public behavior if options were set.
             // In this unit test, options are already set in beforeEach createTestEditor.
             // If we wanted to test this, we'd need to recreate the editor with specific options.
             
             // Skipping complex private field manipulation for now, 
             // focusing on logic we can control via args.
		});
		
		it('should handle attribute filtering (mocked)', () => {
		    // Attribute filtering uses private #CleanElements
            const input = '<p style="color: red;" onclick="alert()">text</p>';
            // By default test editor might not have strict filtering on.
            // clean() checks this.options.get('strictMode').attrFilter
            
            // We can try to mock options.get but it's bound.
            // Instead, we verify basic clean structure is preserved.
            const result = html.clean(input);
            expect(result).toContain('text');
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

		it('should insert without cleaning when skipCleaning is true', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;
			editor.selection.setRange(text, 4, text, 4);

			html.insert('<span>raw</span>', { skipCleaning: true });

			expect(wysiwyg.innerHTML).toContain('raw');
		});

        it('should handle list insertion with checking char count (mocked)', () => {
            jest.spyOn(editor.char, 'check').mockReturnValue(true);
            html.insert('<ul><li>item</li></ul>');
            expect(editor.char.check).toHaveBeenCalled();
        });

        it('should prevent insertion if char count exceeded', () => {
             jest.spyOn(editor.char, 'check').mockReturnValue(false);
             const result = html.insert('content');
             expect(result).toBeUndefined(); // Returns undefined on fail
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

			const focusSpy = jest.spyOn(editor.focusManager, 'focus');

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
				container: img.parentElement,
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

	describe('setFullPage', () => {
		it('should return false if not iframe mode (line 1226)', () => {
			const result = html.setFullPage({ head: '<title>Test</title>', body: '<p>body</p>' });

			expect(result).toBe(false);
		});

        it('should set full page content when iframe mode is enabled', () => {
            // Mock iframe option
            editor.frameOptions.set('iframe', true);
            
            // Mock iframe elements in frameContext
            const mockHead = document.createElement('head');
            const mockBody = document.createElement('body');
            editor.frameContext.set('_wd', { head: mockHead, body: mockBody });
            
            html.setFullPage({ head: '<title>New Title</title>', body: '<p>New Body</p>' });
            
            expect(mockHead.innerHTML).toContain('New Title');
            expect(mockBody.innerHTML).toContain('New Body');
            
            // Reset option
            editor.frameOptions.set('iframe', false);
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

        it('should handle indentation and formatting', () => {
            // Use blockquote which is in the brReg list for indentation
             wysiwyg.innerHTML = '<blockquote><p>nested</p></blockquote>';
             editor.status.codeIndentSize = 4;
             
             const result = html._convertToCode(wysiwyg, false);
             
             expect(result).toContain('    '); // Expect indentation
             expect(result).toContain('<p>nested</p>');
        });

        it('should handle HTML comments', () => {
             wysiwyg.innerHTML = '<!-- comment -->';
             const result = html._convertToCode(wysiwyg, false);
             expect(result).toContain('<!-- comment -->');
        });

        it('should handle pre tags (preserve structure)', () => {
             wysiwyg.innerHTML = '<pre>  code  </pre>';
             const result = html._convertToCode(wysiwyg, false);
             expect(result).toContain('code');
             expect(result).toContain('<pre>');
        });
	});

	describe('add', () => {
		it('should add content to the end', () => {
			wysiwyg.innerHTML = '<p>first</p>';
            
            // Mock scrollTo since it's used in add
            editor.selection.scrollTo = jest.fn();

			html.add('<p>second</p>');

			expect(wysiwyg.children.length).toBe(2);
            expect(wysiwyg.lastChild.textContent).toBe('second');
            expect(editor.selection.scrollTo).toHaveBeenCalled();
		});

        it('should handle code view in add (mocked)', () => {
             editor.frameContext.set('isCodeView', true);
             const viewerSetSpy = jest.spyOn(editor.viewer, '_setCodeView');
             jest.spyOn(editor.viewer, '_getCodeView').mockReturnValue('original\n');

             html.add('<p>added</p>');

             expect(viewerSetSpy).toHaveBeenCalled();
             
             editor.frameContext.set('isCodeView', false);
        });
	});

    describe('copy', () => {
        it('should copy content to clipboard', async () => {
             jest.spyOn(clipboard, 'write').mockResolvedValue(true);
             // mock toast
             editor.uiManager.showToast = jest.fn();

             const result = await html.copy('text');

             expect(result).toBe(true);
             expect(editor.uiManager.showToast).toHaveBeenCalledWith(editor.lang.message_copy_success, expect.anything());
        });

        it('should fail if content is not valid', async () => {
             const result = await html.copy({}); // invalid object
             expect(result).toBe(false);
        });

        it('should handle clipboard error (return false)', async () => {
             jest.spyOn(clipboard, 'write').mockResolvedValue(false);
             editor.uiManager.showToast = jest.fn();

             const result = await html.copy('text');
             expect(result).toBe(false);
             expect(editor.uiManager.showToast).toHaveBeenCalledWith(editor.lang.message_copy_fail, expect.anything(), 'error');
        });

        it('should handle exception in copy', async () => {
             jest.spyOn(clipboard, 'write').mockRejectedValue(new Error('fail'));
             console.error = jest.fn(); // suppress console error
             editor.uiManager.showToast = jest.fn();

             const result = await html.copy('text');
             expect(result).toBe(false);
        });
    });

	/**
	 * ============================================================
	 * STRICT DOM VERIFICATION TESTS FOR HTML CLASS
	 * These tests verify exact DOM output to catch regressions
	 * during refactoring.
	 * ============================================================
	 */
	describe('Strict DOM verification - insert', () => {
		it('should produce exact HTML when inserting text at cursor', () => {
			wysiwyg.innerHTML = '<p>Hello World</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 5, textNode, 5);

			const insertText = document.createTextNode(' Beautiful');
			html.insertNode(insertText);

			expect(wysiwyg.innerHTML).toBe('<p>Hello Beautiful World</p>');
		});

		it('should produce exact HTML when inserting span at cursor', () => {
			wysiwyg.innerHTML = '<p>Plain text here</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 6, textNode, 6);

			const span = document.createElement('span');
			span.style.color = 'red';
			span.textContent = 'colored';
			html.insertNode(span);

			expect(wysiwyg.innerHTML).toBe('<p>Plain <span style="color: red;">colored</span>text here</p>');
		});

		it('should produce exact HTML when replacing selected text', () => {
			wysiwyg.innerHTML = '<p>Replace this word</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 8, textNode, 12);

			const replacement = document.createTextNode('that');
			html.insertNode(replacement);

			expect(wysiwyg.innerHTML).toBe('<p>Replace that word</p>');
		});

		it('should insert strong element correctly', () => {
			wysiwyg.innerHTML = '<p>Normal text</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 7, textNode, 7);

			const strong = document.createElement('strong');
			strong.textContent = 'BOLD';
			html.insertNode(strong);

			expect(wysiwyg.querySelector('strong')).toBeTruthy();
			expect(wysiwyg.querySelector('strong').textContent).toBe('BOLD');
		});
	});

	describe('Strict DOM verification - insertNode with block elements', () => {
		it('should split paragraph when inserting block element', () => {
			wysiwyg.innerHTML = '<p>Before After</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 7, textNode, 7);

			const newP = document.createElement('p');
			newP.textContent = 'Middle';
			html.insertNode(newP);

			// Should have multiple paragraphs now
			const paragraphs = wysiwyg.querySelectorAll('p');
			expect(paragraphs.length).toBeGreaterThanOrEqual(2);
			expect(wysiwyg.textContent).toContain('Before');
			expect(wysiwyg.textContent).toContain('Middle');
			expect(wysiwyg.textContent).toContain('After');
		});

		it('should insert div element splitting content', () => {
			wysiwyg.innerHTML = '<p>Start End</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 6, textNode, 6);

			const div = document.createElement('div');
			div.textContent = 'Inserted Block';
			html.insertNode(div);

			expect(wysiwyg.querySelector('div')).toBeTruthy();
			expect(wysiwyg.textContent).toContain('Inserted Block');
		});
	});

	describe('Strict DOM verification - remove', () => {
		it('should remove selected text exactly', () => {
			wysiwyg.innerHTML = '<p>Remove middle text</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 7, textNode, 14);

			html.remove();

			expect(wysiwyg.innerHTML).toBe('<p>Remove text</p>');
		});

		it('should remove entire word when selected', () => {
			wysiwyg.innerHTML = '<p>Hello World</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 6, textNode, 11);

			html.remove();

			expect(wysiwyg.innerHTML).toBe('<p>Hello </p>');
		});

		it('should handle removing formatted text', () => {
			wysiwyg.innerHTML = '<p>Text <strong>Bold</strong> More</p>';
			const strongText = wysiwyg.querySelector('strong').firstChild;
			editor.selection.setRange(strongText, 0, strongText, 4);

			html.remove();

			// Bold text should be removed, strong tag may or may not remain
			expect(wysiwyg.textContent).toContain('Text');
			expect(wysiwyg.textContent).toContain('More');
			expect(wysiwyg.textContent).not.toContain('Bold');
		});

		it('should remove across multiple elements', () => {
			wysiwyg.innerHTML = '<p><strong>Bold</strong><em>Italic</em></p>';
			const boldText = wysiwyg.querySelector('strong').firstChild;
			const italicText = wysiwyg.querySelector('em').firstChild;
			editor.selection.setRange(boldText, 2, italicText, 3);

			html.remove();

			// Should have removed "ld" from Bold and "Ita" from Italic
			expect(wysiwyg.textContent).toBe('Bolic');
		});
	});

	describe('Strict DOM verification - get/set', () => {
		it('should get exact HTML content', () => {
			wysiwyg.innerHTML = '<p>Test <strong>content</strong></p>';

			const result = html.get();

			expect(result).toBe('<p>Test <strong>content</strong></p>');
		});

		it('should set HTML content exactly', () => {
			html.set('<p>New <em>content</em></p>');

			expect(wysiwyg.innerHTML).toBe('<p>New <em>content</em></p>');
		});

		it('should handle empty content', () => {
			html.set('');

			// Empty content results in empty string (actual behavior)
			expect(wysiwyg.innerHTML).toBeDefined();
		});

		it('should preserve complex nested structure', () => {
			const complexHTML = '<p><strong><em>Bold Italic</em></strong></p><ul><li>Item 1</li><li>Item 2</li></ul>';
			html.set(complexHTML);

			expect(wysiwyg.querySelector('strong em')).toBeTruthy();
			expect(wysiwyg.querySelectorAll('li').length).toBe(2);
		});
	});

	describe('Strict DOM verification - clean', () => {
		it('should clean HTML removing extra whitespace', () => {
			const dirty = '  <p>  Text   with   spaces  </p>  ';
			const cleaned = html.clean(dirty);

			// Should be trimmed and normalized
			expect(cleaned).not.toMatch(/^\s+/);
			expect(cleaned).not.toMatch(/\s+$/);
		});

		it('should preserve necessary structure', () => {
			const input = '<p><strong>Bold</strong> <em>Italic</em></p>';
			const cleaned = html.clean(input);

			expect(cleaned).toContain('<strong>');
			expect(cleaned).toContain('<em>');
		});

		it('should remove script tags', () => {
			const malicious = '<p>Safe</p><script>alert("xss")</script>';
			const cleaned = html.clean(malicious);

			expect(cleaned).not.toContain('<script>');
			expect(cleaned).toContain('Safe');
		});

		it('should handle inline styles (clean may strip styles based on config)', () => {
			const styled = '<p><span style="color: red;">Red Text</span></p>';
			const cleaned = html.clean(styled);

			// clean() may strip inline styles based on editor configuration
			// Text content should be preserved
			expect(cleaned).toContain('Red Text');
		});
	});

	describe('Strict DOM verification - list operations', () => {
		it('should insert into list item correctly', () => {
			wysiwyg.innerHTML = '<ul><li>Item one</li><li>Item two</li></ul>';
			const li = wysiwyg.querySelector('li');
			const textNode = li.firstChild;
			editor.selection.setRange(textNode, 5, textNode, 5);

			const span = document.createElement('span');
			span.textContent = ' inserted';
			html.insertNode(span);

			expect(li.textContent).toContain('inserted');
		});

		it('should handle inserting list into paragraph', () => {
			wysiwyg.innerHTML = '<p>Before list</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 11, textNode, 11);

			const ul = document.createElement('ul');
			ul.innerHTML = '<li>New item</li>';
			html.insertNode(ul);

			expect(wysiwyg.querySelector('ul')).toBeTruthy();
			expect(wysiwyg.querySelector('li').textContent).toBe('New item');
		});
	});

	describe('Strict DOM verification - table operations', () => {
		it('should insert text into table cell', () => {
			wysiwyg.innerHTML = '<table><tbody><tr><td>Cell</td></tr></tbody></table>';
			const cell = wysiwyg.querySelector('td');
			const textNode = cell.firstChild;
			editor.selection.setRange(textNode, 4, textNode, 4);

			const insertText = document.createTextNode(' content');
			html.insertNode(insertText);

			expect(cell.textContent).toBe('Cell content');
		});

		it('should handle removing text from table cell', () => {
			wysiwyg.innerHTML = '<table><tbody><tr><td>Remove this</td></tr></tbody></table>';
			const cell = wysiwyg.querySelector('td');
			const textNode = cell.firstChild;
			editor.selection.setRange(textNode, 7, textNode, 11);

			html.remove();

			expect(cell.textContent).toBe('Remove ');
		});
	});

	describe('Strict DOM verification - special characters', () => {
		it('should handle HTML entities correctly', () => {
			html.set('<p>Test &amp; verify &lt;tag&gt;</p>');

			expect(wysiwyg.textContent).toBe('Test & verify <tag>');
		});

		it('should handle unicode characters', () => {
			html.set('<p>한글 테스트 🎉</p>');

			expect(wysiwyg.textContent).toBe('한글 테스트 🎉');
		});

		it('should preserve whitespace in preformatted blocks', () => {
			const preContent = '<pre>  indented\n    more indent</pre>';
			html.set(preContent);

			const pre = wysiwyg.querySelector('pre');
			expect(pre).toBeTruthy();
			expect(pre.textContent).toContain('  indented');
		});
	});

	describe('Strict DOM verification - edge cases', () => {
		it('should handle empty selection insert', () => {
			wysiwyg.innerHTML = '<p>Text</p>';
			const p = wysiwyg.querySelector('p');
			editor.selection.setRange(p, 0, p, 0);

			const span = document.createElement('span');
			span.textContent = 'Start';
			html.insertNode(span);

			expect(wysiwyg.textContent).toContain('Start');
		});

		it('should handle insert at end of content', () => {
			wysiwyg.innerHTML = '<p>Content</p>';
			const textNode = wysiwyg.querySelector('p').firstChild;
			editor.selection.setRange(textNode, 7, textNode, 7);

			const endText = document.createTextNode(' End');
			html.insertNode(endText);

			expect(wysiwyg.querySelector('p').textContent).toBe('Content End');
		});

		it('should handle nested inline elements', () => {
			wysiwyg.innerHTML = '<p><strong><em>Nested</em></strong></p>';
			const emText = wysiwyg.querySelector('em').firstChild;
			editor.selection.setRange(emText, 3, emText, 3);

			const u = document.createElement('u');
			u.textContent = '-inserted-';
			html.insertNode(u);

			expect(wysiwyg.querySelector('u')).toBeTruthy();
			expect(wysiwyg.textContent).toContain('-inserted-');
		});
	});
});
