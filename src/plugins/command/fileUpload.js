import EditorInjector from '../../editorInjector';
import { domUtils } from '../../helper';
import { FileManager } from '../../modules';
// import { domUtils } from '../../helper';

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

		this.html.insert(a, false, false, true);
		this.fileManager.setInfo(a, file);
	},

	async _error(response) {
		let message = '';
		if (typeof this.events.onFileUploadError !== 'function') {
			message = await this.events.onFileUploadError({ error: response });
		}

		const err = message || response.errorMessage;
		this.notice.open(err);
		console.error('[SUNEDITOR.plugin.fileUpload.error]', err);
	},

	constructor: FileUpload
};

async function OnChangeFile(e) {
	let files = e.target.files;
	if (!files[0]) return;

	if (typeof this.events.onFileUploadBefore === 'function') {
		const result = await this.events.onFileUploadBefore({
			files,
			handler: (data) => {
				this.fileManager.upload(this.uploadUrl, this.uploadHeaders, data && Array.isArray(data.result) ? data : files, UploadCallBack.bind(this), this._error.bind(this));
			}
		});

		if (result === undefined) return true;
		if (result === false) return false;
		if (Array.isArray(result) && result.length > 0) files = result;
	}

	this.fileManager.upload(this.uploadUrl, this.uploadHeaders, files, UploadCallBack.bind(this), this._error.bind(this));
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
