import { Module } from '../Module';

declare interface dialog extends Module {
    onMouseDown_dialog(e: MouseEvent): void;
    onClick_dialog(e: MouseEvent): void;
    open(kind: string, update: boolean): void;
    close(): void;
}

export default dialog;