import type {} from '../typedef';
export default ClassInjector;
/**
 * @private
 * @description Add all inner classes to the editor instance.
 * @param {SunEditor.Core} editor - The root editor instance
 */
declare function ClassInjector(editor: SunEditor.Core): void;
declare class ClassInjector {
	/**
	 * @private
	 * @description Add all inner classes to the editor instance.
	 * @param {SunEditor.Core} editor - The root editor instance
	 */
	private constructor();
	/** @description Toolbar class instance @type {SunEditor.Core['toolbar']} */
	toolbar: SunEditor.Core['toolbar'];
	/** @description Sub-Toolbar class instance @type {SunEditor.Core['subToolbar']|null} */
	subToolbar: SunEditor.Core['subToolbar'] | null;
	/** @description Char class instance @type {SunEditor.Core['char']} */
	char: SunEditor.Core['char'];
	/** @description Component class instance @type {SunEditor.Core['component']} */
	component: SunEditor.Core['component'];
	/** @description Format class instance @type {SunEditor.Core['format']} */
	format: SunEditor.Core['format'];
	/** @description HTML class instance @type {SunEditor.Core['html']} */
	html: SunEditor.Core['html'];
	/** @description Inline format class instance @type {SunEditor.Core['inline']} */
	inline: SunEditor.Core['inline'];
	/** @description List format class instance @type {SunEditor.Core['listFormat']} */
	listFormat: SunEditor.Core['listFormat'];
	/** @description Menu class instance @type {SunEditor.Core['menu']} */
	menu: SunEditor.Core['menu'];
	/** @description NodeTransform class instance @type {SunEditor.Core['nodeTransform']} */
	nodeTransform: SunEditor.Core['nodeTransform'];
	/** @description Offset class instance @type {SunEditor.Core['offset']} */
	offset: SunEditor.Core['offset'];
	/** @description Selection class instance @type {SunEditor.Core['selection']} */
	selection: SunEditor.Core['selection'];
	/** @description Shortcuts class instance @type {SunEditor.Core['shortcuts']} */
	shortcuts: SunEditor.Core['shortcuts'];
	/** @description UI class instance @type {SunEditor.Core['ui']} */
	ui: SunEditor.Core['ui'];
	/** @description Viewer class instance @type {SunEditor.Core['viewer']} */
	viewer: SunEditor.Core['viewer'];
}
