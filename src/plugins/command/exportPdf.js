import EditorInjector from '../../editorInjector';
import { domUtils, env } from '../../helper';
import { ApiManager } from '../../modules';

const { _d } = env;

const ExportPdf = function (editor, pluginOptions) {
	EditorInjector.call(this, editor);
	// plugin basic properties
	this.title = this.lang.exportPdf;
	this.icon = 'pdf';

	// plugin options
	this.apiUrl = pluginOptions.apiUrl;
	this.fileName = pluginOptions.fileName || 'suneditor-pdf';

	// option check
	if (!this.apiUrl) {
		console.warn('[SUNEDITOR.plugins.exportPdf.error] Requires exportPdf."apiUrl" options.');
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

ExportPdf.key = 'exportPdf';
ExportPdf.type = 'command';
ExportPdf.className = 'se-component-enabled';
ExportPdf.prototype = {
	/**
	 * @override core
	 * @param {Element} target Target command button
	 */
	async action() {
		this.editor.showLoading();
		let ww = null;

		try {
			const topArea = this.editor.frameContext.get('topArea');
			const editableDiv = domUtils.createElement('div', { class: this.editor.frameContext.get('wysiwyg').className }, this.html.get());
			ww = domUtils.createElement('div', { style: `position: absolute; left: -10000px; width: ${topArea.clientWidth}px; height: auto;` }, editableDiv);

			if (this.apiUrl) {
				const inlineWW = domUtils.applyInlineStylesAll(editableDiv, true, this.options.get('allUsedStyles'));
				ww.innerHTML = inlineWW.outerHTML;
			}

			_d.body.appendChild(ww);

			// before event
			if ((await this.triggerEvent('onExportPdfBefore', { editableDiv })) === false) return;

			// at server
			await this._createByServer(ww);
			return;
		} catch (error) {
			console.error(`[SUNEDITOR.plugins.exportPdf.error] ${error.message}`);
		} finally {
			// domUtils.removeItem(ww);
			this.editor.hideLoading();
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
			throw Error(`[SUNEDITOR.plugins.exportPdf.error] ${res.errorMessage}`);
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

	constructor: ExportPdf
};

export default ExportPdf;
