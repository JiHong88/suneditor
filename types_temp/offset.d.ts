import EditorClass from "../../interface/editor";

class Offset extends EditorClass {
	/**
	 * @description Returns the position of the argument, relative to inside the editor.
	 * @param node Target node
	 * @returns
	 */
	get(node: Node): { left: number; top: number };

	/**
	 * @description Returns the position of the argument, relative to global document. {left:0, top:0, scroll: 0}
	 * @param container Target element
	 * @returns
	 */
  getGlobal(container: Element): { left: number; top: number; scroll: number };
  
  /**
   * @description Gets the current editor-relative scroll offset.
   */
  getGlobalScroll(): {top: number; left: number};
}

export default Offset;
