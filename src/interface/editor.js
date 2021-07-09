import CoreInterface from "./_core";
import ClassesInterface from "./_classes";

function EditorInterface(editor) {
    CoreInterface.call(this, editor);
    ClassesInterface.call(this, editor);
}

export default EditorInterface;