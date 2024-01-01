import CoreInjector from '../editorInjector/_core';
import { domUtils, env } from '../helper';
import Figure from './Figure';

/**
 *
 * @param {*} inst
 * @param {{ tagNames: array, loadHandler: Function, eventHandler: Function, checkHandler: Function, figure: Figure instance | null }} params
 */
const FileManager = function (inst, params) {
	CoreInjector.call(this, inst.editor);

	// members
	inst.__fileManagement = this;
	this.kind = inst.constructor.key;
	this.inst = inst;
	this.tagNames = params.tagNames;
	this.tagAttrs = params.tagAttrs || [];
	this._tagAttrStr = this.tagAttrs.length > 0 ? `[${this.tagAttrs.join('][')}]` : '';
	this.loadHandler = params.loadHandler;
	this.eventHandler = params.eventHandler;
	this.checkHandler = params.checkHandler;
	this.figure = params.figure;
	this.infoList = [];
	this.infoIndex = 0;
	this.uploadFileLength = 0;
	this.__updateTags = [];
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

		const xmlHttp = env.getXMLHttpRequest();
		xmlHttp.onreadystatechange = CallBackUpload.bind(this, xmlHttp, callBack, errorCallBack);
		xmlHttp.open('post', uploadUrl, true);
		if (uploadHeader !== null && typeof uploadHeader === 'object' && Object.keys(uploadHeader).length > 0) {
			for (let key in uploadHeader) {
				xmlHttp.setRequestHeader(key, uploadHeader[key]);
			}
		}

		xmlHttp.send(formData);
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
		info.delete = function (element) {
			if (typeof this.inst.destroy === 'function') this.inst.destroy.call(this.inst, element);
			this._deleteInfo(element.getAttribute('data-se-index') * 1);
		}.bind(this, element);
		info.select = function (element) {
			element.scrollIntoView(true);
			if (typeof this.inst.select === 'function') this._w.setTimeout(this.inst.select.bind(this.inst, element));
		}.bind(this, element);

		// figure
		if (this.figure) {
			if (!element.getAttribute('data-se-size')) {
				const size = this.figure.getSize(element);
				const w = element.naturalWidth || size.w;
				const h = element.naturalHeight || size.h;
				if (!element.getAttribute('data-se-size')) element.setAttribute('data-se-size', w + ',' + h);
			}

			const figureInfo = Figure.GetContainer(element);
			if (!figureInfo.container) {
				try {
					const size = (element.getAttribute('data-se-size') || ',').split(',');
					this.figure.__fileManagerInfo = true;
					this.inst.ready(element, null);
					this.figure.setSize(size[0], size[1]);
					this.inst.init();
				} catch (error) {
					console.warn(`[SUNEDITOR.FileManager[${this.kind}].setInfo.error]`, error.message);
				} finally {
					this.figure.__fileManagerInfo = false;
				}
			}
		}

		if (typeof this.eventHandler === 'function') {
			this.eventHandler({ editor: this.editor, element, index: dataIndex, state, info, remainingFilesCount: --this.uploadFileLength < 0 ? 0 : this.uploadFileLength });
		}
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
		let tags = [];
		for (let i = 0, len = this.tagNames.length; i < len; i++) {
			tags = tags.concat([].slice.call(this.editor.frameContext.get('wysiwyg').querySelectorAll(this.tagNames[i] + this._tagAttrStr + ':not([data-se-embed="true"])')));
		}

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
			let tag = tags.shift();
			if (!domUtils.getParentElement(tag, Figure.__is)) {
				currentTags.push(this.infoIndex);
				try {
					if (this.figure) this.figure.__fileManagerInfo = true;
					if (typeof this.checkHandler === 'function') tag = this.checkHandler(tag);
					if (!tag) {
						console.warn(
							`[SUNEDITOR.FileManager[${this.kind}].checkHandler.fail] "checkHandler(element)" should return element(Argument element, or newly created element).`
						);
					} else {
						this._setInfo(tag, null);
						this.inst.init();
					}
				} catch (error) {
					console.warn(`[SUNEDITOR.FileManager[${this.kind}].checkHandler.error]`, error.message);
				} finally {
					if (this.figure) this.figure.__fileManagerInfo = false;
				}
			} else if (!tag.getAttribute('data-se-index') || !infoIndex.includes(tag.getAttribute('data-se-index') * 1)) {
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
			if (typeof this.eventHandler === 'function') {
				this.eventHandler({ editor: this.editor, element: null, index: dataIndex, state: 'delete', info: null, remainingFilesCount: 0 });
			}
			i--;
		}
	},

	/**
	 * @description Reset info object and "infoList = []", "infoIndex = 0"
	 * @param {string} this.kind Plugin name
	 * @private
	 */
	_resetInfo() {
		if (typeof this.eventHandler === 'function') {
			for (let i = 0, len = this.infoList.length; i < len; i++) {
				this.eventHandler.call(this.events, { editor: this.editor, element: null, index: this.infoList[i].index, state: 'delete', info: null, remainingFilesCount: 0 });
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

async function CallBackUpload(xmlHttp, callBack, errorCallBack) {
	if (xmlHttp.readyState === 4) {
		if (xmlHttp.status === 200) {
			try {
				await callBack(xmlHttp);
			} catch (error) {
				throw Error(`[SUNEDITOR.FileManager[${this.kind}].upload.callBack.fail] ${error.message}`);
			} finally {
				this.editor.hideLoading();
			}
		} else {
			// exception
			console.error(`[SUNEDITOR.FileManager[${this.kind}].upload.serverException]`, xmlHttp);
			try {
				const res = !xmlHttp.responseText ? xmlHttp : JSON.parse(xmlHttp.responseText);
				let message = '';
				if (typeof errorCallBack === 'function') {
					message = await errorCallBack(res);
				}
				const err = `[SUNEDITOR.FileManager[${this.kind}].upload.serverException] status: ${xmlHttp.status}, response: ${
					message || res.errorMessage || xmlHttp.responseText
				}`;
				this.editor.notice.open(err);
			} catch (error) {
				throw Error(`[SUNEDITOR.FileManager[${this.kind}].upload.errorCallBack.fail] ${error.message}`);
			} finally {
				this.editor.hideLoading();
			}
		}
	}
}

export default FileManager;
