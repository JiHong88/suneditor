import type {} from '../../../../typedef';
/**
 * @class ImageSizeService
 * @description Handles image resizing, proportion calculations, and size input management.
 */
export class ImageSizeService {
	/**
	 * @param {import('../index').default} main - The main Image_ plugin instance.
	 * @param {import('../render/image.html').ModalReturns_image} modalEl - Modal element
	 */
	constructor(main: import('../index').default, modalEl: import('../render/image.html').ModalReturns_image);
	/**
	 * @description Sets the width and height input values.
	 * @param {string} w - Width value
	 * @param {string} h - Height value
	 */
	setInputSize(w: string, h: string): void;
	/**
	 * @description Gets the current width and height input values.
	 * @returns {{w: string, h: string}}
	 */
	getInputSize(): {
		w: string;
		h: string;
	};
	/**
	 * @description Sets the original width and height of the image.
	 * @param {string} w - Original width
	 * @param {string} h - Original height
	 */
	setOriginSize(w: string, h: string): void;
	/**
	 * @description Applies the specified width and height to the image.
	 * @param {string} w - Image width.
	 * @param {string} h - Image height.
	 */
	applySize(w: string, h: string): void;
	/**
	 * @description Called when the modal is opened. Resets size inputs to default.
	 */
	on(): void;
	/**
	 * @description Prepares the size inputs and proportion state when an image is selected.
	 * @param {SunEditor.Module.Figure.TargetInfo} figureInfo - Figure size information
	 * @param {string} w - Current width
	 * @param {string} h - Current height
	 */
	ready(figureInfo: SunEditor.Module.Figure.TargetInfo, w: string, h: string): void;
	/**
	 * @description Initializes the size service state.
	 */
	init(): void;
	#private;
}
export default ImageSizeService;
