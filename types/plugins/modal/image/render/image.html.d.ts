import type {} from '../../../../typedef';
/**
 * @typedef {Object} ModalReturns_image
 * @property {HTMLElement} html
 * @property {HTMLElement} alignForm
 * @property {HTMLElement} fileModalWrapper
 * @property {HTMLInputElement} imgInputFile
 * @property {HTMLInputElement} imgUrlFile
 * @property {HTMLInputElement} altText
 * @property {HTMLInputElement} captionCheckEl
 * @property {HTMLElement} previewSrc
 * @property {HTMLElement} tabs
 * @property {HTMLButtonElement} galleryButton
 * @property {HTMLInputElement} proportion
 * @property {HTMLInputElement} inputX
 * @property {HTMLInputElement} inputY
 * @property {HTMLButtonElement} revertBtn
 * @property {HTMLButtonElement} asBlock
 * @property {HTMLButtonElement} asInline
 * @property {HTMLButtonElement} fileRemoveBtn
 *
 * @param {SunEditor.Deps} $
 * @param {*} pluginOptions
 * @returns {ModalReturns_image}
 */
export function CreateHTML_modal({ lang, icons, plugins }: SunEditor.Deps, pluginOptions: any): ModalReturns_image;
export type ModalReturns_image = {
	html: HTMLElement;
	alignForm: HTMLElement;
	fileModalWrapper: HTMLElement;
	imgInputFile: HTMLInputElement;
	imgUrlFile: HTMLInputElement;
	altText: HTMLInputElement;
	captionCheckEl: HTMLInputElement;
	previewSrc: HTMLElement;
	tabs: HTMLElement;
	galleryButton: HTMLButtonElement;
	proportion: HTMLInputElement;
	inputX: HTMLInputElement;
	inputY: HTMLInputElement;
	revertBtn: HTMLButtonElement;
	asBlock: HTMLButtonElement;
	asInline: HTMLButtonElement;
	fileRemoveBtn: HTMLButtonElement;
};
