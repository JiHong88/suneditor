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
 * @typedef {import('./core/config/options').EditorInitOptions} SunEditor.InitOptions
 */

/**
 * @typedef {import('./core/config/options').EditorFrameOptions} SunEditor.InitFrameOptions
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
 * Editor status object containing current state information
 *
 * @typedef {Object} SunEditor.Status
 *
 * **Public Properties:**
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
 *
 * **Internal Properties (⚠️ DO NOT USE - subject to change without notice):**
 * @property {Range} _range Internal: Current range object
 * @property {boolean} _onMousedown Internal: Mouse down event status
 */

// --------------------------------------------------------- [Component Types] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {Object} SunEditor.ComponentInfo
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
 * @typedef {"auto"|"select"|"line"|"none"} SunEditor.ComponentInsertType
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

// --------------------------------------------------------- [Module Types - Cross-module Public API] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {import('./modules/Controller').ControllerInfo} SunEditor.Module.Controller.Info
 */

/**
 * @typedef {import('./modules/Figure').FigureInfo} SunEditor.Module.Figure.Info
 * @typedef {import('./modules/Figure').FigureTargetInfo} SunEditor.Module.Figure.TargetInfo
 * @typedef {import('./modules/Figure').FigureControlButton} SunEditor.Module.Figure.ControlButton
 * @typedef {import('./modules/Figure').FigureControlResize} SunEditor.Module.Figure.ControlResize
 * @typedef {import('./modules/Figure').ControlCustomAction} SunEditor.Module.Figure.ControlCustomAction
 * @typedef {import('./modules/Figure').FigureControls} SunEditor.Module.Figure.Controls
 */

/**
 * @typedef {import('./modules/Browser').BrowserFile} SunEditor.Module.Browser.File
 */

/**
 * @typedef {import('./modules/HueSlider').HueSliderColor} SunEditor.Module.HueSlider.Color
 */

// --------------------------------------------------------- [Plugin Types] ---------------------------------------------------------------------------------------------------
// 🌐 Note: These types use browser DOM APIs (MouseEvent, KeyboardEvent, Range, HTMLElement, Node)

/**
 * @typedef {Object} SunEditor.Plugin.MouseEventInfo
 * @property {SunEditor.FrameContext} frameContext Frame context
 * @property {MouseEvent} event Event object (browser DOM API)
 */

/**
 * @typedef {Object} SunEditor.Plugin.KeyEventInfo
 * @property {SunEditor.FrameContext} frameContext Frame context
 * @property {KeyboardEvent} event Event object
 * @property {Range} range range object
 * @property {HTMLElement} line Current line element
 */

/**
 * @typedef {Object} SunEditor.Plugin.ToolbarInputChangeEventInfo
 * @property {HTMLElement} target Input element
 * @property {Event} event Event object
 * @property {string} value Input value
 */

/**
 * @typedef {Object} SunEditor.Plugin.ShortcutInfo Information of the "shortcut" plugin
 * @property {Range} range - Range object
 * @property {HTMLElement} line - The line element of the current range
 * @property {import('./core/class/shortcuts').ShortcutInfo} info - Information of the shortcut
 * @property {KeyboardEvent} event - Key event object
 * @property {string} keyCode - KeyBoardEvent.code
 * @property {SunEditor.Core} editor - The root editor instance
 */

/**
 * @typedef {Object} SunEditor.Plugin.PasteParams
 * @property {SunEditor.FrameContext} frameContext Frame context
 * @property {ClipboardEvent} event Clipboard event object
 * @property {string} data Format cleaned paste data (HTML string)
 * @property {Document} doc DomParser data (new DOMParser().parseFromString(data, 'text/html');)
 */

/**
 * @typedef {Object} SunEditor.Plugin.CopyComponentParams
 * @property {ClipboardEvent} event Clipboard event object
 * @property {HTMLElement} cloneContainer Cloned component container
 * @property {SunEditor.ComponentInfo} info Component information
 */

// ================================================================================================================================
// === INTERNAL/ADVANCED TYPES (Framework internals and advanced use cases)
// ================================================================================================================================

// --------------------------------------------------------- [Event Types] ---------------------------------------------------------------------------------------------------
/**
 * EventManager event information
 * @typedef {Object} SunEditor.Event.Info
 * @property {*} target Target element
 * @property {string} type Event type
 * @property {(...args: *) => *} listener Event listener
 * @property {boolean|AddEventListenerOptions} [useCapture] Event useCapture option
 */

/**
 * EventManager global event information
 * @typedef {Object} SunEditor.Event.GlobalInfo
 * @property {string} type Event type
 * @property {(...args: *) => *} listener Event listener
 * @property {boolean|AddEventListenerOptions} [useCapture] Use event capture
 */

/**
 * EventHandlers
 * @typedef {import('./events').EventHandlers} SunEditor.Event.Handlers
 */

/**
 * EventParams - Event callback parameters
 * @typedef {import('./events').BaseEvent} SunEditor.EventParams.BaseEvent
 * @typedef {import('./events').ClipboardEvent} SunEditor.EventParams.ClipboardEvent
 * @typedef {import('./events').FileManagementInfo} SunEditor.EventParams.FileManagementInfo
 * @typedef {import('./events').ProcessInfo} SunEditor.EventParams.ProcessInfo
 * @typedef {import('./events').ImageInfo} SunEditor.EventParams.ImageInfo
 * @typedef {import('./events').VideoInfo} SunEditor.EventParams.VideoInfo
 * @typedef {import('./events').AudioInfo} SunEditor.EventParams.AudioInfo
 * @typedef {import('./events').FileInfo} SunEditor.EventParams.FileInfo
 * @typedef {import('./events').EmbedInfo} SunEditor.EventParams.EmbedInfo
 */

// --------------------------------------------------------- [UI Types] ---------------------------------------------------------------------------------------------------
/**
 * Special toolbar control strings
 * - `"|"`: Vertical separator between buttons
 * - `"/"`: Line break (start new row)
 * - `":[title]-[icon]"`: More button with dropdown (e.g., ":More Button-default.more_vertical")
 * - `"-left"|"-right"`: Float alignment for button groups
 * - `"#fix"`: RTL direction fix
 * - `"%100"|"%50"`: Responsive breakpoint (percentage)
 *
 * @example
 * // Basic separators and layout
 * [['bold', 'italic', '|', 'underline'],]  // Separator between buttons
 * [['font', 'fontSize'], '/', ['align'],]  // Line break between rows
 *
 * // Float alignment
 * [['-right', 'undo', 'redo'],]          // Float right side
 *
 * // More button (collapsible group)
 * [[':Paragraph-More', 'fontSize', 'align'],]      // Dropdown with title
 *
 * // Responsive breakpoint
 * ['%50', ['bold', 'italic'],]           // Show at 50% width breakpoint
 *
 * @typedef {"|"|"/"|`-${"left"|"right"|"center"}`|"#fix"|`:${string}-${string}`|`%${number}`} SunEditor.UI.ButtonSpecial
 */

// ========================================================= [ButtonList Generate] ===================================================================================================
/**
 * === [ Button Types - Auto-generated ] ===
 * ---[ Auto-generated by scripts/check/gen-button-types.cjs - DO NOT EDIT MANUALLY ]---
 *
 * Default command buttons available in the toolbar
 * @typedef {"bold"|"underline"|"italic"|"strike"|"subscript"|"superscript"|"removeFormat"|"copyFormat"|"indent"|"outdent"|"fullScreen"|"showBlocks"|"codeView"|"undo"|"redo"|"preview"|"print"|"copy"|"dir"|"dir_ltr"|"dir_rtl"|"save"|"newDocument"|"selectAll"|"pageBreak"|"pageUp"|"pageDown"|"pageNavigator"} SunEditor.UI.ButtonCommand
 *
 * Plugin buttons available in the toolbar
 * @typedef {"blockquote"|"exportPDF"|"fileUpload"|"list_bulleted"|"list_numbered"|"mention"|"align"|"font"|"fontColor"|"backgroundColor"|"list"|"table"|"blockStyle"|"hr"|"layout"|"lineHeight"|"template"|"paragraphStyle"|"textStyle"|"link"|"image"|"video"|"audio"|"embed"|"math"|"drawing"|"imageGallery"|"videoGallery"|"audioGallery"|"fileGallery"|"fileBrowser"|"fontSize"|"pageNavigator"|"anchor"} SunEditor.UI.ButtonPlugin
 *
 * Single button item in the toolbar (includes special controls and custom strings)
 * @typedef {SunEditor.UI.ButtonCommand|SunEditor.UI.ButtonPlugin|SunEditor.UI.ButtonSpecial|string} SunEditor.UI.ButtonItem
 *
 * Button list configuration for the toolbar
 * 2D array of button items, where each sub-array represents a button group
 * @typedef {Array<Array<SunEditor.UI.ButtonItem>|SunEditor.UI.ButtonSpecial>} SunEditor.UI.ButtonList
 * ///
 * ---[ End of auto-generated button types ]---
 */
