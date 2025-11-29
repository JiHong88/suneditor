# SunEditor Type Definitions Guide

This document provides a comprehensive overview of all TypeScript types available in SunEditor.

---

## Table of Contents

- [Public API Types](#public-api-types)
    - [SunEditor (Root)](#suneditor-root)
    - [SunEditor.Module](#suneditormodule)
    - [SunEditor.Hook](#suneditorhook)
    - [SunEditor.HookParams](#suneditorhookparams)
- [Internal/Advanced Types](#internaladvanced-types)
    - [SunEditor.Event](#suneditorevent)
    - [SunEditor.EventParams](#suneditoreventparams)
    - [SunEditor.UI](#suneditorui)

---

## Public API Types

### SunEditor (Root)

Core types for editor initialization and usage.

| Type                            | Description                                           |
| ------------------------------- | ----------------------------------------------------- |
| `SunEditor.Instance`            | Main editor instance                                  |
| `SunEditor.InitOptions`         | Full initialization options (`EditorInitOptions`)     |
| `SunEditor.InitFrameOptions`    | Frame-specific initialization options                 |
| `SunEditor.Context`             | Editor context (Map-based)                            |
| `SunEditor.Options`             | Base options map (runtime)                            |
| `SunEditor.FrameContext`        | Frame context utility                                 |
| `SunEditor.FrameOptions`        | Frame options map (runtime)                           |
| `SunEditor.Injector`            | Editor injector for dependency injection              |
| `SunEditor.Status`              | Editor status object (focus, nodes, viewport, etc.)   |
| `SunEditor.ComponentInfo`       | Component metadata (target, container, caption, etc.) |
| `SunEditor.ComponentInsertType` | `"auto"` \| `"select"` \| `"line"` \| `"none"`        |
| `SunEditor.NodeCollection`      | `Array<Node>` \| `HTMLCollection` \| `NodeList`       |
| `SunEditor.Core`                | **@deprecated** Use `SunEditor.Instance` instead      |

---

### SunEditor.Module

Cross-module public API types.

#### Controller

| Type                               | Description                   |
| ---------------------------------- | ----------------------------- |
| `SunEditor.Module.Controller.Info` | Controller information object |

#### Figure

| Type                                          | Description                  |
| --------------------------------------------- | ---------------------------- |
| `SunEditor.Module.Figure.Info`                | Figure information object    |
| `SunEditor.Module.Figure.TargetInfo`          | Figure target information    |
| `SunEditor.Module.Figure.ControlButton`       | Figure control button config |
| `SunEditor.Module.Figure.ControlResize`       | Figure resize control config |
| `SunEditor.Module.Figure.ControlCustomAction` | Custom action handler        |
| `SunEditor.Module.Figure.Controls`            | Full controls configuration  |

#### Browser

| Type                            | Description         |
| ------------------------------- | ------------------- |
| `SunEditor.Module.Browser.File` | Browser file object |

#### HueSlider

| Type                               | Description                  |
| ---------------------------------- | ---------------------------- |
| `SunEditor.Module.HueSlider.Color` | Color object from hue slider |

---

### SunEditor.Hook

Hook method signatures for plugins and modules.

#### Event Hooks (Sync)

| Type                               | Description         |
| ---------------------------------- | ------------------- |
| `SunEditor.Hook.Event.Active`      | Active state change |
| `SunEditor.Hook.Event.OnFocus`     | Focus event         |
| `SunEditor.Hook.Event.OnBlur`      | Blur event          |
| `SunEditor.Hook.Event.OnMouseMove` | Mouse move event    |
| `SunEditor.Hook.Event.OnScroll`    | Scroll event        |

#### Event Hooks (Sync/Async)

| Type                                      | Async Version             | Description           |
| ----------------------------------------- | ------------------------- | --------------------- |
| `SunEditor.Hook.Event.OnBeforeInput`      | `OnBeforeInputAsync`      | Before input event    |
| `SunEditor.Hook.Event.OnInput`            | `OnInputAsync`            | Input event           |
| `SunEditor.Hook.Event.OnKeyDown`          | `OnKeyDownAsync`          | Key down event        |
| `SunEditor.Hook.Event.OnKeyUp`            | `OnKeyUpAsync`            | Key up event          |
| `SunEditor.Hook.Event.OnMouseDown`        | `OnMouseDownAsync`        | Mouse down event      |
| `SunEditor.Hook.Event.OnMouseUp`          | `OnMouseUpAsync`          | Mouse up event        |
| `SunEditor.Hook.Event.OnClick`            | `OnClickAsync`            | Click event           |
| `SunEditor.Hook.Event.OnMouseLeave`       | `OnMouseLeaveAsync`       | Mouse leave event     |
| `SunEditor.Hook.Event.OnFilePasteAndDrop` | `OnFilePasteAndDropAsync` | File paste/drop event |
| `SunEditor.Hook.Event.OnPaste`            | `OnPasteAsync`            | Paste event           |

#### Core Hooks

| Type                               | Description               |
| ---------------------------------- | ------------------------- |
| `SunEditor.Hook.Core.RetainFormat` | Format retention hook     |
| `SunEditor.Hook.Core.Shortcut`     | Keyboard shortcut handler |
| `SunEditor.Hook.Core.SetDir`       | Direction change handler  |
| `SunEditor.Hook.Core.Init`         | Initialization hook       |

#### Component Hooks

| Type                                | Description            |
| ----------------------------------- | ---------------------- |
| `SunEditor.Hook.Component.Select`   | Component selection    |
| `SunEditor.Hook.Component.Deselect` | Component deselection  |
| `SunEditor.Hook.Component.Edit`     | Component edit trigger |
| `SunEditor.Hook.Component.Destroy`  | Component destruction  |
| `SunEditor.Hook.Component.Copy`     | Component copy handler |

#### Modal Hooks

| Type                          | Description          |
| ----------------------------- | -------------------- |
| `SunEditor.Hook.Modal.Action` | Modal action handler |
| `SunEditor.Hook.Modal.On`     | Modal open handler   |
| `SunEditor.Hook.Modal.Init`   | Modal initialization |
| `SunEditor.Hook.Modal.Off`    | Modal close handler  |
| `SunEditor.Hook.Modal.Resize` | Modal resize handler |

#### Controller Hooks

| Type                               | Description               |
| ---------------------------------- | ------------------------- |
| `SunEditor.Hook.Controller.Action` | Controller action handler |
| `SunEditor.Hook.Controller.On`     | Controller open handler   |
| `SunEditor.Hook.Controller.Close`  | Controller close handler  |

#### Browser Hooks

| Type                          | Description            |
| ----------------------------- | ---------------------- |
| `SunEditor.Hook.Browser.Init` | Browser initialization |

#### ColorPicker Hooks

| Type                                        | Description            |
| ------------------------------------------- | ---------------------- |
| `SunEditor.Hook.ColorPicker.Action`         | Color selection action |
| `SunEditor.Hook.ColorPicker.HueSliderOpen`  | Hue slider open        |
| `SunEditor.Hook.ColorPicker.HueSliderClose` | Hue slider close       |

#### HueSlider Hooks

| Type                                    | Description       |
| --------------------------------------- | ----------------- |
| `SunEditor.Hook.HueSlider.Action`       | Hue slider action |
| `SunEditor.Hook.HueSlider.CancelAction` | Hue slider cancel |

---

### SunEditor.HookParams

Parameter types for hook methods.

| Type                                       | Description                                    |
| ------------------------------------------ | ---------------------------------------------- |
| `SunEditor.HookParams.MouseEvent`          | Mouse event info (frameContext, event, target) |
| `SunEditor.HookParams.KeyEvent`            | Keyboard event info                            |
| `SunEditor.HookParams.Shortcut`            | Shortcut info (command, key, event)            |
| `SunEditor.HookParams.FilePasteDrop`       | File paste/drop info                           |
| `SunEditor.HookParams.FocusBlur`           | Focus/blur event info                          |
| `SunEditor.HookParams.Scroll`              | Scroll event info                              |
| `SunEditor.HookParams.InputWithData`       | Input event with data                          |
| `SunEditor.HookParams.Paste`               | Paste event info                               |
| `SunEditor.HookParams.Mouse`               | Simple mouse event                             |
| `SunEditor.HookParams.Keyboard`            | Simple keyboard event                          |
| `SunEditor.HookParams.ToolbarInputKeyDown` | Toolbar input keydown event                    |
| `SunEditor.HookParams.ToolbarInputChange`  | Toolbar input change event                     |
| `SunEditor.HookParams.CopyComponent`       | Component copy info                            |

---

## Internal/Advanced Types

### SunEditor.Event

Event system types for EventManager.

| Type                         | Description                                      |
| ---------------------------- | ------------------------------------------------ |
| `SunEditor.Event.Info`       | Event registration info (target, type, listener) |
| `SunEditor.Event.GlobalInfo` | Global event info                                |
| `SunEditor.Event.Handlers`   | All event callback functions                     |

---

### SunEditor.EventParams

Event callback parameter types.

| Type                                       | Description                |
| ------------------------------------------ | -------------------------- |
| `SunEditor.EventParams.BaseEvent`          | Base event parameters      |
| `SunEditor.EventParams.ClipboardEvent`     | Clipboard event parameters |
| `SunEditor.EventParams.FileManagementInfo` | File management info       |
| `SunEditor.EventParams.ProcessInfo`        | Process info               |
| `SunEditor.EventParams.ImageInfo`          | Image-specific info        |
| `SunEditor.EventParams.VideoInfo`          | Video-specific info        |
| `SunEditor.EventParams.AudioInfo`          | Audio-specific info        |
| `SunEditor.EventParams.FileInfo`           | File-specific info         |
| `SunEditor.EventParams.EmbedInfo`          | Embed-specific info        |

---

### SunEditor.UI

UI and toolbar configuration types.

| Type                         | Description                                       |
| ---------------------------- | ------------------------------------------------- |
| `SunEditor.UI.ButtonCommand` | Built-in command button names                     |
| `SunEditor.UI.ButtonPlugin`  | Plugin button names                               |
| `SunEditor.UI.ButtonSpecial` | Special controls (`"\|"`, `"/"`, `"-left"`, etc.) |
| `SunEditor.UI.ButtonItem`    | Single button item                                |
| `SunEditor.UI.ButtonList`    | Full button list configuration                    |

#### ButtonSpecial Values

| Value                                  | Description               |
| -------------------------------------- | ------------------------- |
| `"\|"`                                 | Vertical separator        |
| `"/"`                                  | Line break (new row)      |
| `"-left"` \| `"-right"` \| `"-center"` | Float alignment           |
| `"#fix"`                               | RTL direction fix         |
| `":Title-icon"`                        | More button with dropdown |
| `"%50"` \| `"%100"`                    | Responsive breakpoint     |

---

## Usage Examples

### TypeScript

```typescript
import type { SunEditor } from 'suneditor';

// Editor instance
const editor: SunEditor.Instance = suneditor.init({ ... });

// Options
const options: SunEditor.InitOptions = {
  width: '100%',
  height: '400px',
  buttonList: [['bold', 'italic', '|', 'underline']]
};

// Hook parameters
function onKeyDown(params: SunEditor.HookParams.KeyEvent): void {
  const { event, frameContext } = params;
  // ...
}

// Component info
function handleComponent(info: SunEditor.ComponentInfo): void {
  console.log(info.pluginName, info.target);
}
```

### JSDoc

```javascript
/**
 * @param {SunEditor.HookParams.MouseEvent} params
 */
function onMouseDown(params) {
	const { event, frameContext, target } = params;
	// ...
}

/**
 * @type {SunEditor.InitOptions}
 */
const options = {
	plugins: [image, video],
	buttonList: [['image', 'video']],
};
```
