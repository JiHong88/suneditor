import EditorInjector from '../../editorInjector';
import { converter } from '../../helper';

const ExportPdf = function (editor, pluginOptions) {
	EditorInjector.call(this, editor);
	// plugin basic properties
	this.title = this.lang.exportPdf;
	this.icon = 'pdf';

	// plugin options
	this.apiUrl = pluginOptions.apiUrl;
};

ExportPdf.key = 'exportPdf';
ExportPdf.type = 'command';
ExportPdf.className = '';
ExportPdf.prototype = {
	/**
	 * @override core
	 * @param {Element} target Target command button
	 */
	action() {
		this.editor.showLoading();
		const inlineWW = converter.applyInlineStylesAll(this.editor.frameContext.get('wysiwyg'));
		document.getElementById('pdf_test').innerHTML = inlineWW.outerHTML;
		this.editor.hideLoading();
	},

	constructor: ExportPdf
};

export default ExportPdf;
