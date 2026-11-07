## 3.4.3

### Changes

* Editing an image, video or audio without a new file or URL no longer re-submits the current source, so `onImageUploadBefore`, `onVideoUploadBefore` and `onAudioUploadBefore` fire only when the source is replaced and the stored file name and size are kept.

### Bugfix

* Fixed an issue where the image, video and audio file inputs did not show the selected file name when `createUrlInput` was `false`. [#1726](https://github.com/JiHong88/suneditor/issues/1726) ([@RClaudiuM](https://github.com/RClaudiuM))
* Fixed a bug where `image: { createUrlInput: false }` was ignored unless `createFileInput` was also set. [#1726](https://github.com/JiHong88/suneditor/issues/1726) ([@RClaudiuM](https://github.com/RClaudiuM))
* Fixed a bug where opening the audio edit modal threw an error when `createUrlInput` was `false`.
* Fixed a bug where the image, video and audio edit modals did not close on submit without a new file when `createUrlInput` was `false`, and video size and alignment changes were not applied.
* Fixed an issue where `markdownToHtml()` and `jsonToMarkdown()` lost the blank lines between the items of a loose list. [#1724](https://github.com/JiHong88/suneditor/issues/1724) ([@orshih6](https://github.com/orshih6))
* Fixed an issue where a numbered line other than `1.` inside a Markdown paragraph was split off into an ordered list. [#1724](https://github.com/JiHong88/suneditor/issues/1724) ([@orshih6](https://github.com/orshih6))

### Security

* Fixed a vulnerability where the language of a code block could inject HTML into the code block language button and menu. ([GHSA-j4jp-7r3h-rf28](https://github.com/JiHong88/suneditor/security/advisories/GHSA-j4jp-7r3h-rf28))
* Hardened class sanitizing so a `language-` class is kept only when the language name consists of letters, digits, `_`, `+`, `#`, `.` and `-`.
