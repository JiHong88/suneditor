class Format {
  /**
   * @description Append format element to sibling node of argument element.
   * If the "formatNodeName" argument value is present, the tag of that argument value is inserted,
   * If not, the currently selected format tag is inserted.
   * @param element Insert as siblings of that element
   * @param formatNode Node name or node obejct to be inserted
   * @returns
   */
  appendLine(element: Element, formatNode?: string | Element): Element;

  /**
   * @description Appended all selected format Element to the argument element and insert
   * @param rangeElement Element of wrap the arguments (BLOCKQUOTE...)
   */
  applyRangeBlock(rangeElement: Element): void;

  /**
  * @description The elements of the "selectedFormats" array are detached from the "rangeElement" element. ("LI" tags are converted to "P" tags)
  * When "selectedFormats" is null, all elements are detached and return {cc: parentNode, sc: nextSibling, ec: previousSibling, removeArray: [Array of removed elements]}.
  * @param rangeElement Range format element (PRE, BLOCKQUOTE, OL, UL...)
  * @param selectedFormats Array of format elements (P, DIV, LI...) to remove.
  * If null, Applies to all elements and return {cc: parentNode, sc: nextSibling, ec: previousSibling}
  * @param newRangeElement The node(rangeElement) to replace the currently wrapped node.
  * @param remove If true, deleted without detached.
  * @param notHistoryPush When true, it does not update the history stack and the selection object and return EdgeNodes (util.getEdgeChildNodes)
  * @returns
  */
  removeRangeBlock(rangeElement: Element, selectedFormats: Element[] | null, newRangeElement: Element | null, remove: boolean, notHistoryPush: boolean): { cc: Node, sc: Node, ec: Node, removeArray: Element[] }
  
  /**
	 * @description Append all selected format Element to the list and insert.
	 * @param type List type. (bullet | numbered):[listStyleType]
	 * @param selectedCells Format elements or list cells.
	 * @param nested If true, indenting existing list cells.
	 */
  applyList(type: string, selectedCells: Element[], nested: boolean)
  
  /**
   * @description "selectedCells" array are detached from the list element.
   * The return value is applied when the first and last lines of "selectedFormats" are "LI" respectively.
   * @param selectedCells Array of format elements (LI, P...) to remove.
   * @param remove If true, It does not just remove the list, it deletes the contents. 
   * @returns {sc: <LI>, ec: <LI>}.
   */
  removeList(selectedCells: Element[], remove: boolean): { sc: Element, ec: Element };

  /**
	 * @description Nest list cells or cancel nested cells.
	 * @param selectedCells List cells.
	 * @param nested Nested or cancel nested.
   * @private
	 */
   _applyNestedList(selectedCells: Element[], nested: boolean): void;
  
  /**
   * @description Detach Nested all nested lists under the "baseNode".
   * Returns a list with nested removed.
   * @param baseNode Element on which to base.
   * @param all If true, it also detach all nested lists of a returned list.
   * @returns
   * @private
   */
  _removeNestedList(baseNode: Node, all: boolean): Element;
  
  /**
	 * @description Indent more the selected lines.
	 * margin size - "_variable.indentSize"px
	 */
  indent(): void;

  /**
	 * @description Indent less the selected lines.
	 * margin size - "_variable.indentSize"px
	 */
  outdent(): void;
}

export default Format;