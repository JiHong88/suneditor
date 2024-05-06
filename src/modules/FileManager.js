import CoreInjector from '../editorInjector/_core';
import ApiManager from './ApiManager';

/**
 *
 * @param {*} inst
 * @param {{ query: string, loadHandler: Function, eventHandler: Function, figure: Figure instance | null }} params
 */
const FileManager = function (inst, params) {
	CoreInjector.call(this, inst.editor);

	// members
	inst.__fileManagement = this;
	this.kind = inst.constructor.key || inst.constructor.name;
	this.inst = inst;
	this.component = inst.editor.component;
	this.query = params.query;
	this.loadHandler = params.loadHandler;
	this.eventHandler = params.eventHandler;
	this.infoList = [];
	this.infoIndex = 0;
	this.uploadFileLength = 0;
	this.__updateTags = [];
	// api manager
	this.apiManager = new ApiManager(this, null);
};

FileManager.prototype = {
	/**
	 * @description Upload the file to the server.
	 * @param {string} uploadUrl Upload server url
	 * @param {Object|null} uploadHeader Request header
	 * @param {Files|{FormData, size}} data FormData in body or Files array
	 * @param {Function|null} callBack Success call back function
	 * @param {Function|null} errorCallBack Error call back function
	 */
	upload(uploadUrl, uploadHeader, data, callBack, errorCallBack) {
		this.editor.showLoading();

		let formData = null;
		// create formData
		if (data.length) {
			formData = new FormData();
			for (let i = 0, len = data.length; i < len; i++) {
				formData.append('file-' + i, data[i]);
			}
			this.uploadFileLength = data.length;
		} else {
			formData = data.formData;
			this.uploadFileLength = data.size;
		}

		this.apiManager.call({ method: 'POST', url: uploadUrl, headers: uploadHeader, data: formData, callBack, errorCallBack });
	},

	/**
	 * @description Upload the file to the server.
	 * @param {string} uploadUrl Upload server url
	 * @param {Object|null} uploadHeader Request header
	 * @param {Files|{FormData, size}} data FormData in body or Files array
	 */
	async asyncUpload(uploadUrl, uploadHeader, data) {
		this.editor.showLoading();

		let formData = null;
		// create formData
		if (data.length) {
			formData = new FormData();
			for (let i = 0, len = data.length; i < len; i++) {
				formData.append('file-' + i, data[i]);
			}
			this.uploadFileLength = data.length;
		} else {
			formData = data.formData;
			this.uploadFileLength = data.size;
		}

		return await this.apiManager.asyncCall({ method: 'POST', url: uploadUrl, headers: uploadHeader, data: formData });
	},

	setFileData(element, { name, size }) {
		if (!element) return;
		element.setAttribute('data-se-file-name', name);
		element.setAttribute('data-se-file-size', size);
	},

	/**
	 * @description Create info object of file and add it to "infoList"
	 * @private
	 * @param {Element} element
	 * @param {Object|null} file
	 */
	_setInfo(element, file) {
		let dataIndex = element.getAttribute('data-se-index');
		let info = null;
		let state = '';

		if (!file) {
			file = {
				name: element.getAttribute('data-se-file-name') || (typeof element.src === 'string' ? element.src.split('/').pop() : ''),
				size: element.getAttribute('data-se-file-size') || 0
			};
		}

		// create
		if (!dataIndex || this._componentsInfoInit) {
			state = 'create';
			dataIndex = this.infoIndex++;

			element.setAttribute('data-se-index', dataIndex);
			element.setAttribute('data-se-file-name', file.name);
			element.setAttribute('data-se-file-size', file.size);

			info = {
				src: element.src,
				index: dataIndex * 1,
				name: file.name,
				size: file.size
			};

			this.infoList.push(info);
		} else {
			// update
			state = 'update';
			dataIndex *= 1;

			for (let i = 0, len = this.infoList.length; i < len; i++) {
				if (dataIndex === this.infoList[i].index) {
					info = this.infoList[i];
					break;
				}
			}

			if (!info) {
				dataIndex = this.infoIndex++;
				info = {
					index: dataIndex
				};
				this.infoList.push(info);
			}

			info.src = element.src;
			info.name = element.getAttribute('data-se-file-name');
			info.size = element.getAttribute('data-se-file-size') * 1;
		}

		// method bind
		info.element = element;
		info.delete = function (el) {
			if (typeof this.inst.destroy === 'function') this.inst.destroy.call(this.inst, el);
			this._deleteInfo(el.getAttribute('data-se-index') * 1);
		}.bind(this, element);
		info.select = function (el) {
			el.scrollIntoView(true);
			if (typeof this.inst.select === 'function') this._w.setTimeout(this.inst.select.bind(this.inst, el), 0);
		}.bind(this, element);

		const params = { editor: this.editor, element, index: dataIndex, state, info, remainingFilesCount: --this.uploadFileLength < 0 ? 0 : this.uploadFileLength };
		if (typeof this.eventHandler === 'function') {
			this.eventHandler(params);
		}
		this.triggerEvent('onFileManagerAction', { ...params, pluginName: this.kind });
	},

	/**
	 * @description Gets the sum of the sizes of the currently saved files.
	 * @returns {number} Size
	 */
	getSize() {
		let size = 0;
		for (let i = 0, len = this.infoList.length; i < len; i++) {
			size += this.infoList[i].size * 1;
		}
		return size;
	},

	/**
	 * @description Checke the file's information and modify the tag that does not fit the format.
	 * @private
	 */
	_checkInfo(loaded) {
		const tags = [].slice.call(this.editor.frameContext.get('wysiwyg').querySelectorAll(this.query));
		const infoList = this.infoList;
		if (tags.length === infoList.length) {
			// reset
			if (this._componentsInfoReset) {
				for (let i = 0, len = tags.length; i < len; i++) {
					this._setInfo(tags[i], null);
				}
				return;
			} else {
				let infoUpdate = false;
				for (let i = 0, len = infoList.length, info; i < len; i++) {
					info = infoList[i];
					if (
						tags.filter(function (t) {
							return info.src === t.src && info.index.toString() === t.getAttribute('data-se-index');
						}).length === 0
					) {
						infoUpdate = true;
						break;
					}
				}
				// pass
				if (!infoUpdate) return;
			}
		}

		// check
		const currentTags = [];
		const infoIndex = [];
		for (let i = 0, len = infoList.length; i < len; i++) {
			infoIndex[i] = infoList[i].index;
		}

		this.__updateTags = tags;

		while (tags.length > 0) {
			const tag = tags.shift();
			if (!tag.getAttribute('data-se-index') || !infoIndex.includes(tag.getAttribute('data-se-index') * 1)) {
				currentTags.push(this.infoIndex);
				tag.removeAttribute('data-se-index');
				this._setInfo(tag, null);
			} else {
				currentTags.push(tag.getAttribute('data-se-index') * 1);
			}
		}

		// editor load
		if (loaded && typeof this.loadHandler === 'function') {
			this.loadHandler(infoList);
			return;
		}

		for (let i = 0, dataIndex; i < infoList.length; i++) {
			dataIndex = infoList[i].index;
			if (currentTags.includes(dataIndex)) continue;

			infoList.splice(i, 1);

			const params = { editor: this.editor, element: null, index: dataIndex, state: 'delete', info: null, remainingFilesCount: 0 };
			if (typeof this.eventHandler === 'function') {
				this.eventHandler(params);
			}
			this.triggerEvent('onFileManagerAction', { ...params, pluginName: this.kind });

			i--;
		}
	},

	/**
	 * @description Reset info object and "infoList = []", "infoIndex = 0"
	 * @param {string} this.kind Plugin name
	 * @private
	 */
	_resetInfo() {
		const eh = typeof this.eventHandler === 'function';
		const params = { editor: this.editor, element: null, state: 'delete', info: null, remainingFilesCount: 0 };
		for (let i = 0, len = this.infoList.length; i < len; i++) {
			if (eh) this.eventHandler({ ...params, index: this.infoList[i].index, pluginName: this.kind });
			this.triggerEvent('onFileManagerAction', { ...params, index: this.infoList[i].index, pluginName: this.kind });
		}

		this.infoList = [];
		this.infoIndex = 0;
	},

	/**
	 * @description Delete info object at "infoList"
	 * @param {number} index index of info object infoList[].index)
	 * @private
	 */
	_deleteInfo(index) {
		if (index >= 0) {
			for (let i = 0, len = this.infoList.length; i < len; i++) {
				if (index === this.infoList[i].index) {
					this.infoList.splice(i, 1);
					if (typeof this.eventHandler === 'function') {
						this.eventHandler({ editor: this.editor, element: null, index, state: 'delete', info: null, remainingFilesCount: 0 });
					}
					return;
				}
			}
		}
	},

	constructor: FileManager
};

export default FileManager;
