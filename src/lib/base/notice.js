import EditorInterface from "../../interface/editor";
import {
	domUtils
} from "../../helper";

const Notice = function (editor) {
	EditorInterface.call(this, editor);

	this.modal = domUtils.createElement("DIV", {
		class: "se-notice"
	}, null);

	this.message = domUtils.createElement("SPAN");
	let notice_button = domUtils.createElement("BUTTON", {
			class: "close",
			"aria-label": "Close",
			title: editor.lang.dialogBox.close
		},
		this.icons.cancel);

	this.modal.appendChild(this.message);
	this.modal.appendChild(notice_button);

	/** add event */
	this.__core.eventManager.addEvent(notice_button, "click", OnClick_cancel.bind(this));

	/** append html */
	this.context.element.editorArea.appendChild(this.modal);

	notice_button = null;
};

Notice.prototype = {
	/**
	 * @description  Open the notice panel
	 * @param {string} text Notice message
	 */
	open: function (text) {
		this.message.textContent = text;
		this.modal.style.display = "block";
	},

	/**
	 * @description  Close the notice panel
	 */
	close: function () {
		this.modal.style.display = "none";
	},

	constructor: Notice
};

/**
 * @description Event when clicking the cancel button
 * @param {MouseEvent} e Event object
 */
function OnClick_cancel(e) {
	e.preventDefault();
	e.stopPropagation();
	this.close.call(this);
}

export default Notice;