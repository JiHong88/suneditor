import type {} from '../../typedef';
/**
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
 * @property {HTMLElement & HTMLTextAreaElement} originElement - The original source element (usually a <textarea> or target element).
 * @property {HTMLElement} topArea - The outermost container wrapping the entire editor (toolbar + editor + status bar).
 * @property {HTMLElement} container - The `.se-container` element that holds the editor's UI.
 * @property {HTMLElement} wrapper - The `.se-wrapper` element containing the editable area and internal components.
 * @property {SunEditor.WysiwygFrame} wysiwygFrame - The WYSIWYG frame element (either an <iframe> or a div in inline mode).
 * @property {HTMLElement} wysiwyg - The actual editable content area (usually the iframe’s <body> or a contentEditable div).
 * @property {SunEditor.EventWysiwyg} eventWysiwyg - Internal reference for wysiwyg events (set on initialization).
 * @property {HTMLElement} codeWrapper - Wrapper element for the code-view mode.
 * @property {HTMLElement & HTMLTextAreaElement} code - Code view editing element (a <textarea> or <pre>).
 * @property {HTMLTextAreaElement} codeNumbers - Element displaying line numbers in code view mode.
 * @property {HTMLElement} markdownWrapper - Wrapper element for the markdown-view mode.
 * @property {HTMLTextAreaElement} markdown - Markdown view editing element (a <textarea>).
 * @property {HTMLTextAreaElement} markdownNumbers - Element displaying line numbers in markdown view mode.
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
 * @property {{main: HTMLElement, border: HTMLElement, display: HTMLElement, handles: HTMLElement[]}} [_figure] - Current active figure component (image, table, etc.).
 *
 * === State Flags ===
 * @property {boolean} isCodeView - Whether the editor is currently in code view mode.
 * @property {boolean} isMarkdownView - Whether the editor is currently in markdown view mode.
 * @property {boolean} isFullScreen - Whether the editor is currently in fullscreen mode.
 * @property {boolean} isReadOnly - Whether the editor is set to readonly mode.
 * @property {boolean} isDisabled - Whether the editor is currently disabled.
 * @property {boolean} [isShowBlocks] - Whether block structure visualization is enabled.
 * @property {boolean} isChanged - Whether the content has been changed (-1 means initial state).
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
 * @property {CSSStyleDeclaration} [wwComputedStyle] - Cached computed styles for the wysiwyg element.
 *   - Set during editor initialization via `window.getComputedStyle(wysiwyg)`.
 *   - Used for retrieving runtime CSS values (padding, margins, font-family, etc.).
 *   - Improves performance by avoiding repeated `getComputedStyle()` calls.
 * @property {HTMLElement} [_iframeAuto] - Auto-resizing helper iframe (used for dynamic sizing).
 * @property {number} [_editorHeight] - Current height of the editor.
 * ================================================================================================================================
 */
/** @typedef {Map<keyof FrameContextStore, *>} FrameContexType */
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
 * @returns {FrameContexType}
 */
export function CreateFrameContext(
	editorTarget: {
		target: Element;
		key: any;
		options: SunEditor.FrameOptions;
	},
	top: HTMLElement,
	wwFrame: HTMLElement,
	codeWrapper: HTMLElement,
	codeFrame: HTMLElement,
	markdownWrapper: any,
	markdownFrame: any,
	statusbar: HTMLElement | null,
	documentTypeInner: {
		inner: HTMLElement;
		page: HTMLElement;
		pageMirror: HTMLElement;
	},
	key: any,
): FrameContexType;
/**
 * @description Update statusbar context
 * @param {HTMLElement} statusbar Statusbar element
 * @param {FrameContexType|import('../config/contextProvider').FrameContextMap} mapper FrameContext map
 */
export function UpdateStatusbarContext(statusbar: HTMLElement, mapper: FrameContexType | import('../config/contextProvider').FrameContextMap): void;
/**
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
 */
export type FrameContextStore = {
	/**
	 * - Unique key identifying this editor instance (useful for multi-root editors).
	 */
	key: any;
	/**
	 * - Frame-specific options (toolbar, plugins, behaviors, etc.).
	 *
	 * === Core DOM References ===
	 */
	options: SunEditor.FrameOptions;
	/**
	 * - The original source element (usually a <textarea> or target element).
	 */
	originElement: HTMLElement & HTMLTextAreaElement;
	/**
	 * - The outermost container wrapping the entire editor (toolbar + editor + status bar).
	 */
	topArea: HTMLElement;
	/**
	 * - The `.se-container` element that holds the editor's UI.
	 */
	container: HTMLElement;
	/**
	 * - The `.se-wrapper` element containing the editable area and internal components.
	 */
	wrapper: HTMLElement;
	/**
	 * - The WYSIWYG frame element (either an <iframe> or a div in inline mode).
	 */
	wysiwygFrame: SunEditor.WysiwygFrame;
	/**
	 * - The actual editable content area (usually the iframe’s <body> or a contentEditable div).
	 */
	wysiwyg: HTMLElement;
	/**
	 * - Internal reference for wysiwyg events (set on initialization).
	 */
	eventWysiwyg: SunEditor.EventWysiwyg;
	/**
	 * - Wrapper element for the code-view mode.
	 */
	codeWrapper: HTMLElement;
	/**
	 * - Code view editing element (a <textarea> or <pre>).
	 */
	code: HTMLElement & HTMLTextAreaElement;
	/**
	 * - Element displaying line numbers in code view mode.
	 */
	codeNumbers: HTMLTextAreaElement;
	/**
	 * - Wrapper element for the markdown-view mode.
	 */
	markdownWrapper: HTMLElement;
	/**
	 * - Markdown view editing element (a <textarea>).
	 */
	markdown: HTMLTextAreaElement;
	/**
	 * - Element displaying line numbers in markdown view mode.
	 */
	markdownNumbers: HTMLTextAreaElement;
	/**
	 * - Placeholder element shown when the editor is empty.
	 */
	placeholder: HTMLElement;
	/**
	 * - Editor status bar element (for resizing, info, etc.).
	 */
	statusbar: HTMLElement;
	/**
	 * - Navigation element (e.g., for outline or bookmarks).
	 */
	navigation: HTMLElement;
	/**
	 * - Wrapper for the character counter element.
	 */
	charWrapper: HTMLElement;
	/**
	 * - Element showing the character counter.
	 */
	charCounter: HTMLElement;
	/**
	 * - The window object of the WYSIWYG frame (iframe window).
	 */
	_ww?: Window;
	/**
	 * - The document object of the WYSIWYG frame (iframe document).
	 *
	 * === UI Utilities & Visual Components ===
	 */
	_wd?: Document;
	/**
	 * - Top floating line-breaker UI element (for line insertion).
	 */
	lineBreaker_t: HTMLElement;
	/**
	 * - Bottom floating line-breaker UI element (for line insertion).
	 */
	lineBreaker_b: HTMLElement;
	/**
	 * - Placeholder element used for sticky toolbar behavior.
	 */
	_stickyDummy?: HTMLElement;
	/**
	 * - Shadow element below the toolbar for visual effects.
	 */
	_toolbarShadow?: HTMLElement;
	/**
	 * - Current active figure component (image, table, etc.).
	 *
	 * === State Flags ===
	 */
	_figure?: {
		main: HTMLElement;
		border: HTMLElement;
		display: HTMLElement;
		handles: HTMLElement[];
	};
	/**
	 * - Whether the editor is currently in code view mode.
	 */
	isCodeView: boolean;
	/**
	 * - Whether the editor is currently in markdown view mode.
	 */
	isMarkdownView: boolean;
	/**
	 * - Whether the editor is currently in fullscreen mode.
	 */
	isFullScreen: boolean;
	/**
	 * - Whether the editor is set to readonly mode.
	 */
	isReadOnly: boolean;
	/**
	 * - Whether the editor is currently disabled.
	 */
	isDisabled: boolean;
	/**
	 * - Whether block structure visualization is enabled.
	 */
	isShowBlocks?: boolean;
	/**
	 * - Whether the content has been changed (-1 means initial state).
	 *
	 * === History Tracking ===
	 */
	isChanged: boolean;
	/**
	 * - Current index in the history stack (undo/redo).
	 */
	historyIndex: number;
	/**
	 * - Last saved index in the history stack.
	 *
	 * === DocumentType Editing (Optional) ===
	 */
	savedIndex: number;
	/**
	 * - Document-type specific configuration or module reference.
	 */
	documentType?: any;
	/**
	 * - Inner container for document-type editors.
	 */
	documentTypeInner?: HTMLElement;
	/**
	 * - Page wrapper for paginated editing mode.
	 */
	documentTypePage?: HTMLElement;
	/**
	 * - Mirror page element used for selection/layout adjustments.
	 */
	documentTypePageMirror?: HTMLElement;
	/**
	 * - Whether headers are used in document-type mode.
	 */
	documentType_use_header?: boolean;
	/**
	 * - Whether page layout is enabled in document-type mode.
	 *
	 * === Runtime / Computed Values ===
	 */
	documentType_use_page?: boolean;
	/**
	 * - Minimum height of the wysiwyg area (parsed from inline style or options).
	 */
	_minHeight: number;
	/**
	 * - Cached computed styles for the wysiwyg element.
	 * - Set during editor initialization via `window.getComputedStyle(wysiwyg)`.
	 * - Used for retrieving runtime CSS values (padding, margins, font-family, etc.).
	 * - Improves performance by avoiding repeated `getComputedStyle()` calls.
	 */
	wwComputedStyle?: CSSStyleDeclaration;
	/**
	 * - Auto-resizing helper iframe (used for dynamic sizing).
	 */
	_iframeAuto?: HTMLElement;
	/**
	 * - Current height of the editor.
	 * ================================================================================================================================
	 */
	_editorHeight?: number;
};
export type FrameContexType = Map<keyof FrameContextStore, any>;
