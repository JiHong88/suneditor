import CoreInterface from "./_core";
import ClassesInterface from "./_classes";

/**
 * @interface
 * @description Initializes and adds inner classes and default properties of the editor.
 * @param {any} editor Editor object
 */
function EditorInterface(editor) {
    CoreInterface.call(this, editor);
    ClassesInterface.call(this, editor);
}

export default EditorInterface;