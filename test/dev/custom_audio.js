// import dialog from '../../src/plugins/modules/dialog';
// import component from '../../src/plugins/modules/component';
// import fileManager from '../../src/plugins/modules/fileManager';
import { dialog, component, fileManager } from '../../src/plugins/modules';


/** audio list */
const audioTable = document.getElementById('audio_list');
let audioList = [];

function userFunc_audioUpload (targetElement, index, state, info, remainingFilesCount) {
    console.log('audioInfo', info);

    if (state === 'delete') {
        audioList.splice(findIndex(audioList, index), 1)
    } else {
        if (state === 'create') {
            audioList.push(info)
        } else { // update
            //
        }
    }

    if (remainingFilesCount === 0) {
        console.log('audioList', audioList)
        _setAudioList(audioList)
    }
}

function _setAudioList () {
    let list = '';

    for (let i = 0, info; i < audioList.length; i++) {
        info = audioList[i];
            
        list += '<li>' +
                    '<button title="delete" onclick="_selectAudio(\'delete\',' + info.index + ')">X</button>' +
                    '<a href="javascript:void(0)" onclick="_selectAudio(\'select\',' + info.index + ')">' + info.src + '</a>' +
                '</li>';
    }

    audioTable.innerHTML = list;
}

window._selectAudio = function (type, index) {
    audioList[findIndex(audioList, index)][type]();
}

// ex) A link dialog plugin with used [dialog, component, fileManager] module
// Sample audio : https://file-examples.com/index.php/sample-audio-files/
export default {
    /**
     * @Required @Unique
     * plugin name
     */
    name: 'customAudio',

    /**
     * @Required
     * data display
     */
    display: 'dialog',

    /**
     * @options
     * You can also set from the button list
     */
    title:'Custom audio', 
    buttonClass:'', 
    innerHTML:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" /></svg>',

    /**
     * @Required
     * add function - It is called only once when the plugin is first run.
     * This function generates HTML to append and register the event.
     * arguments - (core : core object, targetElement : clicked button element)
     */
    add: function (core) {

        // If you are using a module, you must register the module using the "addModule" method.
        core.addModule([dialog, component, fileManager]);

        /**
         * @Required
         * Registering a namespace for caching as a plugin name in the context object
         */
        const context = core.context;
        context.customAudio = {
            _infoList: [], // @Override fileManager
            _infoIndex: 0, // @Override fileManager
            _uploadFileLength: 0, // @Override fileManager
            focusElement: null, // @Override // This element has focus when the dialog is opened.
            targetSelect: null,
            linkAnchorText: null,
            // @require @Override component
            _element: null,
            _cover: null,
            _container: null,
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
        let audio_dialog = this.setDialog(core);
        context.customAudio.modal = audio_dialog;
        context.customAudio.fileInput = audio_dialog.querySelector('._se_audio_files');
        context.customAudio.urlInput = audio_dialog.querySelector('.se-input-url');
        context.customAudio.focusElement = context.customAudio.fileInput;

        /** controller */
        let audio_controller = this.setController(core);
        context.customAudio.controller = audio_controller;

        /**
         * @Required
         * You must register the event propagation stop code in the "mousedown" event of the controller.
         */
        audio_controller.addEventListener('mousedown', function (e) { e.stopPropagation(); }, false);

        /** add event listeners */
        audio_dialog.querySelector('.se-dialog-files-edge-button').addEventListener('click', this._removeSelectedFiles.bind(context.fileInput, context.urlInput));
        audio_dialog.querySelector('form').addEventListener('submit', this.submit.bind(core));
        audio_controller.addEventListener('click', this.onClick_controller.bind(core));

        /** append html */
        context.dialog.modal.appendChild(audio_dialog);

        /** append controller */
        context.element.relative.appendChild(audio_controller);

        /** empty memory */
        audio_dialog = null, audio_controller = null;
    },

    /** HTML - dialog */
    setDialog: function (core) {
        const lang = core.lang;
        const dialog = core.util.createElement('DIV');

        dialog.className = 'se-dialog-content';
        dialog.style.display = 'none';
        let html = '' +
            '<form class="editor_link">' +
                '<div class="se-dialog-header">' +
                    '<button type="button" data-command="close" class="se-btn se-dialog-close" aria-label="Close" title="' + lang.dialogBox.close + '">' +
                        core.icons.cancel +
                    '</button>' +
                    '<span class="se-modal-title">' + lang.audio.title + '</span>' +
                '</div>' +
                '<div class="se-dialog-body">' +
                    '<div class="se-dialog-form">' +
                        '<label>' + lang.audio.file + '</label>' +
                        '<div class="se-dialog-form-files">' +
                            '<input class="se-input-form _se_audio_files" type="file" accept="audio/*" multiple="multiple" />' +
                            '<button type="button" data-command="filesRemove" class="se-btn se-dialog-files-edge-button se-file-remove" title="' + lang.controller.remove + '">' + core.icons.cancel + '</button>' +
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
    setController: function (core) {
        const lang = core.lang;
        const icons = core.icons;
        const link_btn = core.util.createElement('DIV');

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
    _removeSelectedFiles: function (urlInput) {
        this.value = '';
        if (urlInput) urlInput.removeAttribute('disabled');
    },

    /**
     * @Required @Override fileManager
     */
    fileTags: ['audio'],

    /**
     * @Override core, fileManager, resizing
     * @description It is called from core.component.select
     * @param {Element} element Target element
     */
    select: function (element) {
        this.plugins.customAudio.onModifyMode.call(this, element);
    },

    /**
     * @Override fileManager, resizing 
     * @param {Element} element Target element
     */
    destroy: function (element) {
        element = element || this.context.customAudio._element;
        const container = this.util.getParentElement(element, this.node.isComponent) || element;
        const dataIndex = element.getAttribute('data-index') * 1;
        const focusEl = (container.previousElementSibling || container.nextElementSibling);

        const emptyDiv = container.parentNode;
        this.util.removeItem(container);
        this.plugins.customAudio.init.call(this);
        this.controllersOff();

        if (emptyDiv !== this.context.element.wysiwyg) this.util.removeItemAllParents(emptyDiv, function (current) { return current.childNodes.length === 0; }, null);

        // focus
        this.focusEdge(focusEl);

        // fileManager event
        // (pluginName, data-index, "uploadEventHandler")
        this.plugins.fileManager.deleteInfo.call(this, 'customAudio', dataIndex, userFunc_audioUpload);

        // history stack
        this.history.push(false);
    },

    /**
     * @Override fileManager
     */
    checkFileInfo: function () {
        // (pluginName, [tag], "uploadEventHandler", "formatFixFunction", "using resizing module?")
        this.plugins.fileManager.checkInfo.call(this, 'customAudio', ['audio'], userFunc_audioUpload, this.plugins.customAudio.updateCover.bind(this), false);
    },

    /**
     * @Override fileManager
     */
    resetFileInfo: function () {
        // (pluginName, data-index, "uploadEventHandler")
        this.plugins.fileManager.resetInfo.call(this, 'customAudio', userFunc_audioUpload);
    },

    /**
     * @Required @Override dialog
     * This method is called just before the dialog opens.
     * @param {Boolean} update If "update" argument is true, it is not a new call, but a call to modify an already created element.
     */
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

    /**
     * @Required @Override dialog
     * This method is called when the plugin button is clicked.
     * Open the modal window here.
     */
    open: function () {
        // open.call(core, pluginName, isModify)
        this.plugins.dialog.open.call(this, 'customAudio', 'customAudio' === this.currentControllerName);
    },

    submit: function (e) {
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
            this.notice.open(response.errorMessage);
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
    },

    callBack_error: function (errorMessage, response, core) {
        core.notice.open(errorMessage | response.toString());
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

    // create or update
    create_audio: function (element, src, file, isUpdate) {
        const context = this.context.customAudio;
        
        // create new tag
        if (!isUpdate) {
            element.src = src;

            // In order to use it in the form of components such as images and videos, 
            // you need to create component tags by calling the "set_cover" and "set_container" functions of the "component" module.
            const cover = this.plugins.component.set_cover.call(this, element);
            const container = this.plugins.component.set_container.call(this, cover, '');
            this.component.insert(container, false);
        } // update
        else if (context._element.src !== src) {
            element = context._element;
            element.src = src
        } // not changed
        else {
            return;
        }

        // call fileManager.setInfo when updated tag
        // (pluginName, element, "uploadEventHandler", file, "using resizing module?")
        this.plugins.fileManager.setInfo.call(this, 'customAudio', element, userFunc_audioUpload, file, false);
        this.history.push(false);
    },

    // Update container for "audio" tag not matching format to be used in "checkFileInfo"
    updateCover: function (element) {
        const context = this.context.customAudio;
        element.setAttribute('controls', true);
        
        // find component element
        const existElement = this.util.getParentElement(element, this.node.isComponent) || 
            this.util.getParentElement(element, function (current) {
                return this.isWysiwygDiv(current.parentNode);
            }.bind(this.util));

        // clone element
        context._element = element = element.cloneNode(false);
        const cover = this.plugins.component.set_cover.call(this, element);
        const container = this.plugins.component.set_container.call(this, cover, 'se-video-container');

        existElement.parentNode.replaceChild(container, existElement);

        // call fileManager.setInfo when updated tag
        // (pluginName, element, "uploadEventHandler", file, "using resizing module?")
        this.plugins.fileManager.setInfo.call(this, 'customAudio', element, userFunc_audioUpload, null, false);
    },

    /**
     * @Required @Override fileManager, resizing
     * @param {Element} selectionTag Selected element
     * @param {Object} size Size object{w, h, t, 1} of "core.plugins.resizing.call_controller_resize" return value when if using "resizing" module
     */
    onModifyMode: function (selectionTag) {
        const context = this.context.customAudio;

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
        
        // Show controller at editor area (controller elements, function, "controller target element(@Required)", "controller name(@Required)", etc..)
        this.controllersOn(controller, selectionTag, this.plugins.customAudio.init.bind(this), 'customAudio');

        // set modify mode context
        selectionTag.style.border = '1px solid #80bdff';
        context._element = selectionTag;
        context._cover = this.util.getParentElement(selectionTag, 'FIGURE');
        context._container = this.util.getParentElement(selectionTag, this.node.isComponent);
    },

    /**
     * @Required @Override fileManager, resizing
     */
    openModify: function (notOpen) {
        this.context.customAudio.urlInput.value = this.context.customAudio._element.src;
        if (!notOpen) this.plugins.dialog.open.call(this, 'customAudio', true);
    },

    onClick_controller: function (e) {
        e.stopPropagation();

        const command = e.target.getAttribute('data-command');
        if (!command) return;

        e.preventDefault();

        if (/update/.test(command)) {
            this.plugins.customAudio.openModify.call(this, false);
        }
        else { /** delete */
            this.plugins.customAudio.destroy.call(this, this.context.customAudio._element);
        }

        this.controllersOff();
    },

    /**
     * @Required @Override dialog
     * This method is called when the dialog window is closed.
     * Initialize the properties.
     */
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