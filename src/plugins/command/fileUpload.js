import EditorInjector from '../../editorInjector';
import { domUtils, env } from '../../helper';
import { FileManager, Figure } from '../../modules';
const { NO_EVENT } = env;

const FileUpload = function (editor, pluginOptions) {
	EditorInjector.call(this, editor);
	// plugin basic properties
	this.title = this.lang.fileUpload;
	this.icon = 'file_upload';

	if (!pluginOptions.uploadUrl) console.warn('[SUNEDITOR.fileUpload.warn] "fileUpload" plugin must be have "uploadUrl" option.');

	// members
	this.input = domUtils.createElement('input', { type: 'file', accept: pluginOptions.accept || '*/*' });
	if (pluginOptions.multiple ?? true) this.input.setAttribute('multiple', 'multiple');
	this.uploadUrl = pluginOptions.uploadUrl;
	this.uploadHeaders = pluginOptions.uploadHeaders;

	// figure
	const showAlign = (pluginOptions.showAlign === undefined ? true : !!pluginOptions.showAlign) ? 'align' : '';
	const figureControls = [[showAlign, 'remove']];
	this.figure = new Figure(this, figureControls, {});

	// file manager
	this.fileManager = new FileManager(this, {
		tagNames: ['a'],
		tagAttrs: ['download', 'data-se-file-download'],
		loadHandler: this.events.onFileLoad,
		eventHandler: this.events.onFileAction,
		figure: this.figure
	});

	// init
	this.eventManager.addEvent(this.input, 'change', OnChangeFile.bind(this));
};

FileUpload.key = 'fileUpload';
FileUpload.type = 'command';
FileUpload.className = '';
FileUpload.component = (node) => {
	return domUtils.isAnchor(node) && node.hasAttribute('download') && node.hasAttribute('data-se-file-download') ? node : null;
};
FileUpload.prototype = {
	/**
	 * @override core
	 * @param {Element} target Target command button
	 */
	action() {
		this.input.click();
	},

	/**
	 * @override fileManager
	 * @param {Element} target Target element
	 */
	select(target) {
		this.figure.open(target, { nonResizing: true, nonSizeInfo: true, nonBorder: true });
	},

	/**
	 * @override fileManager
	 */
	destroy(element) {
		if (!element) return;

		const focusEl = element.previousElementSibling || element.nextElementSibling;
		domUtils.removeItem(element);
		this.editor._offCurrentController();

		this.editor.focusEdge(focusEl);
		this.history.push(false);
	},

	_register(response) {
		const fileList = response.result;

		for (let i = 0, len = fileList.length, file; i < len; i++) {
			file = {
				name: fileList[i].name,
				size: fileList[i].size
			};

			this._create(fileList[i].url, file);
		}
	},

	_create(url, file) {
		const name = file.name || url;
		const a = domUtils.createElement(
			'A',
			{
				href: url,
				title: name,
				download: name,
				target: '_blank',
				'data-se-file-download': ''
			},
			name
		);

		this.fileManager.setFileData(a, file);

		const figure = Figure.CreateContainer(a);
		domUtils.addClass(figure.container, 'se-file-figure');

		if (!this.component.insert(figure.container, false, !this.options.get('mediaAutoSelect'))) {
			this.editor.focus();
			return;
		}

		if (!this.options.get('mediaAutoSelect')) {
			const line = this.format.addLine(figure.container, null);
			if (line) this.selection.setRange(line, 0, line, 0);
		} else {
			this.component.select(a, FileUpload.key, false);
		}
	},

	async _error(response) {
		const message = await this.triggerEvent('onFileUploadError', { error: response });
		const err = message === NO_EVENT ? response.errorMessage : message || response.errorMessage;
		this.notice.open(err);
		console.error('[SUNEDITOR.plugin.fileUpload.error]', err);
	},

	constructor: FileUpload
};

async function OnChangeFile(e) {
	let files = e.target.files;
	if (!files[0]) return;

	const fileInfo = {
		url: this.uploadUrl,
		uploadHeaders: this.uploadHeaders,
		files
	};

	const handler = function (infos, newInfos) {
		infos = newInfos || infos;
		this.fileManager.upload(infos.url, infos.uploadHeaders, infos.files, UploadCallBack.bind(this), this._error.bind(this));
	}.bind(this, fileInfo);

	const result = await this.triggerEvent('onFileUploadBefore', {
		...fileInfo,
		handler
	});

	if (result === undefined) return true;
	if (result === false) return false;
	if (result !== null && typeof result === 'object') handler(result);

	if (result === true || result === NO_EVENT) handler(null);
}

async function UploadCallBack(xmlHttp) {
	const response = JSON.parse(xmlHttp.responseText);
	if (response.errorMessage) {
		this._error(response);
	} else {
		this._register(response);
	}
}

export default FileUpload;
