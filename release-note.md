## 3.4.2

### New Feature

* Typing `>` followed by Space at the start of a line now turns it into a blockquote; set `shortcuts: { blockquote: undefined }` to turn it off.

### Enhancement

* Esc now hides the balloon toolbar (`mode: 'balloon'`, `'balloon-always'`, and `subToolbar` in those modes) while keeping the selection, and an open dropdown or controller is closed first.
* Improved pasting from Word Online so dark cursor-marker blocks and extra wrappers are removed and blank lines are kept. [#1717](https://github.com/JiHong88/suneditor/issues/1717) ([@HamzaA598](https://github.com/HamzaA598))
* Added the `msOffice.isMSOffice()` helper.

### Changes

* The balloon toolbar and the controllers no longer draw a pointer arrow toward their target, and the balloon toolbar sits 10px from the selection instead of 12px; custom CSS can show the arrow again.
* Active toolbar and menu buttons in the `dark`, `midnight` and `cobalt` themes now use a tinted fill with a bright accent icon.
* An `iframe_attributes.sandbox` value is now kept as given with only `allow-same-origin` added, instead of also gaining `allow-scripts`; include `allow-scripts` to keep the editor working in Safari and iOS browsers. [#1716](https://github.com/JiHong88/suneditor/issues/1716)
* Text pasted from Word no longer keeps `color: windowtext` outside links, so it follows the editor theme color. [#1717](https://github.com/JiHong88/suneditor/issues/1717)

### Bugfix

* Fixed an issue where editing a link's display text removed the inline formatting wrapping the link text.
* Fixed a bug where dropping a dragged selection onto itself moved the text to the start of the line or emptied a link.
* Fixed a bug where moved content could land away from the point where it was dropped.
* Fixed an issue where content dropped onto an image, video, inline component or math formula was inserted inside it and broke the component.
* Fixed a bug where pasting or dropping over a selection that left only whitespace removed that whitespace and its formatting and inserted the content on the next line.
* Fixed a bug where `$.eventManager.addEvent()` and `removeEvent()` threw a `SecurityError` on an `iframe`-mode editor that contained embedded frames, such as a video.
* Fixed an issue where a line break inside text was deleted instead of becoming a space, joining words, in `html.set()`, paste, code view and Markdown view. [#1714](https://github.com/JiHong88/suneditor/issues/1714)
* Fixed an issue where code blocks lost their line breaks in code view, Markdown view and `jsonToMarkdown()`. [#1714](https://github.com/JiHong88/suneditor/issues/1714)
* Fixed an issue where Markdown view and `jsonToMarkdown()` escaped every `]` in text but left brackets in link text and image `alt` unescaped, breaking Markdown round trips. [#1714](https://github.com/JiHong88/suneditor/issues/1714)
* Fixed a bug where `markdownToHtml()` misread link and image text containing brackets.
* Fixed a bug where `editor.destroy()` threw an error and left the editor partly torn down when CodeMirror was enabled.
* Fixed an issue where the block handle area stayed visible in code view and Markdown view, narrowing the source frame.
* Fixed a bug where `html.get()` and `getContents()` replaced a table cell with `<br>` when its only content was a component or an `hr`. [#1721](https://github.com/JiHong88/suneditor/issues/1721)
* Fixed an issue where the link modal always showed the title and display text inputs, ignoring `link: { title: false, textToDisplay: false }`. [#1722](https://github.com/JiHong88/suneditor/issues/1722)
