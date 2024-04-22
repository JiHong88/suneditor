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
	this.jsPDFOptions = pluginOptions.jsPDFOptions || {};
	this.html2canvasOptions = pluginOptions.html2canvasOptions || {};

	// option check
	if (!this.apiUrl && !this.options.get('externalLibs').html2canvas && !this.options.get('externalLibs').jsPDF) {
		throw Error('[SUNEDITOR.plugins.exportPdf.error] Requires "apiUrl" or externalLibs.html2canvas and externalLibs.jsPDF options.');
	} else if (this.apiUrl) {
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
ExportPdf.className = '';
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
			const editableDiv = domUtils.createElement('div', { class: this.editor.frameContext.get('wysiwygFrame').className }, this.html.get());
			const inlineWW = domUtils.applyInlineStylesAll(editableDiv, true, this.options.get('allUsedStyles'));
			ww = domUtils.createElement('div', { style: `position: absolute; left: -10000px; width: ${topArea.clientWidth}px; height: auto;` }, editableDiv);
			ww.innerHTML = inlineWW.outerHTML;
			_d.body.appendChild(ww);

			// before event
			if ((await this.triggerEvent('onExportPdfBefore', { editableDiv })) === false) return;

			// at server
			if (this.apiUrl) {
				await this._createByServer(ww);
				return;
			}

			// at client
			const checkAndProcessResources = async () => {
				const resources = ww.querySelectorAll('img, audio, video');
				const resourcesLoaded = Array.from(resources).map((resource) => {
					switch (resource.tagName.toLowerCase()) {
						case 'img':
							return new Promise((resolve) => {
								if (resource.complete && resource.naturalHeight !== 0) {
									resolve();
								} else {
									resource.onload = resolve;
									resource.onerror = () => resolve();
								}
							});
						case 'audio':
						case 'video':
							return new Promise((resolve) => {
								if (resource.readyState >= 4) {
									// HAVE_ENOUGH_DATA
									resolve();
								} else {
									resource.onloadeddata = resolve;
									resource.onerror = () => resolve();
								}
							});
						default:
							return Promise.resolve();
					}
				});

				await Promise.all(resourcesLoaded);

				if (this.apiUrl) {
					await this._createByServer(ww);
				} else {
					await this._createByHtml2canvas(ww);
				}
			};

			// run observer
			const observer = new MutationObserver(checkAndProcessResources);
			observer.observe(ww, { childList: true, subtree: true, attributes: true });

			await checkAndProcessResources();
		} catch (error) {
			console.error(`[SUNEDITOR.plugins.exportPdf.error] ${error.message}`);
		} finally {
			domUtils.removeItem(ww);
			this.editor.hideLoading();
		}
	},

	async _createByHtml2canvas(ww) {
		const canvas = await this.options.get('externalLibs').html2canvas(ww, {
			useCORS: true,
			logging: true,
			...this.html2canvasOptions
		});
		const imageData = canvas.toDataURL('image/png');

		const pdf = new (this.options.get('externalLibs').jsPDF)({
			orientation: 'portrait',
			unit: 'px',
			format: [canvas.width, canvas.height],
			...this.jsPDFOptions
		});

		pdf.addImage(imageData, 'PNG', 0, 0, canvas.width, canvas.height);

		// save PDF file
		pdf.save(`${this.fileName}.pdf`);
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
