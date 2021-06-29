import CoreInterface from "../../interface/_core";
class Component extends CoreInterface {
	/**
	 * @description The method to insert a element and return. (used elements : table, hr, image, video)
	 * If "element" is "HR", insert and return the new line.
	 * @param element Element to be inserted
	 * @param notHistoryPush When true, it does not update the history stack and the selection object and return EdgeNodes (util.getEdgeChildNodes)
	 * @param checkCharCount If true, if "options.maxCharCount" is exceeded when "element" is added, null is returned without addition.
	 * @param notSelect If true, Do not automatically select the inserted component.
	 * @returns
	 */
	insert(element: Element, notHistoryPush?: boolean, checkCharCount?: boolean, notSelect?: boolean): Element;

	/**
	 * @description Gets the file component and that plugin name
	 * return: {target, component, pluginName} | null
	 * @param element Target element (figure tag, component div, file tag)
	 * @returns
	 */
	get(element: Element): seledtedFileInfo | null;

	/**
	 * @description The component(image, video) is selected and the resizing module is called.
	 * @param element Element tag (img, iframe, video)
	 * @param pluginName Plugin name (image, video)
	 */
	select(element: Element, pluginName: string): void;

	/**
	 * @description It is judged whether it is the not checking node. (class="katex", "__se__tag")
	 * @param element The node to check
	 * @returns
	 */
	is(element: Node): boolean;
}

export default Component;
