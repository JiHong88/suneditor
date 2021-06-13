import CoreInterface from "../../interface/_core";

const Notice = function (editor) {
	CoreInterface.call(this, editor);

	this.modal = core.util.createElement("DIV");
	this.message = core.util.createElement("SPAN");
	let notice_button = core.util.createElement("BUTTON");

	this.modal.className = "se-notice";
	notice_button.className = "close";
	notice_button.setAttribute("aria-label", "Close");
	notice_button.setAttribute("title", core.lang.dialogBox.close);
	notice_button.innerHTML = this.icons.cancel;

	this.modal.appendChild(this.message);
	this.modal.appendChild(notice_button);

	/** add event */
	this.editor.addEvent(notice_button, "click", OnClick_cancel.bind(this));

	/** append html */
	this.context.element.editorArea.appendChild(this.modal);

	notice_button = null;
};

Notice.prototype = {
	/**
	 * @description  Open the notice panel
	 * @param {String} text Notice message
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
