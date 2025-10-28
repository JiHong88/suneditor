import type {} from './events';
export {};

declare global {
	namespace SunEditor {
		type Instance = import('./core/editor').default;
		type InitOptions = import('./core/config/options').EditorInitOptions;
		type InitFrameOptions = import('./core/config/options').EditorFrameOptions;
		type Context = Map<keyof import('./core/config/context').ContextUtil, any>;
		type Options = import('./core/config/options').BaseOptionsMap;
		type FrameContext = import('./core/config/frameContext').FrameContextUtil;
		type FrameOptions = import('./core/config/options').FrameOptionsMap;
		type Core = import('./core/editor').default;
		type Injector = import('./editorInjector').default;
		/**
		 * **Public Properties:**
		 */
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
			 *
			 * **Internal Properties (⚠️ DO NOT USE - subject to change without notice):**
			 */
			rootKey: any;
			/**
			 * Internal: Current range object
			 */
			_range: Range;
			/**
			 * Internal: Mouse down event status
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
		type ComponentInsertType = 'auto' | 'select' | 'line' | 'none';
		type NodeCollection = Array<Node> | HTMLCollection | NodeList;
		export namespace Module {
			namespace Controller {
				type Info = import('./modules/Controller').ControllerInfo;
			}
			namespace Figure {
				type Info = import('./modules/Figure').FigureInfo;
				type TargetInfo = import('./modules/Figure').FigureTargetInfo;
				type ControlButton = import('./modules/Figure').FigureControlButton;
				type ControlResize = import('./modules/Figure').FigureControlResize;
				type ControlCustomAction = import('./modules/Figure').ControlCustomAction;
				type Controls = import('./modules/Figure').FigureControls;
			}
			namespace Browser {
				type File = import('./modules/Browser').BrowserFile;
			}
			namespace HueSlider {
				type Color = import('./modules/HueSlider').HueSliderColor;
			}
		}
		export namespace Plugin {
			type MouseEventInfo = {
				/**
				 * Frame context
				 */
				frameContext: SunEditor.FrameContext;
				/**
				 * Event object (browser DOM API)
				 */
				event: MouseEvent;
			};
			type KeyEventInfo = {
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
			type ToolbarInputChangeEventInfo = {
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
			type ShortcutInfo = {
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
			type PasteParams = {
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
			type CopyComponentParams = {
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
		}
		export namespace Event {
			/**
			 * EventManager event information
			 */
			type Info = {
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
				useCapture?: boolean | AddEventListenerOptions;
			};
			/**
			 * EventManager global event information
			 */
			type GlobalInfo = {
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
				useCapture?: boolean | AddEventListenerOptions;
			};
			/**
			 * EventHandlers
			 */
			type Handlers = import('./events').EventHandlers;
		}
		export namespace EventParams {
			/**
			 * EventParams - Event callback parameters
			 */
			type BaseEvent = import('./events').BaseEvent;
			/**
			 * EventParams - Event callback parameters
			 */
			type ClipboardEvent = import('./events').ClipboardEvent;
			/**
			 * EventParams - Event callback parameters
			 */
			type FileManagementInfo = import('./events').FileManagementInfo;
			/**
			 * EventParams - Event callback parameters
			 */
			type ProcessInfo = import('./events').ProcessInfo;
			/**
			 * EventParams - Event callback parameters
			 */
			type ImageInfo = import('./events').ImageInfo;
			/**
			 * EventParams - Event callback parameters
			 */
			type VideoInfo = import('./events').VideoInfo;
			/**
			 * EventParams - Event callback parameters
			 */
			type AudioInfo = import('./events').AudioInfo;
			/**
			 * EventParams - Event callback parameters
			 */
			type FileInfo = import('./events').FileInfo;
			/**
			 * EventParams - Event callback parameters
			 */
			type EmbedInfo = import('./events').EmbedInfo;
		}
		export namespace UI {
			/**
			 * Special toolbar control strings
			 * - `"|"`: Vertical separator between buttons
			 * - `"/"`: Line break (start new row)
			 * - `":[title]-[icon]"`: More button with dropdown (e.g., ":More Button-default.more_vertical")
			 * - `"-left"|"-right"`: Float alignment for button groups
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
			type ButtonItem = SunEditor.UI.ButtonCommand | SunEditor.UI.ButtonPlugin | SunEditor.UI.ButtonSpecial | string;
			/**
			 * ///
			 * ---[ End of auto-generated button types ]---
			 */
			type ButtonList = Array<Array<SunEditor.UI.ButtonItem> | SunEditor.UI.ButtonSpecial>;
		}
	}
}

export type { SunEditor };
