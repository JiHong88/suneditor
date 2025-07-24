export default EditorInjector;
/**
 * @description Initializes and adds inner classes and default properties of the editor.
 * @param {__se__EditorCore} editor - The root editor instance
 */
declare function EditorInjector(editor: __se__EditorCore): void;
declare class EditorInjector {
	/**
	 * @description Initializes and adds inner classes and default properties of the editor.
	 * @param {__se__EditorCore} editor - The root editor instance
	 */
	constructor(editor: __se__EditorCore);
	/** @type {__se__EditorCore} */
	editor: __se__EditorCore;
	/** @type {import('./_core').default['eventManager']} */
	eventManager: import('./_core').default['eventManager'];
	/** @type {import('./_core').default['instanceCheck']} */
	instanceCheck: import('./_core').default['instanceCheck'];
	/** @type {import('./_core').default['history']} */
	history: import('./_core').default['history'];
	/** @type {import('./_core').default['events']} */
	events: import('./_core').default['events'];
	/** @type {import('./_core').default['triggerEvent']} */
	triggerEvent: import('./_core').default['triggerEvent'];
	/** @type {import('./_core').default['carrierWrapper']} */
	carrierWrapper: import('./_core').default['carrierWrapper'];
	/** @type {import('./_core').default['plugins']} */
	plugins: import('./_core').default['plugins'];
	/** @type {import('./_core').default['status']} */
	status: import('./_core').default['status'];
	/** @type {import('./_core').default['frameContext']}  */
	frameContext: import('./_core').default['frameContext'];
	/**  @type {import('./_core').default['frameOptions']} */
	frameOptions: import('./_core').default['frameOptions'];
	/** @type {import('./_core').default['context']} */
	context: import('./_core').default['context'];
	/** @type {import('./_core').default['options']} */
	options: import('./_core').default['options'];
	/** @type {import('./_core').default['icons']} */
	icons: import('./_core').default['icons'];
	/** @type {import('./_core').default['lang']} */
	lang: import('./_core').default['lang'];
	/** @type {import('./_core').default['frameRoots']} */
	frameRoots: import('./_core').default['frameRoots'];
	/** @type {import('./_core').default['_w']} */
	_w: import('./_core').default['_w'];
	/** @type {import('./_core').default['_d']} */
	_d: import('./_core').default['_d'];
	/** @type {import('./_classes').default['toolbar']} */
	toolbar: import('./_classes').default['toolbar'];
	/** @type {import('./_classes').default['subToolbar']} */
	subToolbar: import('./_classes').default['subToolbar'];
	/** @type {import('./_classes').default['char']} */
	char: import('./_classes').default['char'];
	/** @type {import('./_classes').default['component']} */
	component: import('./_classes').default['component'];
	/** @type {import('./_classes').default['format']} */
	format: import('./_classes').default['format'];
	/** @type {import('./_classes').default['html']} */
	html: import('./_classes').default['html'];
	/** @type {import('./_classes').default['menu']} */
	menu: import('./_classes').default['menu'];
	/** @type {import('./_classes').default['nodeTransform']} */
	nodeTransform: import('./_classes').default['nodeTransform'];
	/** @type {import('./_classes').default['offset']} */
	offset: import('./_classes').default['offset'];
	/** @type {import('./_classes').default['selection']} */
	selection: import('./_classes').default['selection'];
	/** @type {import('./_classes').default['shortcuts']} */
	shortcuts: import('./_classes').default['shortcuts'];
	/** @type {import('./_classes').default['ui']} */
	ui: import('./_classes').default['ui'];
	/** @type {import('./_classes').default['viewer']} */
	viewer: import('./_classes').default['viewer'];
}
