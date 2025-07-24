import CoreInjector from './_core';
import ClassInjector from './_classes';

/**
 * @description Initializes and adds inner classes and default properties of the editor.
 * @param {__se__EditorCore} editor - The root editor instance
 */
function EditorInjector(editor) {
	// CoreInjector props
	/** @type {__se__EditorCore} */
	this.editor;
	/** @type {import('./_core').default['eventManager']} */
	this.eventManager;
	/** @type {import('./_core').default['instanceCheck']} */
	this.instanceCheck;
	/** @type {import('./_core').default['history']} */
	this.history;
	/** @type {import('./_core').default['events']} */
	this.events;
	/** @type {import('./_core').default['triggerEvent']} */
	this.triggerEvent;
	/** @type {import('./_core').default['carrierWrapper']} */
	this.carrierWrapper;
	/** @type {import('./_core').default['plugins']} */
	this.plugins;
	/** @type {import('./_core').default['status']} */
	this.status;
	/** @type {import('./_core').default['frameContext']}  */
	this.frameContext = editor.frameContext;
	/**  @type {import('./_core').default['frameOptions']} */
	this.frameOptions = editor.frameOptions;
	/** @type {import('./_core').default['context']} */
	this.context;
	/** @type {import('./_core').default['options']} */
	this.options;
	/** @type {import('./_core').default['icons']} */
	this.icons;
	/** @type {import('./_core').default['lang']} */
	this.lang;
	/** @type {import('./_core').default['frameRoots']} */
	this.frameRoots;
	/** @type {import('./_core').default['_w']} */
	this._w;
	/** @type {import('./_core').default['_d']} */
	this._d;

	// ClassInjector props
	/** @type {import('./_classes').default['toolbar']} */
	this.toolbar;
	/** @type {import('./_classes').default['subToolbar']} */
	this.subToolbar;
	/** @type {import('./_classes').default['char']} */
	this.char;
	/** @type {import('./_classes').default['component']} */
	this.component;
	/** @type {import('./_classes').default['format']} */
	this.format;
	/** @type {import('./_classes').default['html']} */
	this.html;
	/** @type {import('./_classes').default['menu']} */
	this.menu;
	/** @type {import('./_classes').default['nodeTransform']} */
	this.nodeTransform;
	/** @type {import('./_classes').default['offset']} */
	this.offset;
	/** @type {import('./_classes').default['selection']} */
	this.selection;
	/** @type {import('./_classes').default['shortcuts']} */
	this.shortcuts;
	/** @type {import('./_classes').default['ui']} */
	this.ui;
	/** @type {import('./_classes').default['viewer']} */
	this.viewer;

	CoreInjector.call(this, editor);
	ClassInjector.call(this, editor);
}

export default EditorInjector;
