import { Module } from '../Module';

declare interface dialog extends Module {
    /**
     * @description Event to control the behavior of closing the dialog
     * @param e Event object
     */
    onMouseDown_dialog(e: MouseEvent): void;

    /**
     * @description Event to close the window when the outside area of the dialog or close button is click
     * @param e Event object
     */
    onClick_dialog(e: MouseEvent): void;

    /**
     * @description Open a Dialog plugin
     * @param kind Dialog plugin name
     * @param update Whether it will open for update ('image' === this.currentControllerName)
     */
    open(kind: string, update: boolean): void;

    /**
     * @description Close a Dialog plugin
     * The plugin's "init" method is called.
     */
    close(): void;
}

export default dialog;