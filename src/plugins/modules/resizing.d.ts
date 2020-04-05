import { Module } from '../Module';

declare interface resizing extends Module {
    /**
     * @description Call the resizing module
     * @param targetElement Resizing target element
     * @param plugin Plugin name
     * @returns Size of resizing div {w, h, t, l}
     */
    call_controller_resize(targetElement: Element, plugin: string): Record<string, number>;

    /**
     * @description Open align submenu of module
     */
    openAlignMenu(): void;

    /**
     * @description Return HTML string of caption(FIGCAPTION) element
     * @returns
     */
    create_caption(): string;

    /**
     * @description Cover the target element with a FIGURE element.
     * @param element Target element
     */
    set_cover(element: Element): void;

    /**
     * @description Create a container for the resizing component and insert the element.
     * @param cover Cover element (FIGURE)
     * @param className Class name of container (fixed: se-component)
     * @returns Created container element
     */
    set_container(cover: Element, className: string): Element;

    /**
     * @description Click event of resizing toolbar
     * Performs the action of the clicked toolbar button.
     * @param e Event object
     */
    onClick_resizeButton(e: MouseEvent): void;

    /**
     * @description Initialize the transform style (rotation) of the element.
     * @param element Target element
     */
    resetTransform(element: Element): void;

    /**
     * @description Set the transform style (rotation) of the element.
     * @param element Target element
     * @param width Element's width size
     * @param height Element's height size
     */
    setTransformSize(element: Element, width?: number, height?:number): void;

    /**
     * @description The position of the caption is set automatically.
     * @param element Target element (not caption element)
     */
    setCaptionPosition(element: Element): void;

    /**
     * @description Mouse down event of resize handles
     * @param e Event object 
     */
    onMouseDown_resize_handle(e: MouseEvent): void;

    /**
     * @description Mouse move event after call "onMouseDown_resize_handle" of resize handles
     * The size of the module's "div" is adjusted according to the mouse move event.
     * @param contextResizing "core.context.resizing" object (binding argument)
     * @param direction Direction ("tl", "tr", "bl", "br", "lw", "th", "rw", "bh") (binding argument)
     * @param plugin "core.context[currentPlugin]" object (binding argument)
     * @param e Event object
     */
    resizing_element(contextResizing: Object, direction: string, plugin: Object, e: MouseEvent): void;

    /**
     * @description Resize the element to the size of the "div" adjusted in the "resizing_element" method.
     * Called at the mouse-up event registered in "onMouseDown_resize_handle".
     * @param direction Direction ("tl", "tr", "bl", "br", "lw", "th", "rw", "bh")
     */
    cancel_controller_resize(direction: string): void;
}

export default resizing;