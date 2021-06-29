import { History } from './history.d';
import { Plugin } from './../plugins/Plugin.d';
import { Lang } from './../lang/Lang.d';
import { SunEditorOptions } from './../options.d';
import { Context } from './context';
import Util from '../helpers/util';
import { Module } from '../plugins/Module';
import _Notice from './classes/notice.d';

export type Controllers = Array<string | Function | Element>;
export type fileInfo =  {
    index: number;
    name: string;
    size: string | number;
    select: Function;
    delete: Function;
    element: Element;
    src: string;
};
export type seledtedFileInfo = {target: Element; component: Element; pluginName: string;};
export type commands = 'selectAll' | 'codeView' | 'fullScreen' | 'indent' | 'outdent' | 'undo' | 'redo' | 'removeFormat' | 'print' | 'preview' | 'showBlocks' | 'save' | 'bold' | 'underline' | 'italic' | 'strike' | 'subscript' | 'superscript' | 'copy' | 'cut' | 'paste';
export type status = {
    
}

export interface Core {
    /**
     * @description Util object
     */
    util: Util;

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
     * @description Whether the plugin is initialized
     */
    initPlugins: Record<string, boolean>;

    /**
     * @description loaded language
     */
    lang: Lang;

    /**
     * @description The selection node (selection.getNode()) to which the effect was last applied
     */
    effectNode: Node;

    /**
     * @description submenu element
     */
    submenu: Element;

    /**
     * @description container element
     */
    container: Element;

    /**
     * @description active button element in submenu
     */
    submenuActiveButton: Element;

    /**
     * @description active button element in container
     */
    containerActiveButton: Element;

    /**
     * @description The elements array to be processed unvisible when the controllersOff function is executed (resizing, link modified button, table controller)
     */
    controllerArray: Controllers;

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
    resizingDisabledButtons: Element[],

    /**
     * @description Editor tags whitelist (RegExp object)
     * util.createTagsWhitelist(options._editorTagsWhitelist)
     */
    editorTagsWhitelistRegExp: RegExp;

    /**
     * @description Tag whitelist when pasting (RegExp object)
     * util.createTagsWhitelist(options.pasteTagsWhitelist)
     */
    pasteTagsWhitelistRegExp: RegExp;

    /**
     * @description Boolean value of whether the editor has focus
     */
    hasFocus: boolean;

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
    fileInfoPlugins: Function[],

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
     * @description If the plugin is not added, add the plugin and call the 'add' function.
     * If the plugin is added call callBack function.
     * @param pluginName The name of the plugin to call
     * @param callBackFunction Function to be executed immediately after module call
     * @param _target Plugin target button (This is not necessary if you have a button list when creating the editor)
     */
    callPlugin(pluginName: string, callBackFunction: Function, _target?: Element): void;

    /**
     * @description If the module is not added, add the module and call the 'add' function
     * @param moduleArray module object's Array [dialog, resizing]
     */
    addModule(moduleArray: Module[]): void;

    /**
     * @description Gets the current editor-relative scroll offset.
     */
    getGlobalScrollOffset(): {top: number; left: number};

    /**
     * @description Method for managing submenu element.
     * You must add the "submenu" element using the this method at custom plugin.
     * @param pluginName Plugin name
     * @param target Target button
     * @param menu Submenu element
     */
    initMenuTarget(pluginName: string, target: Element | null, menu: Element): void;

    /**
     * @description Enabled submenu
     * @param element Submenu's button element to call
     */
    submenuOn(element: Element): void;

    /**
     * @description Disable submenu
     */
    submenuOff(): void;

    /**
     * @description Enabled container
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
    controllersOn(...arguments: Controllers): void;

    /**
     * @description Hide controller at editor area (link button, image resize button..)
     * @param e Event object when called from mousedown and keydown events registered in "core.controllersOn"
     */
    controllersOff(e?: KeyboardEvent | MouseEvent): void;

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
    setControllerPosition(controller: Element, referEl: Element, position: 'top' | 'bottom', addOffset: {left: number, top: number}): void;

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
    nativeFocus(): void;

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
     * @description Determine if this offset is the edge offset of container
     * @param container The container property of the selection object.
     * @param offset The offset property of the selection object.
     * @param dir Select check point - Both edge, Front edge or End edge. ("front": Front edge, "end": End edge, undefined: Both edge)
     * @returns
     */
    isEdgePoint(container: Node, offset: number, dir?: 'front' | 'end'): boolean;

    /**
     * @description Show loading box
     */
    showLoading(): void;

    /**
     * @description Close loading box
     */
    closeLoading(): void;

    /**
     * @description Delete selected node and insert argument value node and return.
     * If the "afterNode" exists, it is inserted after the "afterNode"
     * Inserting a text node merges with both text nodes on both sides and returns a new "{ container, startOffset, endOffset }".
     * @param oNode Element to be inserted
     * @param afterNode If the node exists, it is inserted after the node
     * @returns
     */
    insertNode(oNode: Node, afterNode?: Node, checkCharCount?: boolean): { startOffset: Node, endOffset: number } | Node | null;
    
    /**
     * @description Delete the currently selected nodes and reset selection range
     * Returns {container: "the last element after deletion", offset: "offset", prevContainer: "previousElementSibling Of the deleted area"}
     * @returns
     */
    removeNode(): { container: Node; offset: number; prevContainer?: Node };

    /**
     * @description Run plugin calls and basic commands.
     * @param command Command string
     * @param display Display type string ('command', 'submenu', 'dialog', 'container')
     * @param target The element of command button
     */
    actionCall(command: string, display: 'command' | 'submenu' | 'dialog' | 'container', target: Element): void;

    /**
     * @description Execute command of command button(All Buttons except submenu and dialog)
     * (undo, redo, bold, underline, italic, strikethrough, subscript, superscript, removeFormat, indent, outdent, fullscreen, showBlocks, codeview, preview, print, copy, cut, paste)
     * @param target The element of command button
     * @param command Property of command button (data-value)
     */
    commandHandler(target: Element | null, command: commands): void;

    /**
     * @description Add or remove the class name of "body" so that the code block is visible
     */
    toggleDisplayBlocks(): void;

    /**
     * @description Changes to code view or wysiwyg view
     */
    toggleCodeView(): void;

    /**
     * @description Changes to full screen or default screen
     * @param element full screen button
     */
    toggleFullScreen(element: Element): void;

    /**
     * @description Prints the current contents of the editor.
     */
    print(): void;

    /**
     * @description Open the preview window.
     */
    preview(): void;

    /**
     * @description Sets the HTML string
     * @param html HTML string
     */
    setContents(html: string): void;

    /**
     * @description Sets the contents of the iframe's head tag and body tag when using the "iframe" or "fullPage" option.
     * @param ctx { head: HTML string, body: HTML string}
     */
    setIframeContents(ctx: { head?: string, body?: string }): void;

    /**
     * @description Gets the current contents
     * @param onlyContents Return only the contents of the body without headers when the "fullPage" option is true
     * @returns
     */
    getContents(onlyContents: boolean): string;

    /**
     * @description Gets the clean HTML code for editor
     * @param html HTML string
     * @param whitelist Regular expression of allowed tags.
     * RegExp object is create by util.createTagsWhitelist method. (core.pasteTagsWhitelistRegExp)
     * @returns
     */
    cleanHTML(html: string, whitelist?: string | RegExp): string;

    /**
     * @description Converts contents into a format that can be placed in an editor
     * @param contents contents
     * @returns 
     */
    convertContentsForEditor(contents: string): string;
    
    /**
     * @description Converts wysiwyg area element into a format that can be placed in an editor of code view mode
     * @param html WYSIWYG element (context.element.wysiwyg) or HTML string.
     * @returns 
     */
    convertHTMLForCodeView(html: Element | string): string;
}

export interface Toolbar {
    /**
     * @description Disable the toolbar
     */
    disabled(): void;

    /**
     * @description Enable the toolbar
     */
    enabled(): void;

    /**
     * @description Show the toolbar
     */
    show(): void;

    /**
     * @description Hide the toolbar
     */
    hide(): void;
}

type EventFn = (e: Event, core: Core) => void;

type imageInputInformation = { linkValue: string, linkNewWindow: Window, inputWidth: number, inputHeight: number, align: string, isUpdate: boolean, element: any };
type videoInputInformation = { inputWidth: number, inputHeight: number, align: string, isUpdate: boolean, element: any };
type audioInputInformation = { isUpdate: boolean, element: any };

export default class SunEditor {
    constructor(context: Context,
        pluginCallButtons: Record<string, Element>,
        plugins: Record<string, Plugin>,
        lang: Lang,
        options: SunEditorOptions,
        _icons: Record<string, string>)

    core: Core;
    util: Util;
    
    /**
     * @description Add or reset option property
     * @param options Options
     */
    setOptions(options: SunEditorOptions): void;

    /**
     * @description Set "options.defaultStyle" style.
     * Define the style of the edit area
     * It can also be defined with the "setOptions" method, but the "setDefaultStyle" method does not render the editor again.
     * @param style Style string
     */
    setDefaultStyle(style: string): void;

    /**
     * @description Copying the contents of the editor to the original textarea
     */
    save(): void;

    /**
     * @description Gets the contents of the suneditor
     * @param onlyContents - Return only the contents of the body without headers when the "fullPage" option is true
     * @returns
     */
    getContents(onlyContents: boolean): string;

    /**
     * @description Gets only the text of the suneditor contents
     * @returns
     */
    getText(): string;

    /**
     * @description Get the editor's number of characters or binary data size.
     * You can use the "charCounterType" option format.
     * @param charCounterType options - charCounterType ('char', 'byte', 'byte-html')
     * If argument is no value, the currently set "charCounterType" option is used.
     * @returns
     */
    getCharCount(charCounterType?: string): number;

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
     * @description Inserts an HTML element or HTML string or plain string at the current cursor position
     * @param html HTML Element or HTML string or plain string
     * @param notCleaningData If true, inserts the HTML string without refining it with core.cleanHTML.
     * @param checkCharCount If true, if "options.maxCharCount" is exceeded when "element" is added, null is returned without addition.
     * @param rangeSelection If true, range select the inserted node.
     */
    insertHTML(html: Element | string, notCleaningData?: boolean, checkCharCount?: boolean, rangeSelection?: boolean): void;

    /**
     * @description Change the contents of the suneditor
     * @param contents Contents to Input
     */
    setContents(contents: string): void;

    /**
     * @description Add contents to the suneditor
     * @param contents Contents to Input
     */
    appendContents(contents: string): void;

    /**
     * @description Switch to or off "ReadOnly" mode.
     * @param value "readOnly" boolean value.
     */
    readOnly(value: boolean): void;

    /**
     * @description Disable the suneditor
     */
    disabled(): void;

    /**
     * @description Enable the suneditor
     */
    enabled(): void;

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