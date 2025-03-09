/**
 * @version 1.0.0
 * @namespace SuneditorTypes
 */

// --------------------------------------------------------- [Node] ---------------------------------------------------------------------------------------------------

/**
 * @memberof SuneditorTypes
 * @typedef {Array<Node>|HTMLCollection|NodeList} NodeCollection
 */

// --------------------------------------------------------- [Editor] ---------------------------------------------------------------------------------------------------
/**
 * @memberof SuneditorTypes
 * @typedef {import('./core/editor').default} EditorCore
 */

/**
 * @memberof SuneditorTypes
 * @typedef {import('./editorInjector').default} EditorInjector
 */

/**
 * @memberof SuneditorTypes
 * @typedef {import('./editorInjector/_core').default} CoreInjector
 */

/**
 * @memberof SuneditorTypes
 * @typedef {Object} EditorStatus
 * @property {boolean} hasFocus Boolean value of whether the editor has focus
 * @property {number} tabSize Indent size of tab (4)
 * @property {number} indentSize Indent size (25)px
 * @property {number} codeIndentSize Indent size of Code view mode (2)
 * @property {Array<string>} currentNodes  An element array of the current cursor's node structure
 * @property {Array<string>} currentNodesMap  An element name array of the current cursor's node structure
 * @property {boolean} onSelected Boolean value of whether component is selected
 * @property {number} rootKey Current root key
 * @property {Range} _range Current range object
 * @property {boolean} _onMousedown Mouse down event status
 */

// --------------------------------------------------------- [Event] ---------------------------------------------------------------------------------------------------
/**
 * @memberof SuneditorTypes
 * @typedef {Object} EventInfo
 * @property {*} target Target element
 * @property {string} type Event type
 * @property {(...args: *) => *} listener Event listener
 * @property {boolean|AddEventListenerOptions=} useCapture Event useCapture option
 */

/**
 * @memberof SuneditorTypes
 * @typedef {Object} GlobalEventInfo
 * @property {string} type Event type
 * @property {(...args: *) => *} listener Event listener
 * @property {boolean|AddEventListenerOptions=} useCapture Use event capture
 */

// --------------------------------------------------------- [Plugin Event] ---------------------------------------------------------------------------------------------------
/**
 * @memberof SuneditorTypes
 * @typedef {Object} PluginMouseEventInfo
 * @property {FrameContext} frameContext Frame context
 * @property {MouseEvent} event Event object
 */

/**
 * @memberof SuneditorTypes
 * @typedef {Object} PluginKeyEventInfo
 * @property {FrameContext} frameContext Frame context
 * @property {KeyboardEvent} event Event object
 * @property {Range} range range object
 * @property {HTMLElement} line Current line element
 */

/**
 * @memberof SuneditorTypes
 * @typedef {Object} PluginToolbarInputChangeEventInfo
 * @property {HTMLElement} target Input element
 * @property {Event} event Event object
 * @property {string} value Input value
 */

// --------------------------------------------------------- [Context] ---------------------------------------------------------------------------------------------------
/**
 * @memberof SuneditorTypes
 * @typedef {Object} EditorFrameOptions
 * @property {string} [value=""] - Initial value for the editor.
 * @property {string} [placeholder=""] - Placeholder text.
 * @property {Object<string, string>} [editableFrameAttributes={}] - Attributes for the editable frame[.sun-editor-editable]. (e.g. [key]: value)
 * @property {string} [width="100%"] - Width for the editor.
 * @property {string} [minWidth=""] - Min width for the editor.
 * @property {string} [maxWidth=""] - Max width for the editor.
 * @property {string} [height="auto"] - Height for the editor.
 * @property {string} [minHeight=""] - Min height for the editor.
 * @property {string} [maxHeight=""] - Max height for the editor.
 * @property {string} [editorStyle=""] - Style string of the top frame of the editor. (e.g. "border: 1px solid #ccc;").
 * @property {boolean} [iframe=false] - Content will be placed in an iframe and isolated from the rest of the page.
 * @property {boolean} [iframe_fullPage=false] - Allows the usage of HTML, HEAD, BODY tags and DOCTYPE declaration on the "iframe".
 * @property {Object<string, string>} [iframe_attributes={}] - Attributes of the "iframe". (e.g. {'scrolling': 'no'})
 * @property {string} [iframe_cssFileName="suneditor"] - Name or Array of the CSS file to apply inside the iframe.
 * - You can also use regular expressions.
 * - Applied by searching by filename in the link tag of document,
 * - or put the URL value (".css" can be omitted).
 * @property {boolean} [statusbar=true] - Enables the status bar.
 * @property {boolean} [statusbar_showPathLabel=true] - Displays the current node structure to status bar.
 * @property {boolean} [statusbar_resizeEnable=true] - Enables resize function of bottom status bar
 * @property {boolean} [charCounter=false] - Shows the number of characters in the editor.
 * - If the maxCharCount option has a value, it becomes true.
 * @property {number} [charCounter_max] - The maximum number of characters allowed to be inserted into the editor.
 * @property {string} [charCounter_label] - Text to be displayed in the "charCounter" area of the bottom bar. (e.g. "Characters : 20/200")
 * @property {"char"|"byte"|"byte-html"} [charCounter_type="char"] - Defines the calculation method of the "charCounter" option.
 * - 'char': Characters length.
 * - 'byte': Binary data size of characters.
 * - 'byte-html': Binary data size of the full HTML string.
 */

/**
 * @memberof SuneditorTypes
 * @typedef {Object} EditorBaseOptions
 * @property {Object<string, *>|Array<Object<string, *>>} [plugins] - Plugin configuration.
 * @property {Array<string>} [excludedPlugins] - Plugin configuration.
 * @property {Array<string[]|string>} [buttonList] - List of toolbar buttons, grouped by sub-arrays.
 * @property {boolean} [v2Migration=false] - Enables migration mode for SunEditor v2.
 * @property {boolean|{tagFilter: boolean, formatFilter: boolean, classFilter: boolean, styleNodeFilter: boolean, attrFilter: boolean, styleFilter: boolean}} [strictMode=true] - Enables strict filtering of tags, attributes, and styles.
 * @property {"classic"|"inline"|"balloon"|"balloon-always"} [mode="classic"] - Toolbar mode: "classic", "inline", "balloon", "balloon-always".
 * @property {string} [type=""] - Editor type: "document:header,page".
 * @property {string} [theme=""] - Editor theme.
 * @property {Object<string, string>} [lang] - Language configuration.
 * @property {Array<string>} [fontSizeUnits=["px", "pt", "em", "rem"]] - Allowed font size units.
 * @property {string} [allowedClassName] - Allowed class names.
 * @property {boolean} [closeModalOutsideClick=false] - Closes modals when clicking outside.
 * @property {boolean} [copyFormatKeepOn=false] - Keeps the format of the copied content.
 * @property {boolean} [syncTabIndent=true] - Synchronizes tab indent with spaces.
 * @property {boolean} [tabDisable=false] - Disables tab key input.
 * @property {boolean} [autoLinkify] - Automatically converts URLs into hyperlinks. ("Link" plugin required)
 * @property {Array<string>} [autoStyleify=["bold", "underline", "italic", "strike"]] - Styles applied automatically on text input.
 * @property {Object<string, string|number>} [scrollToOptions={behavior: "auto", block: "nearest"}] - Configuration for scroll behavior when navigating editor content.
 * @property {Object<string, string|number>} [componentScrollToOptions={behavior: "smooth", block: "center"}] - Configuration for scroll behavior when navigating components.
 * @property {"repeat"|"always"|"none"} [retainStyleMode="repeat"] - This option determines how inline elements (such as <span>, <strong>, etc.) are handled when deleting text.
 * - "repeat": Inline styles are retained unless the backspace key is repeatedly pressed. If the user continuously presses backspace, the styles will eventually be removed.
 * - "none": Inline styles are not retained at all. When deleting text, the associated inline elements are immediately removed along with it.
 * - "always": Inline styles persist indefinitely unless explicitly removed. Even if all text inside an inline element is deleted, the element itself remains until manually removed.
 * @property {Object<string, boolean>} [allowedExtraTags={script: false, style: false, meta: false, link: false, "[a-z]+:[a-z]+": false}] - Specifies extra allowed or disallowed tags.
 * @property {Object<string, (...args: *) => *>} [events={}] - Custom event handlers.
 * @property {string} [__textStyleTags="strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label|code|summary"] - The basic tags that serves as the base for "textStyleTags"
 * @property {string} [textStyleTags="strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label|code|summary"] - Additional text style tags.
 * @property {Object<string, string>} [convertTextTags={bold: "strong", underline: "u", italic: "em", strike: "del", subscript: "sub", superscript: "sup"}] - Maps text styles to specific HTML tags.
 * @property {Object<string, string>} [__tagStyles={'table|th|td': 'border|border-[a-z]+|background-color|text-align|float|font-weight|text-decoration|font-style', 'ol|ul': 'list-style-type'}] - The basic tags that serves as the base for "tagStyles"
 * @property {Object<string, string>} [tagStyles={}] - Specifies allowed styles for HTML tags.
 * @property {string} [spanStyles="font-family|font-size|color|background-color"] - Specifies allowed styles for the "span" tag.
 * @property {string} [lineStyles="text-align|margin-left|margin-right|line-height"] - Specifies allowed styles for the "line" element (p..).
 * @property {string} [textDirection="ltr"] - Text direction: "ltr" or "rtl".
 * @property {Array<string>} [reverseButtons=['indent-outdent']] - An array of command pairs whose shortcut icons should be opposite each other, depending on the "textDirection" mode.
 * @property {number} [historyStackDelayTime=400] - Delay time for history stack updates (ms).
 * @property {string} [lineAttrReset=""] - Line properties that should be reset when changing lines (e.g. "id|name").
 * @property {string} [printClass=""] - Class name for printing.
 * @property {string} [defaultLine="p"] - Default line element when inserting new lines.
 * @property {string} [__defaultElementWhitelist="br|div"] - Default allowed HTML elements. The default values are maintained.
 * @property {string} [elementWhitelist=""] - Allowed HTML elements. Delimiter: "|" (e.g. "p|div", "*").
 * @property {string} [elementBlacklist=""] - Disallowed HTML elements. Delimiter: "|" (e.g. "script|style").
 * @property {string} [__defaultAttributeWhitelist] - Allowed attributes. Delimiter: "|" (e.g. "href|target").
 * @property {Object<string, string>} [attributeWhitelist=""] - Allowed attributes. (e.g. {a: "href|target", img: "src|alt"}).
 * @property {Object<string, string>} [attributeBlacklist=""] - Disallowed attributes. (e.g. {a: "href|target", img: "src|alt"}).
 * @property {string} [__defaultFormatLine="P|DIV|H[1-6]|LI|TH|TD|DETAILS"] - Overrides the editor's default "line" element.
 * @property {string} [formatLine="P|DIV|H[1-6]|LI|TH|TD|DETAILS"] - Specifies the editor's "line" elements.
 * - (P, DIV, H[1-6], PRE, LI | class="__se__format__line_xxx")
 * - "line" element also contain "brLine" element
 * @property {string} [__defaultFormatBrLine="PRE"] - Overrides the editor's default "brLine" element.
 * @property {string} [formatBrLine="PRE"] - Specifies the editor's "brLine" elements. (e.g. "PRE").
 * - (PRE | class="__se__format__br_line_xxx")
 * - "brLine" elements is included in the "line" element.
 * - "brLine" elements's line break is "BR" tag.
 * ※ Entering the Enter key in the space on the last line ends "brLine" and appends "line".
 * @property {string} [__defaultFormatClosureBrLine=""] - Overrides the editor's default "closureBrLine" element.
 * @property {string} [formatClosureBrLine=""] - Specifies the editor's "closureBrLine" elements.
 * - (class="__se__format__br_line__closure_xxx")
 * - "closureBrLine" elements is included in the "brLine".
 * - "closureBrLine" elements's line break is "BR" tag.
 * - ※ You cannot exit this format with the Enter key or Backspace key.
 * - ※ Use it only in special cases. ([ex] format of table cells)
 * @property {string} [__defaultFormatBlock="BLOCKQUOTE|OL|UL|FIGCAPTION|TABLE|THEAD|TBODY|TR|CAPTION|DETAILS"] - Overrides the editor's default "block" element.
 * @property {string} [formatBlock="BLOCKQUOTE|OL|UL|FIGCAPTION|TABLE|THEAD|TBODY|TR|CAPTION|DETAILS"] - Specifies the editor's "block" elements.
 * - (BLOCKQUOTE, OL, UL, FIGCAPTION, TABLE, THEAD, TBODY, TR, TH, TD | class="__se__format__block_xxx")
 * - "block" is wrap the "line" and "component"
 * @property {string} [__defaultFormatClosureBlock="TH|TD"] - Overrides the editor's default "closureBlock" element.
 * @property {string} [formatClosureBlock="TH|TD"] - Specifies the editor's "closureBlock" elements.
 * - (TH, TD | class="__se__format__block_closure_xxx")
 * - "closureBlock" elements is included in the "block".
 * - "closureBlock" element is wrap the "line" and "component"
 * - ※ You cannot exit this format with the Enter key or Backspace key.
 * - ※ Use it only in special cases. ([ex] format of table cells)
 * @property {string} [allowedEmptyTags=".se-component, pre, blockquote, hr, li, table, img, iframe, video, audio, canvas, details"] - Allowed empty tags.
 * @property {number|string} [toolbar_width="auto"] - Toolbar width.
 * @property {Element|string} [toolbar_container] - Container element for the toolbar.
 * @property {number} [toolbar_sticky=0] - Enables sticky toolbar with optional offset.
 * @property {boolean} [toolbar_hide=false] - Hides toolbar initially.
 * @property {Object} [subToolbar] - Sub-toolbar configuration.
 * @property {Array<Array<string>>} [subToolbar.buttonList] - List of Sub-toolbar buttons, grouped by sub-arrays.
 * @property {"balloon"|"balloon-always"} [subToolbar.mode="balloon"] - Sub-toolbar mode: "balloon", "balloon-always".
 * @property {number|string} [subToolbar.width="auto"] - Sub-toolbar width.
 * @property {Element|string} [statusbar_container] - Container element for the status bar.
 * @property {boolean} [shortcutsHint=true] - Displays shortcut hints in tooltips.
 * @property {boolean} [shortcutsDisable=false] - Disables keyboard shortcuts.
 * @property {Object<string, Array<string>>} [shortcuts] - Custom keyboard shortcuts.
 * @property {number} [fullScreenOffset=0] - Offset applied when entering fullscreen mode.
 * @property {string} [previewTemplate] - Custom template for preview mode.
 * @property {string} [printTemplate] - Custom template for print mode.
 * @property {boolean} [componentAutoSelect=false] - Enables automatic selection of inserted components.
 * @property {string} [defaultUrlProtocol] - Default URL protocol for links.
 * @property {string} [allUsedStyles] - Specifies additional styles to the list of allowed styles. Delimiter: "|" (e.g. "color|background-color").
 * @property {Object<string, string>} [icons] - Overrides the default icons.
 * @property {string} [freeCodeViewMode=false] - Enables free code view mode.
 * @property {boolean} [__lineFormatFilter=true] - Line format filter configuration.
 * @property {boolean} [__pluginRetainFilter=true] - Plugin retain filter configuration.
 * @property {Array<string>} [__listCommonStyle=["fontSize", "color", "fontFamily", "fontWeight", "fontStyle"]] - Defines the list of styles that are applied directly to the `<li>` element
 * - when a text style is applied to the entire list item.
 * - For example, when changing the font size or color of a list item (`<li>`),
 * - these styles will be applied to the `<li>` tag instead of wrapping the content inside additional tags.
 * @property {Object<string, *>} [externalLibs] - External libraries like CodeMirror or MathJax.
 * @property {Object<string, *>} [PluginOptions] - Dynamic plugin options, where the key is the plugin name and the value is its configuration.
 */

/**
 * @memberof SuneditorTypes
 * @typedef {Map<string, *>} FrameOptions
 */

/**
 * @memberof SuneditorTypes
 * @typedef {Map<string, *>} FrameContext
 */

/**
 * @memberof SuneditorTypes
 * @typedef {Map<string, *>} Context
 */
