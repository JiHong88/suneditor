import CoreDependency from '../dependency/_core';
import { domUtils, numbers, env } from '../helper';

/**
 *
 * @param {*} inst
 * @param {{ tagNames: array, eventHandler: Function, checkHandler: Function, figure: Figure instance | null }} params
 */
const FileManager = function (inst, params) {
	CoreDependency.call(this, inst.editor);

	// members
	inst.__fileManagement = this;
	this.kind = inst.constructor.key;
	this.inst = inst;
	this.tagNames = params.tagNames;
	this.eventHandler = params.eventHandler;
	this.checkHandler = params.checkHandler;
	this.figure = params.figure;
	this.infoList = [];
	this.infoIndex = 0;
	this.uploadFileLength = 0;
};

FileManager.prototype = {
	/**
	 * @description Upload the file to the server.
	 * @param {string} uploadUrl Upload server url
	 * @param {Object|null} uploadHeader Request header
	 * @param {Files|{FormData, size}} data FormData in body or Files array
	 * @param {Function|null} callBack Success call back function
	 * @param {Function|null} errorCallBack Error call back function
	 * @example this.plugins.fileManager.upload.call(this, imageUploadUrl, this.options.get('imageUploadHeader'), formData, this.plugins.image.callBack_imgUpload.bind(this, info), this.events.onImageUploadError);
	 */
	upload: function (uploadUrl, uploadHeader, data, callBack, errorCallBack) {
		this.editor._openLoading();

		let formData = null;
		// create formData
		if (data.length) {
			formData = new this._w.FormData();
			for (let i = 0, len = data.length; i < len; i++) {
				formData.append('file-' + i, data[i]);
			}
			this.uploadFileLength = data.length;
		} else {
			formData = data.formData;
			this.uploadFileLength = data.size;
		}

		const xmlHttp = env.getXMLHttpRequest();
		xmlHttp.onreadystatechange = CallBackUpload.bind(this, xmlHttp, callBack, errorCallBack);
		xmlHttp.open('post', uploadUrl, true);
		if (uploadHeader !== null && typeof uploadHeader === 'object' && this._w.Object.keys(uploadHeader).length > 0) {
			for (let key in uploadHeader) {
				xmlHttp.setRequestHeader(key, uploadHeader[key]);
			}
		}

		xmlHttp.send(formData);
	},

	/**
	 * @description Create info object of file and add it to "infoList"
	 * @param {Element} element
	 * @param {Object|null} file
	 */
	setInfo: function (element, file) {
		let dataIndex = element.getAttribute('data-index');
		let info = null;
		let state = '';

		if (!file) {
			file = {
				name: element.getAttribute('data-file-name') || (typeof element.src === 'string' ? element.src.split('/').pop() : ''),
				size: element.getAttribute('data-file-size') || 0
			};
		}

		// create
		if (!dataIndex || this._componentsInfoInit) {
			state = 'create';
			dataIndex = this.infoIndex++;

			element.setAttribute('data-index', dataIndex);
			element.setAttribute('data-file-name', file.name);
			element.setAttribute('data-file-size', file.size);

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
				info = { index: dataIndex };
				this.infoList.push(info);
			}

			info.src = element.src;
			info.name = element.getAttribute('data-file-name');
			info.size = element.getAttribute('data-file-size') * 1;
		}

		// method bind
		info.element = element;
		info.delete = function (element) {
			this.inst.destroy.call(this.inst, element);
			this._deleteInfo(element.getAttribute('data-index') * 1);
		}.bind(this, element);
		info.select = function (element) {
			element.scrollIntoView(true);
			this._w.setTimeout(this.inst.select.bind(this.inst, element));
		}.bind(this, element);

		// figure
		if (this.figure) {
			if (!element.getAttribute('data-origin')) {
				const size = this.figure.getSize(element);
				const w = element.naturalWidth || size.w;
				const h = element.naturalHeight || size.h;
				element.setAttribute('data-origin', w + ',' + h);
				if (!element.getAttribute('data-size')) element.setAttribute('data-size', w + ',' + h);
			}

			if (!element.style.width) {
				try {
					const size = (element.getAttribute('data-size') || element.getAttribute('data-origin') || '').split(',');
					this.figure.__fileManagerInfo = true;
					this.inst.ready(element, null);
					this.figure.setSize(numbers.get(size[0]) ? size[0] : 'auto', numbers.get(size[1]) ? size[1] : 'auto');
					this.inst.init();
				} catch (error) {
					console.warn('[SUNEDITOR.FileManager[' + this.kind + '].setInfo.error] ' + error.message);
				} finally {
					this.figure.__fileManagerInfo = false;
				}
			}
		}

		if (typeof this.eventHandler === 'function') this.eventHandler(element, dataIndex, state, info, --this.uploadFileLength < 0 ? 0 : this.uploadFileLength);
	},

	/**
	 * @description Gets the sum of the sizes of the currently saved files.
	 * @returns {number} Size
	 */
	getSize: function () {
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
	_checkInfo: function () {
		let tags = [];
		for (let i = 0, len = this.tagNames.length; i < len; i++) {
			tags = tags.concat([].slice.call(this.editor.frameContext.get('wysiwyg').querySelectorAll(this.tagNames[i] + ':not([data-se-embed="true"])')));
		}

		if (tags.length === this.infoList.length) {
			// reset
			if (this._componentsInfoReset) {
				for (let i = 0, len = tags.length; i < len; i++) {
					this.setInfo(tags[i], null);
				}
				return;
			} else {
				let infoUpdate = false;
				for (let i = 0, len = this.infoList.length, info; i < len; i++) {
					info = this.infoList[i];
					if (
						tags.filter(function (t) {
							return info.src === t.src && info.index.toString() === t.getAttribute('data-index');
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
		for (let i = 0, len = this.infoList.length; i < len; i++) {
			infoIndex[i] = this.infoList[i].index;
		}

		for (let i = 0, len = tags.length, tag; i < len; i++) {
			tag = tags[i];
			if (!domUtils.getParentElement(tag, this.editor.component.is)) {
				currentTags.push(this.infoIndex);
				try {
					this.figure.__fileManagerInfo = true;
					tag = this.checkHandler(tag);
					if (!tag) {
						console.warn('[SUNEDITOR.FileManager[' + this.kind + '].checkHandler.fail] "checkHandler(element)" should return element(Argument element, or newly created element).');
					} else {
						this.setInfo(tag, null);
						this.inst.init();
					}
				} catch (error) {
					console.warn('[SUNEDITOR.FileManager[' + this.kind + '].checkHandler.error] ' + error.message);
				} finally {
					this.figure.__fileManagerInfo = false;
				}
			} else if (!tag.getAttribute('data-index') || infoIndex.indexOf(tag.getAttribute('data-index') * 1) < 0) {
				currentTags.push(this.infoIndex);
				tag.removeAttribute('data-index');
				this.setInfo(tag, null);
			} else {
				currentTags.push(tag.getAttribute('data-index') * 1);
			}
		}

		for (let i = 0, dataIndex; i < this.infoList.length; i++) {
			dataIndex = this.infoList[i].index;
			if (currentTags.indexOf(dataIndex) > -1) continue;

			this.infoList.splice(i, 1);
			if (typeof this.eventHandler === 'function') this.eventHandler(null, dataIndex, 'delete', null, 0);
			i--;
		}
	},

	/**
	 * @description Reset info object and "infoList = []", "infoIndex = 0"
	 * @param {string} this.kind Plugin name
	 * @private
	 */
	_resetInfo: function () {
		if (typeof this.eventHandler === 'function') {
			for (let i = 0, len = this.infoList.length; i < len; i++) {
				this.eventHandler.call(this.events, null, this.infoList[i].index, 'delete', null, 0);
			}
		}

		this.infoList = [];
		this.infoIndex = 0;
	},

	/**
	 * @description Delete info object at "infoList"
	 * @param {number} index index of info object infoList[].index)
	 * @private
	 */
	_deleteInfo: function (index) {
		if (index >= 0) {
			for (let i = 0, len = this.infoList.length; i < len; i++) {
				if (index === this.infoList[i].index) {
					this.infoList.splice(i, 1);
					if (typeof this.eventHandler === 'function') this.eventHandler(null, index, 'delete', null, 0);
					return;
				}
			}
		}
	},

	constructor: FileManager
};

function CallBackUpload(xmlHttp, callBack, errorCallBack) {
	if (xmlHttp.readyState === 4) {
		if (xmlHttp.status === 200) {
			try {
				callBack(xmlHttp);
			} catch (error) {
				throw Error('[SUNEDITOR.FileManager[' + this.kind + '].upload.callBack.fail] ' + error.message);
			} finally {
				this.editor._closeLoading();
			}
		} else {
			// exception
			this.editor._closeLoading();
			const res = !xmlHttp.responseText ? xmlHttp : JSON.parse(xmlHttp.responseText);
			if (typeof errorCallBack !== 'function' || errorCallBack.call(this.events, '', res)) {
				const err = '[SUNEDITOR.FileManager[' + this.kind + '].upload.serverException] status: ' + xmlHttp.status + ', response: ' + (res.errorMessage || xmlHttp.responseText);
				this.editor.notice.open(err);
				throw Error(err);
			}
		}
	}
}

export default FileManager;
