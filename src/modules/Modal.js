import CoreInjector from '../editorInjector/_core';
import { CreateTooltipInner } from '../core/section/constructor';
import { domUtils, env } from '../helper';

const { _w } = env;
const DIRECTION_CURSOR_MAP = { w: 'ns-resize', h: 'ew-resize', c: 'nwse-resize', wRTL: 'ns-resize', hRTL: 'ew-resize', cRTL: 'nesw-resize' };

/**
 * @class
 * @description Modal window module
 * @param {*} inst The instance object that called the constructor.
 * @param {Element} element Modal element
 */
const Modal = function (inst, element) {
	CoreInjector.call(this, inst.editor);
	this.offset = this.editor.offset;
	this.ui = this.editor.ui;

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
	// resie
	this._resizeBody = null;

	// add element
	this._modalInner.appendChild(element);

	// init
	this.eventManager.addEvent(element.querySelector('form'), 'submit', Action.bind(this));
	this._closeSignal = !this.eventManager.addEvent(element.querySelector('[data-command="close"]'), 'click', this.close.bind(this));

	// resize
	if (element.querySelector('.se-modal-resize-handle-w') || element.querySelector('.se-modal-resize-handle-h') || element.querySelector('.se-modal-resize-handle-c') || element.querySelector('.se-modal-resize-form')) {
		if (!(this._resizeBody = element.querySelector('.se-modal-resize-form')) && (this._resizeBody = element.querySelector('.se-modal-body'))) {
			this.eventManager.addEvent(element.querySelector('.se-modal-resize-handle-w'), 'mousedown', OnResizeMouseDown.bind(this, 'w'));
			this.eventManager.addEvent(element.querySelector('.se-modal-resize-handle-h'), 'mousedown', OnResizeMouseDown.bind(this, 'h'));
			this.eventManager.addEvent(element.querySelector('.se-modal-resize-handle-c'), 'mousedown', OnResizeMouseDown.bind(this, 'c'));

			this._currentHandle = null;
			this.__resizeDir = '';
			this.__offetTop = 0;
			this.__offetLeft = 0;
			this.__globalEventHandlers = {
				mousemove: OnResize.bind(this),
				mouseup: OnResizeMouseUp.bind(this)
			};
			this._bindClose_mousemove = null;
			this._bindClose_mouseup = null;
		}
	}
};

Modal.prototype = {
	/**
	 * @description Open a modal plugin
	 * The plugin's "init" method is called.
	 */
	open() {
		this.ui._offCurrentModal();
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

		if (this._resizeBody) {
			const offset = this._saveOffset();
			const { maxWidth, maxHeight } = _w.getComputedStyle(this.form);
			const mw = `${this.form.offsetWidth - offset.width}px`;
			const mh = `${this.form.offsetTop + (this.form.offsetHeight - this._resizeBody.offsetHeight)}px`;
			// set max
			if (maxWidth && typeof this.__resizeDir === 'string') domUtils.setStyle(this._resizeBody, 'max-width', `calc(${maxWidth} - ${mw})`);
			if (maxHeight) domUtils.setStyle(this._resizeBody, 'max-height', `calc(${maxHeight} - ${mh})`);
		}

		if (this.focusElement) this.focusElement.focus();
	},

	/**
	 * @description Close a modal plugin
	 * The plugin's "init" and "off" method is called.
	 */
	close() {
		this.__removeGlobalEvent();
		this._fixCurrentController(false);
		_w.setTimeout(() => {
			this.editor.opendModal = null;
		}, 0);

		if (this._closeSignal) this._modalInner.removeEventListener('click', this._closeListener[1]);
		if (this._bindClose) this._bindClose = this.eventManager.removeGlobalEvent(this._bindClose);

		// close
		this.form.style.display = 'none';
		this._modalBack.style.display = 'none';
		this._modalArea.style.display = 'none';

		if (typeof this.inst.init === 'function') this.inst.init();
		if (typeof this.inst.off === 'function') this.inst.off(this.isUpdate);
		this.editor.focus();
	},

	_fixCurrentController(fixed) {
		const cont = this.editor.opendControllers;
		for (let i = 0; i < cont.length; i++) {
			cont[i].fixed = fixed;
			cont[i].form.style.display = fixed ? 'none' : 'block';
		}
	},

	_saveOffset() {
		const offset = this.offset.getGlobal(this._resizeBody);
		this.__offetTop = offset.top;
		this.__offetLeft = offset.left;
		return offset;
	},

	__addGlobalEvent(dir) {
		this.__removeGlobalEvent();
		this.ui.enableBackWrapper(DIRECTION_CURSOR_MAP[dir]);
		this._bindClose_mousemove = this.eventManager.addGlobalEvent('mousemove', this.__globalEventHandlers.mousemove, true);
		this._bindClose_mouseup = this.eventManager.addGlobalEvent('mouseup', this.__globalEventHandlers.mouseup, true);
	},

	__removeGlobalEvent() {
		this.ui.disableBackWrapper();
		if (this._bindClose_mousemove) this._bindClose_mousemove = this.eventManager.removeGlobalEvent(this._bindClose_mousemove);
		if (this._bindClose_mouseup) this._bindClose_mouseup = this.eventManager.removeGlobalEvent(this._bindClose_mouseup);
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

	this.ui.showLoading();

	try {
		const result = await this.inst.modalAction();
		if (result === false) {
			this.ui.hideLoading();
		} else if (result === undefined) {
			this.close();
		} else {
			this.close();
			this.ui.hideLoading();
		}
	} catch (error) {
		this.close();
		this.ui.hideLoading();
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

/** Resize events */
function OnResizeMouseDown(dir, e) {
	domUtils.addClass((this._currentHandle = e.target), 'active');
	this.__addGlobalEvent((this.__resizeDir = dir + (this.options.get('_rtl') ? 'RTL' : '')));
}

function OnResize(e) {
	switch (this.__resizeDir) {
		case 'w':
		case 'wRTL': {
			const h = e.clientY - this.__offetTop - this._resizeBody.offsetHeight;
			this._resizeBody.style.height = this._resizeBody.offsetHeight + h + 'px';
			break;
		}
		case 'h': {
			const w = e.clientX - this.__offetLeft - this._resizeBody.offsetWidth;
			this._resizeBody.style.width = this._resizeBody.offsetWidth + w + 'px';
			break;
		}
		case 'hRTL': {
			const w = this.__offetLeft - e.clientX;
			this._resizeBody.style.width = this._resizeBody.offsetWidth + w + 'px';
			break;
		}
		case 'c': {
			const w = e.clientX - this.__offetLeft - this._resizeBody.offsetWidth;
			const h = e.clientY - this.__offetTop - this._resizeBody.offsetHeight;
			this._resizeBody.style.width = this._resizeBody.offsetWidth + w + 'px';
			this._resizeBody.style.height = this._resizeBody.offsetHeight + h + 'px';
			break;
		}
		case 'cRTL': {
			const w = this.__offetLeft - e.clientX;
			const h = e.clientY - this.__offetTop - this._resizeBody.offsetHeight;
			this._resizeBody.style.width = this._resizeBody.offsetWidth + w + 'px';
			this._resizeBody.style.height = this._resizeBody.offsetHeight + h + 'px';
			break;
		}
	}

	this._saveOffset();

	if (typeof this.inst.modalResize === 'function') this.inst.modalResize();
}

function OnResizeMouseUp() {
	domUtils.removeClass(this._currentHandle, 'active');
	this._currentHandle = null;
	this.__removeGlobalEvent();
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
		<button type="button" class="se-btn se-modal-files-edge-button se-file-remove se-tooltip" aria-label="${lang.remove}">
			${icons.selection_remove}
			${CreateTooltipInner(lang.remove)}
		</button>
	</div>`;
};
Modal.OnChangeFile = function (wrapper, files) {
	if (!wrapper || !files) return;

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
