import EditorInjector from '../../editorInjector';
import { domUtils, env } from '../../helper';
import { ApiManager } from '../../modules';

const { _d } = env;

/**
 * @constructor
 * @description Export PDF plugin
 * @param {object} editor - editor core object
 * @param {object} pluginOptions - plugin options
 * @param {string} pluginOptions.apiUrl - server request url
 * @param {string} pluginOptions.fileName - file name
 */
const ExportPDF = function (editor, pluginOptions) {
	EditorInjector.call(this, editor);
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
				'Content-Type': 'application/json'
			},
			responseType: 'blob'
		});
	}
};

ExportPDF.key = 'exportPDF';
ExportPDF.type = 'command';
ExportPDF.className = 'se-component-enabled';
ExportPDF.prototype = {
	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * It is executed by clicking a toolbar "command" button or calling an API.
	 */
	async action() {
		if (!this.apiUrl) {
			console.warn('[SUNEDITOR.plugins.exportPDF.error] Requires exportPDF."apiUrl" options.');
			return;
		}

		this.ui.showLoading();
		let ww = null;

		try {
			const standardWW = this.editor.frameContext.get('documentTypePageMirror') || this.editor.frameContext.get('wysiwygFrame');
			const editableDiv = domUtils.createElement('div', { class: standardWW.className }, standardWW.innerHTML);
			ww = domUtils.createElement('div', { style: `position: absolute; top: -10000px; left: -10000px; width: 21cm; columns: 21cm; height: auto;` }, editableDiv);

			const innerPadding = this._w.getComputedStyle(standardWW).padding;
			const inlineWW = domUtils.applyInlineStylesAll(editableDiv, true, this.options.get('allUsedStyles'));
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
			await this._createByServer(ww);
			return;
		} catch (error) {
			console.error(`[SUNEDITOR.plugins.exportPDF.error] ${error.message}`);
		} finally {
			domUtils.removeItem(ww);
			this.ui.hideLoading();
		}
	},

	async _createByServer(ww) {
		const data = {
			fileName: this.fileName,
			htmlContent: ww.innerHTML
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
		const a = domUtils.createElement('A', { href: downloadUrl, download: filename, style: 'display: none;' }, null);

		try {
			_d.body.appendChild(a);
			a.click();
		} finally {
			setTimeout(() => {
				domUtils.removeItem(a);
				URL.revokeObjectURL(downloadUrl);
			}, 100);
		}
	},

	constructor: ExportPDF
};

export default ExportPDF;
