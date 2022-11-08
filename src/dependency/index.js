import CoreDependency from './_core';
import ClassDependency from './_classes';

/**
 * @description Initializes and adds inner classes and default properties of the editor.
 * @param {any} editor Editor object
 */
function EditorDependency(editor) {
	CoreDependency.call(this, editor);
	ClassDependency.call(this, editor);
}

export default EditorDependency;
