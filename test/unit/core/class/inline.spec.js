
import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';
import Inline from '../../../../src/core/class/inline';
import ClassInjector from '../../../../src/editorInjector/_classes';
import { dom } from '../../../../src/helper';

describe('Inline Class', () => {
  let editor;
  let inline;
  let wysiwyg;

  beforeEach(async () => {
    editor = createTestEditor();
    await waitForEditorReady(editor);
    inline = new Inline(editor);
    ClassInjector.call(inline, editor);
    wysiwyg = editor.frameContext.get('wysiwyg');
  });

  afterEach(() => {
    destroyTestEditor(editor);
  });

  describe('apply', () => {
    it('should apply an inline element to the current selection', () => {
      wysiwyg.innerHTML = '<p>Test content</p>';
      const textNode = wysiwyg.firstChild.firstChild;
      editor.selection.setRange(textNode, 5, textNode, 12);

      const strong = dom.utils.createElement('strong');
      inline.apply(strong);

      expect(wysiwyg.innerHTML).toBe('<p>Test <strong>content</strong></p>');
    });
  });

  describe('remove', () => {
    it('should remove an inline element from the current selection', () => {
      wysiwyg.innerHTML = '<p>Test <strong>content</strong></p>';
      const textNode = wysiwyg.querySelector('strong').firstChild;
      editor.selection.setRange(textNode, 0, textNode, 7);

      inline.remove('strong');

      expect(wysiwyg.innerHTML).toBe('<p>Test content</p>');
    });
  });
});
