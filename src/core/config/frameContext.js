import { get as getNumber } from '../../helper/numbers';

/**
 * ================================================================================================================================
 * === FRAME CONTEXT TYPES : Store
 * =================================================================================================================================
 */

/**
 * ================================================================================================================================
 * @typedef {Object} FrameContextStore
 *
 * This object stores **all frame-specific states and DOM references** for a SunEditor instance.
 *
 * - Used to manage **multi-root editors** (each frame has its own context).
 * - Holds references to all **key DOM nodes** (WYSIWYG area, toolbars, status bar, code view, etc.).
 * - Maintains **editor state flags** (fullscreen, readonly, code view, content changes).
 * - Provides storage for **document-type editing features** (page layout, headers, etc.).
 * - Keeps **history positions** and other runtime values for undo/redo operations.
 *
 * This structure is **core to how SunEditor manages each editing frame** and is accessed throughout
 * the editor modules (history, toolbar actions, plugins, etc.).
 * -----------------
 *
 * === Identification ===
 * @property {*} key - Unique key identifying this editor instance (useful for multi-root editors).
 * @property {SunEditor.FrameOptions} options - Frame-specific options (toolbar, plugins, behaviors, etc.).
 *
 * === Core DOM References ===
 * @property {Element} originElement - The original source element (usually a <textarea> or target element).
 * @property {HTMLElement} topArea - The outermost container wrapping the entire editor (toolbar + editor + status bar).
 * @property {HTMLElement} container - The `.se-container` element that holds the editor's UI.
 * @property {HTMLElement} wrapper - The `.se-wrapper` element containing the editable area and internal components.
 * @property {HTMLElement} wysiwygFrame - The WYSIWYG frame element (either an <iframe> or a div in inline mode).
 * @property {HTMLElement} wysiwyg - The actual editable content area (usually the iframe’s <body> or a contentEditable div).
 * @property {HTMLElement} eventWysiwyg - Internal reference for wysiwyg events (set on initialization).
 * @property {HTMLElement} codeWrapper - Wrapper element for the code-view mode.
 * @property {HTMLElement} code - Code view editing element (a <textarea> or <pre>).
 * @property {HTMLTextAreaElement} codeNumbers - Element displaying line numbers in code view mode.
 * @property {HTMLElement} placeholder - Placeholder element shown when the editor is empty.
 * @property {HTMLElement} statusbar - Editor status bar element (for resizing, info, etc.).
 * @property {HTMLElement} navigation - Navigation element (e.g., for outline or bookmarks).
 * @property {HTMLElement} charWrapper - Wrapper for the character counter element.
 * @property {HTMLElement} charCounter - Element showing the character counter.
 * @property {Window} [_ww] - The window object of the WYSIWYG frame (iframe window).
 * @property {Document} [_wd] - The document object of the WYSIWYG frame (iframe document).
 *
 * === UI Utilities & Visual Components ===
 * @property {HTMLElement} lineBreaker_t - Top floating line-breaker UI element (for line insertion).
 * @property {HTMLElement} lineBreaker_b - Bottom floating line-breaker UI element (for line insertion).
 * @property {HTMLElement} [_stickyDummy] - Placeholder element used for sticky toolbar behavior.
 * @property {HTMLElement} [_toolbarShadow] - Shadow element below the toolbar for visual effects.
 * @property {HTMLElement} [_figure] - Current active figure component (image, table, etc.).
 *
 * === State Flags ===
 * @property {boolean} isCodeView - Whether the editor is currently in code view mode.
 * @property {boolean} isFullScreen - Whether the editor is currently in fullscreen mode.
 * @property {boolean} isReadOnly - Whether the editor is set to readonly mode.
 * @property {boolean} isDisabled - Whether the editor is currently disabled.
 * @property {boolean} [isShowBlocks] - Whether block structure visualization is enabled.
 * @property {number} isChanged - Whether the content has been changed (-1 means initial state).
 *
 * === History Tracking ===
 * @property {number} historyIndex - Current index in the history stack (undo/redo).
 * @property {number} savedIndex - Last saved index in the history stack.
 *
 * === DocumentType Editing (Optional) ===
 * @property {*} [documentType] - Document-type specific configuration or module reference.
 * @property {HTMLElement} [documentTypeInner] - Inner container for document-type editors.
 * @property {HTMLElement} [documentTypePage] - Page wrapper for paginated editing mode.
 * @property {HTMLElement} [documentTypePageMirror] - Mirror page element used for selection/layout adjustments.
 * @property {boolean} [documentType_use_header] - Whether headers are used in document-type mode.
 * @property {boolean} [documentType_use_page] - Whether page layout is enabled in document-type mode.
 *
 * === Runtime / Computed Values ===
 * @property {number} _minHeight - Minimum height of the wysiwyg area (parsed from inline style or options).
 * @property {*} [wwComputedStyle] - Cached computed styles for the wysiwyg frame.
 * @property {HTMLIFrameElement} [_iframeAuto] - Auto-resizing helper iframe (used for dynamic sizing).
 * @property {number} [_editorHeight] - Current height of the editor.
 * ================================================================================================================================
 */

/** @typedef {Map<keyof FrameContextStore|null, *>} FrameContextMap */

/** --+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+-- */

/**
 * ================================================================================================================================
 * === UTILITIES : Manage Frame Context Map
 * =================================================================================================================================
 */

/**
 * @typedef {Object} FrameContextUtil
 * @property {(k: keyof FrameContextStore) => *} get - Get a DOM element from the context by key.
 * @property {(k: keyof FrameContextStore, v: *) => void} set - Set a DOM element in the context by key.
 * @property {(k: keyof FrameContextStore) => boolean} has - Check if a key exists in the context.
 * @property {(k: keyof FrameContextStore) => boolean} delete - Delete a key from the context.
 * @property {() => Object<keyof FrameContextStore, *>} [getAll] - Get all DOM elements in the context as an object.
 * @property {(newMap: *) => void} [reset] - Reset the context with a new Map.
 * @property {() => void} clear - Clear all elements in the context.
 */

/**
 * @description Elements and variables you should have
 * @param {{target: Element, key: *, options: SunEditor.FrameOptions}} editorTarget Target textarea
 * @param {HTMLElement} top Editor top area
 * @param {HTMLElement} wwFrame Editor wysiwyg frame
 * @param {HTMLElement} codeWrapper Editor code view wrapper
 * @param {HTMLElement} codeFrame Editor code view frame
 * @param {{inner: HTMLElement, page: HTMLElement, pageMirror: HTMLElement}} documentTypeInner Document type elements
 * @param {?HTMLElement} statusbar Editor statusbar
 * @param {*} key root key
 * @returns {FrameContextMap}
 */
export function CreateFrameContext(editorTarget, top, wwFrame, codeWrapper, codeFrame, statusbar, documentTypeInner, key) {
	const m = /** @type {FrameContextMap} */ (
		new Map([
			['key', key],
			['options', editorTarget.options],
			['originElement', editorTarget.target],
			['topArea', top],
			['container', top.querySelector('.se-container')],
			['wrapper', top.querySelector('.se-wrapper')],
			['wysiwygFrame', wwFrame],
			['wysiwyg', wwFrame], // options.iframe ? wwFrame.contentDocument.body : wwFrame
			['codeWrapper', codeWrapper],
			['code', codeFrame],
			['codeNumbers', /** @type {HTMLTextAreaElement} */ (codeWrapper?.querySelector('.se-code-view-line'))],
			['lineBreaker_t', top.querySelector('.se-line-breaker-component-t')],
			['lineBreaker_b', top.querySelector('.se-line-breaker-component-b')],
			['_stickyDummy', top.querySelector('.se-toolbar-sticky-dummy')],
			['_toolbarShadow', top.querySelector('.se-toolbar-shadow')],
			['_minHeight', getNumber(wwFrame.style.minHeight || '65', 0)],
			['isCodeView', false],
			['isFullScreen', false],
			['isReadOnly', false],
			['isDisabled', false],
			['isChanged', -1],
			['historyIndex', -1],
			['savedIndex', -1],
			['eventwysiwyg', null],
			['documentTypeInner', documentTypeInner.inner],
			['documentTypePage', documentTypeInner.page],
			['documentTypePageMirror', documentTypeInner.pageMirror]
		])
	);

	if (statusbar) UpdateStatusbarContext(statusbar, m);

	const placeholder = top.querySelector('.se-placeholder');
	if (placeholder) m.set('placeholder', placeholder);

	return m;
}

/**
 * @description Update statusbar context
 * @param {HTMLElement} statusbar Statusbar element
 * @param {FrameContextMap|FrameContextUtil} mapper FrameContext map
 */
export function UpdateStatusbarContext(statusbar, mapper) {
	statusbar ? mapper.set('statusbar', statusbar) : mapper.delete('statusbar');
	const navigation = statusbar ? statusbar.querySelector('.se-navigation') : null;
	const charWrapper = statusbar ? statusbar.querySelector('.se-char-counter-wrapper') : null;
	const charCounter = statusbar ? statusbar.querySelector('.se-char-counter-wrapper .se-char-counter') : null;
	navigation ? mapper.set('navigation', navigation) : mapper.delete('navigation');
	charWrapper ? mapper.set('charWrapper', charWrapper) : mapper.delete('charWrapper');
	charCounter ? mapper.set('charCounter', charCounter) : mapper.delete('charCounter');
}

/**
 * @description Creates a utility wrapper for editor base options.
 * - Provides get, set, has, getAll, and setMany methods with internal Map support.
 * @param {*} editor - The editor instance
 * @returns {FrameContextUtil}
 */
export function FrameContextUtil(editor) {
	let store = editor.__frameContext;

	return {
		get(k) {
			return store.get(k);
		},
		set(k, v) {
			return store.set(k, v);
		},
		has(k) {
			return store.has(k);
		},
		delete(k) {
			return store.delete(k);
		},
		getAll() {
			return Object.fromEntries(store.entries());
		},
		reset(newMap) {
			store = editor.__options = newMap;
		},
		clear() {
			store.clear();
		}
	};
}
