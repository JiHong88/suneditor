/**
 * @version 1.0.0
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
 * @typedef {Object} __se__EditorStatus
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
 * @property {Range} params.range - Range object
 * @property {HTMLElement} params.line - The line element of the current range
 * @property {import('./core/class/shortcuts').ShortcutInfo} params.info - Information of the shortcut
 * @property {KeyboardEvent} params.event - Key event object
 * @property {string} params.keyCode - KeyBoardEvent.code
 * @property {__se__EditorCore} params.editor - The root editor instance
 */

// --------------------------------------------------------- [Context] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {Map<string, *>} __se__FrameOptions
 */

/**
 * @typedef {Map<string, *>} __se__FrameContext
 */

/**
 * @typedef {Map<string, *>} __se__Context
 */

// --------------------------------------------------------- [core.class] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {import('./core/class/offset').OffsetGlobalInfo} __se__Class_OffsetGlobalInfo
 */
