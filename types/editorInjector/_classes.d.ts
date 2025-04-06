export default ClassInjector;
/**
 * @private
 * @description Add all inner classes to the editor instance.
 * @param {__se__EditorCore} editor - The root editor instance
 */
declare function ClassInjector(editor: __se__EditorCore): void;
declare class ClassInjector {
	/**
	 * @private
	 * @description Add all inner classes to the editor instance.
	 * @param {__se__EditorCore} editor - The root editor instance
	 */
	private constructor();
	/** @description Toolbar class instance @type {__se__EditorCore['toolbar']} */
	toolbar: __se__EditorCore['toolbar'];
	/** @description Sub-Toolbar class instance @type {__se__EditorCore['subToolbar']|null} */
	subToolbar: __se__EditorCore['subToolbar'] | null;
	/** @description Char class instance @type {__se__EditorCore['char']} */
	char: __se__EditorCore['char'];
	/** @description Component class instance @type {__se__EditorCore['component']} */
	component: __se__EditorCore['component'];
	/** @description Format class instance @type {__se__EditorCore['format']} */
	format: __se__EditorCore['format'];
	/** @description HTML class instance @type {__se__EditorCore['html']} */
	html: __se__EditorCore['html'];
	/** @description Menu class instance @type {__se__EditorCore['menu']} */
	menu: __se__EditorCore['menu'];
	/** @description NodeTransform class instance @type {__se__EditorCore['nodeTransform']} */
	nodeTransform: __se__EditorCore['nodeTransform'];
	/** @description Offset class instance @type {__se__EditorCore['offset']} */
	offset: __se__EditorCore['offset'];
	/** @description Selection class instance @type {__se__EditorCore['selection']} */
	selection: __se__EditorCore['selection'];
	/** @description Shortcuts class instance @type {__se__EditorCore['shortcuts']} */
	shortcuts: __se__EditorCore['shortcuts'];
	/** @description UI class instance @type {__se__EditorCore['ui']} */
	ui: __se__EditorCore['ui'];
	/** @description Viewer class instance @type {__se__EditorCore['viewer']} */
	viewer: __se__EditorCore['viewer'];
}
