import type {} from '../../../../typedef';
/**
 * @typedef {object} ModalReturns_video
 * @property {HTMLElement} html
 * @property {HTMLElement} alignForm
 * @property {HTMLElement} fileModalWrapper
 * @property {HTMLInputElement} videoInputFile
 * @property {HTMLInputElement} videoUrlFile
 * @property {HTMLElement} previewSrc
 * @property {HTMLButtonElement} galleryButton
 * @property {HTMLInputElement} proportion
 * @property {HTMLSelectElement} frameRatioOption
 * @property {HTMLInputElement} inputX
 * @property {HTMLInputElement} inputY
 * @property {HTMLButtonElement} revertBtn
 * @property {HTMLButtonElement} fileRemoveBtn
 *
 * @param {SunEditor.Core} editor
 * @param {*} pluginOptions
 * @returns {ModalReturns_video}
 */
export function CreateHTML_modal({ lang, icons, plugins }: SunEditor.Core, pluginOptions: any): ModalReturns_video;
export type ModalReturns_video = {
	html: HTMLElement;
	alignForm: HTMLElement;
	fileModalWrapper: HTMLElement;
	videoInputFile: HTMLInputElement;
	videoUrlFile: HTMLInputElement;
	previewSrc: HTMLElement;
	galleryButton: HTMLButtonElement;
	proportion: HTMLInputElement;
	frameRatioOption: HTMLSelectElement;
	inputX: HTMLInputElement;
	inputY: HTMLInputElement;
	revertBtn: HTMLButtonElement;
	fileRemoveBtn: HTMLButtonElement;
};
