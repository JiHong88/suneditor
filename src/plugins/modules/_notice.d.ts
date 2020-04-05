import { Module } from '../Module';

declare interface _notice extends Module {
    /**
     * @description Event when clicking the cancel button
     * @param e Event object
     */
    onClick_cancel(e: MouseEvent): void;
    /**
     * @description  Open the notice panel
     * @param text Notice message
     */
    open(text: string): void;

    /**
     * @description  Open the notice panel
     */
    close(): void;
}

export default _notice;