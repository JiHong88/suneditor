import { keyCodeMap, numbers, dom } from '../../../../helper';
import { Figure } from '../../../../modules/contract';

/**
 * @class VideoSizeService
 * @description Handles video size operations including ratio management and size input controls.
 */
export class VideoSizeService {
	#main;
	#state;
	#pluginOptions;
	#resizing;

	#frameRatio;
	#defaultSizeX;
	#defaultSizeY;
	#origin_w;
	#origin_h;

	#ratio = { w: 0, h: 0 };
	#proportion = null;
	#inputX = null;
	#inputY = null;
	#initRatioValue = null;

	/**
	 * @param {import('../index').default} main - The main Video plugin instance.
	 * @param {import('../render/video.html').ModalReturns_video} modalEl - Modal element
	 */
	constructor(main, modalEl) {
		this.#main = main;
		this.#state = main.state;
		this.#pluginOptions = main.pluginOptions;
		this.#resizing = this.#pluginOptions.canResize;

		this.#frameRatio = this.#state.defaultRatio;
		this.#defaultSizeX = '100%';
		this.#defaultSizeY = this.#pluginOptions.defaultRatio * 100 + '%';
		this.#origin_w = this.#pluginOptions.defaultWidth === '100%' ? '' : this.#pluginOptions.defaultWidth;
		this.#origin_h = this.#pluginOptions.defaultHeight === this.#state.defaultRatio ? '' : this.#pluginOptions.defaultHeight;

		if (this.#resizing) {
			this.#proportion = modalEl.proportion;
			this.frameRatioOption = modalEl.frameRatioOption;
			this.#inputX = modalEl.inputX;
			this.#inputY = modalEl.inputY;
			this.#inputX.value = this.#pluginOptions.defaultWidth;
			this.#inputY.value = this.#pluginOptions.defaultHeight;

			const ratioChange = this.#OnChangeRatio.bind(this);
			main.eventManager.addEvent(this.#inputX, 'keyup', this.#OnInputSize.bind(this, 'x'));
			main.eventManager.addEvent(this.#inputY, 'keyup', this.#OnInputSize.bind(this, 'y'));
			main.eventManager.addEvent(this.#inputX, 'change', ratioChange);
			main.eventManager.addEvent(this.#inputY, 'change', ratioChange);
			main.eventManager.addEvent(this.#proportion, 'change', ratioChange);
			main.eventManager.addEvent(this.frameRatioOption, 'change', this.#SetRatio.bind(this));
			main.eventManager.addEvent(modalEl.revertBtn, 'click', this.#OnClickRevert.bind(this));
		}
	}

	/**
	 * @description Sets the width and height input values.
	 * @param {string} w - Width value
	 * @param {string} h - Height value
	 */
	setInputSize(w, h) {
		this.#inputX.value = w === this.#defaultSizeX ? '' : w;

		if (this.#state.onlyPercentage) return;
		this.#inputY.value = h === this.#defaultSizeY ? '' : h;
	}

	/**
	 * @description Gets the current width and height input values.
	 * @returns {{w: string, h: string}}
	 */
	getInputSize() {
		return {
			w: this.#inputX?.value || '',
			h: this.#inputY?.value || '',
		};
	}

	/**
	 * @description Sets the original width and height of the video.
	 * @param {string} w - Original width
	 * @param {string} h - Original height
	 */
	setOriginSize(w, h) {
		this.#origin_w = w;
		this.#origin_h = h;
	}

	/**
	 * @description Sets the size of the video element.
	 * @param {string|number} w - The width of the video.
	 * @param {string|number} h - The height of the video.
	 */
	applySize(w, h) {
		w ||= this.#inputX?.value || this.#pluginOptions.defaultWidth;
		h ||= this.#inputY?.value || this.#pluginOptions.defaultHeight;

		if (this.#state.onlyPercentage) {
			if (!w) w = '100%';
			else if (/%$/.test(w + '')) w += '%';
		}
		this.#main.figure.setSize(w, h);
	}

	/**
	 * @description Resolves the final size of the video element, checking if it has changed from the current size.
	 * @param {string} width - Desired width
	 * @param {string} height - Desired height
	 * @param {HTMLElement} oFrame - The video/iframe element
	 * @param {boolean} isUpdate - Whether we are updating an existing component
	 * @returns {{width: string, height: string, isChanged: boolean}} Resolved size info
	 */

	resolveSize(width, height, oFrame, isUpdate) {
		width ||= this.#defaultSizeX;
		height ||= this.#frameRatio;

		const size = this.#main.figure.getSize(oFrame);
		const inputUpdate = size.w !== width || size.h !== height;
		const isChanged = !isUpdate || inputUpdate;

		// set size
		if (isChanged) {
			if (this.#initRatioValue !== this.frameRatioOption?.value) this.#main.figure.deleteTransform();
			this.applySize(width, height);
		}

		return { width, height, isChanged };
	}

	/**
	 * @description Called when the modal is opened. Initializes inputs and ratio options.
	 * @param {boolean} isUpdate - Indicates whether the modal is for editing an existing component (true) or registering a new one (false).
	 */
	on(isUpdate) {
		if (!this.#resizing) return;

		if (!isUpdate) {
			const x = this.#pluginOptions.defaultWidth;
			const y = this.#pluginOptions.defaultHeight;
			this.setInputSize(x, y);
			this.setOriginSize(x, y);
			this.#proportion.disabled = true;
		}

		this.#setRatioSelect(this.#main.figure.isVertical ? '' : this.#origin_h || this.#state.defaultRatio);
		this.#initRatioValue = this.frameRatioOption?.value;
	}

	/**
	 * @description Prepares the size inputs and options when a video component is selected.
	 * @param {import('../../../../modules/contract/Figure').FigureTargetInfo} figureInfo - Figure size information
	 * @param {HTMLElement} target - The selected video/iframe element
	 */
	ready(figureInfo, target) {
		const { dw, dh } = this.#main.figure.getSize(target);
		this.setInputSize(dw, dh);

		const h = figureInfo.height || figureInfo.h || this.#origin_h || '';
		if (!this.#setRatioSelect(h)) this.#inputY.value = String(this.#state.onlyPercentage ? numbers.get(h, 2) : h);

		const percentageRotation = this.#state.onlyPercentage && this.#main.figure.isVertical;
		this.#inputX.disabled = percentageRotation;
		this.#inputY.disabled = percentageRotation;
		this.#proportion.checked = !figureInfo.isVertical;
		this.#proportion.disabled = percentageRotation;

		this.#ratio = this.#proportion.checked ? figureInfo.ratio : { w: 0, h: 0 };
	}

	/**
	 * @description Initializes the size service state.
	 */
	init() {
		this.#ratio = { w: 0, h: 0 };

		if (!this.#resizing) return;

		this.setInputSize(this.#pluginOptions.defaultWidth, this.#pluginOptions.defaultHeight);
		this.#proportion.checked = false;
		this.#proportion.disabled = true;
		this.#setRatioSelect(this.#state.defaultRatio);
	}

	/**
	 * @description Reverts the size inputs to the original video size.
	 */
	#OnClickRevert() {
		if (this.#state.onlyPercentage) {
			this.#inputX.value = Number(this.#origin_w) > 100 ? '100' : this.#origin_w;
		} else {
			this.#inputX.value = this.#origin_w;
			this.#inputY.value = this.#origin_h;
		}
	}

	/**
	 * @description Selects a ratio option in the ratio dropdown.
	 * @param {string|number} value - The selected ratio value.
	 * @returns {boolean} Returns true if a ratio was selected.
	 */
	#setRatioSelect(value) {
		if (!this.frameRatioOption) return;

		let ratioSelected = false;
		const ratioOption = this.frameRatioOption.options;

		if (/%$/.test(value + '') || this.#state.onlyPercentage) value = numbers.get(value, 2) / 100 + '';
		else if (!numbers.is(value) || Number(value) >= 1) value = '';

		this.#inputY.placeholder = '';
		for (let i = 0, len = ratioOption.length; i < len; i++) {
			if (ratioOption[i].value === value) {
				ratioSelected = ratioOption[i].selected = true;
				this.#inputY.placeholder = !value ? '' : Number(value) * 100 + '%';
			} else {
				ratioOption[i].selected = false;
			}
		}

		return ratioSelected;
	}

	/**
	 * @description Handles the ratio selection change event.
	 * @param {InputEvent} e - Event object
	 */
	#SetRatio(e) {
		/** @type {HTMLSelectElement} */
		const eventTarget = dom.query.getEventTarget(e);
		const value = eventTarget.options[eventTarget.selectedIndex].value;
		this.#defaultSizeY = this.#main.figure.autoRatio.current = this.#frameRatio = !value ? this.#defaultSizeY : Number(value) * 100 + '%';
		this.#inputY.placeholder = !value ? '' : Number(value) * 100 + '%';
		this.#inputY.value = '';
	}

	/**
	 * @description Updates the ratio based on current input values.
	 */
	#OnChangeRatio() {
		this.#ratio = this.#proportion.checked ? Figure.GetRatio(this.#inputX.value, this.#inputY.value, this.#state.sizeUnit) : { w: 0, h: 0 };
	}

	/**
	 * @description Handles keyup events on size inputs to calculate proportion or update ratio selection.
	 * @param {'x'|'y'} xy - Axis ('x' for width, 'y' for height)
	 * @param {KeyboardEvent} e - Event object
	 */
	#OnInputSize(xy, e) {
		if (keyCodeMap.isSpace(e.code)) {
			e.preventDefault();
			return;
		}

		/** @type {HTMLInputElement} */
		const eventTarget = dom.query.getEventTarget(e);
		if (xy === 'x' && this.#state.onlyPercentage && Number(eventTarget.value) > 100) {
			eventTarget.value = '100';
		} else if (this.#proportion.checked && !this.frameRatioOption?.value) {
			const ratioSize = Figure.CalcRatio(this.#inputX.value, this.#inputY.value, this.#state.sizeUnit, this.#ratio);
			if (xy === 'x') {
				this.#inputY.value = String(ratioSize.h);
			} else {
				this.#inputX.value = String(ratioSize.w);
			}
		}

		if (xy === 'y') {
			this.#setRatioSelect(eventTarget.value || this.#state.defaultRatio);
		}
	}
}

export default VideoSizeService;
