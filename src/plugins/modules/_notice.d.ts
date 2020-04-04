import { Module } from '../Module';

declare interface _notice extends Module {
    onClick_cancel(e: MouseEvent): void;
    open(text: string): void;
    close(): void;
}

export default _notice;