import EditorInjector from '../../editorInjector';
import { CreateTooltipInner } from '../../core/section/constructor';
import { domUtils, env } from '../../helper';
import { FileManager, Figure, Controller } from '../../modules';
const { NO_EVENT, _w } = env;

const FileUpload = function (editor, pluginOptions) {
	EditorInjector.call(this, editor);
	// plugin basic properties
	this.title = this.lang.fileUpload;
	this.icon = 'file_upload';

	if (!pluginOptions.uploadUrl) console.warn('[SUNEDITOR.fileUpload.warn] "fileUpload" plugin must be have "uploadUrl" option.');

	// members
	this.uploadUrl = pluginOptions.uploadUrl;
	this.uploadHeaders = pluginOptions.uploadHeaders;
	this.acceptedFormats = typeof pluginOptions.acceptedFormats !== 'string' ? '*' : pluginOptions.acceptedFormats.trim() || '*';
	this.input = domUtils.createElement('input', { type: 'file', accept: this.acceptedFormats });
	this._element = null;

	// figure
	const customItems = {
		'custom-download': {
			command: 'download',
			title: this.lang.download,
			icon: 'download',
			action: (target) => {
				const url = target.getAttribute('href');
				if (url) domUtils.createElement('A', { href: url }, null).click();
			}
		},
		'custom-as': {
			command: 'as',
			value: 'link', // 'box' or 'link'
			title: this.lang.asLink,
			icon: 'reduction',
			action: (target, value) => {
				if (value === 'link') {
					this.figure.close();
					const { container } = Figure.GetContainer(target);
					const next = container.nextElementSibling;
					const parent = container.parentElement;

					target.removeAttribute('data-se-non-focus');
					target.setAttribute('contenteditable', false);
					domUtils.addClass(target, 'se-component');
					domUtils.addClass(target, 'se-inline-component');

					const line = domUtils.createElement(this.options.get('defaultLine'), null, target);
					parent.insertBefore(line, next);
					domUtils.removeItem(container);
				} else {
					this.selection.setRange(target, 0, target, 1);
					const r = this.html.remove();
					const s = this.nodeTransform.split(r.container, r.offset, 0);

					if (s?.previousElementSibling && domUtils.isZeroWith(s.previousElementSibling)) {
						domUtils.removeItem(s.previousElementSibling);
					}

					target.setAttribute('data-se-non-focus', 'true');
					target.removeAttribute('contenteditable');
					domUtils.removeClass(target, 'se-component');
					domUtils.removeClass(target, 'se-inline-component');

					const figure = Figure.CreateContainer(target, 'se-file-figure se-flex-component');
					(s || r.container).parentElement.insertBefore(figure.container, s);
				}

				this.editor.focus();
				this.component.select(target, FileUpload.key, false);
			}
		}
	};
	let figureControls = pluginOptions.controls || [['custom-as', 'edit', 'align', 'remove', 'custom-download']];
	figureControls = figureControls.map((subArray) => subArray.map((item) => (item.startsWith('custom-') ? customItems[item] : item)));
	this.figure = new Figure(this, figureControls, {});

	// file manager
	this.fileManager = new FileManager(this, {
		tagNames: ['a'],
		tagAttrs: ['download', 'data-se-file-download'],
		loadHandler: this.events.onFileLoad,
		eventHandler: this.events.onFileAction,
		figure: this.figure
	});

	// controller
	if (/\bedit\b/.test(_w.JSON.stringify(figureControls))) {
		const controllerEl = CreateHTML_controller(this);
		this.controller = new Controller(this, controllerEl, { position: 'bottom', disabled: true }, FileUpload.key);
		this.editInput = controllerEl.querySelector('input');
	}

	// init
	this.eventManager.addEvent(this.input, 'change', OnChangeFile.bind(this));
};

FileUpload.key = 'fileUpload';
FileUpload.type = 'command';
FileUpload.className = '';
FileUpload.component = function (node) {
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
		this._element = target;
		const asBtn = this.figure.controller.form.querySelector('[data-command="__c__as"]');
		if (domUtils.isFigure(target.parentElement)) {
			asBtn.innerHTML = this.icons.reduction + CreateTooltipInner(this.lang.asLink);
			asBtn.setAttribute('data-value', 'link');
			this.figure.open(target, { nonResizing: true, nonSizeInfo: true, nonBorder: true, figureTarget: true, __fileManagerInfo: false });
		} else {
			asBtn.innerHTML = this.icons.expansion + CreateTooltipInner(this.lang.asBox);
			asBtn.setAttribute('data-value', 'box');
			this.figure.controllerOpen(target, { isWWTarget: true });
			return true;
		}
	},

	/**
	 * @override Figure
	 * @param {Element} target Target element
	 */
	edit(target) {
		this.editInput.value = target.textContent;
		this.figure.controllerHide();
		this.controller.open(target, null, { isWWTarget: !domUtils.isFigure(target.parentElement), initMethod: null, addOffset: null });
		this.editInput.focus();
	},

	/**
	 * @override controller
	 * @param {Element} target Target button element
	 * @returns
	 */
	controllerAction(target) {
		const command = target.getAttribute('data-command');
		if (!command) return;

		if (command === 'edit') {
			if (this.editInput.value.trim().length === 0) return;
			this._element.textContent = this.editInput.value;
		}

		this.controller.close();
		this.component.select(this._element, FileUpload.key, false);
	},

	/**
	 * @override fileManager, Figure
	 * @param {Element} target Target element
	 */
	async destroy(target) {
		if (!target) return;

		const figure = Figure.GetContainer(target);
		target = domUtils.getParentElement(target, '.se-component') || target;

		const message = await this.triggerEvent('onFileDeleteBefore', { target: figure.target, container: figure, url: figure.target.getAttribute('href') });
		if (message === false) return;

		const focusEl = target.previousElementSibling || target.nextElementSibling;
		domUtils.removeItem(target);
		this.editor._offCurrentController();

		this.editor.focusEdge(focusEl);
		this.history.push(false);
	},

	_register(response) {
		const file = response.result[0];
		this._create(file.url, {
			name: file.name,
			size: file.size
		});
	},

	_create(url, file) {
		const name = file.name || url;
		const a = domUtils.createElement(
			'A',
			{
				href: url,
				title: name,
				download: name,
				'data-se-file-download': '',
				contenteditable: 'false',
				'data-se-non-focus': 'true'
			},
			name
		);

		this.fileManager.setFileData(a, file);

		const figure = Figure.CreateContainer(a);
		domUtils.addClass(figure.container, 'se-file-figure se-flex-component');

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
		if (message === false) return;
		const err = message === NO_EVENT ? response.errorMessage : message || response.errorMessage;
		this.notice.open(err);
		console.error('[SUNEDITOR.plugin.fileUpload.error]', err);
	},

	_uploadCallBack(xmlHttp) {
		const response = JSON.parse(xmlHttp.responseText);
		if (response.errorMessage) {
			this._error(response);
		} else {
			this._register(response);
		}
	},

	constructor: FileUpload
};

async function OnChangeFile(e) {
	const files = e.target.files;
	if (!files[0]) return;

	const fileInfo = {
		url: this.uploadUrl,
		uploadHeaders: this.uploadHeaders,
		files
	};

	const handler = async function (infos, newInfos) {
		infos = newInfos || infos;
		const xmlHttp = await this.fileManager.asyncUpload(infos.url, infos.uploadHeaders, infos.files);
		this._uploadCallBack(xmlHttp);
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

function CreateHTML_controller({ lang, icons }) {
	const html = /*html*/ `
		<div class="se-arrow se-arrow-up"></div>
		<form>
			<div class="se-btn-group se-form-group">
				<input type="text" />
				<button type="submit" data-command="edit" class="se-btn se-tooltip se-btn-success">
					${icons.checked}
					<span class="se-tooltip-inner"><span class="se-tooltip-text">${lang.save}</span></span>
				</button>
				<button type="button" data-command="cancel" class="se-btn se-tooltip se-btn-danger">
					${icons.cancel}
					<span class="se-tooltip-inner"><span class="se-tooltip-text">${lang.cancel}</span></span>
				</button>
			</div>
		</form>
		`;

	return domUtils.createElement('DIV', { class: 'se-controller se-controller-resizing' }, html);
}

export default FileUpload;
