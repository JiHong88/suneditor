import { History } from './history.d';
import { Plugin } from './../plugins/Plugin.d';
import { Lang } from './../lang/Lang.d';
import { SunEditorOptions } from './../options.d';
import { Context } from './context';
import Util from './util';
import { Module } from '../plugins/Module';
import _Notice from '../plugins/modules/_notice';

type Controllers = Array<string | Function | Element>;
type fileInfo =  {
    index: number;
    name: string;
    size: string | number;
    select: Function;
    delete: Function;
    element: Element;
    src: string;
};
type seledtedFileInfo = {target: Element; component: Element; pluginName: string;};
type commands = 'selectAll' | 'codeView' | 'fullScreen' | 'indent' | 'outdent' | 'undo' | 'redo' | 'removeFormat' | 'print' | 'preview' | 'showBlocks' | 'save' | 'bold' | 'underline' | 'italic' | 'strike' | 'subscript' | 'superscript' | 'copy' | 'cut' | 'paste';
​​
interface Core {
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
     * @description The selection node (core.getSelectionNode()) to which the effect was last applied
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
     * @description The file component object of current selected file tag (getFileComponent(): {target, component, pluginName})
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
     * @param arguments controller elements, functions..
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
     * @description Set current editor's range object and return.
     * @param startCon The startContainer property of the selection object.
     * @param startOff The startOffset property of the selection object.
     * @param endCon The endContainer property of the selection object.
     * @param endOff The endOffset property of the selection object.
     * @returns
     */
    setRange(startCon: Node, startOff: number, endCon: Node, endOff: number): Range;

    /**
     * @description Remove range object and button effect
     */
    removeRange(): void;

    /**
     * @description Get current editor's range object
     * @returns
     */
    getRange(): Range;

    /**
     * @description If the "range" object is a non-editable area, add a line at the top of the editor and update the "range" object.
     * Returns a new "range" or argument "range".
     * @param range core.getRange()
     * @param container If there is "container" argument, it creates a line in front of the container.
     */
    getRange_addLine(range: Range, container?: Element): Range;

    /**
     * @description Get window selection obejct
     * @returns
     */
    getSelection(): Selection;

    /**
     * @description Get current select node
     * @returns
     */
    getSelectionNode(): Node;

    /**
     * @description Returns a "formatElement"(util.isFormatElement) array from the currently selected range.
     * @param validation The validation function. (Replaces the default validation function-util.isFormatElement(current))
     * @returns
     */
    getSelectedElements(validation?: Function): Node[];

    /**
     * @description Get format elements and components from the selected area. (P, DIV, H[1-6], OL, UL, TABLE..)
     * If some of the component are included in the selection, get the entire that component.
     * @param removeDuplicate If true, if there is a parent and child tag among the selected elements, the child tag is excluded.
     * @returns
     */
    getSelectedElementsAndComponents(removeDuplicate: boolean): Node[];

    /**
     * @description Determine if this offset is the edge offset of container
     * @param container The container property of the selection object.
     * @param offset The offset property of the selection object.
     * @param dir Select check point - Both edge, Front edge or End edge. ("front": Front edge, "end": End edge, undefined: Both edge)
     * @returns
     */
    isEdgePoint(container: Node, offset: number, dir?: 'front' | 'end'): boolean;

    /**
     * @description Check if the container and offset values are the edges of the format tag
     * @param container The container property of the selection object.
     * @param offset The offset property of the selection object.
     * @param dir Select check point - "front": Front edge, "end": End edge, undefined: Both edge.
     * @returns
     */
    isEdgeFormat(container: Node, offset: number, dir: 'front' | 'end'): boolean;

    /**
     * @description Show loading box
     */
    showLoading(): void;

    /**
     * @description Close loading box
     */
    closeLoading(): void;

    /**
     * @description Append format element to sibling node of argument element.
     * If the "formatNodeName" argument value is present, the tag of that argument value is inserted,
     * If not, the currently selected format tag is inserted.
     * @param element Insert as siblings of that element
     * @param formatNode Node name or node obejct to be inserted
     * @returns
     */
    appendFormatTag(element: Element, formatNode?: string | Element): Element;

    /**
     * @description The method to insert a element and return. (used elements : table, hr, image, video)
     * If "element" is "HR", insert and return the new line.
     * @param element Element to be inserted
     * @param notHistoryPush When true, it does not update the history stack and the selection object and return EdgeNodes (util.getEdgeChildNodes)
     * @param checkCharCount If true, if "options.maxCharCount" is exceeded when "element" is added, null is returned without addition.
     * @param notSelect If true, Do not automatically select the inserted component.
     * @returns
     */
    insertComponent(element: Element, notHistoryPush?: boolean, checkCharCount?: boolean, notSelect?:boolean): Element;
    
    /**
     * @description Gets the file component and that plugin name
     * return: {target, component, pluginName} | null
     * @param element Target element (figure tag, component div, file tag)
     * @returns
     */
    getFileComponent(element: Element): seledtedFileInfo | null;

    /**
     * @description The component(image, video) is selected and the resizing module is called.
     * @param element Element tag (img, iframe, video)
     * @param pluginName Plugin name (image, video)
     */
    selectComponent(element: Element, pluginName: string): void;

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
     * @description Appended all selected format Element to the argument element and insert
     * @param rangeElement Element of wrap the arguments (BLOCKQUOTE...)
     */
    applyRangeFormatElement(rangeElement: Element): void;

    /**
     * @description The elements of the "selectedFormats" array are detached from the "rangeElement" element. ("LI" tags are converted to "P" tags)
     * When "selectedFormats" is null, all elements are detached and return {cc: parentNode, sc: nextSibling, ec: previousSibling, removeArray: [Array of removed elements]}.
     * @param rangeElement Range format element (PRE, BLOCKQUOTE, OL, UL...)
     * @param selectedFormats Array of format elements (P, DIV, LI...) to remove.
     * If null, Applies to all elements and return {cc: parentNode, sc: nextSibling, ec: previousSibling}
     * @param newRangeElement The node(rangeElement) to replace the currently wrapped node.
     * @param remove If true, deleted without detached.
     * @param notHistoryPush When true, it does not update the history stack and the selection object and return EdgeNodes (util.getEdgeChildNodes)
     * @returns
     */
    detachRangeFormatElement(rangeElement: Element, selectedFormats: Element[] | null, newRangeElement: Element | null, remove: boolean, notHistoryPush: boolean): {cc: Node, sc: Node, ec: Node, removeArray: Element[]}

    /**
     * @description "selectedFormats" array are detached from the list element.
     * The return value is applied when the first and last lines of "selectedFormats" are "LI" respectively.
     * @param selectedFormats Array of format elements (LI, P...) to remove.
     * @param remove If true, deleted without detached.
     * @returns {sc: <LI>, ec: <LI>}.
     */
    detachList(selectedFormats: Element[], remove: boolean): {sc: Element, ec: Element};

    /**
     * @description Add, update, and delete nodes from selected text.
     * 1. If there is a node in the "appendNode" argument, a node with the same tags and attributes as "appendNode" is added to the selection text.
     * 2. If it is in the same tag, only the tag's attributes are changed without adding a tag.
     * 3. If the "appendNode" argument is null, the node of the selection is update or remove without adding a new node.
     * 4. The same style as the style attribute of the "styleArray" argument is deleted.
     *    (Styles should be put with attribute names from css. ["background-color"])
     * 5. The same class name as the class attribute of the "styleArray" argument is deleted.
     *    (The class name is preceded by "." [".className"])
     * 6. Use a list of styles and classes of "appendNode" in "styleArray" to avoid duplicate property values.
     * 7. If a node with all styles and classes removed has the same tag name as "appendNode" or "removeNodeArray", or "appendNode" is null, that node is deleted.
     * 8. Regardless of the style and class of the node, the tag with the same name as the "removeNodeArray" argument value is deleted.
     * 9. If the "strictRemove" argument is true, only nodes with all styles and classes removed from the nodes of "removeNodeArray" are removed.
     * 10. It won't work if the parent node has the same class and same value style.
     *    However, if there is a value in "removeNodeArray", it works and the text node is separated even if there is no node to replace.
     * @param appendNode The element to be added to the selection. If it is null, only delete the node.
     * @param styleArray The style or className attribute name Array to check (['font-size'], ['.className'], ['font-family', 'color', '.className']...])
     * @param removeNodeArray An array of node names to remove types from, remove all formats when "appendNode" is null and there is an empty array or null value. (['span'], ['strong', 'em'] ...])
     * @param strictRemove If true, only nodes with all styles and classes removed from the nodes of "removeNodeArray" are removed.
     */
    nodeChange(appendNode?: Element, styleArray?: string[], removeNodeArray?: string[], strictRemove?: boolean): void;

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
     * @description Remove format of the currently selected range
     */
    removeFormat(): void;

    /**
     * @description This method implements indentation to selected range.
     * Setted "margin-left" to "25px" in the top "P" tag of the parameter node.
     * @param command Separator ("indent" or "outdent")
     */
    indent(command: 'indent' | 'outdent'): void;

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

    /**
     * @description Add an event to document.
     * When created as an Iframe, the same event is added to the document in the Iframe.
     * @param type Event type
     * @param listener Event listener
     * @param useCapture Use event capture
     */
    addDocEvent(type: string, listener: EventListener, useCapture: boolean): void;

    /**
     * @description Remove events from document.
     * When created as an Iframe, the event of the document inside the Iframe is also removed.
     * @param type Event type
     * @param listener Event listener
     */
    removeDocEvent(type: string, listener: EventListener): void;

    /**
     * @description When "element" is added, if it is greater than "options.maxCharCount", false is returned.
     * @param element Element node or String.
     * @param charCounterType charCounterType. If it is null, the options.charCounterType
     */
    checkCharCount(element: Node | string, charCounterType?: string): boolean;

    /**
     * @description Get the length of the content.
     * Depending on the option, the length of the character is taken. (charCounterType)
     * @param content Content to count
     * @param charCounterType options.charCounterType
     */
    getCharLength(content: string, charCounterType: string): number;
}

interface Toolbar {
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
    
    onload: (core: Core, reload: boolean) => void;
    onScroll: EventFn;
    onFocus: EventFn;
    onMouseDown: EventFn;
    onClick: EventFn;
    onInput: EventFn;
    onKeyDown: EventFn;
    onKeyUp: EventFn;
    onChange: (contents: string, core: Core) => void;
    onBlur: (e: FocusEvent, core: Core) => void;
    onDrop: (e: Event, cleanData: string, maxCharCount: number, core: Core) => boolean | string;
    onPaste: (e: Event, cleanData: string, maxCharCount: number, core: Core) => boolean | string;
    onCopy: (e: Event, clipboardData: any, core: Core) => void;
    onCut: (e: Event, clipboardData: any, core: Core) => void;

    /**
     * @description Called just before the inline toolbar is positioned and displayed on the screen.
     * @param toolbar Toolbar Element
     * @param context The editor's context object (editor.getContext())
     * @param core Core object
     */
    showInline: (toolbar: Element, context: Context, core: Core) => void;

    /**
     * @description Called just after the controller is positioned and displayed on the screen.
     * controller - editing elements displayed on the screen [image resizing, table editor, link editor..]]
     * @param name The name of the plugin that called the controller
     * @param controllers Array of Controller elements
     * @param core Core object
     */
    showController: (name: String, controllers: Controllers, core: Core) => void;

    /**
     * @description It replaces the default callback function of the image upload
     * @param xmlHttp xmlHttpRequest object
     * @param info Input information
     * - linkValue: Link url value
     * - linkNewWindow: Open in new window Check Value
     * - inputWidth: Value of width input
     * - inputHeight: Value of height input
     * - align: Align Check Value
     * - isUpdate: Update image if true, create image if false
     * - element: If isUpdate is true, the currently selected image.
     * @param core Core object
     */
    imageUploadHandler: (xmlHttp: XMLHttpRequest, info: imageInputInformation, core: Core) => void;

    /**
     * @description It replaces the default callback function of the video upload
     * @param xmlHttp xmlHttpRequest object
     * @param info Input information
     * - inputWidth: Value of width input
     * - inputHeight: Value of height input
     * - align: Align Check Value
     * - isUpdate: Update video if true, create video if false
     * - element: If isUpdate is true, the currently selected video.
     * @param core Core object
     */
    videoUploadHandler: (xmlHttp: XMLHttpRequest, info: videoInputInformation, core: Core) => void;

    /**
     * @description It replaces the default callback function of the audio upload
     * @param xmlHttp xmlHttpRequest object
     * @param info Input information
     * - isUpdate: Update audio if true, create audio if false
     * - element: If isUpdate is true, the currently selected audio.
     * @param core Core object
     */
    audioUploadHandler: (xmlHttp: XMLHttpRequest, info: audioInputInformation, core: Core) => void;

    /**
     * @description An event when toggling between code view and wysiwyg view.
     * @param isCodeView Whether the current code view mode
     * @param core Core object
     */
    toggleCodeView: (isCodeView: boolean, core: Core) => void;

    /**
     * @description An event when toggling full screen.
     * @param isFullScreen Whether the current full screen mode
     * @param core Core object
     */
    toggleFullScreen: (isFullScreen: boolean, core: Core) => void;

    /**
     * @description Called before the image is uploaded
     * If true is returned, the internal upload process runs normally.
     * If false is returned, no image upload is performed.
     * If new fileList are returned,  replaced the previous fileList
     * If undefined is returned, it waits until "uploadHandler" is executed.
     * @param files Files array
     * @param info Input information
     * @param core Core object
     * @param uploadHandler If undefined is returned, it waits until "uploadHandler" is executed.
     *                "uploadHandler" is an upload function with "core" and "info" bound.
     *                [upload files] : uploadHandler(files or [new File(...),])
     *                [error]        : uploadHandler("Error message")
     *                [Just finish]  : uploadHandler()
     *                [directly register] : uploadHandler(response) // Same format as "imageUploadUrl" response
     *                                   ex) {
     *                                      // "errorMessage": "insert error message",
     *                                      "result": [ { "url": "...", "name": "...", "size": "999" }, ]
     *                                   }
     * @returns
     */
    onImageUploadBefore: (files: any[], info: imageInputInformation, core: Core, uploadHandler: Function) => boolean | any[] | undefined;

    /**
     * @description Called before the video is uploaded
     * If true is returned, the internal upload process runs normally.
     * If false is returned, no video upload is performed.
     * If new fileList are returned,  replaced the previous fileList
     * If undefined is returned, it waits until "uploadHandler" is executed.
     * @param files Files array
     * @param info Input information
     * @param core Core object
     * @param uploadHandler If undefined is returned, it waits until "uploadHandler" is executed.
     *                "uploadHandler" is an upload function with "core" and "info" bound.
     *                [upload files] : uploadHandler(files or [new File(...),])
     *                [error]        : uploadHandler("Error message")
     *                [Just finish]  : uploadHandler()
     *                [directly register] : uploadHandler(response) // Same format as "videoUploadUrl" response
     *                                   ex) {
     *                                      // "errorMessage": "insert error message",
     *                                      "result": [ { "url": "...", "name": "...", "size": "999" }, ]
     *                                   }
     * @returns
     */
    onVideoUploadBefore: (files: any[], info: videoInputInformation, core: Core, uploadHandler: Function) => boolean | any[] | undefined;

    /**
     * @description Called before the audio is uploaded
     * If true is returned, the internal upload process runs normally.
     * If false is returned, no audio upload is performed.
     * If new fileList are returned,  replaced the previous fileList
     * If undefined is returned, it waits until "uploadHandler" is executed.
     * @param files Files array
     * @param info Input information
     * @param core Core object
     * @param uploadHandler If undefined is returned, it waits until "uploadHandler" is executed.
     *                "uploadHandler" is an upload function with "core" and "info" bound.
     *                [upload files] : uploadHandler(files or [new File(...),])
     *                [error]        : uploadHandler("Error message")
     *                [Just finish]  : uploadHandler()
     *                [directly register] : uploadHandler(response) // Same format as "audioUploadUrl" response
     *                                   ex) {
     *                                      // "errorMessage": "insert error message",
     *                                      "result": [ { "url": "...", "name": "...", "size": "999" }, ]
     *                                   }
     * @returns
     */
    onAudioUploadBefore: (files: any[], info: audioInputInformation, core: Core, uploadHandler: Function) => boolean | any[] | undefined;

    /**
     * @description Called when the image is uploaded, updated, deleted
     * @param targetElement Target element
     * @param index Uploaded index
     * @param state Upload status ('create', 'update', 'delete')
     * @param info Info object
     * - index: data index
     * - name: file name
     * - size: file size
     * - select: select function
     * - delete: delete function
     * - element: target element
     * - src: src attribute of tag
     * @param remainingFilesCount Count of remaining files to upload (0 when added as a url)
     * @param core Core object
     */
    onImageUpload: (targetElement: HTMLImageElement, index: number, state: 'create' | 'update' | 'delete', info: fileInfo, remainingFilesCount: number, core: Core) => void;

    /**
     * @description Called when the video(iframe, video) is uploaded, updated, deleted
     * @param targetElement Target element
     * @param index Uploaded index
     * @param state Upload status ('create', 'update', 'delete')
     * @param info Info object
     * - index: data index
     * - name: file name
     * - size: file size
     * - select: select function
     * - delete: delete function
     * - element: target element
     * - src: src attribute of tag
     * @param remainingFilesCount Count of remaining files to upload (0 when added as a url)
     * @param core Core object
     */
    onVideoUpload: (targetElement: HTMLIFrameElement | HTMLVideoElement, index: number, state: 'create' | 'update' | 'delete', info: fileInfo, remainingFilesCount: number, core: Core) => void;

    /**
     * @description Called when the audio is uploaded, updated, deleted
     * @param targetElement Target element
     * @param index Uploaded index
     * @param state Upload status ('create', 'update', 'delete')
     * @param info Info object
     * - index: data index
     * - name: file name
     * - size: file size
     * - select: select function
     * - delete: delete function
     * - element: target element
     * - src: src attribute of tag
     * @param remainingFilesCount Count of remaining files to upload (0 when added as a url)
     * @param core Core object
     */
    onAudioUpload: (targetElement: HTMLAudioElement, index: number, state: 'create' | 'update' | 'delete', info: fileInfo, remainingFilesCount: number, core: Core) => void;

    /**
     * @description Called when the image is upload failed
     * @param errorMessage Error message
     * @param result Response Object
     * @param core Core object
     * @returns
     */
    onImageUploadError: (errorMessage: string, result: any, core: Core) => boolean;

    /**
     * @description Called when the video(iframe, video) upload failed
     * @param errorMessage Error message
     * @param result Response Object
     * @param core Core object
     * @returns
     */
    onVideoUploadError: (errorMessage: string, result: any, core: Core) => boolean;

    /**
     * @description Called when the audio upload failed
     * @param errorMessage Error message
     * @param result Response Object
     * @param core Core object
     * @returns
     */
    onAudioUploadError: (errorMessage: string, result: any, core: Core) => boolean;

    /**
     * @description Reset the buttons on the toolbar. (Editor is not reloaded)
     * You cannot set a new plugin for the button.
     * @param buttonList Button list 
     */
    setToolbarButtons(buttonList: any[]): void;

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
     * @description Open a notice area
     * @param message Notice message
     */
    noticeOpen(message: string): void;

    /**
     * @description Close a notice area
     */
    noticeClose(): void;

    /**
     * @description Copying the contents of the editor to the original textarea
     */
    save(): void;

    /**
     * @description Gets the suneditor's context object. Contains settings, plugins, and cached element objects
     * @returns
     */
    getContext(): Context;

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
     * @description Gets uploaded images informations
     * - index: data index
     * - name: file name
     * - size: file size
     * - select: select function
     * - delete: delete function
     * - element: img element
     * - src: src attribute of img tag
     * @returns
     */
    getImagesInfo(): fileInfo[];

    /**
     * @description Gets uploaded files(plugin using fileManager) information list.
     * image: [img], video: [video, iframe], audio: [audio]
     * When the argument value is 'image', it is the same function as "getImagesInfo".
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
     * @description Upload images using image plugin
     * @param files FileList
     */
    insertImage(files: FileList): void;

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