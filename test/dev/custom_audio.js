import dialog from '../../src/plugins/modules/dialog';
import component from '../../src/plugins/modules/component';
import fileManager from '../../src/plugins/modules/fileManager';

// ex) A link dialog plugin with used [dialog, component, fileManager] module
export default {
    // @Required @Unique
    // plugin name
    name: 'customAudio',

    // @Required
    // data display
    display: 'dialog',

    // @Required
    // add function - It is called only once when the plugin is first run.
    // This function generates HTML to append and register the event.
    // arguments - (core : core object, targetElement : clicked button element)
    add: function (core) {

        // If you are using a module, you must register the module using the "addModule" method.
        core.addModule([dialog, component, fileManager]);

        // @Required
        // Registering a namespace for caching as a plugin name in the context object
        const context = core.context;
        context.customAudio = {
            _infoList: [], // @overriding fileManager
            _infoIndex: 0, // @overriding fileManager
            _uploadFileLength: 0, // @overriding fileManager
            focusElement: null, // @Overriding // This element has focus when the dialog is opened.
            targetSelect: null,
            linkAnchorText: null,
            _element: null
        };

        // buton title
        const titleList = {
            en: 'Audio',
            ko: '오디오'
        };
        core.title = titleList[core.lang.code];

        // languages
        const customAudioLang = {
            en: {
                title: 'Audio',
                file: 'Select from files',
                url: 'Audio url'
            },
            ko: {
                title: '오디오',
                file: '파일에서 선택',
                url: '오디오 주소'
            }
        };
        core.lang.audio = customAudioLang[core.lang.code];
        
        /** dialog */
        let audio_dialog = this.setDialog.call(core);
        context.customAudio.modal = audio_dialog;
        context.customAudio.fileInput = audio_dialog.querySelector('._se_audio_files');
        context.customAudio.urlInput = audio_dialog.querySelector('.se-input-url');
        context.customAudio.focusElement = context.customAudio.fileInput;

        /** controller */
        let audio_controller = this.setController.call(core);
        context.customAudio.controller = audio_controller;
        context.customAudio._element = null;
        // @Required
        // You must register the event propagation stop code in the "mousedown" event of the controller.
        audio_controller.addEventListener('mousedown', function (e) { e.stopPropagation(); }, false);

        /** add event listeners */
        audio_dialog.querySelector('.se-dialog-files-edge-button').addEventListener('click', this._removeSelectedFiles.bind(core, context.fileInput, context.urlInput));
        audio_dialog.querySelector('.se-btn-primary').addEventListener('click', this.submit.bind(core));
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
        const lang = this.lang;
        const dialog = this.util.createElement('DIV');

        dialog.className = 'se-dialog-content';
        dialog.style.display = 'none';
        let html = '' +
            '<form class="editor_link">' +
                '<div class="se-dialog-header">' +
                    '<button type="button" data-command="close" class="se-btn se-dialog-close" aria-label="Close" title="' + lang.dialogBox.close + '">' +
                        this.icons.cancel +
                    '</button>' +
                    '<span class="se-modal-title">' + lang.audio.title + '</span>' +
                '</div>' +
                '<div class="se-dialog-body">' +
                    '<div class="se-dialog-form">' +
                        '<label>' + lang.audio.file + '</label>' +
                        '<div class="se-dialog-form-files">' +
                            '<input class="se-input-form _se_audio_files" type="file" accept="audio/*" multiple="multiple" />' +
                            '<button type="button" data-command="filesRemove" class="se-btn se-dialog-files-edge-button" title="' + lang.controller.remove + '">' + this.icons.cancel + '</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="se-dialog-form">' +
                        '<label>' + lang.audio.url + '</label>' +
                        '<input class="se-input-form se-input-url" type="text" />' +
                    '</div>' +
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

    _removeSelectedFiles: function (fileInput, urlInput) {
        fileInput.value = '';
        if (urlInput) urlInput.removeAttribute('disabled');
    },

    // @Required, @Overriding fileManager
    fileTags: ['audio'],

    // @overriding core, fileManager, resizing
    select: function (element) {
        this.plugins.customAudio.call_controller.call(this, element);
    },

    // @overriding fileManager, resizing
    destroy: function (element) {
        element = element || this.context.customAudio._element;
        let focusEl = (element.previousElementSibling || element.nextElementSibling);

        this.plugins.customAudio.init.call(this);
        this.controllersOff();

        // focus
        this.focusEdge(focusEl);

        // fileManager event
        this.plugins.fileManager.deleteInfo.call('customAudio', dataIndex, null);

        // history stack
        this.history.push(false);
    },

    // @overriding fileManager
    checkFileInfo: function () {
        this.plugins.fileManager.checkInfo.call(this, 'customAudio', ['audio'], null, this.plugins.customAudio.updateCover.bind(this), false);
    },

    // @overriding fileManager
    resetFileInfo: function () {
        this.plugins.fileManager.resetInfo.call(this, 'customAudio', null);
    },

    // @Required, @Overriding dialog
    // This method is called when the plugin button is clicked.
    // Open the modal window here.
    open: function () {
        // open.call(core, pluginName, isModify)
        this.plugins.dialog.open.call(this, 'customAudio', 'customAudio' === this.currentControllerName);
    },

    submit: function (e) {
        this.showLoading();
        const context = this.context.customAudio;

        e.preventDefault();
        e.stopPropagation();

        try {
            if (context.fileInput.files.length > 0) {
                // upload files
                this.plugins.customAudio.submitAction.call(this, context.fileInput.files);
            } else if (context.urlInput.value.trim().length > 0) {
                // url
                this.plugins.customAudio.setupUrl.call(this, context.urlInput);
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
        const files = [];
        for (let i = 0, len = fileList.length; i < len; i++) {
            if (/audio/i.test(fileList[i].type)) {
                files.push(fileList[i]);
                fileSize += fileList[i].size;
            }
        }

        const context = this.context.customAudio;
        const audioPlugin = this.plugins.customAudio;

        context._uploadFileLength = files.length;
        const filesLen = this.context.dialog.updateModal ? 1 : files.length;
        const info = {
            align: context._align,
            isUpdate: this.context.dialog.updateModal,
            element: context._element
        };

        // create formData
        const formData = new FormData();
        for (let i = 0; i < filesLen; i++) {
            formData.append('file-' + i, files[i]);
        }

        // fileManager - upload
        // (uploadURL, uploadHeader, formData, callBack, errorCallBack)
        this.plugins.fileManager.upload.call(this, 'http://localhost:3000', {}, formData, audioPlugin.callBack_upload.bind(this, info), audioPlugin.callBack_error);
    },

    callBack_upload: function (info, xmlHttp) {
        const response = JSON.parse(xmlHttp.responseText);

        if (response.errorMessage) {
            this.functions.noticeOpen(response.errorMessage);
        } else {
            const fileList = response.result;
            let oAudio = null;
            if (info.isUpdate) {
                oAudio = info.element;
            } else {
                this.util.createElement('AUDIO');
                oAudio.setAttribute('controls', true);
            }

            for (let i = 0, len = fileList.length, file; i < len; i++) {
                file = { name: fileList[i].name, size: fileList[i].size };
                this.plugins.customAudio.create_audio.call(this, oAudio, fileList[i].url, file, info.isUpdate);
            }
        }

        this.closeLoading();
    },

    callBack_error: function (errorMessage, response, core) {
        core.functions.noticeOpen(errorMessage | response.toString());
    },

    setupUrl: function () {
        try {
            this.showLoading();
            const context = this.context.customAudio;
            const src = context.urlInput.value.trim();

            if (src.length === 0) return false;

            const oAudio = this.util.createElement('AUDIO');
            oAudio.setAttribute('controls', true);

            // When opened for modification "this.context.dialog.updateModal" is true
            this.plugins.customAudio.create_audio.call(this, oAudio, src, null, this.context.dialog.updateModal);
        } catch (error) {
            throw Error('[SUNEDITOR.audio.audio.fail] cause : "' + error.message + '"');
        } finally {
            this.closeLoading();
        }
    },

    create_audio: function (element, src, file, isUpdate) {
        const context = this.context.customAudio;
        
        // create new tag
        if (!isUpdate) {
            element.src = src;

            // In order to use it in the form of components such as images and videos, 
            // you need to create component tags by calling the "set_cover" and "set_container" functions of the "component" module.
            const cover = this.plugins.component.set_cover.call(this, element);
            const container = this.plugins.component.set_container.call(this, cover, '');
            this.insertComponent(container, false);
        } // update
        else if (context._element.src !== src) {
            element = context._element;
            element.src = src
        } // not changed
        else {
            return;
        }

        // call fileManager.setInfo when updated tag
        // (pluginName, element, uploadEventHandler, file, "using resizing module")
        this.plugins.fileManager.setInfo.call(this, 'customAudio', element, null, file, false);
        this.history.push(false);
    },

    updateCover: function (element) {
        const context = this.context.customAudio;
        element.setAttribute('controls', true);
        
        // find component element
        const existElement = this.util.getParentElement(element, this.util.isMediaComponent) || 
            this.util.getParentElement(element, function (current) {
                return this.isWysiwygDiv(current.parentNode);
            }.bind(this.util));

        // clone element
        context._element = element = element.cloneNode(false);
        const cover = this.plugins.component.set_cover.call(this, element);
        const container = this.plugins.component.set_container.call(this, cover, 'se-video-container');

        existElement.parentNode.replaceChild(container, existElement);

        // call fileManager.setInfo when updated tag
        // (pluginName, element, uploadEventHandler, file, "using resizing module")
        this.plugins.fileManager.setInfo.call(this, 'customAudio', element, null, null, false);
    },

    // @Overriding dialog
    // This method is called just before the dialog opens.
    // If "update" argument is true, it is not a new call, but a call to modify an already created element.
    on: function (update) {
        if (!update) {
            this.plugins.customAudio.init.call(this);
        } else if (this.context.customAudio._element) {
            // "update" and "this.context.dialog.updateModal" are always the same value.
            // This code is an exception to the "link" plugin.
            this.context.dialog.updateModal = true;
            this.context.customAudio.urlInput.value = this.context.customAudio._element.src;
        }
    },

    call_controller: function (selectionTag) {
        selectionTag.style.border = '1px solid #80bdff';
        this.context.customAudio._element = selectionTag;
        const controller = this.context.customAudio.controller;

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
        
        // Show controller at editor area (controller elements, function, "controller target element(@Required)", "controller name(@Required)", etc..)
        this.controllersOn(controller, selectionTag, this.plugins.customAudio.init.bind(this), 'customAudio');
    },

    onClick_controller: function (e) {
        e.stopPropagation();

        const command = e.target.getAttribute('data-command');
        if (!command) return;

        e.preventDefault();

        const context = this.context.customAudio;
        if (/update/.test(command)) {
            context.urlInput.value = context._element.src;
            this.plugins.dialog.open.call(this, 'customAudio', true);
        }
        else { /** delete */
            const container = this.util.getParentElement(context._element, this.util.isMediaComponent);
            this.util.removeItem(container);
            context._element = null;
            this.focus();

            // history stack
            this.history.push(false);
        }

        this.controllersOff();
    },

    // @Required, @Overriding dialog
    // This method is called when the dialog window is closed.
    // Initialize the properties.
    init: function () {
        if (this.context.dialog.updateModal) return;

        const context = this.context.customAudio;
        if (context._element) context._element.style.border = '';
        context.controller.style.display = 'none';
        context._element = null;
        context.fileInput.value = '';
        context.urlInput.value = '';
    }
};