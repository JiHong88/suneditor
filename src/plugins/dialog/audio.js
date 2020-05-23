/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

import dialog from '../modules/dialog';
import component from '../modules/component';
import fileManager from '../modules/fileManager';

export default {
    name: 'audio',
    display: 'dialog',
    add: function (core) {
        core.addModule([dialog, component, fileManager]);

        const context = core.context;
        const contextAudio = context.audio = {
            _infoList: [], // @Override fileManager
            _infoIndex: 0, // @Override fileManager
            _uploadFileLength: 0, // @Override fileManager
            focusElement: null, // @Override // This element has focus when the dialog is opened.
            targetSelect: null,
            _origin_w: context.option.audioWidth,
            _origin_h: context.option.audioHeight,
            // @require @Override component
            _element: null,
            _cover: null,
            _container: null,
        };

        /** dialog */
        let audio_dialog = this.setDialog.call(core);
        contextAudio.modal = audio_dialog;
        contextAudio.audioInputFile = audio_dialog.querySelector('._se_audio_files');
        contextAudio.audioUrlFile = audio_dialog.querySelector('.se-input-url');
        contextAudio.focusElement = contextAudio.audioInputFile || contextAudio.audioUrlFile;

        /** controller */
        let audio_controller = this.setController.call(core);
        contextAudio.controller = audio_controller;

        audio_controller.addEventListener('mousedown', function (e) { e.stopPropagation(); }, false);

        /** add event listeners */
        audio_dialog.querySelector('.se-btn-primary').addEventListener('click', this.submit.bind(core));
        if (contextAudio.audioInputFile) audio_dialog.querySelector('.se-dialog-files-edge-button').addEventListener('click', this._removeSelectedFiles.bind(core, context.audioInputFile, context.audioUrlFile));
        if (contextAudio.audioInputFile && contextAudio.audioUrlFile) contextAudio.audioInputFile.addEventListener('change', this._fileInputChange.bind(contextAudio));
        audio_controller.addEventListener('click', this.onClick_controller.bind(core));

        /** append html */
        context.dialog.modal.appendChild(audio_dialog);

        /** append controller */
        context.element.relative.appendChild(audio_controller);

        /** empty memory */
        audio_dialog = null, audio_controller = null;
    },

    /** HTML - dialog */
    setDialog: function () {
        const option = this.context.option;
        const lang = this.lang;
        const dialog = this.util.createElement('DIV');

        dialog.className = 'se-dialog-content';
        dialog.style.display = 'none';
        let html = '' +
            '<form method="post" enctype="multipart/form-data">' +
                '<div class="se-dialog-header">' +
                    '<button type="button" data-command="close" class="se-btn se-dialog-close" aria-label="Close" title="' + lang.dialogBox.close + '">' +
                        this.icons.cancel +
                    '</button>' +
                    '<span class="se-modal-title">' + lang.dialogBox.audioBox.title + '</span>' +
                '</div>' +
                '<div class="se-dialog-body">';

                if (option.audioFileInput) {
                    html += '' +
                        '<div class="se-dialog-form">' +
                            '<label>' + lang.dialogBox.audioBox.file + '</label>' +
                            '<div class="se-dialog-form-files">' +
                                '<input class="se-input-form _se_audio_files" type="file" accept="audio/*" multiple="multiple" />' +
                                '<button type="button" data-command="filesRemove" class="se-btn se-dialog-files-edge-button" title="' + lang.controller.remove + '">' + this.icons.cancel + '</button>' +
                            '</div>' +
                        '</div>';
                }
                 
                if (option.audioUrlInput) {
                    html += '' +
                        '<div class="se-dialog-form">' +
                            '<label>' + lang.dialogBox.audioBox.url + '</label>' +
                            '<input class="se-input-form se-input-url" type="text" />' +
                        '</div>';
                }
                    
                html += '' +
                '</div>' +
                '<div class="se-dialog-footer">' +
                    '<button type="submit" class="se-btn-primary" title="' + lang.dialogBox.submitButton + '"><span>' + lang.dialogBox.submitButton + '</span></button>' +
                '</div>' +
            '</form>';

        dialog.innerHTML = html;

        return dialog;
    },

    /** HTML - controller */
    setController: function () {
        const lang = this.lang;
        const icons = this.icons;
        const link_btn = this.util.createElement('DIV');

        link_btn.className = 'se-controller se-controller-link';
        link_btn.innerHTML = '' +
            '<div class="se-arrow se-arrow-up"></div>' +
            '<div class="link-content">' +
                '<div class="se-btn-group">' +
                    '<button type="button" data-command="update" tabindex="-1" class="se-tooltip">' +
                        icons.edit +
                        '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.edit + '</span></span>' +
                    '</button>' +
                    '<button type="button" data-command="delete" tabindex="-1" class="se-tooltip">' +
                        icons.delete +
                        '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.remove + '</span></span>' +
                    '</button>' +
                '</div>' +
            '</div>';

        return link_btn;
    },

    // Disable url input when uploading files
    _fileInputChange: function () {
        if (!this.audioInputFile.value) this.audioUrlFile.removeAttribute('disabled');
        else this.audioUrlFile.setAttribute('disabled', true);
    },

    // Disable url input when uploading files
    _removeSelectedFiles: function (fileInput, urlInput) {
        fileInput.value = '';
        if (urlInput) urlInput.removeAttribute('disabled');
    },

    // create new audio tag
    _createAudioTag: function () {
        const oAudio = this.util.createElement('AUDIO');
        oAudio.setAttribute('controls', true);

        const w = this.context.audio._origin_w;
        const h = this.context.audio._origin_h;
        oAudio.setAttribute('origin-size', w + ',' + h);
        oAudio.style.cssText = (w ? ('width:' + w + '; ') : '') + (h ? ('height:' + h + ';') : '');

        return oAudio;
    },

    /**
     * @Required @Override fileManager
     */
    fileTags: ['audio'],

    /**
     * @Override core, fileManager, resizing
     */
    select: function (element) {
        this.plugins.audio.onModifyMode.call(this, element);
    },

    /**
     * @Override fileManager, resizing 
     */
    destroy: function (element) {
        element = element || this.context.audio._element;
        const container = this.util.getParentElement(element, this.util.isComponent) || element;
        const dataIndex = element.getAttribute('data-index') * 1;
        const focusEl = (container.previousElementSibling || container.nextElementSibling);

        const emptyDiv = container.parentNode;
        this.util.removeItem(container);
        this.plugins.audio.init.call(this);
        this.controllersOff();

        if (emptyDiv !== this.context.element.wysiwyg) this.util.removeItemAllParents(emptyDiv, function (current) { return current.childNodes.length === 0; }, null);

        // focus
        this.focusEdge(focusEl);

        // fileManager event
        this.plugins.fileManager.deleteInfo.call(this, 'audio', dataIndex, this.functions.onAudioUpload);

        // history stack
        this.history.push(false);
    },

    /**
     * @Override fileManager
     */
    checkFileInfo: function () {
        this.plugins.fileManager.checkInfo.call(this, 'audio', ['audio'], this.functions.onAudioUpload, this.plugins.audio.updateCover.bind(this), false);
    },

    /**
     * @Override fileManager
     */
    resetFileInfo: function () {
        this.plugins.fileManager.resetInfo.call(this, 'audio', this.functions.onAudioUpload);
    },

    /**
     * @Required @Override dialog
     */
    on: function (update) {
        if (!update) {
            this.plugins.audio.init.call(this);
        } else if (this.context.audio._element) {
            this.context.dialog.updateModal = true;
            this.context.audio.audioUrlFile.value = this.context.audio._element.src;
        }
    },

    /**
     * @Required @Override dialog
     */
    open: function () {
        this.plugins.dialog.open.call(this, 'audio', 'audio' === this.currentControllerName);
    },

    submit: function (e) {
        const context = this.context.audio;

        e.preventDefault();
        e.stopPropagation();

        try {
            if (context.audioInputFile && context.audioInputFile.files.length > 0) {
                // upload files
                this.plugins.audio.submitAction.call(this, context.audioInputFile.files);
            } else if (context.audioUrlFile && context.audioUrlFile.value.trim().length > 0) {
                // url
                this.plugins.audio.setupUrl.call(this, context.audioUrlFile);
            }
        } catch (error) {
            throw Error('[SUNEDITOR.audio.submit.fail] cause : "' + error.message + '"');
        } finally {
            this.plugins.dialog.close.call(this);
        }

        return false;
    },

    submitAction: function (fileList) {
        if (fileList.length === 0) return;

        let fileSize = 0;
        let files = [];
        for (let i = 0, len = fileList.length; i < len; i++) {
            if (/audio/i.test(fileList[i].type)) {
                files.push(fileList[i]);
                fileSize += fileList[i].size;
            }
        }

        const limitSize = this.context.option.audioUploadSizeLimit;
        if (limitSize > 0) {
            let infoSize = 0;
            const audiosInfo = this.context.audio._infoList;
            for (let i = 0, len = audiosInfo.length; i < len; i++) {
                infoSize += audiosInfo[i].size * 1;
            }

            if ((fileSize + infoSize) > limitSize) {
                const err = '[SUNEDITOR.audioUpload.fail] Size of uploadable total audios: ' + (limitSize/1000) + 'KB';
                if (this.functions.onAudioUploadError !== 'function' || this.functions.onAudioUploadError(err, { 'limitSize': limitSize, 'currentSize': infoSize, 'uploadSize': fileSize }, this)) {
                    this.functions.noticeOpen(err);
                }
                return;
            }
        }

        const context = this.context.audio;
        const audioPlugin = this.plugins.audio;

        context._uploadFileLength = files.length;
        const audioUploadUrl = this.context.option.audioUploadUrl;
        const filesLen = this.context.dialog.updateModal ? 1 : files.length;

        const info = {
            isUpdate: this.context.dialog.updateModal,
            element: context._element
        };

        if (typeof this.functions.onAudioUploadBefore === 'function') {
            const result = this.functions.onAudioUploadBefore(files, info, this);
            if (!result) return;
            if (typeof result === 'object' && result.length > 0) files = result;
        }

        // create formData
        const formData = new FormData();
        for (let i = 0; i < filesLen; i++) {
            formData.append('file-' + i, files[i]);
        }

        // server upload
        this.plugins.fileManager.upload.call(this, audioUploadUrl, this.context.option.audioUploadHeader, formData, audioPlugin.callBack_upload.bind(this, info), this.functions.onAudioUploadError);
    },

    callBack_upload: function (info, xmlHttp) {
        const response = JSON.parse(xmlHttp.responseText);

        if (response.errorMessage) {
            if (this.functions.onAudioUploadError !== 'function' || this.functions.onAudioUploadError(response.errorMessage, response, this)) {
                this.functions.noticeOpen(response.errorMessage);
            }
        } else {
            const fileList = response.result;
            for (let i = 0, len = fileList.length, file, oAudio; i < len; i++) {
                if (info.isUpdate) oAudio = info.element;
                else oAudio = this.plugins.audio._createAudioTag.call(this);

                file = { name: fileList[i].name, size: fileList[i].size };
                this.plugins.audio.create_audio.call(this, oAudio, fileList[i].url, file, info.isUpdate);
            }
        }
    },

    setupUrl: function (urlFile) {
        try {
            this.showLoading();
            const src = urlFile.value.trim();
            if (src.length === 0) return false;

            this.plugins.audio.create_audio.call(this, this.plugins.audio._createAudioTag.call(this), src, null, this.context.dialog.updateModal);
        } catch (error) {
            throw Error('[SUNEDITOR.audio.audio.fail] cause : "' + error.message + '"');
        } finally {
            this.closeLoading();
        }
    },

    create_audio: function (element, src, file, isUpdate) {
        const context = this.context.audio;
        
        // create new tag
        if (!isUpdate) {
            element.src = src;
            const cover = this.plugins.component.set_cover.call(this, element);
            const container = this.plugins.component.set_container.call(this, cover, '');
            this.insertComponent(container, false);
        } // update
        else {
            if (context._element) element = context._element;
            if (element && element.src !== src) {
                element.src = src;
            } else {
                return;
            }
        }

        this.plugins.fileManager.setInfo.call(this, 'audio', element, this.functions.onAudioUpload, file, false);
        this.history.push(false);
    },

    updateCover: function (element) {
        const context = this.context.audio;
        element.setAttribute('controls', true);
        
        // find component element
        const existElement = this.util.getParentElement(element, this.util.isMediaComponent) || 
            this.util.getParentElement(element, function (current) {
                return this.isWysiwygDiv(current.parentNode);
            }.bind(this.util));

        // clone element
        context._element = element = element.cloneNode(false);
        const cover = this.plugins.component.set_cover.call(this, element);
        const container = this.plugins.component.set_container.call(this, cover, 'se-audio-container');

        existElement.parentNode.replaceChild(container, existElement);
        this.plugins.fileManager.setInfo.call(this, 'audio', element, this.functions.onAudioUpload, null, false);
    },

    /**
     * @Required @Override fileManager, resizing
     */
    onModifyMode: function (selectionTag) {
        const context = this.context.audio;

        const controller = context.controller;
        const offset = this.util.getOffset(selectionTag, this.context.element.wysiwygFrame);
        controller.style.top = (offset.top + selectionTag.offsetHeight + 10) + 'px';
        controller.style.left = (offset.left - this.context.element.wysiwygFrame.scrollLeft) + 'px';

        controller.style.display = 'block';

        const overLeft = this.context.element.wysiwygFrame.offsetWidth - (controller.offsetLeft + controller.offsetWidth);
        if (overLeft < 0) {
            controller.style.left = (controller.offsetLeft + overLeft) + 'px';
            controller.firstElementChild.style.left = (20 - overLeft) + 'px';
        } else {
            controller.firstElementChild.style.left = '20px';
        }
        
        this.controllersOn(controller, selectionTag, this.plugins.audio.init.bind(this), 'audio');

        this.util.addClass(selectionTag, 'active');
        context._element = selectionTag;
        context._cover = this.util.getParentElement(selectionTag, 'FIGURE');
        context._container = this.util.getParentElement(selectionTag, this.util.isComponent);
    },

    /**
     * @Required @Override fileManager, resizing
     */
    openModify: function (notOpen) {
        if (this.context.audio.audioUrlFile) this.context.audio.audioUrlFile.value = this.context.audio._element.src;
        if (!notOpen) this.plugins.dialog.open.call(this, 'audio', true);
    },

    onClick_controller: function (e) {
        e.stopPropagation();

        const command = e.target.getAttribute('data-command');
        if (!command) return;

        e.preventDefault();

        if (/update/.test(command)) {
            this.plugins.audio.openModify.call(this, false);
        }
        else { /** delete */
            this.plugins.audio.destroy.call(this, this.context.audio._element);
        }

        this.controllersOff();
    },

    /**
     * @Required @Override dialog
     */
    init: function () {
        if (this.context.dialog.updateModal) return;
        const context = this.context.audio;

        if (context._element) this.util.removeClass(context._element, 'active');

        if (context.audioInputFile) context.audioInputFile.value = '';
        if (context.audioUrlFile) context.audioUrlFile.value = '';
        if (context.audioInputFile && context.audioUrlFile) context.audioUrlFile.removeAttribute('disabled');

        context.controller.style.display = 'none';
        context._element = null;
    }
};