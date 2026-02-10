import { dom } from '../../../../helper';
import { Modal } from '../../../../modules/contract';

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
export function CreateHTML_modal({ lang, icons, plugins }, pluginOptions) {
	const createFileInputHtml = !pluginOptions.createFileInput
		? ''
		: /*html*/ `
		<div class="se-modal-form">
			<label>${lang.image_modal_file}</label>
			${Modal.CreateFileInput({ icons, lang }, pluginOptions)}
		</div>`;

	const createUrlInputHtml = !pluginOptions.createUrlInput
		? ''
		: /*html*/ `
		<div class="se-modal-form">
			<label>${lang.image_modal_url}</label>
			<div class="se-modal-form-files">
				<input class="se-input-form se-input-url" data-focus type="text" />
				${
					plugins.imageGallery
						? `<button type="button" class="se-btn se-tooltip se-modal-files-edge-button __se__gallery" aria-label="${lang.imageGallery}">
							${icons.image_gallery}
							${dom.utils.createTooltipInner(lang.imageGallery)}
							</button>`
						: ''
				}
			</div>
			<pre class="se-link-preview"></pre>
		</div>`;

	const canResizeHtml = !pluginOptions.canResize
		? ''
		: /*html*/ `
		<div class="se-modal-form">
			<div class="se-modal-size-text">
				<label class="size-w">${lang.width}</label>
				<label class="se-modal-size-x">&nbsp;</label>
				<label class="size-h">${lang.height}</label>
			</div>
			<input class="se-input-control _se_size_x" placeholder="auto" type="text" />
			<label class="se-modal-size-x">x</label>
			<input type="text" class="se-input-control _se_size_y" placeholder="auto" />
			<label><input type="checkbox" class="se-modal-btn-check _se_check_proportion" checked/>&nbsp;${lang.proportion}</label>
			<button type="button" aria-label="${lang.revert}" class="se-btn se-tooltip se-modal-btn-revert">
				${icons.revert}
				${dom.utils.createTooltipInner(lang.revert)}
			</button>
		</div>`;

	const useFormatTypeHtml = !pluginOptions.useFormatType
		? ''
		: /*html*/ `
		<div class="se-modal-form">
			<div class="se-modal-flex-form">
				<button type="button" data-command="asBlock" class="se-btn se-tooltip" aria-label="${lang.inlineStyle}">
					${icons.as_block}
					${dom.utils.createTooltipInner(lang.blockStyle)}
				</button>
				<button type="button" data-command="asInline" class="se-btn se-tooltip" aria-label="${lang.inlineStyle}">
					${icons.as_inline}
					${dom.utils.createTooltipInner(lang.inlineStyle)}
				</button>
			</div>
		</div>`;

	const html = /*html*/ `
		<div class="se-modal-header">
			<button type="button" data-command="close" class="se-btn se-close-btn close" title="${lang.close}" aria-label="${lang.close}">${icons.cancel}</button>
			<span class="se-modal-title">${lang.image_modal_title}</span>
		</div>
		<div class="se-modal-tabs">
			<button type="button" class="_se_tab_link active" data-tab-link="image">${lang.image}</button>
			<button type="button" class="_se_tab_link" data-tab-link="url">${lang.link}</button>
		</div>
		<form method="post" enctype="multipart/form-data">
			<div class="_se_tab_content _se_tab_content_image">
				<div class="se-modal-body">
					${createFileInputHtml}
					${createUrlInputHtml}
					<div style="border-bottom: 1px dashed #ccc;"></div>
					<div class="se-modal-form">
						<label>${lang.image_modal_altText}</label><input class="se-input-form _se_image_alt" type="text" />
					</div>
					${canResizeHtml}
					${useFormatTypeHtml}
					<div class="se-modal-form se-modal-form-footer">
						<label><input type="checkbox" class="se-modal-btn-check _se_image_check_caption" />&nbsp;${lang.caption}</label>
					</div>
				</div>
			</div>
			<div class="se-anchor-editor _se_tab_content _se_tab_content_url" style="display: none;">
			</div>
			<div class="se-modal-footer">
				<div class="se-figure-align">
					<label><input type="radio" name="suneditor_image_radio" class="se-modal-btn-radio" value="none" checked>${lang.basic}</label>
					<label><input type="radio" name="suneditor_image_radio" class="se-modal-btn-radio" value="left">${lang.left}</label>
					<label><input type="radio" name="suneditor_image_radio" class="se-modal-btn-radio" value="center">${lang.center}</label>
					<label><input type="radio" name="suneditor_image_radio" class="se-modal-btn-radio" value="right">${lang.right}</label>
				</div>
				<button type="submit" class="se-btn-primary" title="${lang.submitButton}" aria-label="${lang.submitButton}"><span>${lang.submitButton}</span></button>
			</div>
		</form>`;

	const content = dom.utils.createElement('DIV', { class: 'se-modal-content' }, html);

	return {
		html: content,
		alignForm: content.querySelector('.se-figure-align'),
		fileModalWrapper: content.querySelector('.se-flex-input-wrapper'),
		imgInputFile: content.querySelector('.__se__file_input'),
		imgUrlFile: content.querySelector('.se-input-url'),
		altText: content.querySelector('._se_image_alt'),
		captionCheckEl: content.querySelector('._se_image_check_caption'),
		previewSrc: content.querySelector('._se_tab_content_image .se-link-preview'),
		tabs: content.querySelector('.se-modal-tabs'),
		galleryButton: content.querySelector('.__se__gallery'),
		proportion: content.querySelector('._se_check_proportion'),
		inputX: content.querySelector('._se_size_x'),
		inputY: content.querySelector('._se_size_y'),
		revertBtn: content.querySelector('.se-modal-btn-revert'),
		asBlock: content.querySelector('[data-command="asBlock"]'),
		asInline: content.querySelector('[data-command="asInline"]'),
		fileRemoveBtn: content.querySelector('.se-file-remove'),
	};
}
