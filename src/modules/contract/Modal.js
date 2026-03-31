import { dom, env, keyCodeMap } from '../../helper';

const { _w } = env;
const DIRECTION_CURSOR_MAP = { w: 'ns-resize', h: 'ew-resize', c: 'nwse-resize', wRTL: 'ns-resize', hRTL: 'ew-resize', cRTL: 'nesw-resize' };

/**
 * @class
 * @description Modal window module
 */
class Modal {
	#$;

	/** @type {HTMLElement} */
	#modalArea;
	/** @type {HTMLElement} */
	#modalInner;
	/** @type {HTMLElement} */
	#resizeBody;
	#closeListener;
	#globalEventHandlers;

	#bindClose = null;
	#hasNoCloseButton = false;
	#bindCloseClick = null;
	#currentHandle = null;
	#resizeDir = '';
	#offetTop = 0;
	#offetLeft = 0;
	#bindClose_mousemove = null;
	#bindClose_mouseup = null;

	/**
	 * @description Modal window module
	 * @param {*} inst The instance object that called the constructor.
	 * @param {SunEditor.Deps} $ Kernel dependencies
	 * @param {Element} element Modal element
	 */
	constructor(inst, $, element) {
		this.#$ = $;

		// members
		this.inst = inst;
		this.kind = inst.constructor.key || inst.constructor.name;
		this.form = /** @type {HTMLElement} */ (element);
		this.isUpdate = false;

		/** @type {HTMLInputElement} */
		this.focusElement = element.querySelector('[data-focus]');

		this.#modalArea = this.#$.contextProvider.carrierWrapper.querySelector('.se-modal');
		this.#modalInner = this.#$.contextProvider.carrierWrapper.querySelector('.se-modal .se-modal-inner');
		this.#closeListener = [this.#CloseListener.bind(this), this.#OnClick_dialog.bind(this)];

		// add element
		this.#modalInner.appendChild(element);

		// init
		this.#$.eventManager.addEvent(element.querySelector('form'), 'submit', this.#Action.bind(this));
		this.#hasNoCloseButton = !this.#$.eventManager.addEvent(element.querySelector('[data-command="close"]'), 'click', this.close.bind(this));

		// resize
		if (element.querySelector('.se-modal-resize-handle-w') || element.querySelector('.se-modal-resize-handle-h') || element.querySelector('.se-modal-resize-handle-c') || element.querySelector('.se-modal-resize-form')) {
			if (!(this.#resizeBody = element.querySelector('.se-modal-resize-form')) && (this.#resizeBody = element.querySelector('.se-modal-body'))) {
				this.#$.eventManager.addEvent(element.querySelector('.se-modal-resize-handle-w'), 'mousedown', this.#OnResizeMouseDown.bind(this, 'w'));
				this.#$.eventManager.addEvent(element.querySelector('.se-modal-resize-handle-h'), 'mousedown', this.#OnResizeMouseDown.bind(this, 'h'));
				this.#$.eventManager.addEvent(element.querySelector('.se-modal-resize-handle-c'), 'mousedown', this.#OnResizeMouseDown.bind(this, 'c'));

				this.#globalEventHandlers = {
					mousemove: this.#OnResize.bind(this),
					mouseup: this.#OnResizeMouseUp.bind(this),
				};
			}
		}
	}

	/**
	 * @description Create a file input tag in the modal window.
	 * @param {{icons: SunEditor.Deps['icons'], lang: SunEditor.Deps['lang']}} param0 - icons and language object
	 * @param {{acceptedFormats?: string, allowMultiple?: boolean}} param1 - options
	 * - acceptedFormats: `"image/*, video/*, audio/*"`, etc.
	 * - allowMultiple: `true` or `false`
	 * @returns {string} HTML string
	 * @example
	 * // Inside a plugin's modal HTML template:
	 * const html = Modal.CreateFileInput(
	 *   { icons, lang },
	 *   { acceptedFormats: 'image/*', allowMultiple: true }
	 * );
	 */
	static CreateFileInput({ icons, lang }, { acceptedFormats, allowMultiple }) {
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
				${dom.utils.createTooltipInner(lang.remove)}
			</button>
		</div>`;
	}

	/**
	 * @description A function called when the contents of `input` have changed and you want to adjust the style.
	 * @param {Element} wrapper - Modal file input wrapper(`.se-flex-input-wrapper`)
	 * @param {FileList|File[]} files - FileList object
	 */
	static OnChangeFile(wrapper, files) {
		if (!wrapper || !files) return;

		const fileCnt = /** @type {HTMLElement} */ (wrapper.querySelector('.se-input-file-cnt'));
		const fileUp = /** @type {HTMLElement} */ (wrapper.querySelector('.se-input-file-icon-up'));
		const fileSelected = /** @type {HTMLElement} */ (wrapper.querySelector('.se-input-file-icon-files'));

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
	}

	/**
	 * @description Open a modal plugin
	 * - The plugin's `init` method is called.
	 */
	open() {
		this.#$.ui.offCurrentModal();
		this.#fixCurrentController(true);

		if (this.#hasNoCloseButton) {
			if (this.#bindCloseClick) this.#$.eventManager.removeEvent(this.#bindCloseClick);
			this.#bindCloseClick = this.#$.eventManager.addEvent(this.#modalInner, 'click', this.#closeListener[1]);
		}

		this.#bindClose &&= this.#$.eventManager.removeGlobalEvent(this.#bindClose);
		this.#bindClose = this.#$.eventManager.addGlobalEvent('keydown', this.#closeListener[0]);
		this.isUpdate = this.kind === this.#$.ui.currentControllerName;
		this.#$.ui.opendModal = this;

		if (!this.isUpdate) this.inst.modalInit?.();
		this.inst.modalOn?.(this.isUpdate);

		dom.utils.addClass(this.#modalArea, 'se-backdrop-show');
		dom.utils.addClass(this.form, 'se-modal-show');

		if (this.#resizeBody) {
			const offset = this.#saveOffset();
			const { maxWidth, maxHeight } = _w.getComputedStyle(this.form);
			const mw = `${this.form.offsetWidth - offset.width}px`;
			const mh = `${this.form.offsetTop + (this.form.offsetHeight - this.#resizeBody.offsetHeight)}px`;
			// set max
			if (maxWidth && typeof this.#resizeDir === 'string') dom.utils.setStyle(this.#resizeBody, 'max-width', `calc(${maxWidth} - ${mw})`);
			if (maxHeight) dom.utils.setStyle(this.#resizeBody, 'max-height', `calc(${maxHeight} - ${mh})`);
		}

		if (this.focusElement) this.focusElement.focus();
	}

	/**
	 * @description Close a modal plugin
	 * - The plugin's `init` and `modalOff` method is called.
	 */
	close() {
		this.#removeGlobalEvent();
		this.#fixCurrentController(false);
		_w.setTimeout(() => {
			this.#$.ui.opendModal = null;
		}, 0);

		if (this.#hasNoCloseButton) {
			if (this.#bindCloseClick) {
				this.#$.eventManager.removeEvent(this.#bindCloseClick);
				this.#bindCloseClick = null;
			}
		}

		this.#bindClose &&= this.#$.eventManager.removeGlobalEvent(this.#bindClose);

		// close
		dom.utils.removeClass(this.#modalArea, 'se-backdrop-show');
		dom.utils.removeClass(this.form, 'se-modal-show');

		this.inst.modalInit?.();
		this.inst.modalOff?.(this.isUpdate);

		if (!this.isUpdate) this.#$.focusManager.focus();
	}

	/**
	 * @description Fixes the current controller's display state when the modal is opened or closed.
	 * @param {boolean} fixed - Whether to fix or unfix the controller.
	 */
	#fixCurrentController(fixed) {
		const cont = this.#$.ui.opendControllers;
		for (let i = 0; i < cont.length; i++) {
			cont[i].fixed = fixed;
			cont[i].form.style.display = fixed ? 'none' : 'block';
		}
	}

	/**
	 * @description Saves the current offset position of the modal for resizing calculations.
	 * @returns {import('../../core/logic/dom/offset').OffsetGlobalInfo} The offset position of the modal.
	 */
	#saveOffset() {
		const offset = this.#$.offset.getGlobal(this.#resizeBody);
		this.#offetTop = offset.top;
		this.#offetLeft = offset.left;
		return offset;
	}

	/**
	 * @description Adds global event listeners for resizing the modal.
	 * @param {string} dir - The direction in which resizing is occurring.
	 */
	#addGlobalEvent(dir) {
		this.#removeGlobalEvent();
		this.#$.ui.enableBackWrapper(DIRECTION_CURSOR_MAP[dir]);
		this.#bindClose_mousemove = this.#$.eventManager.addGlobalEvent('mousemove', this.#globalEventHandlers.mousemove, true);
		this.#bindClose_mouseup = this.#$.eventManager.addGlobalEvent('mouseup', this.#globalEventHandlers.mouseup, true);
	}

	/**
	 * @description Removes global event listeners related to modal resizing.
	 */
	#removeGlobalEvent() {
		this.#$.ui.disableBackWrapper();
		this.#bindClose_mousemove &&= this.#$.eventManager.removeGlobalEvent(this.#bindClose_mousemove);
		this.#bindClose_mouseup &&= this.#$.eventManager.removeGlobalEvent(this.#bindClose_mouseup);
	}

	/**
	 * The loading bar is executed before `modalAction` is executed.
	 * return type -
	 * `true` : the loading bar and modal window are closed.
	 * `false` : only the loading bar is closed.
	 * `undefined` : only the modal window is closed.
	 * -
	 * exception occurs : the modal window and loading bar are closed.
	 * @param {SubmitEvent} e - Event object
	 */
	async #Action(e) {
		e.preventDefault();
		e.stopPropagation();

		this.#$.ui.showLoading();

		try {
			const result = await this.inst.modalAction();
			if (result === false) {
				this.#$.ui.hideLoading();
			} else if (result === undefined) {
				this.close();
			} else {
				this.close();
				this.#$.ui.hideLoading();
			}
		} catch (error) {
			this.close();
			this.#$.ui.hideLoading();
			throw Error(`[SUNEDITOR.Modal[${this.kind}].warn] ${error.message}`);
		}
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#OnClick_dialog(e) {
		const eventTarget = dom.query.getEventTarget(e);
		if (/close/.test(eventTarget.getAttribute('data-command')) || eventTarget === this.#modalInner) {
			this.close();
		}
	}

	/**
	 * @param {KeyboardEvent} e - Event object
	 */
	#CloseListener(e) {
		if (!keyCodeMap.isEsc(e.code)) return;
		this.close();
	}

	/** ---------- Resize events ---------- */
	/**
	 * @param {string} dir - The direction in which the resize handle is located.
	 * @param {MouseEvent} e - Event object
	 */
	#OnResizeMouseDown(dir, e) {
		this.#currentHandle = dom.query.getEventTarget(e);
		dom.utils.addClass(this.#currentHandle, 'active');
		this.#addGlobalEvent((this.#resizeDir = dir + (this.#$.options.get('_rtl') ? 'RTL' : '')));
	}

	/**
	 * @param {MouseEvent} e - Event object
	 */
	#OnResize(e) {
		switch (this.#resizeDir) {
			case 'w':
			case 'wRTL': {
				const h = e.clientY - this.#offetTop - this.#resizeBody.offsetHeight;
				this.#resizeBody.style.height = this.#resizeBody.offsetHeight + h + 'px';
				break;
			}
			case 'h': {
				const w = e.clientX - this.#offetLeft - this.#resizeBody.offsetWidth;
				this.#resizeBody.style.width = this.#resizeBody.offsetWidth + w + 'px';
				break;
			}
			case 'hRTL': {
				const w = this.#offetLeft - e.clientX;
				this.#resizeBody.style.width = this.#resizeBody.offsetWidth + w + 'px';
				break;
			}
			case 'c': {
				const w = e.clientX - this.#offetLeft - this.#resizeBody.offsetWidth;
				const h = e.clientY - this.#offetTop - this.#resizeBody.offsetHeight;
				this.#resizeBody.style.width = this.#resizeBody.offsetWidth + w + 'px';
				this.#resizeBody.style.height = this.#resizeBody.offsetHeight + h + 'px';
				break;
			}
			case 'cRTL': {
				const w = this.#offetLeft - e.clientX;
				const h = e.clientY - this.#offetTop - this.#resizeBody.offsetHeight;
				this.#resizeBody.style.width = this.#resizeBody.offsetWidth + w + 'px';
				this.#resizeBody.style.height = this.#resizeBody.offsetHeight + h + 'px';
				break;
			}
		}

		this.#saveOffset();

		this.inst.modalResize?.();
	}

	#OnResizeMouseUp() {
		dom.utils.removeClass(this.#currentHandle, 'active');
		this.#currentHandle = null;
		this.#removeGlobalEvent();
	}
}

export default Modal;
