import CoreInterface from './_core';
import ModuleInterface from './_module';

/**
 * @interface
 * @description Initializes and adds inner classes and default properties of the editor.
 * @param {any} editor Editor object
 */
function EditorInterface(editor) {
	CoreInterface.call(this, editor);
	ModuleInterface.call(this, editor);
}

export default EditorInterface;
