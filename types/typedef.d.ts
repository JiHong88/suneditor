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
			 */
			rootKey: any;
			/**
			 * Checks if the editor frame is currently scrollable.
			 * - default fc parameter is this.frameContext
			 * - Returns true if: (1) height is not 'auto' (fixed height always has scroll),
			 * - or (2) height is 'auto' with maxHeight set and content exceeds maxHeight
			 *
			 * **Internal Properties (⚠️ DO NOT USE - subject to change without notice):**
			 */
			isScrollable: (fc?: SunEditor.FrameContext) => boolean;
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
				type Info = import('./modules/contracts/Controller').ControllerInfo;
			}
			namespace Figure {
				type Info = import('./modules/contracts/Figure').FigureInfo;
				type TargetInfo = import('./modules/contracts/Figure').FigureTargetInfo;
				type ControlButton = import('./modules/contracts/Figure').FigureControlButton;
				type ControlResize = import('./modules/contracts/Figure').FigureControlResize;
				type ControlCustomAction = import('./modules/contracts/Figure').ControlCustomAction;
				type Controls = import('./modules/contracts/Figure').FigureControls;
			}
			namespace Browser {
				type File = import('./modules/contracts/Browser').BrowserFile;
			}
			namespace HueSlider {
				type Color = import('./modules/contracts/HueSlider').HueSliderColor;
			}
		}
		export namespace Hook {
			namespace Event {
				type Active = typeof import('./hooks/base').Event.Active;
				type OnFocus = typeof import('./hooks/base').Event.OnFocus;
				type OnBlur = typeof import('./hooks/base').Event.OnBlur;
				type OnMouseMove = typeof import('./hooks/base').Event.OnMouseMove;
				type OnScroll = typeof import('./hooks/base').Event.OnScroll;
				type OnBeforeInput = typeof import('./hooks/base').Event.OnBeforeInput;
				type OnBeforeInputAsync = typeof import('./hooks/base').Event.OnBeforeInputAsync;
				type OnInput = typeof import('./hooks/base').Event.OnInput;
				type OnInputAsync = typeof import('./hooks/base').Event.OnInputAsync;
				type OnKeyDown = typeof import('./hooks/base').Event.OnKeyDown;
				type OnKeyDownAsync = typeof import('./hooks/base').Event.OnKeyDownAsync;
				type OnKeyUp = typeof import('./hooks/base').Event.OnKeyUp;
				type OnKeyUpAsync = typeof import('./hooks/base').Event.OnKeyUpAsync;
				type OnMouseDown = typeof import('./hooks/base').Event.OnMouseDown;
				type OnMouseDownAsync = typeof import('./hooks/base').Event.OnMouseDownAsync;
				type OnMouseUp = typeof import('./hooks/base').Event.OnMouseUp;
				type OnMouseUpAsync = typeof import('./hooks/base').Event.OnMouseUpAsync;
				type OnClick = typeof import('./hooks/base').Event.OnClick;
				type OnClickAsync = typeof import('./hooks/base').Event.OnClickAsync;
				type OnMouseLeave = typeof import('./hooks/base').Event.OnMouseLeave;
				type OnMouseLeaveAsync = typeof import('./hooks/base').Event.OnMouseLeaveAsync;
				type OnFilePasteAndDrop = typeof import('./hooks/base').Event.OnFilePasteAndDrop;
				type OnFilePasteAndDropAsync = typeof import('./hooks/base').Event.OnFilePasteAndDropAsync;
				type OnPaste = typeof import('./hooks/base').Event.OnPaste;
				type OnPasteAsync = typeof import('./hooks/base').Event.OnPasteAsync;
			}
			namespace Core {
				type RetainFormat = typeof import('./hooks/base').Core.RetainFormat;
				type Shortcut = typeof import('./hooks/base').Core.Shortcut;
				type SetDir = typeof import('./hooks/base').Core.SetDir;
				type Init = typeof import('./hooks/base').Core.Init;
			}
			namespace Component {
				type Select = typeof import('./interfaces/contracts').EditorComponent.prototype.componentSelect;
				type Deselect = typeof import('./interfaces/contracts').EditorComponent.prototype.componentDeselect;
				type Edit = typeof import('./interfaces/contracts').EditorComponent.prototype.componentEdit;
				type Destroy = typeof import('./interfaces/contracts').EditorComponent.prototype.componentDestroy;
				type Copy = typeof import('./interfaces/contracts').EditorComponent.prototype.componentCopy;
			}
			namespace Modal {
				type Action = typeof import('./interfaces/contracts').ModuleModal.prototype.modalAction;
				type On = typeof import('./interfaces/contracts').ModuleModal.prototype.modalOn;
				type Init = typeof import('./interfaces/contracts').ModuleModal.prototype.modalInit;
				type Off = typeof import('./interfaces/contracts').ModuleModal.prototype.modalOff;
				type Resize = typeof import('./interfaces/contracts').ModuleModal.prototype.modalResize;
			}
			namespace Controller {
				type Action = typeof import('./interfaces/contracts').ModuleController.prototype.controllerAction;
				type On = typeof import('./interfaces/contracts').ModuleController.prototype.controllerOn;
				type Close = typeof import('./interfaces/contracts').ModuleController.prototype.controllerClose;
			}
			namespace Browser {
				type Init = typeof import('./interfaces/contracts').ModuleBrowser.prototype.browserInit;
			}
			namespace ColorPicker {
				type Action = typeof import('./interfaces/contracts').ModuleColorPicker.prototype.colorPickerAction;
				type HueSliderOpen = typeof import('./interfaces/contracts').ModuleColorPicker.prototype.colorPickerHueSliderOpen;
				type HueSliderClose = typeof import('./interfaces/contracts').ModuleColorPicker.prototype.colorPickerHueSliderClose;
			}
			namespace HueSlider {
				type Action = typeof import('./interfaces/contracts').ModuleHueSlider.prototype.hueSliderAction;
				type CancelAction = typeof import('./interfaces/contracts').ModuleHueSlider.prototype.hueSliderCancelAction;
			}
		}
		export namespace HookParams {
			type MouseEvent = import('./hooks/params').MouseEventInfo;
			type KeyEvent = import('./hooks/params').KeyEventInfo;
			type Shortcut = import('./hooks/params').ShortcutInfo;
			type FilePasteDrop = import('./hooks/params').FilePasteDrop;
			type FocusBlur = import('./hooks/params').FocusBlurEvent;
			type Scroll = import('./hooks/params').ScrollEvent;
			type InputWithData = import('./hooks/params').InputEventWithData;
			type Paste = import('./hooks/params').Paste;
			type Mouse = import('./hooks/params').Mouse;
			type Keyboard = import('./hooks/params').Keyboard;
			type InputKeyDown = import('./hooks/params').InputKeyDown;
			type InputChange = import('./hooks/params').InputChange;
			type CopyComponent = import('./hooks/params').CopyComponent;
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
			 * EventHandlers object containing all event callback functions
			 * To access individual handler types, use indexed access:
			 * Use SunEditor.Event.Handlers["onload"] to get the onload callback type
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
