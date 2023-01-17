/**
 * @fileoverview Menu class
 * @author Yi JiHong.
 */

import Modal from '../../modules/Modal';
import { domUtils } from '../../helper';

const Notice = function (editor) {
	const modalEl = CreateHTML(editor);
	this.editor = editor;
	this.modal = new Modal(this, modalEl);
	this.message = modalEl.querySelector('span');
};

Notice.prototype = {
	/**
	 * @description  Open the notice panel
	 * @param {string} text Notice message
	 */
	open: function (text) {
		this.message.textContent = text;
		this.modal.open();
	},

	/**
	 * @description  Close the notice panel
	 */
	close: function () {
		this.modal.close();
	},

	constructor: Notice
};

function CreateHTML(editor) {
	let html = '<div><button class="close" data-command="close" title="' + editor.lang.close + '">' + editor.icons.cancel + '</button></div><div><span></span></div>';
	return domUtils.createElement('DIV', { class: 'se-notice' }, html);
}

export default Notice;
