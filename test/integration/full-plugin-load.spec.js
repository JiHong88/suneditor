import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';
import {
  blockquote, list_bulleted, list_numbered,
  align, font, fontColor, backgroundColor, hr, list, table,
  blockStyle, layout, lineHeight, template, paragraphStyle, textStyle,
  link, image, video, audio, embed, math, drawing,
  fontSize, anchor,
} from '../../src/plugins';

// Plugins must be passed as an object keyed by plugin.key
const pluginList = [
  blockquote, list_bulleted, list_numbered,
  align, font, fontColor, backgroundColor, hr, list, table,
  blockStyle, layout, lineHeight, template, paragraphStyle, textStyle,
  link, image, video, audio, embed, math, drawing,
  fontSize, anchor,
].filter(Boolean);

const allPlugins = {};
pluginList.forEach(p => { allPlugins[p.key] = p; });

describe('Full plugin load test', () => {
  let editor;
  afterEach(() => { if (editor) destroyTestEditor(editor); });

  it('should load all plugins', async () => {
    editor = createTestEditor({
      plugins: allPlugins,
      buttonList: [
        ['bold','italic','underline','strike','subscript','superscript'],
        ['font','fontSize','fontColor','backgroundColor'],
        ['align','lineHeight','list','table'],
        ['link','image','video','audio'],
        ['blockquote','blockStyle','paragraphStyle','textStyle'],
        ['hr','template','layout'],
        ['undo','redo'],
      ],
    });
    await waitForEditorReady(editor);
    expect(editor.$).toBeTruthy();
    expect(Object.keys(editor.$.plugins).length).toBeGreaterThan(10);
  });
});
