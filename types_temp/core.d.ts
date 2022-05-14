import { History } from './history.d';
import { Plugin } from '../src/plugins/Plugin';
import { Lang } from './Lang';
import { SunEditorOptions } from '../src/options';
import { Context } from '../src/lib/context';
import { Module } from '../src/plugins/Module';
import _Notice from './notice.d';

export type Controllers = Array<string | Function | Element>;
export type fileInfo = {
	index: number;
	name: string;
	size: string | number;
	select: Function;
	delete: Function;
	element: Element;
	src: string;
};
export type seledtedFileInfo = { target: Element; component: Element; pluginName: string };
export type commands = 'selectAll' | 'codeView' | 'fullScreen' | 'indent' | 'outdent' | 'undo' | 'redo' | 'removeFormat' | 'print' | 'preview' | 'showBlocks' | 'save' | 'bold' | 'underline' | 'italic' | 'strike' | 'subscript' | 'superscript' | 'copy' | 'cut' | 'paste';
export type status = {};

export interface Core {
	/**
	 * @description Functions object
	 */
	functions: SunEditor;

	/**
	 * @description Editor options
	 */
	options: SunEditorOptions;

	/**
	 * @description Computed style of the wysiwyg area (window.getComputedStyle(context.element.wysiwyg))
	 */
	wwComputedStyle: any;

	/**
	 * @description Notice object
	 */
	notice: _Notice;

	/**
	 * @description Default icons object
	 */
	icons: Record<string, string>;

	/**
	 * @description History object for undo, redo
	 */
	history: History;

	/**
	 * @description Elements and user options parameters of the suneditor
	 */
	context: Context;

	/**
	 * @description Plugin buttons
	 */
	pluginCallButtons: Record<string, Element>;

	/**
	 * @description Loaded plugins
	 */
	plugins: Record<string, Plugin>;

	/**
	 * @description loaded language
	 */
	lang: Lang;

	/**
	 * @description The selection node (selection.getNode()) to which the effect was last applied
	 */
	effectNode: Node;

	/**
	 * @description dropdown element
	 */
	dropdown: Element;

	/**
	 * @description container element
	 */
	container: Element;

	/**
	 * @description active button element in dropdown
	 */
	currentDropdownActiveButton: Element;

	/**
	 * @description active button element in container
	 */
	currentContainerActiveButton: Element;

	/**
	 * @description The elements array to be processed unvisible when the controllerOff function is executed (resizing, link modified button, table controller)
	 */
	currentControllerItems: Controllers;

	/**
	 * @description The name of the plugin that called the currently active controller
	 */
	currentControllerName: string;

	/**
	 * @description The target element of current controller
	 */
	currentControllerTarget: Element;

	/**
	 * @description The file component object of current selected file tag (component.get(): {target, component, pluginName})
	 */
	currentFileComponentInfo: seledtedFileInfo;

	/**
	 * @description An array of buttons whose class name is not "se-code-view-enabled"
	 */
	codeViewDisabledButtons: Element[];

	/**
	 * @description An array of buttons whose class name is not "se-resizing-enabled"
	 */
	resizingDisabledButtons: Element[];

	/**
	 * @description Editor tags whitelist (RegExp object)
	 * util.createElementWhitelist(options._editorElementWhitelist)
	 */
	_elementWhitelistRegExp: RegExp;

	/**
	 * @description Editor tags blacklist (RegExp object)
	 * util.createElementBlacklist(options.elementBlacklist)
	 */
	_elementBlacklistRegExp: RegExp;

	/**
	 * @description Plugins array with "active" method.
	 * "activePlugins" runs the "add" method when creating the editor.
	 */
	activePlugins: Plugin[];

	/**
	 * @description Plugins array with "checkFiletInfo" and "resetFileInfo" methods.
	 * "fileInfoPlugins" runs the "add" method when creating the editor.
	 * "checkFileInfo" method is always call just before the "change" event.
	 */
	fileInfoPlugins: Function[];

	/**
	 * @description Elements that need to change text or className for each selection change
	 * After creating the editor, "activePlugins" are added.
	 * @property STRONG bold button
	 * @property U underline button
	 * @property EM italic button
	 * @property DEL strike button
	 * @property SUB subscript button
	 * @property SUP superscript button
	 * @property OUTDENT outdent button
	 * @property INDENT indent button
	 */
	commandMap: Record<string, Element>;

	/**
	 * @description Contains pairs of all "data-commands" and "elements" setted in toolbar over time
	 * Used primarily to save and recover button states after the toolbar re-creation
	 * Updates each "_cachingButtons()" invocation
	 */
	allCommandButtons: Record<string, Element>;

	/**
	 * @description Save the current buttons states to "allCommandButtons" object
	 */
	saveButtonStates(): void;

	/**
	 * @description Recover the current buttons states from "allCommandButtons" object
	 */
	recoverButtonStates(): void;

	/**
	 * @description If the plugin is not added, add the plugin and call the 'add' function.
	 * If the plugin is added call callBack function.
	 * @param pluginName The name of the plugin to call
	 * @param callBackFunction Function to be executed immediately after module call
	 * @param target Plugin target button (This is not necessary if you have a button list when creating the editor)
	 */
	registerPlugin(pluginName: string, callBackFunction: Function, target?: Element): void;

	/**
	 * @description If the module is not added, add the module and call the 'add' function
	 * @param moduleArray module object's Array
	 */
	addModule(moduleArray: Module[]): void;

	/**
	 * @description Method for managing dropdown element.
	 * You must add the "dropdown" element using the this method at custom plugin.
	 * @param pluginName Plugin name
	 * @param target Target button
	 * @param menu Dropdown element
	 */
	initMenuTarget(pluginName: string, target: Element | null, menu: Element): void;

	/**
	 * @description Enable dropdown
	 * @param element Dropdown's button element to call
	 */
	dropdownOn(element: Element): void;

	/**
	 * @description Disable dropdown
	 */
	dropdownOff(): void;

	/**
	 * @description Disable more layer
	 */
	moreLayerOff(): void;

	/**
	 * @description Enable container
	 * @param element Container's button element to call
	 */
	containerOn(element: Element): void;

	/**
	 * @description Disable container
	 */
	containerOff(): void;

	/**
	 * @description Show controller at editor area (controller elements, function, "controller target element(@Required)", "controller name(@Required)", etc..)
	 * @param arguments controller elements, function.
	 */
	controllerOn(...arguments: Controllers): void;

	/**
	 * @description Hide controller at editor area (link button, image resize button..)
	 * @param e Event object when called from mousedown and keydown events registered in "core.controllerOn"
	 */
	controllerOff(e?: KeyboardEvent | MouseEvent): void;

	/**
	 * @description Specify the position of the controller.
	 * @param controller Controller element.
	 * @param referEl Element that is the basis of the controller's position.
	 * @param position Type of position ("top" | "bottom")
	 * When using the "top" position, there should not be an arrow on the controller.
	 * When using the "bottom" position there should be an arrow on the controller.
	 * @param addOffset These are the left and top values that need to be added specially.
	 * This argument is required. - {left: 0, top: 0}
	 * Please enter the value based on ltr mode.
	 * Calculated automatically in rtl mode.
	 */
	setControllerPosition(controller: Element, referEl: Element, position: 'top' | 'bottom', addOffset: { left: number; top: number }): void;

	/**
	 * @description javascript execCommand
	 * @param command javascript execCommand function property
	 * @param showDefaultUI javascript execCommand function property
	 * @param value javascript execCommand function property
	 */
	execCommand(command: string, showDefaultUI?: boolean, value?: string): void;

	/**
	 * @description Focus to wysiwyg area using "native focus function"
	 */
	_nativeFocus(): void;

	/**
	 * @description Focus to wysiwyg area
	 */
	focus(): void;

	/**
	 * @description If "focusEl" is a component, then that component is selected; if it is a format element, the last text is selected
	 * If "focusEdge" is null, then selected last element
	 * @param focusEl Focus element
	 */
	focusEdge(focusEl: Element | null): void;

	/**
	 * @description Focusout to wysiwyg area (.blur())
	 */
	blur(): void;

	/**
	 * @description Show loading box
	 */
	openLoading(): void;

	/**
	 * @description Close loading box
	 */
	closeLoading(): void;

	/**
	 * @description Run plugin calls and basic commands.
	 * @param command Command string
	 * @param display Display type string ('command', 'dropdown', 'dialog', 'container')
	 * @param target The element of command button
	 */
	runPlugin(command: string, display: 'command' | 'dropdown' | 'dialog' | 'container', target: Element): void;

	/**
	 * @description Execute command of command button(All Buttons except dropdown and dialog)
	 * (undo, redo, bold, underline, italic, strikethrough, subscript, superscript, removeFormat, indent, outdent, fullscreen, showBlocks, codeview, preview, print, copy, cut, paste)
	 * @param command Property of command button (data-value)
	 * @param target The element of command button
	 */
	commandHandler(command: commands, target: Element | null): void;

	/**
	 * @description Add or remove the class name of "body" so that the code block is visible
	 * @param value true/false, If undefined toggle the codeView mode.
	 */
	showBlocks(value: boolean | undefined): void;

	/**
	 * @description Changes to code view or wysiwyg view
	 * @param value true/false, If undefined toggle the codeView mode.
	 */
	codeView(value: boolean | undefined): void;

	/**
	 * @description Changes to full screen or default screen
	 * @param value true/false, If undefined toggle the codeView mode.
	 */
	fullScreen(value: boolean | undefined): void;

	/**
	 * @description Prints the current content of the editor.
	 */
	print(): void;

	/**
	 * @description Open the preview window.
	 */
	preview(): void;

	/**
	 * @description Set direction to "rtl" or "ltr".
	 * @param dir "rtl" or "ltr"
	 */
	setDir(dir: 'rtl' | 'ltr'): void;

	/**
	 * @description Sets the HTML string
	 * @param html HTML string
	 */
	setContent(html: string): void;

	/**
	 * @description Sets the content of the iframe's head tag and body tag when using the "iframe" or "iframe_fullPage" option.
	 * @param ctx { head: HTML string, body: HTML string}
	 */
	setFullPageContent(ctx: { head?: string; body?: string }): void;

	/**
	 * @description Gets the current content
	 * @param onlyContent Return only the content of the body without headers when the "iframe_fullPage" option is true
	 * @returns
	 */
	getContent(onlyContent: boolean): string;

	/**
	 * @description Gets the clean HTML code for editor
	 * @param html HTML string
	 * @param whitelist Regular expression of allowed tags.
	 * RegExp object is create by util.createElementWhitelist method.
	 * @param blacklist Regular expression of disallowed tags.
	 * RegExp object is create by util.createElementBlacklist method.
	 * @returns
	 */
	cleanHTML(html: string, whitelist?: string | RegExp, blacklist?: string | RegExp): string;

	/**
	 * @description Converts content into a format that can be placed in an editor
	 * @param content content
	 * @returns
	 */
	convertContentForEditor(content: string): string;

	/**
	 * @description Converts wysiwyg area element into a format that can be placed in an editor of code view mode
	 * @param html WYSIWYG element (context.element.wysiwyg) or HTML string.
	 * @param comp If true, does not line break and indentation of tags.
	 * @returns
	 */
	_convertHTMLForCodeView(html: Element | string, comp?: boolean): string;
}

export interface Toolbar {
	/**
	 * @description Disable the toolbar
	 */
	disable(): void;

	/**
	 * @description Enable the toolbar
	 */
	enable(): void;

	/**
	 * @description Show the toolbar
	 */
	show(): void;

	/**
	 * @description Hide the toolbar
	 */
	hide(): void;
}

interface Wysiwyg {
	/**
	 * @description Disable the wysiwyg area
	 */
	disable(): void;

	/**
	 * @description Enable the wysiwyg area
	 */
	enable(): void;
}

type EventFn = (e: Event, core: Core) => void;

type imageInputInformation = { linkValue: string; linkNewWindow: Window; inputWidth: number; inputHeight: number; align: string; isUpdate: boolean; element: any };
type videoInputInformation = { inputWidth: number; inputHeight: number; align: string; isUpdate: boolean; element: any };
type audioInputInformation = { isUpdate: boolean; element: any };

export default class SunEditor {
	constructor(context: Context, pluginCallButtons: Record<string, Element>, plugins: Record<string, Plugin>, lang: Lang, options: SunEditorOptions, _icons: Record<string, string>);

	core: Core;
	util: Util;

	/**
	 * @description Add or reset option property
	 * @param options Options
	 */
	setOptions(options: SunEditorOptions): void;

	/**
	 * @description Set "options.editorCSSText" style.
	 * Define the style of the edit area
	 * It can also be defined with the "setOptions" method, but the "setEditorCSSText" method does not render the editor again.
	 * @param style Style string
	 */
	setEditorCSSText(style: string): void;

	/**
	 * @description Copying the content of the editor to the original textarea and execute onSave callback.
	 */
	save(): void;

	/**
	 * @description Gets the content of the suneditor
	 * @param onlyContent - Return only the content of the body without headers when the "iframe_fullPage" option is true
	 * @returns
	 */
	getContent(onlyContent: boolean): string;

	/**
	 * @description Gets only the text of the suneditor content
	 * @returns
	 */
	getText(): string;

	/**
	 * @description Get the editor's number of characters or binary data size.
	 * You can use the "charCounter_type" option format.
	 * @param charCounter_type options - charCounter_type ('char', 'byte', 'byte-html')
	 * If argument is no value, the currently set "charCounter_type" option is used.
	 * @returns
	 */
	getCharCount(charCounter_type?: string): number;

	/**
	 * @description Gets uploaded files(plugin using fileManager) information list.
	 * image: [img], video: [video, iframe], audio: [audio]
	 * - index: data index
	 * - name: file name
	 * - size: file size
	 * - select: select function
	 * - delete: delete function
	 * - element: img element
	 * - src: src attribute of img tag
	 * @param pluginName Plugin name (image, video, audio)
	 * @returns
	 */
	getFilesInfo(pluginName: string): fileInfo[];

	/**
	 * @description Change the content of the suneditor
	 * @param content Content to Input
	 */
	setContent(content: string): void;

	/**
	 * @description Add content to the end of content.
	 * @param content Content to Input
	 */
	addContent(content: string): void;

	/**
	 * @description Switch to or off "ReadOnly" mode.
	 * @param value "readOnly" boolean value.
	 */
	readOnly(value: boolean): void;

	/**
	 * @description Disable the suneditor
	 */
	disable(): void;

	/**
	 * @description Enable the suneditor
	 */
	enable(): void;

	/**
	 * @description Show the suneditor
	 */
	show(): void;

	/**
	 * @description Hide the suneditor
	 */
	hide(): void;

	/**
	 * @description Destroy the suneditor
	 */
	destroy(): void;

	/**
	 * @description Toolbar methods
	 */
	toolbar: Toolbar;
}
