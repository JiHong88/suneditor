export {};

declare global {
	type __se__NodeCollection = Array<Node> | HTMLCollection | NodeList;
	type __se__EditorCore = import('./core/editor').default;
	type __se__EditorInjector = import('./editorInjector').default;
	type __se__CoreInjector = import('./editorInjector/_core').default;
	type __se__ComponentInfo = {
		/**
		 * - The target element associated with the component.
		 */
		target: HTMLElement;
		/**
		 * - The name of the plugin related to the component.
		 */
		pluginName: string;
		/**
		 * - Options related to the component.
		 */
		options: {
			[x: string]: any;
		};
		/**
		 * - The main container element for the component.
		 */
		container: HTMLElement;
		/**
		 * - The cover element, if applicable.
		 */
		cover: HTMLElement | null;
		/**
		 * - The inline cover element, if applicable.
		 */
		inlineCover: HTMLElement | null;
		/**
		 * - The caption element, if applicable.
		 */
		caption: HTMLElement | null;
		/**
		 * - Whether the component is a file-related component.
		 */
		isFile: boolean;
		/**
		 * - The element that triggered the component, if applicable.
		 */
		launcher: HTMLElement | null;
		/**
		 * - Whether the component is an input component (e.g., table).
		 */
		isInputType: boolean;
	};
	type __se__EditorStatus = {
		/**
		 * Boolean value of whether the editor has focus
		 */
		hasFocus: boolean;
		/**
		 * Indent size of tab (4)
		 */
		tabSize: number;
		/**
		 * Indent size (25)px
		 */
		indentSize: number;
		/**
		 * Indent size of Code view mode (2)
		 */
		codeIndentSize: number;
		/**
		 * An element array of the current cursor's node structure
		 */
		currentNodes: Array<string>;
		/**
		 * An element name array of the current cursor's node structure
		 */
		currentNodesMap: Array<string>;
		/**
		 * Current visual viewport height size
		 */
		currentViewportHeight: number;
		/**
		 * Height of the initial visual viewport height size
		 */
		initViewportHeight: number;
		/**
		 * Boolean value of whether component is selected
		 */
		onSelected: boolean;
		/**
		 * Current root key
		 */
		rootKey: number;
		/**
		 * Current range object
		 */
		_range: Range;
		/**
		 * Mouse down event status
		 */
		_onMousedown: boolean;
	};
	type __se__EventInfo = {
		/**
		 * Target element
		 */
		target: any;
		/**
		 * Event type
		 */
		type: string;
		/**
		 * Event listener
		 */
		listener: (...args: any) => any;
		/**
		 * Event useCapture option
		 */
		useCapture?: (boolean | AddEventListenerOptions) | undefined;
	};
	type __se__GlobalEventInfo = {
		/**
		 * Event type
		 */
		type: string;
		/**
		 * Event listener
		 */
		listener: (...args: any) => any;
		/**
		 * Use event capture
		 */
		useCapture?: (boolean | AddEventListenerOptions) | undefined;
	};
	type __se__PluginMouseEventInfo = {
		/**
		 * Frame context
		 */
		frameContext: __se__FrameContext;
		/**
		 * Event object
		 */
		event: MouseEvent;
	};
	type __se__PluginKeyEventInfo = {
		/**
		 * Frame context
		 */
		frameContext: __se__FrameContext;
		/**
		 * Event object
		 */
		event: KeyboardEvent;
		/**
		 * range object
		 */
		range: Range;
		/**
		 * Current line element
		 */
		line: HTMLElement;
	};
	type __se__PluginToolbarInputChangeEventInfo = {
		/**
		 * Input element
		 */
		target: HTMLElement;
		/**
		 * Event object
		 */
		event: Event;
		/**
		 * Input value
		 */
		value: string;
	};
	/**
	 * Information of the "shortcut" plugin
	 */
	type __se__PluginShortcutInfo = {
		/**
		 * - Range object
		 */
		range: Range;
		/**
		 * - The line element of the current range
		 */
		line: HTMLElement;
		/**
		 * - Information of the shortcut
		 */
		info: import('./core/class/shortcuts').ShortcutInfo;
		/**
		 * - Key event object
		 */
		event: KeyboardEvent;
		/**
		 * - KeyBoardEvent.code
		 */
		keyCode: string;
		/**
		 * - The root editor instance
		 */
		editor: __se__EditorCore;
	};
	type __se__PluginPasteParams = {
		/**
		 * Frame context
		 */
		frameContext: __se__FrameContext;
		/**
		 * Clipboard event object
		 */
		event: ClipboardEvent;
		/**
		 * Format cleaned paste data (HTML string)
		 */
		data: string;
		/**
		 * DomParser data (new DOMParser().parseFromString(data, 'text/html');)
		 */
		doc: Document;
	};
	type __se__PluginCopyComponentParams = {
		/**
		 * Clipboard event object
		 */
		event: ClipboardEvent;
		/**
		 * Cloned component container
		 */
		cloneContainer: HTMLElement;
		/**
		 * Component information
		 */
		info: __se__ComponentInfo;
	};
	type __se__FrameOptions = Map<string, any>;
	type __se__FrameContext = Map<string, any>;
	type __se__Context = Map<string, any>;
	type __se__Class_OffsetGlobalInfo = import('./core/class/offset').OffsetGlobalInfo;
}
