/**
 * @fileoverview Global Type Declarations for SunEditor Custom Types
 */

/**
 * @namespace SunEditor
 */

// ================================================================================================================================
// === PUBLIC API TYPES (User-facing types for common use cases)
// ================================================================================================================================

// --------------------------------------------------------- [Editor Types] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {import('./core/editor').default} SunEditor.Instance
 */

// --------------------------------------------------------- [Init Options] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {import('./core/config/options.js').EditorInitOptions} SunEditor.InitOptions
 */

/**
 * @typedef {import('./core/config/options.js').EditorFrameOptions} SunEditor.InitFrameOptions
 */

// --------------------------------------------------------- [Context & Options] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {Map<keyof import('./core/config/context').ContextUtil, *>} SunEditor.Context
 */

/**
 * @typedef {import('./core/config/options').BaseOptionsMap} SunEditor.Options
 *
 */

// --------------------------------------------------------- [{Frame} Context & Options] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {import('./core/config/frameContext').FrameContextUtil} SunEditor.FrameContext
 */

/**
 * @typedef {import('./core/config/options').FrameOptionsMap} SunEditor.FrameOptions
 *
 */

// --------------------------------------------------------- [Internal Core Types] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {import('./core/editor').default} SunEditor.Core
 * @deprecated Use SunEditor.Instance instead
 */

/**
 * @typedef {import('./editorInjector').default} SunEditor.Injector
 */

/**
 * @typedef {Object} SunEditor.Status
 *
 * @property {boolean} hasFocus Boolean value of whether the editor has focus
 * @property {number} tabSize Indent size of tab (4)
 * @property {number} indentSize Indent size (25)px
 * @property {number} codeIndentSize Indent size of Code view mode (2)
 * @property {Array<string>} currentNodes  An element array of the current cursor's node structure
 * @property {Array<string>} currentNodesMap  An element name array of the current cursor's node structure
 * @property {number} currentViewportHeight Current visual viewport height size
 * @property {number} initViewportHeight Height of the initial visual viewport height size
 * @property {boolean} onSelected Boolean value of whether component is selected
 * @property {*} rootKey Current root key
 * @property {Range} _range Current range object
 * @property {boolean} _onMousedown Mouse down event status
 */

// --------------------------------------------------------- [Component Types] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {Object} SunEditor.ComponentInfo
 *
 * @property {HTMLElement} target - The target element associated with the component.
 * @property {string} pluginName - The name of the plugin related to the component.
 * @property {Object<string, *>} options - Options related to the component.
 * @property {HTMLElement} container - The main container element for the component.
 * @property {?HTMLElement} cover - The cover element, if applicable.
 * @property {?HTMLElement} inlineCover - The inline cover element, if applicable.
 * @property {?HTMLElement} caption - The caption element, if applicable.
 * @property {boolean} isFile - Whether the component is a file-related component.
 * @property {?HTMLElement} launcher - The element that triggered the component, if applicable.
 * @property {boolean} isInputType - Whether the component is an input component (e.g., table).
 */

/**
 * @typedef {"auto"|"select"|"line"|"none"} SunEditor.ComponentInsertBehaviorType
 *
 * @description Component insertion behavior for selection and cursor placement.
 * - For inline components: places the cursor near the inserted component or selects it if no nearby range is available.
 * - For block components: executes behavior based on `selectMode`:
 *    - `auto`: Move cursor to the next line if possible, otherwise select the component.
 *    - `select`: Always select the inserted component.
 *    - `line`: Move cursor to the next line if possible, or create a new line and move there.
 *    - `none`: Do nothing.
 */

// --------------------------------------------------------- [DOM/Utility Types] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {Array<Node>|HTMLCollection|NodeList} SunEditor.NodeCollection
 */

// --------------------------------------------------------- [Plugin Event Types] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {Object} SunEditor.PluginMouseEventInfo
 *
 * @property {SunEditor.FrameContext} frameContext Frame context
 * @property {MouseEvent} event Event object
 */

/**
 * @typedef {Object} SunEditor.PluginKeyEventInfo
 *
 * @property {SunEditor.FrameContext} frameContext Frame context
 * @property {KeyboardEvent} event Event object
 * @property {Range} range range object
 * @property {HTMLElement} line Current line element
 */

/**
 * @typedef {Object} SunEditor.PluginToolbarInputChangeEventInfo
 *
 * @property {HTMLElement} target Input element
 * @property {Event} event Event object
 * @property {string} value Input value
 */

/**
 * @typedef {Object} SunEditor.PluginShortcutInfo Information of the "shortcut" plugin
 *
 * @property {Range} range - Range object
 * @property {HTMLElement} line - The line element of the current range
 * @property {import('./core/class/shortcuts').ShortcutInfo} info - Information of the shortcut
 * @property {KeyboardEvent} event - Key event object
 * @property {string} keyCode - KeyBoardEvent.code
 * @property {SunEditor.Core} editor - The root editor instance
 */

/**
 * @typedef {Object} SunEditor.PluginPasteParams
 *
 * @property {SunEditor.FrameContext} frameContext Frame context
 * @property {ClipboardEvent} event Clipboard event object
 * @property {string} data Format cleaned paste data (HTML string)
 * @property {Document} doc DomParser data (new DOMParser().parseFromString(data, 'text/html');)
 */

/**
 * @typedef {Object} SunEditor.PluginCopyComponentParams
 *
 * @property {ClipboardEvent} event Clipboard event object
 * @property {HTMLElement} cloneContainer Cloned component container
 * @property {SunEditor.ComponentInfo} info Component information
 */

// ================================================================================================================================
// === INTERNAL/ADVANCED TYPES (Framework internals and advanced use cases)
// ================================================================================================================================

// --------------------------------------------------------- [Event System Types] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {Object} SunEditor.EventInfo
 *
 * @property {*} target Target element
 * @property {string} type Event type
 * @property {(...args: *) => *} listener Event listener
 * @property {boolean|AddEventListenerOptions=} useCapture Event useCapture option
 */

/**
 * @typedef {Object} SunEditor.GlobalEventInfo
 *
 * @property {string} type Event type
 * @property {(...args: *) => *} listener Event listener
 * @property {boolean|AddEventListenerOptions=} useCapture Use event capture
 */

// --------------------------------------------------------- [Event System Internals] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {import('./core/event/reducers/keydown.reducer').KeydownReducerCtx} SunEditor.EventKeydownCtx
 *
 */

/**
 * @typedef {import('./core/event/actions').Action[]} SunEditor.EventActions
 *
 */

/**
 * @typedef {import('./core/event/ports').EventReducerPorts} SunEditor.EventPorts
 *
 */

// --------------------------------------------------------- [Button/Toolbar Types] ---------------------------------------------------------------------------------------------------
/**
 * Special toolbar control strings
 * - `"|"`: Vertical separator
 * - `"/"`: Line break
 * - `":title-icon"`: More button (e.g., ":More-default.more_vertical")
 * - `"-left"|"-right"|"-center"`: Float alignment
 * - `"#fix"`: RTL direction fix
 * - `"%100"|"%50"`: Responsive breakpoint (percentage)
 * @typedef {"|"|"/"|`-${"left"|"right"|"center"}`|"#fix"|`:${string}-${string}`|`%${number}`} SunEditor.ButtonSpecial
 */

// ========================================================= [ButtonList Generate] ===================================================================================================
/**
 * === [ Button Types - Auto-generated ] ===
 * ---[ Auto-generated by scripts/check/gen-button-types.cjs - DO NOT EDIT MANUALLY ]---
 *
 * Default command buttons available in the toolbar
 * @typedef {"bold"|"underline"|"italic"|"strike"|"subscript"|"superscript"|"removeFormat"|"copyFormat"|"indent"|"outdent"|"fullScreen"|"showBlocks"|"codeView"|"undo"|"redo"|"preview"|"print"|"copy"|"dir"|"dir_ltr"|"dir_rtl"|"save"|"newDocument"|"selectAll"|"pageBreak"|"pageUp"|"pageDown"|"pageNavigator"} SunEditor.ButtonCommand
 *
 * Plugin buttons available in the toolbar
 * @typedef {"blockquote"|"exportPDF"|"fileUpload"|"list_bulleted"|"list_numbered"|"mention"|"align"|"font"|"fontColor"|"backgroundColor"|"list"|"table"|"blockStyle"|"hr"|"layout"|"lineHeight"|"template"|"paragraphStyle"|"textStyle"|"link"|"image"|"video"|"audio"|"embed"|"math"|"drawing"|"imageGallery"|"videoGallery"|"audioGallery"|"fileGallery"|"fileBrowser"|"fontSize"|"pageNavigator"|"anchor"} SunEditor.ButtonPlugin
 *
 * Single button item in the toolbar (includes special controls and custom strings)
 * @typedef {SunEditor.ButtonCommand|SunEditor.ButtonPlugin|SunEditor.ButtonSpecial|string} SunEditor.ButtonItem
 *
 * Button list configuration for the toolbar
 * 2D array of button items, where each sub-array represents a button group
 * @typedef {Array<Array<SunEditor.ButtonItem>|SunEditor.ButtonSpecial>} SunEditor.ButtonList
 * ///
 * ---[ End of auto-generated button types ]---
 */
