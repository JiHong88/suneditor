## 3.4.3

### Bugfix

* Fixed an issue where the image, video and audio file inputs did not show the selected file name when `createUrlInput` was `false`. [#1726](https://github.com/JiHong88/suneditor/issues/1726) ([@RClaudiuM](https://github.com/RClaudiuM))
* Fixed a bug where `image: { createUrlInput: false }` was ignored unless `createFileInput` was also set. [#1726](https://github.com/JiHong88/suneditor/issues/1726) ([@RClaudiuM](https://github.com/RClaudiuM))
* Fixed a bug where opening the audio edit modal threw an error when `createUrlInput` was `false`.
* Fixed an issue where `markdownToHtml()` and `jsonToMarkdown()` lost the blank lines between the items of a loose list. [#1724](https://github.com/JiHong88/suneditor/issues/1724) ([@orshih6](https://github.com/orshih6))
* Fixed an issue where a numbered line other than `1.` inside a Markdown paragraph was split off into an ordered list. [#1724](https://github.com/JiHong88/suneditor/issues/1724) ([@orshih6](https://github.com/orshih6))

### Security

* Fixed a vulnerability where the language of a code block could inject HTML into the code block language button and menu. ([GHSA-j4jp-7r3h-rf28](https://github.com/JiHong88/suneditor/security/advisories/GHSA-j4jp-7r3h-rf28))
* Hardened class sanitizing so a `language-` class is kept only when the language name consists of letters, digits, `_`, `+`, `#`, `.` and `-`.
