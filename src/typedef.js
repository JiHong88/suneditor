/**
 * @fileoverview Global Type Declarations for SunEditor Custom Types
 */

// --------------------------------------------------------- [Node] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {Array<Node>|HTMLCollection|NodeList} __se__NodeCollection
 */

// --------------------------------------------------------- [Editor] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {import('./core/editor').default} __se__EditorCore
 */

/**
 * @typedef {import('./editorInjector').default} __se__EditorInjector
 */

/**
 * @typedef {import('./editorInjector/_core').default} __se__CoreInjector
 */

/**
 * @typedef {Object} __se__ComponentInfo
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
 * @typedef {Object} __se__EditorStatus
 * @property {boolean} hasFocus Boolean value of whether the editor has focus
 * @property {number} tabSize Indent size of tab (4)
 * @property {number} indentSize Indent size (25)px
 * @property {number} codeIndentSize Indent size of Code view mode (2)
 * @property {Array<string>} currentNodes  An element array of the current cursor's node structure
 * @property {Array<string>} currentNodesMap  An element name array of the current cursor's node structure
 * @property {number} currentViewportHeight Current visual viewport height size
 * @property {number} initViewportHeight Height of the initial visual viewport height size
 * @property {boolean} onSelected Boolean value of whether component is selected
 * @property {number} rootKey Current root key
 * @property {Range} _range Current range object
 * @property {boolean} _onMousedown Mouse down event status
 */

// --------------------------------------------------------- [Event] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {Object} __se__EventInfo
 * @property {*} target Target element
 * @property {string} type Event type
 * @property {(...args: *) => *} listener Event listener
 * @property {boolean|AddEventListenerOptions=} useCapture Event useCapture option
 */

/**
 * @typedef {Object} __se__GlobalEventInfo
 * @property {string} type Event type
 * @property {(...args: *) => *} listener Event listener
 * @property {boolean|AddEventListenerOptions=} useCapture Use event capture
 */

// --------------------------------------------------------- [Plugin Event] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {Object} __se__PluginMouseEventInfo
 * @property {__se__FrameContext} frameContext Frame context
 * @property {MouseEvent} event Event object
 */

/**
 * @typedef {Object} __se__PluginKeyEventInfo
 * @property {__se__FrameContext} frameContext Frame context
 * @property {KeyboardEvent} event Event object
 * @property {Range} range range object
 * @property {HTMLElement} line Current line element
 */

/**
 * @typedef {Object} __se__PluginToolbarInputChangeEventInfo
 * @property {HTMLElement} target Input element
 * @property {Event} event Event object
 * @property {string} value Input value
 */

/**
 * @typedef {Object} __se__PluginShortcutInfo Information of the "shortcut" plugin
 * @property {Range} range - Range object
 * @property {HTMLElement} line - The line element of the current range
 * @property {import('./core/class/shortcuts').ShortcutInfo} info - Information of the shortcut
 * @property {KeyboardEvent} event - Key event object
 * @property {string} keyCode - KeyBoardEvent.code
 * @property {__se__EditorCore} editor - The root editor instance
 */

/**
 * @typedef {Object} __se__PluginPasteParams
 * @property {__se__FrameContext} frameContext Frame context
 * @property {ClipboardEvent} event Clipboard event object
 * @property {string} data Format cleaned paste data (HTML string)
 * @property {Document} doc DomParser data (new DOMParser().parseFromString(data, 'text/html');)
 */

/**
 * @typedef {Object} __se__PluginCopyComponentParams
 * @property {ClipboardEvent} event Clipboard event object
 * @property {HTMLElement} cloneContainer Cloned component container
 * @property {__se__ComponentInfo} info Component information
 */

// --------------------------------------------------------- [Context] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {Map<keyof import('./core/config/options').AllFrameOptions, *>} __se__FrameOptions
 */

/**
 * @typedef {import('./core/config/frameContext').FrameContextUtil} __se__FrameContext
 */

/**
 * @typedef {Map<keyof import('./core/config/context').ContextUtil, *>} __se__Context
 */

// --------------------------------------------------------- [core.class] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {import('./core/class/offset').OffsetGlobalInfo} __se__Class_OffsetGlobalInfo
 */
