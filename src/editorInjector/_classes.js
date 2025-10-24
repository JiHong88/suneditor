/**
 * @private
 * @description Add all inner classes to the editor instance.
 * @param {SunEditor.Core} editor - The root editor instance
 */
function ClassInjector(editor) {
	/** @description Toolbar class instance @type {SunEditor.Core['toolbar']} */
	this.toolbar = editor.toolbar;
	/** @description Sub-Toolbar class instance @type {SunEditor.Core['subToolbar']|null} */
	this.subToolbar = null;
	if (editor.subToolbar) this.subToolbar = editor.subToolbar;
	/** @description Char class instance @type {SunEditor.Core['char']} */
	this.char = editor.char;
	/** @description Component class instance @type {SunEditor.Core['component']} */
	this.component = editor.component;
	/** @description Format class instance @type {SunEditor.Core['format']} */
	this.format = editor.format;
	/** @description HTML class instance @type {SunEditor.Core['html']} */
	this.html = editor.html;
	/** @description Inline format class instance @type {SunEditor.Core['inline']} */
	this.inline = editor.inline;
	/** @description List format class instance @type {SunEditor.Core['listFormat']} */
	this.listFormat = editor.listFormat;
	/** @description Menu class instance @type {SunEditor.Core['menu']} */
	this.menu = editor.menu;
	/** @description NodeTransform class instance @type {SunEditor.Core['nodeTransform']} */
	this.nodeTransform = editor.nodeTransform;
	/** @description Offset class instance @type {SunEditor.Core['offset']} */
	this.offset = editor.offset;
	/** @description Selection class instance @type {SunEditor.Core['selection']} */
	this.selection = editor.selection;
	/** @description Shortcuts class instance @type {SunEditor.Core['shortcuts']} */
	this.shortcuts = editor.shortcuts;
	/** @description UI class instance @type {SunEditor.Core['ui']} */
	this.ui = editor.ui;
	/** @description Viewer class instance @type {SunEditor.Core['viewer']} */
	this.viewer = editor.viewer;
}

export default ClassInjector;
