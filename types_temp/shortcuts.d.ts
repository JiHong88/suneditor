import EditorClass from "../../interface/editor";

class Shortcuts extends EditorClass {
  /**
	 * @description If there is a shortcut function, run it.
	 * @param keyCode event.keyCode
	 * @param shift Whether to press shift key
	 * @returns
	 */
  command(keyCode: number, shift: boolean): boolean;
}

export default Shortcuts;