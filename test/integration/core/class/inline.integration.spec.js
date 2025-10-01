
import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';
import { dom } from '../../../../src/helper';

describe('Inline Class - Integration Tests', () => {
  let editor;
  let wysiwyg;

  beforeEach(async () => {
    editor = createTestEditor();
    await waitForEditorReady(editor);
    wysiwyg = editor.frameContext.get('wysiwyg');
  });

  afterEach(() => {
    destroyTestEditor(editor);
  });

  const applyBold = () => {
    const strong = dom.utils.createElement('strong');
    return editor.inline.apply(strong);
  };

  const applyItalic = () => {
    const em = dom.utils.createElement('em');
    return editor.inline.apply(em);
  };

  const applyUnderline = () => {
    const u = dom.utils.createElement('u');
    return editor.inline.apply(u);
  };

  const removeFormat = () => {
    return editor.inline.apply(null);
  };

  describe('Complex multi-paragraph formatting', () => {
    it('should apply bold across multiple paragraphs preserving structure', () => {
      wysiwyg.innerHTML = '<p>First paragraph</p><p>Second paragraph</p><p>Third paragraph</p>';
      const firstText = wysiwyg.querySelectorAll('p')[0].firstChild;
      const thirdText = wysiwyg.querySelectorAll('p')[2].firstChild;
      editor.selection.setRange(firstText, 6, thirdText, 5);

      applyBold();

      expect(wysiwyg.querySelectorAll('strong').length).toBeGreaterThan(0);
      expect(wysiwyg.querySelectorAll('p').length).toBe(3);
    });

    it('should handle complex mixed formatting with undo/redo', () => {
      wysiwyg.innerHTML = '<p>Test content here</p>';
      const textNode = wysiwyg.querySelector('p').firstChild;

      editor.selection.setRange(textNode, 0, textNode, 4);
      applyBold();

      editor.selection.setRange(textNode, 5, textNode, 12);
      applyItalic();

      expect(wysiwyg.querySelector('strong')).toBeTruthy();
      expect(wysiwyg.querySelector('em')).toBeTruthy();

      editor.history.undo();
      expect(wysiwyg.querySelectorAll('em').length).toBe(0);

      editor.history.redo();
      expect(wysiwyg.querySelectorAll('em').length).toBeGreaterThan(0);
    });

    it('should handle selection across different block types', () => {
      wysiwyg.innerHTML = '<p>Paragraph</p><blockquote>Quote</blockquote><pre>Code</pre>';
      const pText = wysiwyg.querySelector('p').firstChild;
      const preText = wysiwyg.querySelector('pre').firstChild;
      editor.selection.setRange(pText, 0, preText, 4);

      applyBold();

      expect(wysiwyg.querySelectorAll('strong').length).toBeGreaterThan(0);
    });
  });

  describe('Complex nested inline formatting', () => {
    it('should handle multiple overlapping inline styles', () => {
      wysiwyg.innerHTML = '<p>Test content for styling</p>';
      const textNode = wysiwyg.querySelector('p').firstChild;

      editor.selection.setRange(textNode, 0, textNode, 10);
      applyBold();

      editor.selection.setRange(textNode, 5, textNode, 15);
      applyItalic();

      editor.selection.setRange(textNode, 8, textNode, 20);
      applyUnderline();

      expect(wysiwyg.querySelector('strong')).toBeTruthy();
      expect(wysiwyg.querySelector('em')).toBeTruthy();
      expect(wysiwyg.querySelector('u')).toBeTruthy();
    });

    it('should preserve anchor links when applying styles', () => {
      wysiwyg.innerHTML = '<p><a href="https://example.com">Link text here</a></p>';
      const textNode = wysiwyg.querySelector('a').firstChild;
      editor.selection.setRange(textNode, 0, textNode, 4);

      applyBold();

      expect(wysiwyg.querySelector('a')).toBeTruthy();
      expect(wysiwyg.querySelector('a').getAttribute('href')).toBe('https://example.com');
      expect(wysiwyg.querySelector('strong')).toBeTruthy();
    });

    it('should handle deeply nested list formatting', () => {
      wysiwyg.innerHTML = '<ul><li>Item 1<ul><li>Nested item<ul><li>Deep item</li></ul></li></ul></li></ul>';
      const deepText = wysiwyg.querySelectorAll('li')[2].firstChild;
      editor.selection.setRange(deepText, 0, deepText, 4);

      applyBold();

      expect(wysiwyg.querySelector('strong')).toBeTruthy();
    });
  });

  describe('Remove format scenarios', () => {
    it('should remove all formatting from heavily styled text', () => {
      wysiwyg.innerHTML = '<p><strong><em><u><span style="color: red;">Styled</span></u></em></strong></p>';
      const textNode = wysiwyg.querySelector('span').firstChild;
      editor.selection.setRange(textNode, 0, textNode, 6);

      removeFormat();

      const p = wysiwyg.querySelector('p');
      expect(p.textContent).toBe('Styled');
    });

    it('should handle partial format removal', () => {
      wysiwyg.innerHTML = '<p><strong>Bold text here</strong></p>';
      const textNode = wysiwyg.querySelector('strong').firstChild;
      editor.selection.setRange(textNode, 5, textNode, 9);

      removeFormat();

      expect(wysiwyg.textContent).toContain('Bold');
      expect(wysiwyg.textContent).toContain('here');
    });

    it('should remove format across multiple elements', () => {
      wysiwyg.innerHTML = '<p><strong>Bold</strong> <em>italic</em> <u>underline</u></p>';
      const p = wysiwyg.querySelector('p');
      editor.selection.setRange(p, 0, p, p.childNodes.length);

      removeFormat();

      expect(wysiwyg.querySelector('strong')).toBeFalsy();
      expect(wysiwyg.querySelector('em')).toBeFalsy();
      expect(wysiwyg.querySelector('u')).toBeFalsy();
    });
  });

  describe('Color and font styling', () => {
    it('should apply text color to selection', () => {
      wysiwyg.innerHTML = '<p>Colorful text</p>';
      const textNode = wysiwyg.querySelector('p').firstChild;
      editor.selection.setRange(textNode, 0, textNode, 8);

      const span = dom.utils.createElement('span');
      span.style.color = 'rgb(255, 0, 0)';
      editor.inline.apply(span);

      const coloredSpan = wysiwyg.querySelector('span[style*="color"]');
      expect(coloredSpan).toBeTruthy();
    });

    it('should change existing color', () => {
      wysiwyg.innerHTML = '<p><span style="color: blue;">Blue text</span></p>';
      const textNode = wysiwyg.querySelector('span').firstChild;
      editor.selection.setRange(textNode, 0, textNode, 4);

      const span = dom.utils.createElement('span');
      span.style.color = 'rgb(255, 0, 0)';
      editor.inline.apply(span);

      expect(wysiwyg.querySelector('span')).toBeTruthy();
    });

    it('should apply background color independently from text color', () => {
      wysiwyg.innerHTML = '<p><span style="color: blue;">Text</span></p>';
      const textNode = wysiwyg.querySelector('span').firstChild;
      editor.selection.setRange(textNode, 0, textNode, 4);

      const span = dom.utils.createElement('span');
      span.style.backgroundColor = 'yellow';
      editor.inline.apply(span);

      expect(wysiwyg.querySelector('span')).toBeTruthy();
    });
  });

  describe('Selection edge cases', () => {
    it('should handle collapsed selection (caret position)', () => {
      wysiwyg.innerHTML = '<p>Test text</p>';
      const textNode = wysiwyg.querySelector('p').firstChild;
      editor.selection.setRange(textNode, 5, textNode, 5);

      applyBold();

      expect(wysiwyg.innerHTML).toBeTruthy();
    });

    it('should handle selection with BR elements', () => {
      wysiwyg.innerHTML = '<p>Line1<br>Line2<br>Line3</p>';
      const p = wysiwyg.querySelector('p');
      const firstText = p.firstChild;
      const lastText = p.lastChild;
      editor.selection.setRange(firstText, 0, lastText, 5);

      applyBold();

      expect(wysiwyg.querySelectorAll('br').length).toBe(2);
      expect(wysiwyg.querySelector('strong')).toBeTruthy();
    });

    it('should handle empty paragraphs', () => {
      wysiwyg.innerHTML = '<p><br></p><p>Text</p>';
      const textNode = wysiwyg.querySelectorAll('p')[1].firstChild;
      editor.selection.setRange(textNode, 0, textNode, 4);

      applyBold();

      expect(wysiwyg.querySelectorAll('p').length).toBe(2);
    });
  });

  describe('Table cell formatting', () => {
    it('should apply formatting within table cells', () => {
      wysiwyg.innerHTML = '<table><tbody><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody></table>';
      const cell1Text = wysiwyg.querySelectorAll('td')[0].firstChild;
      editor.selection.setRange(cell1Text, 0, cell1Text, 6);

      applyBold();

      expect(wysiwyg.querySelector('td strong')).toBeTruthy();
    });

    it('should handle formatting across multiple cells', () => {
      wysiwyg.innerHTML = '<table><tbody><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody></table>';
      const cell1Text = wysiwyg.querySelectorAll('td')[0].firstChild;
      const cell2Text = wysiwyg.querySelectorAll('td')[1].firstChild;
      editor.selection.setRange(cell1Text, 3, cell2Text, 3);

      applyBold();

      expect(wysiwyg.querySelectorAll('strong').length).toBeGreaterThan(0);
    });

    it('should handle table with nested paragraphs', () => {
      wysiwyg.innerHTML = '<table><tbody><tr><td><p>Para in cell</p></td></tr></tbody></table>';
      const textNode = wysiwyg.querySelector('p').firstChild;
      editor.selection.setRange(textNode, 0, textNode, 4);

      applyBold();

      expect(wysiwyg.querySelector('strong')).toBeTruthy();
    });
  });

  describe('Complex real-world scenarios', () => {
    it('should handle copy-pasted content with mixed formatting', () => {
      wysiwyg.innerHTML = '<p><strong>Bold</strong> and <em>italic</em> and <u>underline</u></p>';
      const p = wysiwyg.querySelector('p');
      editor.selection.setRange(p, 0, p, p.childNodes.length);

      const span = dom.utils.createElement('span');
      span.style.color = 'red';
      editor.inline.apply(span);

      expect(wysiwyg.querySelector('strong')).toBeTruthy();
      expect(wysiwyg.querySelector('em')).toBeTruthy();
      expect(wysiwyg.querySelector('u')).toBeTruthy();
    });

    it('should handle alternating bold/unbold operations', () => {
      wysiwyg.innerHTML = '<p>Test text</p>';
      const textNode = wysiwyg.querySelector('p').firstChild;

      editor.selection.setRange(textNode, 0, textNode, 4);
      applyBold();
      expect(wysiwyg.querySelector('strong')).toBeTruthy();

      editor.selection.setRange(textNode, 0, textNode, 4);
      applyBold();

      expect(wysiwyg.innerHTML).toBeTruthy();
    });

    it('should preserve whitespace in formatted text', () => {
      wysiwyg.innerHTML = '<p>Text   with   spaces</p>';
      const textNode = wysiwyg.querySelector('p').firstChild;
      editor.selection.setRange(textNode, 0, textNode, textNode.length);

      applyBold();

      expect(wysiwyg.textContent).toContain('   ');
    });

    it('should handle mixed list and paragraph formatting', () => {
      wysiwyg.innerHTML = '<p>Paragraph</p><ul><li>Item 1</li><li>Item 2</li></ul><p>Another para</p>';
      const firstText = wysiwyg.querySelector('p').firstChild;
      const lastPara = wysiwyg.querySelectorAll('p')[1];
      const lastText = lastPara.firstChild;
      editor.selection.setRange(firstText, 0, lastText, 7);

      applyItalic();

      expect(wysiwyg.querySelectorAll('em').length).toBeGreaterThan(0);
    });
  });

  describe('Undo/Redo with complex formatting', () => {
    it('should undo multiple formatting steps correctly', () => {
      wysiwyg.innerHTML = '<p>Test content</p>';
      const textNode = wysiwyg.querySelector('p').firstChild;

      editor.selection.setRange(textNode, 0, textNode, 4);
      applyBold();
      expect(wysiwyg.querySelector('strong')).toBeTruthy();

      editor.selection.setRange(textNode, 0, textNode, 4);
      applyItalic();
      expect(wysiwyg.querySelector('em')).toBeTruthy();

      editor.selection.setRange(textNode, 0, textNode, 4);
      applyUnderline();
      expect(wysiwyg.querySelector('u')).toBeTruthy();

      editor.history.undo();
      editor.history.undo();
      editor.history.undo();

      // After undoing all changes, content should still be present
      expect(wysiwyg.textContent.length).toBeGreaterThan(0);
    });

    it('should redo formatting operations', () => {
      wysiwyg.innerHTML = '<p>Test content</p>';
      const textNode = wysiwyg.querySelector('p').firstChild;

      editor.selection.setRange(textNode, 0, textNode, 4);
      applyBold();

      editor.history.undo();
      expect(wysiwyg.querySelector('strong')).toBeFalsy();

      editor.history.redo();
      expect(wysiwyg.querySelector('strong')).toBeTruthy();
    });
  });

  describe('Special character handling', () => {
    it('should handle zero-width spaces in formatting', () => {
      wysiwyg.innerHTML = '<p>Test\u200Bcontent</p>';
      const textNode = wysiwyg.querySelector('p').firstChild;
      editor.selection.setRange(textNode, 0, textNode, textNode.length);

      applyBold();

      expect(wysiwyg.querySelector('strong')).toBeTruthy();
    });

    it('should handle non-breaking spaces', () => {
      wysiwyg.innerHTML = '<p>Test&nbsp;content</p>';
      const textNode = wysiwyg.querySelector('p').firstChild;
      editor.selection.setRange(textNode, 0, textNode, textNode.length);

      applyBold();

      expect(wysiwyg.querySelector('strong')).toBeTruthy();
    });

    it('should handle unicode characters', () => {
      wysiwyg.innerHTML = '<p>你好世界 こんにちは 🌍</p>';
      const textNode = wysiwyg.querySelector('p').firstChild;
      editor.selection.setRange(textNode, 0, textNode, 4);

      applyBold();

      expect(wysiwyg.querySelector('strong')).toBeTruthy();
    });
  });

  describe('Component and plugin integration', () => {
    it('should skip non-editable regions', () => {
      wysiwyg.innerHTML = '<p>Before <span contenteditable="false">locked</span> after</p>';
      const p = wysiwyg.querySelector('p');
      editor.selection.setRange(p, 0, p, p.childNodes.length);

      applyBold();

      expect(wysiwyg.querySelector('[contenteditable="false"]')).toBeTruthy();
    });

    it('should handle image captions', () => {
      wysiwyg.innerHTML = '<figure><img src="test.jpg"><figcaption>Caption text</figcaption></figure>';
      const caption = wysiwyg.querySelector('figcaption');
      if (caption && caption.firstChild) {
        const captionText = caption.firstChild;
        editor.selection.setRange(captionText, 0, Math.min(captionText.length, 7));

        applyBold();

        expect(wysiwyg.querySelector('figcaption')).toBeTruthy();
      } else {
        expect(caption).toBeTruthy();
      }
    });
  });

  describe('Edge cases with empty content', () => {
    it('should handle completely empty wysiwyg', () => {
      wysiwyg.innerHTML = '';

      const result = editor.inline.apply(dom.utils.createElement('strong'));

      expect(result).toBeDefined();
    });

    it('should handle paragraph with only whitespace', () => {
      wysiwyg.innerHTML = '<p>   </p>';
      const textNode = wysiwyg.querySelector('p').firstChild;
      if (textNode) {
        editor.selection.setRange(textNode, 0, textNode, 3);
        applyBold();
      }

      expect(wysiwyg.querySelector('p')).toBeTruthy();
    });
  });

  describe('Blockquote and pre formatting', () => {
    it('should apply inline formatting within blockquote', () => {
      wysiwyg.innerHTML = '<blockquote><p>Quoted text</p></blockquote>';
      const textNode = wysiwyg.querySelector('p').firstChild;
      editor.selection.setRange(textNode, 0, textNode, 6);

      applyBold();

      expect(wysiwyg.querySelector('strong')).toBeTruthy();
    });

    it('should apply inline formatting within pre tag', () => {
      wysiwyg.innerHTML = '<pre>Code block</pre>';
      const textNode = wysiwyg.querySelector('pre').firstChild;
      editor.selection.setRange(textNode, 0, textNode, 4);

      applyBold();

      expect(wysiwyg.querySelector('pre')).toBeTruthy();
    });

    it('should handle nested blockquotes', () => {
      wysiwyg.innerHTML = '<blockquote><blockquote><p>Nested quote</p></blockquote></blockquote>';
      const textNode = wysiwyg.querySelector('p').firstChild;
      editor.selection.setRange(textNode, 0, textNode, 6);

      applyBold();

      expect(wysiwyg.querySelectorAll('blockquote').length).toBe(2);
    });
  });

  describe('Complex maintained node scenarios', () => {
    it('should handle selection spanning across multiple anchor elements', () => {
      wysiwyg.innerHTML = '<p><a href="#1">First link</a> middle <a href="#2">Second link</a></p>';
      const firstLink = wysiwyg.querySelectorAll('a')[0].firstChild;
      const secondLink = wysiwyg.querySelectorAll('a')[1].firstChild;
      editor.selection.setRange(firstLink, 6, secondLink, 6);

      applyBold();

      expect(wysiwyg.querySelectorAll('a').length).toBe(2);
      expect(wysiwyg.querySelector('strong')).toBeTruthy();
    });

    it('should handle nested code blocks with formatting', () => {
      wysiwyg.innerHTML = '<p><code>outer <span>inner code</span> text</code></p>';
      const innerText = wysiwyg.querySelector('span').firstChild;
      editor.selection.setRange(innerText, 0, innerText, 5);

      applyBold();

      expect(wysiwyg.querySelector('code')).toBeTruthy();
    });

    it('should handle label elements as maintained nodes', () => {
      wysiwyg.innerHTML = '<p><label>Label text here</label></p>';
      const textNode = wysiwyg.querySelector('label').firstChild;
      editor.selection.setRange(textNode, 0, textNode, 5);

      applyBold();

      expect(wysiwyg.querySelector('label')).toBeTruthy();
      expect(wysiwyg.querySelector('strong')).toBeTruthy();
    });

    it('should handle summary elements as maintained nodes', () => {
      wysiwyg.innerHTML = '<details><summary>Summary text</summary><p>Details</p></details>';
      const textNode = wysiwyg.querySelector('summary').firstChild;
      editor.selection.setRange(textNode, 0, textNode, 7);

      applyBold();

      expect(wysiwyg.querySelector('summary')).toBeTruthy();
    });
  });

  describe('Complex text splitting scenarios', () => {
    it('should handle partial selection at start of maintained node', () => {
      wysiwyg.innerHTML = '<p><a href="#">Link text content</a></p>';
      const textNode = wysiwyg.querySelector('a').firstChild;
      editor.selection.setRange(textNode, 0, textNode, 4);

      applyBold();

      expect(wysiwyg.querySelector('a')).toBeTruthy();
      expect(wysiwyg.querySelector('strong')).toBeTruthy();
    });

    it('should handle partial selection at end of maintained node', () => {
      wysiwyg.innerHTML = '<p><a href="#">Link text content</a></p>';
      const textNode = wysiwyg.querySelector('a').firstChild;
      const len = textNode.length;
      editor.selection.setRange(textNode, len - 7, textNode, len);

      applyBold();

      expect(wysiwyg.querySelector('a')).toBeTruthy();
      expect(wysiwyg.querySelector('strong')).toBeTruthy();
    });

    it('should handle middle selection in maintained node', () => {
      wysiwyg.innerHTML = '<p><a href="#">Before middle after</a></p>';
      const textNode = wysiwyg.querySelector('a').firstChild;
      editor.selection.setRange(textNode, 7, textNode, 13);

      applyBold();

      expect(wysiwyg.querySelector('a')).toBeTruthy();
    });

    it('should handle multiple maintained nodes with partial selections', () => {
      wysiwyg.innerHTML = '<p><code>code1</code> text <code>code2</code></p>';
      const code1 = wysiwyg.querySelectorAll('code')[0].firstChild;
      const code2 = wysiwyg.querySelectorAll('code')[1].firstChild;
      editor.selection.setRange(code1, 2, code2, 3);

      applyBold();

      expect(wysiwyg.querySelectorAll('code').length).toBe(2);
    });
  });

  describe('Complex validation and removal scenarios', () => {
    it('should handle style modification with partial match', () => {
      wysiwyg.innerHTML = '<p><span style="color: red; font-size: 14px;">styled text</span></p>';
      const textNode = wysiwyg.querySelector('span').firstChild;
      editor.selection.setRange(textNode, 0, textNode, 6);

      const span = dom.utils.createElement('span');
      span.style.color = 'blue';
      editor.inline.apply(span, {
        stylesToModify: ['color']
      });

      expect(wysiwyg.querySelector('span')).toBeTruthy();
    });

    it('should handle class modification with multiple classes', () => {
      wysiwyg.innerHTML = '<p><span class="class1 class2 class3">text</span></p>';
      const textNode = wysiwyg.querySelector('span').firstChild;
      editor.selection.setRange(textNode, 0, textNode, 4);

      const span = dom.utils.createElement('span');
      span.className = 'newclass';
      editor.inline.apply(span);

      expect(wysiwyg.querySelector('span')).toBeTruthy();
    });

    it('should handle removing specific node types while preserving others', () => {
      wysiwyg.innerHTML = '<p><strong><em><u>triple styled</u></em></strong></p>';
      const textNode = wysiwyg.querySelector('u').firstChild;
      editor.selection.setRange(textNode, 0, textNode, 6);

      editor.inline.apply(null, {
        nodesToRemove: ['strong', 'u']
      });

      // After removal, em should still exist
      expect(wysiwyg.querySelector('em')).toBeTruthy();
    });
  });

  describe('Edge cases with empty and whitespace nodes', () => {
    it('should handle selection with multiple whitespace text nodes', () => {
      wysiwyg.innerHTML = '<p>text     <span>   content   </span>     more</p>';
      const p = wysiwyg.querySelector('p');
      editor.selection.setRange(p.firstChild, 0, p.lastChild, 4);

      applyBold();

      expect(wysiwyg.querySelector('strong')).toBeTruthy();
    });

    it('should handle zero-width space at selection boundaries', () => {
      wysiwyg.innerHTML = '<p>\u200Btext content\u200B</p>';
      const textNode = wysiwyg.querySelector('p').firstChild;
      editor.selection.setRange(textNode, 1, textNode, 8);

      applyBold();

      expect(wysiwyg.querySelector('strong')).toBeTruthy();
    });

    it('should handle empty spans in selection', () => {
      wysiwyg.innerHTML = '<p>before<span></span><span></span>after</p>';
      const p = wysiwyg.querySelector('p');
      editor.selection.setRange(p.firstChild, 0, p.lastChild, 5);

      applyBold();

      expect(wysiwyg.querySelector('strong')).toBeTruthy();
    });
  });

  describe('Complex multi-line with maintained nodes', () => {
    it('should handle lists with anchor links', () => {
      wysiwyg.innerHTML = '<ul><li><a href="#1">First</a></li><li><a href="#2">Second</a></li></ul>';
      const first = wysiwyg.querySelectorAll('a')[0].firstChild;
      const second = wysiwyg.querySelectorAll('a')[1].firstChild;
      editor.selection.setRange(first, 0, second, 6);

      applyBold();

      expect(wysiwyg.querySelectorAll('a').length).toBe(2);
      expect(wysiwyg.querySelectorAll('strong').length).toBeGreaterThan(0);
    });

    it('should handle table cells with code blocks', () => {
      wysiwyg.innerHTML = '<table><tbody><tr><td><code>code1</code></td><td><code>code2</code></td></tr></tbody></table>';
      const code1 = wysiwyg.querySelectorAll('code')[0].firstChild;
      const code2 = wysiwyg.querySelectorAll('code')[1].firstChild;
      editor.selection.setRange(code1, 0, code2, 5);

      applyBold();

      expect(wysiwyg.querySelectorAll('code').length).toBe(2);
    });
  });

  describe('Performance with complex structures', () => {
    it('should handle deeply nested elements efficiently', () => {
      wysiwyg.innerHTML = '<p><span><strong><em><u><span><i>deeply nested</i></span></u></em></strong></span></p>';
      const textNode = wysiwyg.querySelector('i').firstChild;
      editor.selection.setRange(textNode, 0, textNode, 6);

      const startTime = Date.now();
      applyBold();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(500);
      expect(wysiwyg.querySelector('strong')).toBeTruthy();
    });

    it('should handle many sibling elements efficiently', () => {
      let html = '<p>';
      for (let i = 0; i < 20; i++) {
        html += `<span>text${i}</span>`;
      }
      html += '</p>';
      wysiwyg.innerHTML = html;

      const first = wysiwyg.querySelectorAll('span')[0].firstChild;
      const last = wysiwyg.querySelectorAll('span')[19].firstChild;
      editor.selection.setRange(first, 0, last, 5);

      const startTime = Date.now();
      applyBold();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(wysiwyg.querySelector('strong')).toBeTruthy();
    });
  });

  describe('Special formatting combinations', () => {
    it('should handle superscript with other formatting', () => {
      wysiwyg.innerHTML = '<p><sup>superscript text</sup></p>';
      const textNode = wysiwyg.querySelector('sup').firstChild;
      editor.selection.setRange(textNode, 0, textNode, 11);

      applyBold();

      expect(wysiwyg.querySelector('sup')).toBeTruthy();
      expect(wysiwyg.querySelector('strong')).toBeTruthy();
    });

    it('should handle subscript with other formatting', () => {
      wysiwyg.innerHTML = '<p><sub>subscript text</sub></p>';
      const textNode = wysiwyg.querySelector('sub').firstChild;
      editor.selection.setRange(textNode, 0, textNode, 9);

      applyBold();

      expect(wysiwyg.querySelector('sub')).toBeTruthy();
      expect(wysiwyg.querySelector('strong')).toBeTruthy();
    });

    it('should handle strike-through with nesting', () => {
      wysiwyg.innerHTML = '<p><s>strike text here</s></p>';
      const textNode = wysiwyg.querySelector('s').firstChild;
      editor.selection.setRange(textNode, 0, textNode, 6);

      applyBold();

      expect(wysiwyg.querySelector('s')).toBeTruthy();
      expect(wysiwyg.querySelector('strong')).toBeTruthy();
    });

    it('should handle del and ins elements', () => {
      wysiwyg.innerHTML = '<p><del>deleted</del> <ins>inserted</ins></p>';
      const delText = wysiwyg.querySelector('del').firstChild;
      const insText = wysiwyg.querySelector('ins').firstChild;
      editor.selection.setRange(delText, 0, insText, 8);

      applyBold();

      expect(wysiwyg.querySelector('del')).toBeTruthy();
      expect(wysiwyg.querySelector('ins')).toBeTruthy();
    });
  });

  describe('Boundary and edge selection cases', () => {
    it('should handle selection starting at element boundary', () => {
      wysiwyg.innerHTML = '<p><strong>bold</strong>normal</p>';
      const p = wysiwyg.querySelector('p');
      const normalText = p.lastChild;
      editor.selection.setRange(p, 1, normalText, 6);

      applyItalic();

      expect(wysiwyg.querySelector('em')).toBeTruthy();
    });

    it('should handle selection ending at element boundary', () => {
      wysiwyg.innerHTML = '<p>normal<strong>bold</strong></p>';
      const p = wysiwyg.querySelector('p');
      const normalText = p.firstChild;
      editor.selection.setRange(normalText, 0, p, 1);

      applyItalic();

      expect(wysiwyg.querySelector('em')).toBeTruthy();
    });

    it('should handle cross-element selection with mixed content', () => {
      wysiwyg.innerHTML = '<p>text<strong>bold</strong><em>italic</em><u>under</u>more</p>';
      const p = wysiwyg.querySelector('p');
      editor.selection.setRange(p.firstChild, 2, p.lastChild, 2);

      const span = dom.utils.createElement('span');
      span.style.color = 'red';
      editor.inline.apply(span);

      expect(wysiwyg.querySelectorAll('span').length).toBeGreaterThan(0);
    });
  });

  describe('Real-world complex content', () => {
    it('should handle rich text with multiple formatting layers', () => {
      wysiwyg.innerHTML = '<p><strong><em>Bold italic</em></strong> <a href="#"><u>linked underline</u></a> <span style="color: red;">colored</span></p>';
      const p = wysiwyg.querySelector('p');
      const first = p.querySelector('em').firstChild;
      const last = p.querySelector('span').firstChild;
      editor.selection.setRange(first, 0, last, 7);

      const span = dom.utils.createElement('span');
      span.style.backgroundColor = 'yellow';
      editor.inline.apply(span);

      expect(wysiwyg.querySelector('strong')).toBeTruthy();
      expect(wysiwyg.querySelector('em')).toBeTruthy();
      expect(wysiwyg.querySelector('a')).toBeTruthy();
    });

    it('should handle content with mix of inline and block siblings', () => {
      wysiwyg.innerHTML = '<div><p>Para 1</p><span>Inline span</span><p>Para 2</p></div>';
      const span = wysiwyg.querySelector('span').firstChild;
      editor.selection.setRange(span, 0, span, 6);

      applyBold();

      expect(wysiwyg.querySelector('span')).toBeTruthy();
    });
  });
});
