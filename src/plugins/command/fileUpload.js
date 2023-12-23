import EditorInjector from '../../editorInjector';
import { domUtils, env } from '../../helper';
import { FileManager } from '../../modules';
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

	// file manager
	this.fileManager = new FileManager(this, {
		tagNames: ['a'],
		tagAttrs: ['download'],
		loadHandler: this.events.onFileLoad,
		eventHandler: this.events.onFileAction
	});

	// init
	this.eventManager.addEvent(this.input, 'change', OnChangeFile.bind(this));
};

FileUpload.key = 'fileUpload';
FileUpload.type = 'command';
FileUpload.className = '';
FileUpload.component = (node) => domUtils.isAnchor(node) && !domUtils.isMedia(node.firstElementChild);
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
	 * @param {Element} element Target element
	 */
	select(element) {
		this.selection.setRange(element, 0, element, 1);
		domUtils.addClass(element, 'on');
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
				download: name
			},
			name
		);

		this.fileManager.setFileData(a, file);
		this.html.insert(a, false, false, true);
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
