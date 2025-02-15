// --------------------------------------------------------- [Node] ---------------------------------------------------------------------------------------------------

/**
 * @typedef {Array<Node>} ReturnNodeArray
 */

/**
 * @typedef {ReturnNodeArray|HTMLCollection|NodeList} NodeCollection
 */

// --------------------------------------------------------- [Editor] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {import('../src/core/editor').default} EditorInstance
 */

/**
 * @typedef {import('../src//editorInjector').default} EditorInjector
 */

/**
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

/**
 * @typedef {Map<string, *>} FrameOptions
 */

/**
 * @typedef {Map<string, *>} FrameContext
 */

/**
 * @typedef {Map<string, *>} Context
 */

// --------------------------------------------------------- [Event] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {Object} EventInfo
 * @property {*} target Target element
 * @property {string} type Event type
 * @property {(...args: *) => *} listener Event listener
 * @property {boolean|AddEventListenerOptions=} useCapture Event useCapture option
 */

/**
 * @typedef {Object} GlobalEventInfo
 * @property {string} type Event type
 * @property {(...args: *) => *} listener Event listener
 * @property {boolean|AddEventListenerOptions=} useCapture Use event capture
 */

// --------------------------------------------------------- [Plugin Event] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {Object} PluginMouseEventInfo
 * @property {FrameContext} frameContext Frame context
 * @property {Event} event Event object
 */

/**
 * @typedef {Object} PluginInputEventInfo
 * @property {FrameContext} frameContext Frame context
 * @property {Event} event Event object
 * @property {string} data Input data
 */

/**
 * @typedef {Object} PluginKeyEventInfo
 * @property {FrameContext} frameContext Frame context
 * @property {Event} event Event object
 * @property {Range} range range object
 * @property {Element} line Current line element
 */

/**
 * @typedef {Object} PluginToolbarInputKeyEventInfo
 * @property {Element} target Input element
 * @property {Event} event Event object
 */

/**
 * @typedef {Object} PluginToolbarInputChangeEventInfo
 * @property {Element} target Input element
 * @property {Event} event Event object
 * @property {string} value Input value
 */
