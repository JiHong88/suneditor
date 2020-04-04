import { Module } from '../Module';

declare interface resizing extends Module {
    call_controller_resize(targetElement: Element, plugin: string): Record<string, number>;
    openAlignMenu(): void;
    create_caption(): string;
    set_cover(element: Element): void;
    set_container(cover: Element, className: string): Element;
    onClick_resizeButton(e: MouseEvent): void;
    resetTransform(element: Element): void;
    setTransformSize(element: Element, width?: number, height?:number): void;
    setCaptionPosition(element: Element): void;
    onMouseDown_resize_handle(e: MouseEvent): void;
    resizing_element(contextResizing: Object, direction: string, plugin: Object, e: MouseEvent): void;
    cancel_controller_resize(direction: string): void;
}

export default resizing;