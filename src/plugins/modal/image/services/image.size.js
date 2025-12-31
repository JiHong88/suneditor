import { keyCodeMap } from '../../../../helper';
import { Figure } from '../../../../modules/contract';
import { SIZE_UNIT } from '../shared/image.constants';

/**
 * @class ImageSizeService
 * @description Handles image resizing, proportion calculations, and size input management.
 */
export class ImageSizeService {
	#main;
	#state;
	#pluginOptions;

	#resizing;
	#origin_w;
	#origin_h;

	#ratio = { w: 0, h: 0 };
	#proportion = null;
	#inputX = null;
	#inputY = null;

	/**
	 * @param {import('../index').default} main - The main Image_ plugin instance.
	 * @param {import('../render/image.html').ModalReturns_image} modalEl - Modal element
	 */
	constructor(main, modalEl) {
		this.#main = main;
		this.#state = main.state;
		this.#pluginOptions = main.pluginOptions;

		this.#resizing = this.#pluginOptions.canResize;
		this.#origin_w = this.#pluginOptions.defaultWidth === 'auto' ? '' : this.#pluginOptions.defaultWidth;
		this.#origin_h = this.#pluginOptions.defaultHeight === 'auto' ? '' : this.#pluginOptions.defaultHeight;

		if (this.#resizing) {
			this.#proportion = modalEl.proportion;
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
			main.eventManager.addEvent(modalEl.revertBtn, 'click', this.#OnClickRevert.bind(this));
		}
	}

	/**
	 * @description Sets the width and height input values.
	 * @param {string} w - Width value
	 * @param {string} h - Height value
	 */
	setInputSize(w, h) {
		this.#inputX.value = w === 'auto' ? '' : w;

		if (this.#state.onlyPercentage) return;
		this.#inputY.value = h === 'auto' ? '' : h;
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
	 * @description Sets the original width and height of the image.
	 * @param {string} w - Original width
	 * @param {string} h - Original height
	 */
	setOriginSize(w, h) {
		this.#origin_w = w;
		this.#origin_h = h;
	}

	/**
	 * @description Applies the specified width and height to the image.
	 * @param {string} w - Image width.
	 * @param {string} h - Image height.
	 */
	applySize(w, h) {
		w ||= this.#inputX?.value || this.#pluginOptions.defaultWidth;
		h ||= this.#inputY?.value || this.#pluginOptions.defaultHeight;

		if (this.#state.onlyPercentage) {
			if (!w) w = '100%';
			else if (!/%$/.test(w)) w += SIZE_UNIT.PERCENTAGE;
		}
		this.#main.figure.setSize(w, h);
	}

	/**
	 * @description Called when the modal is opened. Resets size inputs to default.
	 */
	on() {
		if (!this.#resizing) return;

		const x = this.#pluginOptions.defaultWidth;
		const y = this.#pluginOptions.defaultHeight;
		this.setInputSize(x, y);
		this.setOriginSize(x, y);
	}

	/**
	 * @description Prepares the size inputs and proportion state when an image is selected.
	 * @param {SunEditor.Module.Figure.TargetInfo} figureInfo - Figure size information
	 * @param {string} w - Current width
	 * @param {string} h - Current height
	 */
	ready(figureInfo, w, h) {
		this.setInputSize(w, h);

		const percentageRotation = this.#state.onlyPercentage && this.#main.figure.isVertical;
		this.#proportion.checked = true;
		this.#inputX.disabled = percentageRotation;
		this.#inputY.disabled = percentageRotation;
		this.#proportion.disabled = percentageRotation;

		this.#ratio = this.#proportion.checked
			? figureInfo.ratio
			: {
					w: 0,
					h: 0,
				};
	}

	/**
	 * @description Initializes the size service state.
	 */
	init() {
		this.#ratio = {
			w: 0,
			h: 0,
		};

		if (this.#resizing) {
			this.setInputSize(this.#pluginOptions.defaultWidth, this.#pluginOptions.defaultHeight);
			this.#proportion.checked = true;
		}
	}

	/**
	 * @description Handles keyup events on size inputs to calculate proportion.
	 * @param {'x'|'y'} xy - Axis ('x' for width, 'y' for height)
	 * @param {KeyboardEvent} e - Event object
	 */
	#OnInputSize(xy, e) {
		if (keyCodeMap.isSpace(e.code)) {
			e.preventDefault();
			return;
		}

		const target = /** @type {HTMLInputElement} */ (e.target);
		if (xy === 'x' && this.#state.onlyPercentage && Number(target.value) > 100) {
			target.value = '100';
		} else if (this.#proportion.checked) {
			const ratioSize = Figure.CalcRatio(this.#inputX.value, this.#inputY.value, this.#state.sizeUnit, this.#ratio);
			if (xy === 'x') {
				this.#inputY.value = String(ratioSize.h);
			} else {
				this.#inputX.value = String(ratioSize.w);
			}
		}
	}

	/**
	 * @description Updates the ratio based on current input values.
	 */
	#OnChangeRatio() {
		this.#ratio = this.#proportion.checked ? Figure.GetRatio(this.#inputX.value, this.#inputY.value, this.#state.sizeUnit) : { w: 0, h: 0 };
	}

	/**
	 * @description Reverts the size inputs to the original image size.
	 */
	#OnClickRevert() {
		if (this.#state.onlyPercentage) {
			this.#inputX.value = Number(this.#origin_w) > 100 ? '100' : this.#origin_w;
		} else {
			this.#inputX.value = this.#origin_w;
			this.#inputY.value = this.#origin_h;
		}
	}
}

export default ImageSizeService;
