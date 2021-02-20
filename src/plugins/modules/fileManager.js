/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

(function (global, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = global.document ?
            factory(global, true) :
            function (w) {
                if (!w.document) {
                    throw new Error('SUNEDITOR_MODULES a window with a document');
                }
                return factory(w);
            };
    } else {
        factory(global);
    }
}(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
    const fileManager = {
        name: 'fileManager',
        _xmlHttp: null,

        _checkMediaComponent: function (tag) {
            if (/IMG/i.test(tag)) {
                return !/FIGURE/i.test(tag.parentElement.nodeName) || !/FIGURE/i.test(tag.parentElement.parentElement.nodeName);
            } else if (/VIDEO/i.test(tag)) {
                return !/FIGURE/i.test(tag.parentElement.nodeName);
            }
            return true;
        },

        /**
         * @description Upload the file to the server.
         * @param {String} uploadUrl Upload server url
         * @param {Object|null} uploadHeader Request header
         * @param {FormData} formData FormData in body
         * @param {Function|null} callBack Success call back function
         * @param {Function|null} errorCallBack Error call back function
         * @example this.plugins.fileManager.upload.call(this, imageUploadUrl, this.options.imageUploadHeader, formData, this.plugins.image.callBack_imgUpload.bind(this, info), this.functions.onImageUploadError);
         */
        upload: function (uploadUrl, uploadHeader, formData, callBack, errorCallBack) {
            this.showLoading();
            const filePlugin = this.plugins.fileManager;
            const xmlHttp = filePlugin._xmlHttp = this.util.getXMLHttpRequest();

            xmlHttp.onreadystatechange = filePlugin._callBackUpload.bind(this, xmlHttp, callBack, errorCallBack);
            xmlHttp.open('post', uploadUrl, true);
            if(uploadHeader !== null && typeof uploadHeader === 'object' && this._w.Object.keys(uploadHeader).length > 0){
                for(let key in uploadHeader){
                    xmlHttp.setRequestHeader(key, uploadHeader[key]);
                }
            }
            xmlHttp.send(formData);
        },

        _callBackUpload: function (xmlHttp, callBack, errorCallBack) {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    try {
                        callBack(xmlHttp);
                    } catch (e) {
                        throw Error('[SUNEDITOR.fileManager.upload.callBack.fail] cause : "' + e.message + '"');
                    } finally {
                        this.closeLoading();
                    }
                } else { // exception
                    this.closeLoading();
                    const res = !xmlHttp.responseText ? xmlHttp : JSON.parse(xmlHttp.responseText);
                    if (typeof errorCallBack !== 'function' || errorCallBack('', res, this)) {
                        const err = '[SUNEDITOR.fileManager.upload.serverException] status: ' + xmlHttp.status + ', response: ' + (res.errorMessage || xmlHttp.responseText);
                        this.functions.noticeOpen(err);
                        throw Error(err);
                    }
                }
            }
        },
        
        /**
         * @description Checke the file's information and modify the tag that does not fit the format.
         * @param {String} pluginName Plugin name
         * @param {Array} tagNames Tag array to check
         * @param {Function|null} uploadEventHandler Event handler to process updated file info after checking (used in "setInfo")
         * @param {Function} modifyHandler A function to modify a tag that does not fit the format (Argument value: Tag element)
         * @param {Boolean} resizing True if the plugin is using a resizing module
         * @example 
         * const modifyHandler = function (tag) {
         *      imagePlugin.onModifyMode.call(this, tag, null);
         *      imagePlugin.openModify.call(this, true);
         *      imagePlugin.update_image.call(this, true, false, true);
         *  }.bind(this);
         *  this.plugins.fileManager.checkInfo.call(this, 'image', ['img'], this.functions.onImageUpload, modifyHandler, true);
         */
        checkInfo: function (pluginName, tagNames, uploadEventHandler, modifyHandler, resizing) {
            let tags = [];
            for (let i = 0, len = tagNames.length; i < len; i++) {
                tags = tags.concat([].slice.call(this.context.element.wysiwyg.getElementsByTagName(tagNames[i])));
            }

            const fileManagerPlugin = this.plugins.fileManager;
            const context = this.context[pluginName];
            const infoList = context._infoList;
            const setFileInfo = fileManagerPlugin.setInfo.bind(this);

            if (tags.length === infoList.length) {
                // reset
                if (this._componentsInfoReset) {
                    for (let i = 0, len = tags.length; i < len; i++) {
                        setFileInfo(pluginName, tags[i], uploadEventHandler, null, resizing);
                    }
                    return ;
                } else {
                    let infoUpdate = false;
                    for (let i = 0, len = infoList.length, info; i < len; i++) {
                        info = infoList[i];
                        if (tags.filter(function (t) { return info.src === t.src && info.index.toString() === t.getAttribute('data-index'); }).length === 0) {
                            infoUpdate = true;
                            break;
                        }
                    }
                    // pass
                    if (!infoUpdate) return;
                }
            }

            // check
            const _resize_plugin = resizing ? this.context.resizing._resize_plugin : '';
            if (resizing) this.context.resizing._resize_plugin = pluginName;
            const currentTags = [];
            const infoIndex = [];
            for (let i = 0, len = infoList.length; i < len; i++) {
                infoIndex[i] = infoList[i].index;
            }
            
            for (let i = 0, len = tags.length, tag; i < len; i++) {
                tag = tags[i];
                if (!this.util.getParentElement(tag, this.util.isMediaComponent) || !fileManagerPlugin._checkMediaComponent(tag)) {
                    currentTags.push(context._infoIndex);
                    modifyHandler(tag);
                } else if (!tag.getAttribute('data-index') || infoIndex.indexOf(tag.getAttribute('data-index') * 1) < 0) {
                    currentTags.push(context._infoIndex);
                    tag.removeAttribute('data-index');
                    setFileInfo(pluginName, tag, uploadEventHandler, null, resizing);
                } else {
                    currentTags.push(tag.getAttribute('data-index') * 1);
                }
            }

            for (let i = 0, dataIndex; i < infoList.length; i++) {
                dataIndex = infoList[i].index;
                if (currentTags.indexOf(dataIndex) > -1) continue;

                infoList.splice(i, 1);
                if (typeof uploadEventHandler === 'function') uploadEventHandler(null, dataIndex, 'delete', null, 0, this);
                i--;
            }

            if (resizing) this.context.resizing._resize_plugin = _resize_plugin;
        },

        /**
         * @description Create info object of file and add it to "_infoList" (this.context[pluginName]._infoList[])
         * @param {String} pluginName Plugin name 
         * @param {Element} element 
         * @param {Function|null} uploadEventHandler Event handler to process updated file info (created in setInfo)
         * @param {Object|null} file 
         * @param {Boolean} resizing True if the plugin is using a resizing module
         * @example 
         * uploadCallBack {.. file = { name: fileList[i].name, size: fileList[i].size };
         * this.plugins.fileManager.setInfo.call(this, 'image', oImg, this.functions.onImageUpload, file, true);
         */
        setInfo: function (pluginName, element, uploadEventHandler, file, resizing) {
            const _resize_plugin = resizing ? this.context.resizing._resize_plugin : '';
            if (resizing) this.context.resizing._resize_plugin = pluginName;
    
            const plguin = this.plugins[pluginName];
            const context = this.context[pluginName];
            const infoList = context._infoList;
            let dataIndex = element.getAttribute('data-index');
            let info = null;
            let state = '';

            if (!file) {
                file = {
                    'name': element.getAttribute('data-file-name') || (typeof element.src === 'string' ? element.src.split('/').pop() : ''),
                    'size': element.getAttribute('data-file-size') || 0
                };
            }
    
            // create
            if (!dataIndex || this._componentsInfoInit) {
                state = 'create';
                dataIndex = context._infoIndex++;
    
                element.setAttribute('data-index', dataIndex);
                element.setAttribute('data-file-name', file.name);
                element.setAttribute('data-file-size', file.size);
    
                info = {
                    src: element.src,
                    index: dataIndex * 1,
                    name: file.name,
                    size: file.size
                };
    
                infoList.push(info);
            } else { // update
                state = 'update';
                dataIndex *= 1;
    
                for (let i = 0, len = infoList.length; i < len; i++) {
                    if (dataIndex === infoList[i].index) {
                        info = infoList[i];
                        break;
                    }
                }
    
                if (!info) {
                    dataIndex = context._infoIndex++;
                    info = { index: dataIndex };
                    infoList.push(info);
                }
    
                info.src = element.src;
                info.name = element.getAttribute("data-file-name");
                info.size = element.getAttribute("data-file-size") * 1;
            }
    
            // method bind
            info.element = element;
            info.delete = plguin.destroy.bind(this, element);
            info.select = function (element) {
                element.scrollIntoView(true);
                this._w.setTimeout(plguin.select.bind(this, element));
            }.bind(this, element);
    
            if (resizing) {
                if (!element.getAttribute('origin-size') && element.naturalWidth) {
                    element.setAttribute('origin-size', element.naturalWidth + ',' + element.naturalHeight);
                }
    
                if (!element.getAttribute('data-origin')) {
                    const container = this.util.getParentElement(element, this.util.isMediaComponent);
                    const cover = this.util.getParentElement(element, 'FIGURE');
        
                    const w = this.plugins.resizing._module_getSizeX.call(this, context, element, cover, container);
                    const h = this.plugins.resizing._module_getSizeY.call(this, context, element, cover, container);
                    element.setAttribute('data-origin', w + ',' + h);
                    element.setAttribute('data-size', w + ',' + h);
                }
        
                if (!element.style.width) {
                    const size = (element.getAttribute('data-size') || element.getAttribute('data-origin') || '').split(',');
                    plguin.onModifyMode.call(this, element, null);
                    plguin.applySize.call(this, size[0], size[1]);
                }
        
                this.context.resizing._resize_plugin = _resize_plugin;
            }

            if (typeof uploadEventHandler === 'function') uploadEventHandler(element, dataIndex, state, info, --context._uploadFileLength < 0 ? 0 : context._uploadFileLength, this);
        },

        /**
         * @description Delete info object at "_infoList"
         * @param {String} pluginName Plugin name 
         * @param {Number} index index of info object (this.context[pluginName]._infoList[].index)
         * @param {Function|null} uploadEventHandler Event handler to process updated file info (created in setInfo)
         */
        deleteInfo: function (pluginName, index, uploadEventHandler) {
            if (index >= 0) {
                const infoList = this.context[pluginName]._infoList;
    
                for (let i = 0, len = infoList.length; i < len; i++) {
                    if (index === infoList[i].index) {
                        infoList.splice(i, 1);
                        if (typeof uploadEventHandler === 'function') uploadEventHandler(null, index, 'delete', null, 0, this);
                        return;
                    }
                }
            }
        },

        /**
         * @description Reset info object and "_infoList = []", "_infoIndex = 0"
         * @param {String} pluginName Plugin name 
         * @param {Function|null} uploadEventHandler Event handler to process updated file info (created in setInfo)
         */
        resetInfo: function (pluginName, uploadEventHandler) {
            const context = this.context[pluginName];

            if (typeof uploadEventHandler === 'function') {
                const infoList = context._infoList;
                for (let i = 0, len = infoList.length; i < len; i++) {
                    uploadEventHandler(null, infoList[i].index, 'delete', null, 0, this);
                }
            }

            context._infoList = [];
            context._infoIndex = 0;
        }
    };

    if (typeof noGlobal === typeof undefined) {
        if (!window.SUNEDITOR_MODULES) {
            Object.defineProperty(window, 'SUNEDITOR_MODULES', {
                enumerable: true,
                writable: false,
                configurable: false,
                value: {}
            });
        }

        Object.defineProperty(window.SUNEDITOR_MODULES, 'fileManager', {
            enumerable: true,
            writable: false,
            configurable: false,
            value: fileManager
        });
    }

    return fileManager;
}));