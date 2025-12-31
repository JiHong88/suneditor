import { dom } from '../../../../helper';
import { Modal } from '../../../../modules/contract';

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
export function CreateHTML_modal({ lang, icons, plugins }, pluginOptions) {
	let html = /*html*/ `
	<form method="post" enctype="multipart/form-data">
		<div class="se-modal-header">
			<button type="button" data-command="close" class="se-btn se-close-btn" title="${lang.close}" aria-label="${lang.close}">
			${icons.cancel}
			</button>
			<span class="se-modal-title">${lang.video_modal_title}</span>
		</div>
		<div class="se-modal-body">`;

	if (pluginOptions.createFileInput) {
		html += /*html*/ `
			<div class="se-modal-form">
				<label>${lang.video_modal_file}</label>
				${Modal.CreateFileInput({ lang, icons }, pluginOptions)}
			</div>`;
	}

	if (pluginOptions.createUrlInput) {
		html += /*html*/ `
			<div class="se-modal-form">
				<label>${lang.video_modal_url}</label>
				<div class="se-modal-form-files">
					<input class="se-input-form se-input-url" type="text" data-focus />
					${
						plugins.videoGallery
							? `<button type="button" class="se-btn se-tooltip se-modal-files-edge-button __se__gallery" aria-label="${lang.videoGallery}">
								${icons.video_gallery}
								${dom.utils.createTooltipInner(lang.videoGallery)}
								</button>`
							: ''
					}
				</div>
				<pre class="se-link-preview"></pre>
			</div>`;
	}

	if (pluginOptions.canResize) {
		const ratioList = pluginOptions.ratioOptions || [
			{ name: '16:9', value: 0.5625 },
			{ name: '4:3', value: 0.75 },
			{ name: '21:9', value: 0.4285 },
			{ name: '9:16', value: 1.78 },
		];
		const ratio = pluginOptions.defaultRatio;
		const onlyPercentage = pluginOptions.percentageOnlySize;
		const onlyPercentDisplay = onlyPercentage ? ' style="display: none !important;"' : '';
		const heightDisplay = !pluginOptions.showHeightInput ? ' style="display: none !important;"' : '';
		const ratioDisplay = !pluginOptions.showRatioOption ? ' style="display: none !important;"' : '';
		const onlyWidthDisplay = !onlyPercentage && !pluginOptions.showHeightInput && !pluginOptions.showRatioOption ? ' style="display: none !important;"' : '';
		html += /*html*/ `
			<div class="se-modal-form">
				<div class="se-modal-size-text">
					<label class="size-w">${lang.width}</label>
					<label class="se-modal-size-x">&nbsp;</label>
					<label class="size-h"${heightDisplay}>${lang.height}</label>
					<label class="size-h"${ratioDisplay}>(${lang.ratio})</label>
				</div>
				<input class="se-input-control _se_size_x" placeholder="100%"${onlyPercentage ? ' type="number" min="1"' : 'type="text"'}${onlyPercentage ? ' max="100"' : ''}/>
				<label class="se-modal-size-x"${onlyWidthDisplay}>${onlyPercentage ? '%' : 'x'}</label>
				<input class="se-input-control _se_size_y" placeholder="${pluginOptions.defaultRatio * 100}%"
				${onlyPercentage ? ' type="number" min="1"' : 'type="text"'}${onlyPercentage ? ' max="100"' : ''}${heightDisplay}/>
				<select class="se-input-select se-modal-ratio" title="${lang.ratio}" aria-label="${lang.ratio}"${ratioDisplay}>
					${!heightDisplay ? '<option value=""> - </option>' : ''} 
					${ratioList.map((ratioOption) => `<option value="${ratioOption.value}"${ratio.toString() === ratioOption.value.toString() ? ' selected' : ''}>${ratioOption.name}</option>`).join('')}
				</select>
				<button type="button" title="${lang.revert}" aria-label="${lang.revert}" class="se-btn se-modal-btn-revert">${icons.revert}</button>
			</div>
			<div class="se-modal-form se-modal-form-footer"${onlyPercentDisplay}${onlyWidthDisplay}>
				<label>
					<input type="checkbox" class="se-modal-btn-check _se_check_proportion" />&nbsp;
					<span>${lang.proportion}</span>
				</label>
			</div>`;
	}

	html += /*html*/ `
		</div>
		<div class="se-modal-footer">
			<div class="se-figure-align">
				<label><input type="radio" name="suneditor_video_radio" class="se-modal-btn-radio" value="none" checked>${lang.basic}</label>
				<label><input type="radio" name="suneditor_video_radio" class="se-modal-btn-radio" value="left">${lang.left}</label>
				<label><input type="radio" name="suneditor_video_radio" class="se-modal-btn-radio" value="center">${lang.center}</label>
				<label><input type="radio" name="suneditor_video_radio" class="se-modal-btn-radio" value="right">${lang.right}</label>
			</div>
			<button type="submit" class="se-btn-primary" title="${lang.submitButton}" aria-label="${lang.submitButton}"><span>${lang.submitButton}</span></button>
		</div>
	</form>`;

	const content = dom.utils.createElement('DIV', { class: 'se-modal-content' }, html);

	return {
		html: content,
		alignForm: content.querySelector('.se-figure-align'),
		fileModalWrapper: content.querySelector('.se-flex-input-wrapper'),
		videoInputFile: content.querySelector('.__se__file_input'),
		videoUrlFile: content.querySelector('.se-input-url'),
		previewSrc: content.querySelector('.se-link-preview'),
		galleryButton: content.querySelector('.__se__gallery'),
		proportion: content.querySelector('._se_check_proportion'),
		frameRatioOption: content.querySelector('.se-modal-ratio'),
		inputX: content.querySelector('._se_size_x'),
		inputY: content.querySelector('._se_size_y'),
		revertBtn: content.querySelector('.se-modal-btn-revert'),
		fileRemoveBtn: content.querySelector('.se-file-remove'),
	};
}
