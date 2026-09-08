### fix

- Clicking the code block hover language button while the editor had focus closed the hover UI without opening the select menu — the unprevented mousedown blurred the wysiwyg, and the blur handler closes every non-fixed controller mid-press (`plugins/command/codeBlock`)
- Block handle (and its line highlight) stayed visible when it should have gone away — while typing, and over the toolbar when its block scrolled out of the editing area (`core/logic/panel/blockHandle`, `core/event/eventOrchestrator`, `core/event/handlers/handler_ww_key`)
- After opening a component's edit dialog (image, video, ...), pasting or dropping another file failed with a console error — the modal's update mode outlived the closed dialog, sending the upload down the update path with no target (`modules/contract/Modal`) #1688
