import type {} from '../../../../typedef';
/**
 * @class VideoSizeService
 * @description Handles video size operations including ratio management and size input controls.
 */
export class VideoSizeService {
	/**
	 * @param {import('../index').default} main - The main Video plugin instance.
	 * @param {import('../render/video.html').ModalReturns_video} modalEl - Modal element
	 */
	constructor(main: import('../index').default, modalEl: import('../render/video.html').ModalReturns_video);
	frameRatioOption: HTMLSelectElement;
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
	 * @description Sets the original width and height of the video.
	 * @param {string} w - Original width
	 * @param {string} h - Original height
	 */
	setOriginSize(w: string, h: string): void;
	/**
	 * @description Sets the size of the video element.
	 * @param {string|number} w - The width of the video.
	 * @param {string|number} h - The height of the video.
	 */
	applySize(w: string | number, h: string | number): void;
	/**
	 * @description Resolves the final size of the video element, checking if it has changed from the current size.
	 * @param {string} width - Desired width
	 * @param {string} height - Desired height
	 * @param {HTMLElement} oFrame - The video/iframe element
	 * @param {boolean} isUpdate - Whether we are updating an existing component
	 * @returns {{width: string, height: string, isChanged: boolean}} Resolved size info
	 */
	resolveSize(
		width: string,
		height: string,
		oFrame: HTMLElement,
		isUpdate: boolean,
	): {
		width: string;
		height: string;
		isChanged: boolean;
	};
	/**
	 * @description Called when the modal is opened. Initializes inputs and ratio options.
	 * @param {boolean} isUpdate - Indicates whether the modal is for editing an existing component (true) or registering a new one (false).
	 */
	on(isUpdate: boolean): void;
	/**
	 * @description Prepares the size inputs and options when a video component is selected.
	 * @param {import('../../../../modules/contract/Figure').FigureTargetInfo} figureInfo - Figure size information
	 * @param {HTMLElement} target - The selected video/iframe element
	 */
	ready(figureInfo: import('../../../../modules/contract/Figure').FigureTargetInfo, target: HTMLElement): void;
	/**
	 * @description Initializes the size service state.
	 */
	init(): void;
	#private;
}
export default VideoSizeService;
