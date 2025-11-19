import { PluginCommand } from '../../interfaces';
import { dom, env } from '../../helper';
import { ApiManager } from '../../modules/utils';

const { _w, _d } = env;

/**
 * @typedef ExportPDFPluginOptions
 * @property {string} apiUrl - Server request URL for PDF generation
 * @property {string} [fileName="suneditor-pdf"] - Name of the generated PDF file
 */

/**
 * @class
 * @description Export PDF plugin
 */
class ExportPDF extends PluginCommand {
	static key = 'exportPDF';
	static className = 'se-component-enabled';

	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {ExportPDFPluginOptions} pluginOptions - plugin options
	 */
	constructor(editor, pluginOptions) {
		super(editor);
		// plugin basic properties
		this.title = this.lang.exportPDF;
		this.icon = 'PDF';

		// plugin options
		this.apiUrl = pluginOptions.apiUrl;
		this.fileName = pluginOptions.fileName || 'suneditor-pdf';

		// option check
		if (!this.apiUrl) {
			console.warn('[SUNEDITOR.plugins.exportPDF.error] Requires exportPDF."apiUrl" options.');
		} else {
			this.apiManager = new ApiManager(this, {
				method: 'POST',
				url: this.apiUrl,
				headers: {
					'Content-Type': 'application/json',
				},
				responseType: 'blob',
			});
		}
	}

	/**
	 * @override
	 * @type {PluginCommand['action']}
	 */
	async action() {
		if (!this.apiUrl) {
			console.warn('[SUNEDITOR.plugins.exportPDF.error] Requires exportPDF."apiUrl" options.');
			return;
		}

		this.ui.showLoading();
		let ww = null;

		try {
			const standardWW = this.frameContext.get('documentTypePageMirror') || this.frameContext.get('wysiwygFrame');
			const editableDiv = dom.utils.createElement('div', { class: standardWW.className }, standardWW.innerHTML);
			ww = dom.utils.createElement('div', { style: `position: absolute; top: -10000px; left: -10000px; width: 21cm; columns: 21cm; height: auto;` }, editableDiv);

			const innerPadding = _w.getComputedStyle(standardWW).padding;
			const inlineWW = dom.utils.applyInlineStylesAll(editableDiv, true, this.options.get('allUsedStyles'));
			inlineWW.style.padding = inlineWW.style.paddingTop = inlineWW.style.paddingBottom = inlineWW.style.paddingLeft = inlineWW.style.paddingRight = '0';
			ww.innerHTML = `
				<style>
					@page {
						size: A4;
						margin: ${innerPadding};
					}
				</style>
				${inlineWW.outerHTML}`;

			_d.body.appendChild(ww);

			// before event
			if ((await this.triggerEvent('onExportPDFBefore', { target: ww })) === false) return;

			// at server
			await this.#createByServer(ww);
			return;
		} catch (error) {
			console.error('[SUNEDITOR.plugins.exportPDF.error]', error.message);
		} finally {
			dom.utils.removeItem(ww);
			this.ui.hideLoading();
		}
	}

	/**
	 * @description Sends the editor content to the server for PDF generation.
	 * @param {HTMLElement} ww - A temporary container holding the formatted editor content.
	 * @returns {Promise<void>} Resolves when the PDF file is successfully downloaded.
	 * @throws {Error} Throws an error if the server response indicates a failure.
	 */
	async #createByServer(ww) {
		const data = {
			fileName: this.fileName,
			htmlContent: ww.innerHTML,
		};

		const xhr = await this.apiManager.asyncCall({ data: JSON.stringify(data) });

		if (xhr.status !== 200) {
			const res = !xhr.responseText ? xhr : JSON.parse(xhr.responseText);
			throw Error(`[SUNEDITOR.plugins.exportPDF.error] ${res.errorMessage}`);
		}

		const blob = new Blob([xhr.response], { type: 'application/pdf' });
		const contentDisposition = xhr.getResponseHeader('Content-Disposition');
		const downloadUrl = URL.createObjectURL(blob);
		const filename = (contentDisposition.match(/filename="([^"]+)/) || [])[1] || this.fileName + '.pdf';
		const a = dom.utils.createElement('A', { href: downloadUrl, download: filename, style: 'display: none;' }, null);

		try {
			_d.body.appendChild(a);
			a.click();
		} finally {
			_w.setTimeout(() => {
				dom.utils.removeItem(a);
				URL.revokeObjectURL(downloadUrl);
			}, 100);
		}
	}
}

export default ExportPDF;
