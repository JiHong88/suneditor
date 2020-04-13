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
        xmlHttp: null,

        upload: function (uploadUrl, uploadHeader, formData, callBack, errorCallBack) {
            this.showLoading();
            const filePlugin = this.plugins.fileManager;
            const xmlHttp = filePlugin.xmlHttp = this.util.getXMLHttpRequest();

            xmlHttp.onreadystatechange = filePlugin.callBackUpload.bind(this, xmlHttp, callBack, errorCallBack);
            xmlHttp.open('post', uploadUrl, true);
            if(uploadHeader !== null && typeof uploadHeader === 'object' && this._w.Object.keys(uploadHeader).length > 0){
                for(let key in uploadHeader){
                    xmlHttp.setRequestHeader(key, uploadHeader[key]);
                }
            }
            xmlHttp.send(formData);  
        },

        callBackUpload: function (xmlHttp, callBack, errorCallBack) {
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
        
        checkInfo: function (pluginName, tagNames, uploadEventHandler, modifyHandler, resizing) {
            let tags = [];
            for (let i in tagNames) {
                tags = tags.concat([].slice.call(this.context.element.wysiwyg.getElementsByTagName(tagNames[i])));
            }

            const context = this.context[pluginName];
            const infoList = context._infoList;
            const setFileInfo = this.plugins.fileManager.setInfo.bind(this);

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
                        if (tags.filter(function (img) { return info.src === img.src && info.index.toString() === img.getAttribute('data-index'); }).length === 0) {
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
                if (!this.util.getParentElement(tag, this.util.isMediaComponent)) {
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

        resetInfo: function (pluginName) {
            const context = this.context[pluginName];
            context._infoList = [];
            context._infoIndex = 0;
        },

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
            info.select = plguin.select.bind(this, element);
    
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

        deleteFileInfo: function (pluginName, index, uploadEventHandler) {
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