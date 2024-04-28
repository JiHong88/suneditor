import CoreInjector from '../editorInjector/_core';

const Modal = function (inst, element) {
	CoreInjector.call(this, inst.editor);

	// members
	this.inst = inst;
	this.kind = inst.constructor.key || inst.constructor.name;
	this.form = element;
	this.focusElement = element.querySelector('[data-focus]');
	this.isUpdate = false;
	this._modalArea = this.carrierWrapper.querySelector('.se-modal');
	this._modalBack = this.carrierWrapper.querySelector('.se-modal-back');
	this._modalInner = this.carrierWrapper.querySelector('.se-modal-inner');
	this._closeListener = [CloseListener.bind(this), OnClick_dialog.bind(this)];
	this._bindClose = null;
	this._onClickEvent = null;
	this._closeSignal = false;

	// add element
	this._modalInner.appendChild(element);

	// init
	this.eventManager.addEvent(element.querySelector('form'), 'submit', Action.bind(this));
	this._closeSignal = !this.eventManager.addEvent(element.querySelector('[data-command="close"]'), 'click', this.close.bind(this));
};

Modal.prototype = {
	/**
	 * @description Open a modal plugin
	 */
	open() {
		this.editor._offCurrentModal();
		this._fixCurrentController(true);

		if (this._closeSignal) this._modalInner.addEventListener('click', this._closeListener[1]);
		if (this._bindClose) this._bindClose = this.eventManager.removeGlobalEvent(this._bindClose);
		this._bindClose = this.eventManager.addGlobalEvent('keydown', this._closeListener[0]);
		this.isUpdate = this.kind === this.editor.currentControllerName;
		this.editor.opendModal = this;

		if (!this.isUpdate && typeof this.inst.init === 'function') this.inst.init();
		if (typeof this.inst.on === 'function') this.inst.on(this.isUpdate);

		this._modalArea.style.display = 'block';
		this._modalBack.style.display = 'block';
		this._modalInner.style.display = 'block';
		this.form.style.display = 'block';

		if (this.focusElement) this.focusElement.focus();
	},

	/**
	 * @description Close a modal plugin
	 * The plugin's "init" method is called.
	 */
	close() {
		this._fixCurrentController(false);
		this.editor.opendModal = null;

		if (this._closeSignal) this._modalInner.removeEventListener('click', this._closeListener[1]);
		if (this._bindClose) this._bindClose = this.eventManager.removeGlobalEvent(this._bindClose);

		// close
		this.form.style.display = 'none';
		this._modalBack.style.display = 'none';
		this._modalArea.style.display = 'none';

		if (typeof this.inst.init === 'function') this.inst.init();
		this.editor.focus();
	},

	_fixCurrentController(fixed) {
		const cont = this.editor.opendControllers;
		for (let i = 0; i < cont.length; i++) {
			cont[i].fixed = fixed;
			cont[i].form.style.display = fixed ? 'none' : 'block';
		}
	},

	constructor: Modal
};

/**
 * The loading bar is executed before "modalAction" is executed.
 * return type -
 * true : the loading bar and modal window are closed.
 * false : only the loading bar is closed.
 * undefined : only the modal window is closed.
 * -
 * exception occurs : the modal window and loading bar are closed.
 */
async function Action(e) {
	e.preventDefault();
	e.stopPropagation();

	this.editor.showLoading();

	try {
		const result = await this.inst.modalAction();
		if (result === false) {
			this.editor.hideLoading();
		} else if (result === undefined) {
			this.close();
		} else {
			this.close();
			this.editor.hideLoading();
		}
	} catch (error) {
		this.close();
		this.editor.hideLoading();
		throw Error(`[SUNEDITOR.Modal[${this.kind}].warn] ${error.message}`);
	}
}

function OnClick_dialog(e) {
	if (/close/.test(e.target.getAttribute('data-command')) || e.target === this._modalInner) {
		this.close();
	}
}

function CloseListener(e) {
	if (!/27/.test(e.keyCode)) return;
	this.close();
}

// HTML Creator ======================================================================================================

// Create a file input tag
Modal.CreateFileInput = function ({ icons, lang }, { acceptedFormats, allowMultiple }) {
	return /*html*/ `
	<div class="se-modal-form-files">
		<div class="se-flex-input-wrapper">
			<div class="se-input-form-abs">
				<div>
					<div class="se-input-file-w">
						<div class="se-input-file-icon-up">${icons.upload_tray}</div>
						<div class="se-input-file-icon-files">${icons.file_plus}</div>
						<span class="se-input-file-cnt"></span>
					</div>
				</div>
			</div>
			<input class="se-input-form __se__file_input" data-focus type="file" accept="${acceptedFormats}"${allowMultiple ? ' multiple="multiple"' : ''}/>
		</div>
		<button type="button" class="se-btn se-modal-files-edge-button se-file-remove" title="${lang.remove}" aria-label="${lang.remove}">${icons.selection_remove}</button>
	</div>`;
};
Modal.OnChangeFile = function (wrapper, files) {
	const fileCnt = wrapper.querySelector('.se-input-file-cnt');
	const fileUp = wrapper.querySelector('.se-input-file-icon-up');
	const fileSelected = wrapper.querySelector('.se-input-file-icon-files');

	if (files.length > 1) {
		fileUp.style.display = 'none';
		fileSelected.style.display = 'inline-block';
		fileCnt.style.display = '';
		fileCnt.textContent = ` ..${files.length}`;
	} else if (files.length > 0) {
		fileUp.style.display = 'none';
		fileSelected.style.display = 'none';
		fileCnt.style.display = 'block';
		fileCnt.textContent = files[0].name;
	} else {
		fileUp.style.display = 'inline-block';
		fileSelected.style.display = 'none';
		fileCnt.style.display = '';
		fileCnt.textContent = '';
	}
};

export default Modal;
