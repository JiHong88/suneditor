import { Module } from '../Module';

declare interface component extends Module {
    /**
     * @description Create a container for the resizing component and insert the element.
     * @param cover Cover element (FIGURE)
     * @param className Class name of container (fixed: se-component)
     * @returns Created container element
     */
    set_container(cover: Element, className: string): Element;

    /**
     * @description Cover the target element with a FIGURE element.
     * @param element Target element
     */
    set_cover(element: Element): void;

    /**
     * @description Return HTML string of caption(FIGCAPTION) element
     * @returns
     */
    create_caption(): string;
}

export default resizing;