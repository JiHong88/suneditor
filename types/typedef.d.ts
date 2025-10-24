export {};

declare global {
	declare namespace SunEditor {
		type Instance = import('./core/editor').default;
		type InitOptions = import('./core/config/options.js').EditorInitOptions;
		type InitFrameOptions = import('./core/config/options.js').EditorFrameOptions;
		type Context = Map<keyof import('./core/config/context').ContextUtil, any>;
		type Options = import('./core/config/options').BaseOptionsMap;
		type FrameContext = import('./core/config/frameContext').FrameContextUtil;
		type FrameOptions = import('./core/config/options').FrameOptionsMap;
		type Core = import('./core/editor').default;
		type Injector = import('./editorInjector').default;
		type Status = {
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
			rootKey: any;
			/**
			 * Current range object
			 */
			_range: Range;
			/**
			 * Mouse down event status
			 */
			_onMousedown: boolean;
		};
		type ComponentInfo = {
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
		type ComponentInsertBehaviorType = 'auto' | 'select' | 'line' | 'none';
		type NodeCollection = Array<Node> | HTMLCollection | NodeList;
		type PluginMouseEventInfo = {
			/**
			 * Frame context
			 */
			frameContext: SunEditor.FrameContext;
			/**
			 * Event object
			 */
			event: MouseEvent;
		};
		type PluginKeyEventInfo = {
			/**
			 * Frame context
			 */
			frameContext: SunEditor.FrameContext;
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
		type PluginToolbarInputChangeEventInfo = {
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
		type PluginShortcutInfo = {
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
			editor: SunEditor.Core;
		};
		type PluginPasteParams = {
			/**
			 * Frame context
			 */
			frameContext: SunEditor.FrameContext;
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
		type PluginCopyComponentParams = {
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
			info: SunEditor.ComponentInfo;
		};
		type EventInfo = {
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
		type GlobalEventInfo = {
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
		type EventKeydownCtx = import('./core/event/reducers/keydown.reducer').KeydownReducerCtx;
		type EventActions = import('./core/event/actions').Action[];
		type EventPorts = import('./core/event/ports').EventReducerPorts;
		/**
		 * Special toolbar control strings
		 * - `"|"`: Vertical separator
		 * - `"/"`: Line break
		 * - `":title-icon"`: More button (e.g., ":More-default.more_vertical")
		 * - `"-left"|"-right"|"-center"`: Float alignment
		 * - `"#fix"`: RTL direction fix
		 * - `"%100"|"%50"`: Responsive breakpoint (percentage)
		 */
		type ButtonSpecial = '|' | '/' | `-${'left' | 'right' | 'center'}` | '#fix' | `:${string}-${string}` | `%${number}`;
		/**
		 * Plugin buttons available in the toolbar
		 */
		type ButtonCommand =
			| 'bold'
			| 'underline'
			| 'italic'
			| 'strike'
			| 'subscript'
			| 'superscript'
			| 'removeFormat'
			| 'copyFormat'
			| 'indent'
			| 'outdent'
			| 'fullScreen'
			| 'showBlocks'
			| 'codeView'
			| 'undo'
			| 'redo'
			| 'preview'
			| 'print'
			| 'copy'
			| 'dir'
			| 'dir_ltr'
			| 'dir_rtl'
			| 'save'
			| 'newDocument'
			| 'selectAll'
			| 'pageBreak'
			| 'pageUp'
			| 'pageDown'
			| 'pageNavigator';
		/**
		 * Single button item in the toolbar (includes special controls and custom strings)
		 */
		type ButtonPlugin =
			| 'blockquote'
			| 'exportPDF'
			| 'fileUpload'
			| 'list_bulleted'
			| 'list_numbered'
			| 'mention'
			| 'align'
			| 'font'
			| 'fontColor'
			| 'backgroundColor'
			| 'list'
			| 'table'
			| 'blockStyle'
			| 'hr'
			| 'layout'
			| 'lineHeight'
			| 'template'
			| 'paragraphStyle'
			| 'textStyle'
			| 'link'
			| 'image'
			| 'video'
			| 'audio'
			| 'embed'
			| 'math'
			| 'drawing'
			| 'imageGallery'
			| 'videoGallery'
			| 'audioGallery'
			| 'fileGallery'
			| 'fileBrowser'
			| 'fontSize'
			| 'pageNavigator'
			| 'anchor';
		/**
		 * Button list configuration for the toolbar
		 * 2D array of button items, where each sub-array represents a button group
		 */
		type ButtonItem = SunEditor.ButtonCommand | SunEditor.ButtonPlugin | SunEditor.ButtonSpecial | string;
		/**
		 * ///
		 * ---[ End of auto-generated button types ]---
		 */
		type ButtonList = Array<Array<SunEditor.ButtonItem> | SunEditor.ButtonSpecial>;
	}
}

export type { SunEditor };
