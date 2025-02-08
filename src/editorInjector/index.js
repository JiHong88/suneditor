import CoreInjector from './_core';
import ClassInjector from './_classes';

/**
 * @typedef {import('../core/editor').default} EditorInstance
 */

/**
 * @description Initializes and adds inner classes and default properties of the editor.
 * @param {EditorInstance} editor - The root editor instance
 */
function EditorInjector(editor) {
	CoreInjector.call(this, editor);
	ClassInjector.call(this, editor);
}

export default EditorInjector;
