import type {} from './events';
export {};

declare global {
	namespace SunEditor {
		type Instance = import('./core/editor').default;
		type Kernel = import('./core/kernel/coreKernel').default;
		type Store = import('./core/kernel/store').default;
		type StorePathMap = import('./core/kernel/store').StoreState;
		type Deps = import('./core/kernel/coreKernel').Deps;
		type InitOptions = import('./core/schema/options').EditorInitOptions;
		type InitFrameOptions = import('./core/schema/options').EditorFrameOptions;
		type Context = import('./core/config/contextProvider').ContextMap;
		type Options = import('./core/config/optionProvider').BaseOptionsMap;
		type FrameContext = import('./core/config/contextProvider').FrameContextMap;
		type FrameOptions = import('./core/config/optionProvider').FrameOptionsMap;
		type EventWysiwyg = HTMLElement & Window;
		type WysiwygFrame = HTMLElement & HTMLIFrameElement;
		type GlobalWindow = Window & typeof globalThis;
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
				type Info = import('./modules/contract/Controller').ControllerInfo;
			}
			namespace Figure {
				type Info = import('./modules/contract/Figure').FigureInfo;
				type TargetInfo = import('./modules/contract/Figure').FigureTargetInfo;
				type ControlButton = import('./modules/contract/Figure').FigureControlButton;
				type ControlResize = import('./modules/contract/Figure').FigureControlResize;
				type ControlCustomAction = import('./modules/contract/Figure').ControlCustomAction;
				type Controls = import('./modules/contract/Figure').FigureControls;
			}
			namespace Browser {
				type File = import('./modules/contract/Browser').BrowserFile;
			}
			namespace HueSlider {
				type Color = import('./modules/contract/HueSlider').HueSliderColor;
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
			type ToolbarInputKeyDown = import('./hooks/params').ToolbarInputKeyDown;
			type ToolbarInputChange = import('./hooks/params').ToolbarInputChange;
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
				listener: any;
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
				listener: any;
				/**
				 * Use event capture
				 */
				useCapture?: boolean | AddEventListenerOptions;
			};
			/**
			 * EventHandlers object containing all event callback functions
			 * To access individual handler types, use indexed access:
			 * Use `SunEditor.Event.Handlers["onload"]` to get the `onload` callback type
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
			/**
			 * The event object passed to the plugin event handler
			 */
			type PluginEvent = import('./core/logic/shell/pluginManager').PluginEventParam;
		}
		export namespace UI {
			/**
			 * Special toolbar control strings
			 * - `"|"`: Vertical separator between buttons
			 * - `"/"`: Line break (start new row)
			 * - `":[title]-[icon]"`: More button with dropdown (e.g., `":More Button-default.more_vertical"`)
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
				| 'markdownView'
				| 'undo'
				| 'redo'
				| 'preview'
				| 'print'
				| 'copy'
				| 'dir'
				| 'dir_ltr'
				| 'dir_rtl'
				| 'finder'
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
			 * Supports nested arrays, special controls, and responsive breakpoint configurations
			 */
			type ButtonItem = SunEditor.UI.ButtonCommand | SunEditor.UI.ButtonPlugin | SunEditor.UI.ButtonSpecial | string;
			/**
			 * ///
			 * ---[ End of auto-generated button types ]---
			 */
			type ButtonList = Array<SunEditor.UI.ButtonItem | SunEditor.UI.ButtonList | SunEditor.UI.ButtonSpecial>;
		}
	}
}

export type { SunEditor };
