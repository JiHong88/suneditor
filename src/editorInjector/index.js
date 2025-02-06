import CoreInjector from './_core';
import ClassInjector from './_classes';

/**
 * @description Initializes and adds inner classes and default properties of the editor.
 * @param {object} editor - The root editor instance
 */
function EditorInjector(editor) {
	CoreInjector.call(this, editor);
	ClassInjector.call(this, editor);
}

export default EditorInjector;
