/**
 * @fileoverview Menu class
 */

import Modal from '../../modules/Modal';
import { domUtils } from '../../helper';

const Notice = function (editor) {
	const modalEl = CreateHTML(editor);

	// members
	this.editor = editor;
	this.modal = new Modal(this, modalEl);
	this.message = modalEl.querySelector('span');
};

Notice.prototype = {
	/**
	 * @description  Open the notice panel
	 * @param {string} text Notice message
	 */
	open(text) {
		this.message.textContent = text;
		this.modal.open();
	},

	/**
	 * @description  Close the notice panel
	 */
	close() {
		this.modal.close();
	},

	constructor: Notice
};

function CreateHTML({ lang, icons }) {
	let html = '<div><button class="close" data-command="close" title="' + lang.close + '">' + icons.cancel + '</button></div><div><span></span></div>';
	return domUtils.createElement('DIV', { class: 'se-notice' }, html);
}

export default Notice;
