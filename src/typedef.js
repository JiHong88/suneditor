/**
 * @fileoverview Global Type Declarations for SunEditor Custom Types
 */

/**
 * @namespace SunEditor
 */

// ================================================================================================================================
// === PUBLIC API TYPES (User-facing types for common use cases)
// ================================================================================================================================

// --------------------------------------------------------- [Editor Types] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {import('./core/editor').default} SunEditor.Instance
 * @typedef {import('./core/kernel/coreKernel').default} SunEditor.Kernel
 * @typedef {import('./core/kernel/store').default} SunEditor.Store
 * @typedef {import('./core/kernel/store').StoreState} SunEditor.StorePathMap
 * @typedef {import('./core/kernel/coreKernel').Deps} SunEditor.Deps
 */

// --------------------------------------------------------- [Init Options] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {import('./core/schema/options').EditorInitOptions} SunEditor.InitOptions
 * @typedef {import('./core/schema/options').EditorFrameOptions} SunEditor.InitFrameOptions
 */

// --------------------------------------------------------- [Context & Options] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {import('./core/config/contextProvider').ContextMap} SunEditor.Context
 * @typedef {import('./core/config/optionProvider').BaseOptionsMap} SunEditor.Options
 */

// --------------------------------------------------------- [{Frame} Context & Options] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {import('./core/config/contextProvider').FrameContextMap} SunEditor.FrameContext
 * @typedef {import('./core/config/optionProvider').FrameOptionsMap} SunEditor.FrameOptions
 */

/**
 * @typedef {HTMLElement & Window} SunEditor.EventWysiwyg
 * @typedef {HTMLElement & HTMLIFrameElement} SunEditor.WysiwygFrame
 * @typedef {Window & typeof globalThis} SunEditor.GlobalWindow
 */

// --------------------------------------------------------- [Component Types] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {Object} SunEditor.ComponentInfo
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
 * @typedef {"auto"|"select"|"line"|"none"} SunEditor.ComponentInsertType
 * @description Component insertion behavior for selection and cursor placement.
 * - For inline components: places the cursor near the inserted component or selects it if no nearby range is available.
 * - For block components: executes behavior based on `selectMode`:
 *    - `auto`: Move cursor to the next line if possible, otherwise select the component.
 *    - `select`: Always select the inserted component.
 *    - `line`: Move cursor to the next line if possible, or create a new line and move there.
 *    - `none`: Do nothing.
 */

// --------------------------------------------------------- [DOM/Utility Types] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {Array<Node>|HTMLCollection|NodeList} SunEditor.NodeCollection
 */

// --------------------------------------------------------- [Module Types - Cross-module Public API] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {import('./modules/contract/Controller').ControllerInfo} SunEditor.Module.Controller.Info
 *
 * @typedef {import('./modules/contract/Figure').FigureInfo} SunEditor.Module.Figure.Info
 * @typedef {import('./modules/contract/Figure').FigureTargetInfo} SunEditor.Module.Figure.TargetInfo
 * @typedef {import('./modules/contract/Figure').FigureControlButton} SunEditor.Module.Figure.ControlButton
 * @typedef {import('./modules/contract/Figure').FigureControlResize} SunEditor.Module.Figure.ControlResize
 * @typedef {import('./modules/contract/Figure').ControlCustomAction} SunEditor.Module.Figure.ControlCustomAction
 * @typedef {import('./modules/contract/Figure').FigureControls} SunEditor.Module.Figure.Controls
 *
 * @typedef {import('./modules/contract/Browser').BrowserFile} SunEditor.Module.Browser.File
 *
 * @typedef {import('./modules/contract/HueSlider').HueSliderColor} SunEditor.Module.HueSlider.Color
 */

// --------------------------------------------------------- [Plugin Hook Types] ---------------------------------------------------------------------------------------------------
// Editor hooks - Called by Editor core
// Event sync
/**
 * @typedef {typeof import('./hooks/base').Event.Active} SunEditor.Hook.Event.Active
 * @typedef {typeof import('./hooks/base').Event.OnFocus} SunEditor.Hook.Event.OnFocus
 * @typedef {typeof import('./hooks/base').Event.OnBlur} SunEditor.Hook.Event.OnBlur
 * @typedef {typeof import('./hooks/base').Event.OnMouseMove} SunEditor.Hook.Event.OnMouseMove
 * @typedef {typeof import('./hooks/base').Event.OnScroll} SunEditor.Hook.Event.OnScroll
 */

// Event sync/async
/**
 * @typedef {typeof import('./hooks/base').Event.OnBeforeInput} SunEditor.Hook.Event.OnBeforeInput
 * @typedef {typeof import('./hooks/base').Event.OnBeforeInputAsync} SunEditor.Hook.Event.OnBeforeInputAsync
 * @typedef {typeof import('./hooks/base').Event.OnInput} SunEditor.Hook.Event.OnInput
 * @typedef {typeof import('./hooks/base').Event.OnInputAsync} SunEditor.Hook.Event.OnInputAsync
 * @typedef {typeof import('./hooks/base').Event.OnKeyDown} SunEditor.Hook.Event.OnKeyDown
 * @typedef {typeof import('./hooks/base').Event.OnKeyDownAsync} SunEditor.Hook.Event.OnKeyDownAsync
 * @typedef {typeof import('./hooks/base').Event.OnKeyUp} SunEditor.Hook.Event.OnKeyUp
 * @typedef {typeof import('./hooks/base').Event.OnKeyUpAsync} SunEditor.Hook.Event.OnKeyUpAsync
 * @typedef {typeof import('./hooks/base').Event.OnMouseDown} SunEditor.Hook.Event.OnMouseDown
 * @typedef {typeof import('./hooks/base').Event.OnMouseDownAsync} SunEditor.Hook.Event.OnMouseDownAsync
 * @typedef {typeof import('./hooks/base').Event.OnMouseUp} SunEditor.Hook.Event.OnMouseUp
 * @typedef {typeof import('./hooks/base').Event.OnMouseUpAsync} SunEditor.Hook.Event.OnMouseUpAsync
 * @typedef {typeof import('./hooks/base').Event.OnClick} SunEditor.Hook.Event.OnClick
 * @typedef {typeof import('./hooks/base').Event.OnClickAsync} SunEditor.Hook.Event.OnClickAsync
 * @typedef {typeof import('./hooks/base').Event.OnMouseLeave} SunEditor.Hook.Event.OnMouseLeave
 * @typedef {typeof import('./hooks/base').Event.OnMouseLeaveAsync} SunEditor.Hook.Event.OnMouseLeaveAsync
 * @typedef {typeof import('./hooks/base').Event.OnFilePasteAndDrop} SunEditor.Hook.Event.OnFilePasteAndDrop
 * @typedef {typeof import('./hooks/base').Event.OnFilePasteAndDropAsync} SunEditor.Hook.Event.OnFilePasteAndDropAsync
 * @typedef {typeof import('./hooks/base').Event.OnPaste} SunEditor.Hook.Event.OnPaste
 * @typedef {typeof import('./hooks/base').Event.OnPasteAsync} SunEditor.Hook.Event.OnPasteAsync
 */

// Core etc
/**
 * @typedef {typeof import('./hooks/base').Core.RetainFormat} SunEditor.Hook.Core.RetainFormat
 * @typedef {typeof import('./hooks/base').Core.Shortcut} SunEditor.Hook.Core.Shortcut
 * @typedef {typeof import('./hooks/base').Core.SetDir} SunEditor.Hook.Core.SetDir
 * @typedef {typeof import('./hooks/base').Core.Init} SunEditor.Hook.Core.Init
 */

// component
/**
 * @typedef {typeof import('./interfaces/contracts').EditorComponent.prototype.componentSelect} SunEditor.Hook.Component.Select
 * @typedef {typeof import('./interfaces/contracts').EditorComponent.prototype.componentDeselect} SunEditor.Hook.Component.Deselect
 * @typedef {typeof import('./interfaces/contracts').EditorComponent.prototype.componentEdit} SunEditor.Hook.Component.Edit
 * @typedef {typeof import('./interfaces/contracts').EditorComponent.prototype.componentDestroy} SunEditor.Hook.Component.Destroy
 * @typedef {typeof import('./interfaces/contracts').EditorComponent.prototype.componentCopy} SunEditor.Hook.Component.Copy
 */

// Module hooks - Called by Module instances (defined in interfaces/contracts.js)
/**
 * @typedef {typeof import('./interfaces/contracts').ModuleModal.prototype.modalAction} SunEditor.Hook.Modal.Action
 * @typedef {typeof import('./interfaces/contracts').ModuleModal.prototype.modalOn} SunEditor.Hook.Modal.On
 * @typedef {typeof import('./interfaces/contracts').ModuleModal.prototype.modalInit} SunEditor.Hook.Modal.Init
 * @typedef {typeof import('./interfaces/contracts').ModuleModal.prototype.modalOff} SunEditor.Hook.Modal.Off
 * @typedef {typeof import('./interfaces/contracts').ModuleModal.prototype.modalResize} SunEditor.Hook.Modal.Resize
 *
 * @typedef {typeof import('./interfaces/contracts').ModuleController.prototype.controllerAction} SunEditor.Hook.Controller.Action
 * @typedef {typeof import('./interfaces/contracts').ModuleController.prototype.controllerOn} SunEditor.Hook.Controller.On
 * @typedef {typeof import('./interfaces/contracts').ModuleController.prototype.controllerClose} SunEditor.Hook.Controller.Close
 *
 * @typedef {typeof import('./interfaces/contracts').ModuleBrowser.prototype.browserInit} SunEditor.Hook.Browser.Init
 *
 * @typedef {typeof import('./interfaces/contracts').ModuleColorPicker.prototype.colorPickerAction} SunEditor.Hook.ColorPicker.Action
 * @typedef {typeof import('./interfaces/contracts').ModuleColorPicker.prototype.colorPickerHueSliderOpen} SunEditor.Hook.ColorPicker.HueSliderOpen
 * @typedef {typeof import('./interfaces/contracts').ModuleColorPicker.prototype.colorPickerHueSliderClose} SunEditor.Hook.ColorPicker.HueSliderClose
 *
 * @typedef {typeof import('./interfaces/contracts').ModuleHueSlider.prototype.hueSliderAction} SunEditor.Hook.HueSlider.Action
 * @typedef {typeof import('./interfaces/contracts').ModuleHueSlider.prototype.hueSliderCancelAction} SunEditor.Hook.HueSlider.CancelAction
 */

// --------------------------------------------------------- [Plugin Hook parameter types] ---------------------------------------------------------------------------------------------------
/**
 * @typedef {import('./hooks/params').MouseEventInfo} SunEditor.HookParams.MouseEvent
 * @typedef {import('./hooks/params').KeyEventInfo} SunEditor.HookParams.KeyEvent
 * @typedef {import('./hooks/params').ShortcutInfo} SunEditor.HookParams.Shortcut
 * @typedef {import('./hooks/params').FilePasteDrop} SunEditor.HookParams.FilePasteDrop
 * @typedef {import('./hooks/params').FocusBlurEvent} SunEditor.HookParams.FocusBlur
 * @typedef {import('./hooks/params').ScrollEvent} SunEditor.HookParams.Scroll
 * @typedef {import('./hooks/params').InputEventWithData} SunEditor.HookParams.InputWithData
 * @typedef {import('./hooks/params').Paste} SunEditor.HookParams.Paste
 * @typedef {import('./hooks/params').Mouse} SunEditor.HookParams.Mouse
 * @typedef {import('./hooks/params').Keyboard} SunEditor.HookParams.Keyboard
 *
 * @typedef {import('./hooks/params').ToolbarInputKeyDown} SunEditor.HookParams.ToolbarInputKeyDown
 * @typedef {import('./hooks/params').ToolbarInputChange} SunEditor.HookParams.ToolbarInputChange
 *
 * @typedef {import('./hooks/params').CopyComponent} SunEditor.HookParams.CopyComponent
 */

//** ****************************************************************************************************************************************************************************************** */

// ================================================================================================================================
// === INTERNAL/ADVANCED TYPES (Framework internals and advanced use cases)
// ================================================================================================================================

// --------------------------------------------------------- [Event Types] ---------------------------------------------------------------------------------------------------
/**
 * EventManager event information
 * @typedef {Object} SunEditor.Event.Info
 * @property {*} target Target element
 * @property {string} type Event type
 * @property {*} listener Event listener
 * @property {boolean|AddEventListenerOptions} [useCapture] Event useCapture option
 */

/**
 * EventManager global event information
 * @typedef {Object} SunEditor.Event.GlobalInfo
 * @property {string} type Event type
 * @property {(...args: *) => *} listener Event listener
 * @property {boolean|AddEventListenerOptions} [useCapture] Use event capture
 */

/**
 * EventHandlers object containing all event callback functions
 * To access individual handler types, use indexed access:
 * Use `SunEditor.Event.Handlers["onload"]` to get the `onload` callback type
 * @typedef {import('./events').EventHandlers} SunEditor.Event.Handlers
 */

/**
 * EventParams - Event callback parameters
 * @typedef {import('./events').BaseEvent} SunEditor.EventParams.BaseEvent
 * @typedef {import('./events').ClipboardEvent} SunEditor.EventParams.ClipboardEvent
 * @typedef {import('./events').FileManagementInfo} SunEditor.EventParams.FileManagementInfo
 * @typedef {import('./events').ProcessInfo} SunEditor.EventParams.ProcessInfo
 * @typedef {import('./events').ImageInfo} SunEditor.EventParams.ImageInfo
 * @typedef {import('./events').VideoInfo} SunEditor.EventParams.VideoInfo
 * @typedef {import('./events').AudioInfo} SunEditor.EventParams.AudioInfo
 * @typedef {import('./events').FileInfo} SunEditor.EventParams.FileInfo
 * @typedef {import('./events').EmbedInfo} SunEditor.EventParams.EmbedInfo
 */

/**
 * The event object passed to the plugin event handler
 * @typedef {import('./core/logic/shell/pluginManager').PluginEventParam} SunEditor.EventParams.PluginEvent
 */

// --------------------------------------------------------- [UI Types] ---------------------------------------------------------------------------------------------------
/**
 * Special toolbar control strings
 * - `"|"`: Vertical separator between buttons
 * - `"/"`: Line break (start new row)
 * - `":[title]-[icon]"`: More button with dropdown (e.g., `":More Button-default.more_vertical"`)
 * - `"-left"|"-right"`: Float alignment for button groups
 * - `"#fix"`: RTL direction fix
 * - `"%100"|"%50"`: Responsive breakpoint (percentage)
 *
 * @example
 * // Basic separators and layout
 * [['bold', 'italic', '|', 'underline'],]  // Separator between buttons
 * [['font', 'fontSize'], '/', ['align'],]  // Line break between rows
 *
 * // Float alignment
 * [['-right', 'undo', 'redo'],]          // Float right side
 *
 * // More button (collapsible group)
 * [[':Paragraph-More', 'fontSize', 'align'],]      // Dropdown with title
 *
 * // Responsive breakpoint
 * ['%50', ['bold', 'italic'],]           // Show at 50% width breakpoint
 *
 * @typedef {"|"|"/"|`-${"left"|"right"|"center"}`|"#fix"|`:${string}-${string}`|`%${number}`} SunEditor.UI.ButtonSpecial
 */

// ========================================================= [ButtonList Generate] ===================================================================================================
/**
 * === [ Button Types - Auto-generated ] ===
 * ---[ Auto-generated by scripts/check/gen-button-types.cjs - DO NOT EDIT MANUALLY ]---
 *
 * Default command buttons available in the toolbar
 * @typedef {"bold"|"underline"|"italic"|"strike"|"subscript"|"superscript"|"removeFormat"|"copyFormat"|"indent"|"outdent"|"fullScreen"|"showBlocks"|"codeView"|"undo"|"redo"|"preview"|"print"|"copy"|"dir"|"dir_ltr"|"dir_rtl"|"save"|"newDocument"|"selectAll"|"pageBreak"|"pageUp"|"pageDown"|"pageNavigator"} SunEditor.UI.ButtonCommand
 *
 * Plugin buttons available in the toolbar
 * @typedef {"blockquote"|"exportPDF"|"fileUpload"|"list_bulleted"|"list_numbered"|"mention"|"align"|"font"|"fontColor"|"backgroundColor"|"list"|"table"|"blockStyle"|"hr"|"layout"|"lineHeight"|"template"|"paragraphStyle"|"textStyle"|"link"|"image"|"video"|"audio"|"embed"|"math"|"drawing"|"imageGallery"|"videoGallery"|"audioGallery"|"fileGallery"|"fileBrowser"|"fontSize"|"pageNavigator"|"anchor"} SunEditor.UI.ButtonPlugin
 *
 * Single button item in the toolbar (includes special controls and custom strings)
 * @typedef {SunEditor.UI.ButtonCommand|SunEditor.UI.ButtonPlugin|SunEditor.UI.ButtonSpecial|string} SunEditor.UI.ButtonItem
 *
 * Button list configuration for the toolbar
 * Supports nested arrays, special controls, and responsive breakpoint configurations
 * @typedef {Array<SunEditor.UI.ButtonItem|SunEditor.UI.ButtonList|SunEditor.UI.ButtonSpecial>} SunEditor.UI.ButtonList
 * ///
 * ---[ End of auto-generated button types ]---
 */
