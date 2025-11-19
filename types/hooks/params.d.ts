import type {} from '../typedef';
export type FilePasteDrop = {
	file: File;
	event: ClipboardEvent | DragEvent;
	frameContext: SunEditor.FrameContext;
};
export type FocusBlurEvent = {
	frameContext: SunEditor.FrameContext;
	event: FocusEvent;
};
export type ScrollEvent = {
	frameContext: SunEditor.FrameContext;
	event: Event;
};
export type InputEventWithData = {
	frameContext: SunEditor.FrameContext;
	event: InputEvent;
	data: string;
};
export type Paste = {
	frameContext: SunEditor.FrameContext;
	event: ClipboardEvent;
	data: string;
	doc: Document;
};
export type Mouse = {
	frameContext: SunEditor.FrameContext;
	event: MouseEvent;
};
export type Keyboard = {
	frameContext: SunEditor.FrameContext;
	event: KeyboardEvent;
};
export type InputKeyDown = {
	target: HTMLElement;
	event: KeyboardEvent;
};
export type InputChange = {
	target: HTMLElement;
	value: string;
	event: FocusEvent | MouseEvent;
};
export type CopyComponent = {
	event: ClipboardEvent;
	cloneContainer: HTMLElement;
	info: SunEditor.ComponentInfo;
};
export type MouseEventInfo = {
	frameContext: SunEditor.FrameContext;
	event: MouseEvent;
};
export type KeyEventInfo = {
	frameContext: SunEditor.FrameContext;
	event: KeyboardEvent;
	range: Range;
	line: HTMLElement;
};
export type ShortcutInfo = {
	range: Range;
	line: HTMLElement;
	info: import('../core/class/shortcuts').ShortcutInfo;
	event: KeyboardEvent;
	keyCode: string;
	editor: SunEditor.Core;
};
