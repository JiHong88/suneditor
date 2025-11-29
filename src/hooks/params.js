/**
 * @fileoverview Common parameter types used across SunEditor plugins and callbacks.
 * These types define the structure of parameters passed to various plugin methods.
 */

// ================================================================
// PARAMS - Common parameter types
// ================================================================

/**
 * @typedef {{
 *   file: File,
 *   event: ClipboardEvent | DragEvent,
 *   frameContext: SunEditor.FrameContext
 * }} FilePasteDrop
 * @description Parameters for file paste/drop events
 */

/**
 * @typedef {{
 *   frameContext: SunEditor.FrameContext,
 *   event: FocusEvent
 * }} FocusBlurEvent
 * @description Parameters for focus and blur events
 */

/**
 * @typedef {{
 *   frameContext: SunEditor.FrameContext,
 *   event: Event
 * }} ScrollEvent
 * @description Parameters for scroll events
 */

/**
 * @typedef {{
 *   frameContext: SunEditor.FrameContext,
 *   event: InputEvent,
 *   data: string
 * }} InputEventWithData
 * @description Parameters for beforeinput and input events
 */

/**
 * @typedef {{
 *   frameContext: SunEditor.FrameContext,
 *   event: ClipboardEvent,
 *   data: string,
 *   doc: Document
 * }} Paste
 * @description Parameters for paste events
 */

/**
 * @typedef {{
 *   frameContext: SunEditor.FrameContext,
 *   event: MouseEvent
 * }} Mouse
 * @description Parameters for mouse events
 */

/**
 * @typedef {{
 *   frameContext: SunEditor.FrameContext,
 *   event: KeyboardEvent
 * }} Keyboard
 * @description Parameters for keyboard events
 */

/**
 * @typedef {{
 *   target: HTMLElement,
 *   event: KeyboardEvent
 * }} ToolbarInputKeyDown
 * @description Parameters for toolbar input keydown events
 */

/**
 * @typedef {{
 *   target: HTMLElement,
 *   value: string,
 *   event: FocusEvent | MouseEvent
 * }} ToolbarInputChange
 * @description Parameters for toolbar input change events (triggered by blur or other input click)
 */

/**
 * @typedef {{
 *   event: ClipboardEvent,
 *   cloneContainer: HTMLElement,
 *   info: SunEditor.ComponentInfo
 * }} CopyComponent
 * @description Parameters for component copy events
 */

// ================================================================
// PLUGIN EVENT PARAMS - Plugin hook event parameter types
// ================================================================

/**
 * @typedef {{
 *   frameContext: SunEditor.FrameContext,
 *   event: MouseEvent
 * }} MouseEventInfo
 * @description Parameters for plugin mouse event hooks
 */

/**
 * @typedef {{
 *   frameContext: SunEditor.FrameContext,
 *   event: KeyboardEvent,
 *   range: Range,
 *   line: HTMLElement
 * }} KeyEventInfo
 * @description Parameters for plugin keyboard event hooks
 */

/**
 * @typedef {{
 *   range: Range,
 *   line: HTMLElement,
 *   info: import('../core/class/shortcuts').ShortcutInfo,
 *   event: KeyboardEvent,
 *   keyCode: string,
 *   editor: SunEditor.Core
 * }} ShortcutInfo
 * @description Information of the "shortcut" plugin hook
 */

export {};
