/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 Yi JiHong.
 * MIT license.
 */
'use strict';

import modal from '../modules/modal';
import anchor from '../modules/_anchor';
import mediaContainer from '../modules/mediaContainer';
import resizing from '../modules/resizing';
import fileManager from '../modules/fileManager';

export default {
    name: 'image',
    type: 'modal',
    add: function (core) {
        core.addModule([modal, anchor, mediaContainer, resizing, fileManager]);
        
        const options = core.options;
        const context = core.context;
        const contextImage = context.image = {
            _infoList: [], // @Override fileManager
            _infoIndex: 0, // @Override fileManager
            _uploadFileLength: 0, // @Override fileManager
            focusElement: null, // @Override modal // This element has focus when the modal is opened.
            sizeUnit: options._imageSizeUnit,
            _linkElement: '',
            _altText: '',
            _align: 'none',
            _floatClassRegExp: '__se__float\\-[a-z]+',
            _v_src: {_linkValue: ''},
            svgDefaultSize: '30%',
            base64RenderIndex: 0,
            // @require @Override mediaContainer
            _element: null,
            _cover: null,
            _container: null,
            // @Override resizing properties
            inputX: null,
            inputY: null,
            _element_w: 1,
            _element_h: 1,
            _element_l: 0,
            _element_t: 0,
            _defaultSizeX: 'auto',
            _defaultSizeY: 'auto',
            _origin_w: options.imageWidth === 'auto' ? '' : options.imageWidth,
            _origin_h: options.imageHeight === 'auto' ? '' : options.imageHeight,
            _proportionChecked: true,
            _resizing: options.imageResizing,
            _resizeDotHide: !options.imageHeightShow,
            _rotation: options.imageRotation,
            _alignHide: !options.imageAlignShow,
            _onlyPercentage: options.imageSizeOnlyPercentage,
            _ratio: false,
            _ratioX: 1,
            _ratioY: 1,
            _captionShow: true,
            _captionChecked: false,
            _caption: null,
            captionCheckEl: null
        };

        /** image modal */
        let image_modal = this.setModal(core);
        contextImage.modal = image_modal;
        contextImage.imgInputFile = image_modal.querySelector('._se_image_file');
        contextImage.imgUrlFile = image_modal.querySelector('._se_image_url');
        contextImage.focusElement = contextImage.imgInputFile || contextImage.imgUrlFile;
        contextImage.altText = image_modal.querySelector('._se_image_alt');
        contextImage.captionCheckEl = image_modal.querySelector('._se_image_check_caption');
        contextImage.previewSrc = image_modal.querySelector('._se_tab_content_image .se-link-preview');

        /** add event listeners */
        image_modal.querySelector('.se-modal-tabs').addEventListener('click', this.openTab.bind(core));
        image_modal.querySelector('form').addEventListener('submit', this.submit.bind(core));
        if (contextImage.imgInputFile) image_modal.querySelector('.se-file-remove').addEventListener('click', this._removeSelectedFiles.bind(contextImage.imgInputFile, contextImage.imgUrlFile, contextImage.previewSrc));
        if (contextImage.imgUrlFile) contextImage.imgUrlFile.addEventListener('input', this._onLinkPreview.bind(contextImage.previewSrc, contextImage._v_src, options.linkProtocol));
        if (contextImage.imgInputFile && contextImage.imgUrlFile) contextImage.imgInputFile.addEventListener('change', this._fileInputChange.bind(contextImage));

        const imageGalleryButton = image_modal.querySelector('.__se__gallery');
        if (imageGalleryButton) imageGalleryButton.addEventListener('click', this._openGallery.bind(core));
        
        contextImage.proportion = {};
        contextImage.inputX = {};
        contextImage.inputY = {};
        if (options.imageResizing) {
            contextImage.proportion = image_modal.querySelector('._se_image_check_proportion');
            contextImage.inputX = image_modal.querySelector('._se_image_size_x');
            contextImage.inputY = image_modal.querySelector('._se_image_size_y');
            contextImage.inputX.value = options.imageWidth;
            contextImage.inputY.value = options.imageHeight;
            
            contextImage.inputX.addEventListener('keyup', this.setInputSize.bind(core, 'x'));
            contextImage.inputY.addEventListener('keyup', this.setInputSize.bind(core, 'y'));

            contextImage.inputX.addEventListener('change', this.setRatio.bind(core));
            contextImage.inputY.addEventListener('change', this.setRatio.bind(core));
            contextImage.proportion.addEventListener('change', this.setRatio.bind(core));
            
            image_modal.querySelector('.se-modal-btn-revert').addEventListener('click', this.sizeRevert.bind(core));
        }

        /** append html */
        context.modal.modal.appendChild(image_modal);

        /** link event */
        core.plugins.anchor.initEvent.call(core, 'image', image_modal.querySelector('._se_tab_content_url'));
        contextImage.anchorCtx = core.context.anchor.caller.image;

        /** empty memory */
        image_modal = null;
    },

    /** modal */
    setModal: function (core) {
        const option = core.options;
        const lang = core.lang;
        const modal = core.util.createElement('DIV');

        modal.className = 'se-modal-content se-modal-image';
        modal.style.display = 'none';

        let html = '' +
            '<div class="se-modal-header">' +
                '<button type="button" data-command="close" class="se-btn se-modal-close" class="close" title="' + lang.modalBox.close + '" aria-label="' + lang.modalBox.close + '">' +
                    core.icons.cancel +
                '</button>' +
                '<span class="se-modal-title">' + lang.modalBox.imageBox.title + '</span>' +
            '</div>' +
            '<div class="se-modal-tabs">' +
                '<button type="button" class="_se_tab_link active" data-tab-link="image">' + lang.toolbar.image + '</button>' +
                '<button type="button" class="_se_tab_link" data-tab-link="url">' + lang.toolbar.link + '</button>' +
            '</div>' +
            '<form method="post" enctype="multipart/form-data">' +
                '<div class="_se_tab_content _se_tab_content_image">' +
                    '<div class="se-modal-body"><div style="border-bottom: 1px dashed #ccc;">';
                    
                    if (option.imageFileInput) {
                        html += '' +
                            '<div class="se-modal-form">' +
                                '<label>' + lang.modalBox.imageBox.file + '</label>' +
                                '<div class="se-modal-form-files">' +
                                    '<input class="se-input-form _se_image_file" type="file" accept="' + option.imageAccept + '"' + (option.imageMultipleFile ? ' multiple="multiple"' : '') + '/>' +
                                    '<button type="button" class="se-btn se-modal-files-edge-button se-file-remove" title="' + lang.controller.remove + '" aria-label="' + lang.controller.remove + '">' + core.icons.cancel + '</button>' +
                                '</div>' +
                            '</div>' ;
                    }
        
                    if (option.imageUrlInput) {
                        html += '' +
                            '<div class="se-modal-form">' +
                                '<label>' + lang.modalBox.imageBox.url + '</label>' +
                                '<div class="se-modal-form-files">' +
                                    '<input class="se-input-form se-input-url _se_image_url" type="text" />' +
                                    ((option.imageGalleryUrl && core.plugins.imageGallery) ? '<button type="button" class="se-btn se-modal-files-edge-button __se__gallery" title="' + lang.toolbar.imageGallery + '" aria-label="' + lang.toolbar.imageGallery + '">' + core.icons.image_gallery + '</button>' : '') +
                                '</div>' +
                                '<pre class="se-link-preview"></pre>' +
                            '</div>';
                    }
        
                    html += '</div>' +
                        '<div class="se-modal-form">' +
                            '<label>' + lang.modalBox.imageBox.altText + '</label><input class="se-input-form _se_image_alt" type="text" />' +
                        '</div>';

            if (option.imageResizing) {
                const onlyPercentage = option.imageSizeOnlyPercentage;
                const onlyPercentDisplay = onlyPercentage ? ' style="display: none !important;"' : '';
                const heightDisplay = !option.imageHeightShow ? ' style="display: none !important;"' : '';
                html += '<div class="se-modal-form">';
                        if (onlyPercentage || !option.imageHeightShow) {
                            html += '' +
                            '<div class="se-modal-size-text">' +
                                '<label class="size-w">' + lang.modalBox.size + '</label>' +
                            '</div>';
                        } else {
                            html += '' +
                            '<div class="se-modal-size-text">' +
                                '<label class="size-w">' + lang.modalBox.width + '</label>' +
                                '<label class="se-modal-size-x">&nbsp;</label>' +
                                '<label class="size-h">' + lang.modalBox.height + '</label>' +
                            '</div>';
                        }
                        html += '' +
                            '<input class="se-input-control _se_image_size_x" placeholder="auto"' + (onlyPercentage ? ' type="number" min="1"' : 'type="text"') + (onlyPercentage ? ' max="100"' : '') + ' />' +
                            '<label class="se-modal-size-x"' + heightDisplay + '>' + (onlyPercentage ? '%' : 'x') + '</label>' +
                            '<input type="text" class="se-input-control _se_image_size_y" placeholder="auto"' + onlyPercentDisplay + (onlyPercentage ? ' max="100"' : '') + heightDisplay + '/>' +
                            '<label' + onlyPercentDisplay + heightDisplay + '><input type="checkbox" class="se-modal-btn-check _se_image_check_proportion" checked/>&nbsp;' + lang.modalBox.proportion + '</label>' +
                            '<button type="button" title="' + lang.modalBox.revertButton + '" aria-label="' + lang.modalBox.revertButton + '" class="se-btn se-modal-btn-revert" style="float: right;">' + core.icons.revert + '</button>' +
                        '</div>' ;
            }

            html += '' +
                        '<div class="se-modal-form se-modal-form-footer">' +
                            '<label><input type="checkbox" class="se-modal-btn-check _se_image_check_caption" />&nbsp;' + lang.modalBox.caption + '</label>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="_se_tab_content _se_tab_content_url" style="display: none">' +
                    core.context.anchor.forms.innerHTML +
                '</div>' +
                '<div class="se-modal-footer">' +
                    '<div' + (option.imageAlignShow ? '' : ' style="display: none"') + '>' +
                        '<label><input type="radio" name="suneditor_image_radio" class="se-modal-btn-radio" value="none" checked>' + lang.modalBox.basic + '</label>' +
                        '<label><input type="radio" name="suneditor_image_radio" class="se-modal-btn-radio" value="left">' + lang.modalBox.left + '</label>' +
                        '<label><input type="radio" name="suneditor_image_radio" class="se-modal-btn-radio" value="center">' + lang.modalBox.center + '</label>' +
                        '<label><input type="radio" name="suneditor_image_radio" class="se-modal-btn-radio" value="right">' + lang.modalBox.right + '</label>' +
                    '</div>' +
                    '<button type="submit" class="se-btn-primary" title="' + lang.modalBox.submitButton + '" aria-label="' + lang.modalBox.submitButton + '"><span>' + lang.modalBox.submitButton + '</span></button>' +
                '</div>' +
            '</form>';

        modal.innerHTML = html;

        return modal;
    },

    _fileInputChange: function () {
        if (!this.imgInputFile.value) {
            this.imgUrlFile.removeAttribute('disabled');
            this.previewSrc.style.textDecoration = '';
        } else {
            this.imgUrlFile.setAttribute('disabled', true);
            this.previewSrc.style.textDecoration = 'line-through';
        }
    },

    _removeSelectedFiles: function (urlInput, previewSrc) {
        this.value = '';
        if (urlInput) {
            urlInput.removeAttribute('disabled');
            previewSrc.style.textDecoration = '';
        }
    },

    _openGallery: function () {
        this.plugins.imageGallery.open(this.plugins.image._setUrlInput.bind(this.context.image))
    },

    _setUrlInput: function (target) {
        this.altText.value = target.alt;
        this._v_src._linkValue = this.previewSrc.textContent = this.imgUrlFile.value = target.src;
        this.imgUrlFile.focus();
    },

    _onLinkPreview: function (context, protocol, e) {
        const value = e.target.value.trim();
        context._linkValue = this.textContent = !value ? '' : (protocol && value.indexOf('://') === -1 && value.indexOf('#') !== 0) ? protocol + value : value.indexOf('://') === -1 ? '/' + value : value;
    },

    /**
     * @Override @Required fileManager
     */
    fileTags: ['img'],

    /**
     * @Override core, fileManager, resizing
     * @description It is called from core.mediaContainer.select
     * @param {Element} element Target element
     */
    select: function (element) {
        this.plugins.image.onModifyMode.call(this, element, this.plugins.resizing.call_controller_resize.call(this, element, 'image'));
    },

    /**
     * @Override fileManager, resizing
     */
    destroy: function (element) {
        const imageEl = element || this.context.image._element;
        const imageContainer = this.util.getParentElement(imageEl, this.component.is) || imageEl;
        const dataIndex = imageEl.getAttribute('data-index') * 1;
        let focusEl = (imageContainer.previousElementSibling || imageContainer.nextElementSibling);
        
        const emptyDiv = imageContainer.parentNode;
        this.util.removeItem(imageContainer);
        this.plugins.image.init.call(this);
        this.menu.controllerOff();

        if (emptyDiv !== this.context.element.wysiwyg) this.util.removeAllParents(emptyDiv, function (current) { return current.childNodes.length === 0; }, null);

        // focus
        this.focusEdge(focusEl);
        
        // event
        this.plugins.fileManager.deleteInfo.call(this, 'image', dataIndex, this.events.onImageUpload);

        // history stack
        this.history.push(false);
    },

    /**
     * @Required @Override modal
     */
    on: function (update) {
        const contextImage = this.context.image;
        
        if (!update) {
            contextImage.inputX.value = contextImage._origin_w = this.options.imageWidth === contextImage._defaultSizeX ? '' : this.options.imageWidth;
            contextImage.inputY.value = contextImage._origin_h = this.options.imageHeight === contextImage._defaultSizeY ? '' : this.options.imageHeight;
            if (contextImage.imgInputFile && this.options.imageMultipleFile) contextImage.imgInputFile.setAttribute('multiple', 'multiple');
        } else {
            if (contextImage.imgInputFile && this.options.imageMultipleFile) contextImage.imgInputFile.removeAttribute('multiple');
        }
        this.plugins.anchor.on.call(this, contextImage.anchorCtx, update);
    },

    /**
     * @Required @Override modal
     */
    open: function () {
        this.plugins.modal.open.call(this, 'image', 'image' === this.currentControllerName);
    },

    openTab: function (e) {
        const modal = this.context.image.modal;
        const targetElement = (e === 'init' ? modal.querySelector('._se_tab_link') : e.target);

        if (!/^BUTTON$/i.test(targetElement.tagName)) {
            return false;
        }

        // Declare all variables
        const tabName = targetElement.getAttribute('data-tab-link');
        const contentClassName = '_se_tab_content';
        let i, tabContent, tabLinks;

        // Get all elements with class="tabcontent" and hide them
        tabContent = modal.getElementsByClassName(contentClassName);
        for (i = 0; i < tabContent.length; i++) {
            tabContent[i].style.display = 'none';
        }

        // Get all elements with class="tablinks" and remove the class "active"
        tabLinks = modal.getElementsByClassName('_se_tab_link');
        for (i = 0; i < tabLinks.length; i++) {
            this.util.removeClass(tabLinks[i], 'active');
        }

        // Show the current tab, and add an "active" class to the button that opened the tab
        modal.querySelector('.' + contentClassName + '_' + tabName).style.display = 'block';
        this.util.addClass(targetElement, 'active');

        // focus
        if (tabName === 'image' && this.context.image.focusElement) {
            this.context.image.focusElement.focus();
        } else if (tabName === 'url') {
            this.context.anchor.caller.image.urlInput.focus();
        }

        return false;
    },

    submit: function (e) {
        const contextImage = this.context.image;
        const imagePlugin = this.plugins.image;

        e.preventDefault();
        e.stopPropagation();

        contextImage._altText = contextImage.altText.value;
        contextImage._align = contextImage.modal.querySelector('input[name="suneditor_image_radio"]:checked').value;
        contextImage._captionChecked = contextImage.captionCheckEl.checked;
        if (contextImage._resizing) contextImage._proportionChecked = contextImage.proportion.checked;

        try {
            if (this.context.modal.updateModal) {
                imagePlugin.update_image.call(this, false, true, false);
            }
            
            if (contextImage.imgInputFile && contextImage.imgInputFile.files.length > 0) {
                this.openLoading();
                imagePlugin.submitAction.call(this, this.context.image.imgInputFile.files);
            } else if (contextImage.imgUrlFile && contextImage._v_src._linkValue.length > 0) {
                this.openLoading();
                imagePlugin.onRender_imgUrl.call(this, contextImage._v_src._linkValue);
            }
        } catch (error) {
            this.closeLoading();
            throw Error('[SUNEDITOR.image.submit.fail] cause : "' + error.message + '"');
        } finally {
            this.plugins.modal.close.call(this);
        }

        return false;
    },

    submitAction: function (fileList) {
        if (fileList.length === 0) return;

        let fileSize = 0;
        let files = [];
        for (let i = 0, len = fileList.length; i < len; i++) {
            if (/image/i.test(fileList[i].type)) {
                files.push(fileList[i]);
                fileSize += fileList[i].size;
            }
        }

        const limitSize = this.options.imageUploadSizeLimit;
        if (limitSize > 0) {
            let infoSize = 0;
            const imagesInfo = this.context.image._infoList;
            for (let i = 0, len = imagesInfo.length; i < len; i++) {
                infoSize += imagesInfo[i].size * 1;
            }

            if ((fileSize + infoSize) > limitSize) {
                this.closeLoading();
                const err = '[SUNEDITOR.imageUpload.fail] Size of uploadable total images: ' + (limitSize/1000) + 'KB';
                if (typeof this.events.onImageUploadError !== 'function' || this.events.onImageUploadError(err, { 'limitSize': limitSize, 'currentSize': infoSize, 'uploadSize': fileSize })) {
                    this.notice.open(err);
                }
                return;
            }
        }

        const contextImage = this.context.image;
        contextImage._uploadFileLength = files.length;
        
        const anchor = this.plugins.anchor.createAnchor.call(this, contextImage.anchorCtx, true);
        const info = {
            anchor: anchor,
            inputWidth: contextImage.inputX.value,
            inputHeight: contextImage.inputY.value,
            align: contextImage._align,
            isUpdate: this.context.modal.updateModal,
            alt: contextImage._altText,
            element: contextImage._element
        };

        if (typeof this.events.onImageUploadBefore === 'function') {
            const result = this.events.onImageUploadBefore(files, info, function (data) {
                if (data && this._w.Array.isArray(data.result)) {
                    this.plugins.image.register.call(this, info, data);
                } else {
                    this.plugins.image.upload.call(this, info, data);
                }
            }.bind(this));
            
            if (typeof result === 'undefined') return;
            if (!result) {
                this.closeLoading();
                return;
            }
            if (this._w.Array.isArray(result) && result.length > 0) files = result;
        }

        this.plugins.image.upload.call(this, info, files);
    },

    error: function (message, response) {
        this.closeLoading();
        if (typeof this.events.onImageUploadError !== 'function' || this.events.onImageUploadError(message, response)) {
            this.notice.open(message);
            throw Error('[SUNEDITOR.plugin.image.error] response: ' + message);
        }
    },

    upload: function (info, files) {
        if (!files) {
            this.closeLoading();
            return;
        }
        if (typeof files === 'string') {
            this.plugins.image.error.call(this, files, null);
            return;
        }

        const imageUploadUrl = this.options.imageUploadUrl;
        const filesLen = this.context.modal.updateModal ? 1 : files.length;

        // server upload
        if (typeof imageUploadUrl === 'string' && imageUploadUrl.length > 0) {
            const formData = new FormData();
            for (let i = 0; i < filesLen; i++) {
                formData.append('file-' + i, files[i]);
            }
            this.plugins.fileManager.upload.call(this, imageUploadUrl, this.options.imageUploadHeader, formData, this.plugins.image.callBack_imgUpload.bind(this, info), this.events.onImageUploadError);
        } else { // base64
            this.plugins.image.setup_reader.call(this, files, info.anchor, info.inputWidth, info.inputHeight, info.align, info.alt, filesLen, info.isUpdate);
        }
    },

    callBack_imgUpload: function (info, xmlHttp) {
        if (typeof this.events.imageUploadHandler === 'function') {
            this.events.imageUploadHandler(xmlHttp, info);
        } else {
            const response = JSON.parse(xmlHttp.responseText);
            if (response.errorMessage) {
                this.plugins.image.error.call(this, response.errorMessage, response);
            } else {
                this.plugins.image.register.call(this, info, response);
            }
        }
    },

    register: function (info, response) {
        const fileList = response.result;

        for (let i = 0, len = fileList.length, file; i < len; i++) {
            file = { name: fileList[i].name, size: fileList[i].size };
            if (info.isUpdate) {
                this.plugins.image.update_src.call(this, fileList[i].url, info.element, file);
                break;
            } else {
                this.plugins.image.create_image.call(this, fileList[i].url, info.anchor, info.inputWidth, info.inputHeight, info.align, file, info.alt);
            }
        }
        
        this.closeLoading();
    },

    setup_reader: function (files, anchor, width, height, align, alt, filesLen, isUpdate) {
        try {
            this.context.image.base64RenderIndex = filesLen;
            const wFileReader = this._w.FileReader;
            const filesStack = [filesLen];
            this.context.image.inputX.value = width;
            this.context.image.inputY.value = height;
    
            for (let i = 0, reader, file; i < filesLen; i++) {
                reader = new wFileReader();
                file = files[i];
    
                reader.onload = function (reader, update, updateElement, file, index) {
                    filesStack[index] = { result: reader.result, file: file };

                    if (--this.context.image.base64RenderIndex === 0) {
                        this.plugins.image.onRender_imgBase64.call(this, update, filesStack, updateElement, anchor, width, height, align, alt);
                        this.closeLoading();
                    }
                }.bind(this, reader, isUpdate, this.context.image._element, file, i);

                reader.readAsDataURL(file);
            }
        } catch (e) {
            this.closeLoading();
            throw Error('[SUNEDITOR.image.setup_reader.fail] cause : "' + e.message + '"');
        }
    },

    onRender_imgBase64: function (update, filesStack, updateElement, anchor, width, height, align, alt) {
        const updateMethod = this.plugins.image.update_src;
        const createMethod = this.plugins.image.create_image;
        
        for (let i = 0, len = filesStack.length; i < len; i++) {
            if (update) {
                this.context.image._element.setAttribute('data-file-name', filesStack[i].file.name);
                this.context.image._element.setAttribute('data-file-size', filesStack[i].file.size);
                updateMethod.call(this, filesStack[i].result, updateElement, filesStack[i].file);
            } else {
                createMethod.call(this, filesStack[i].result, anchor, width, height, align, filesStack[i].file, alt);
            }
        }
    },

    onRender_imgUrl: function (url) {
        if (!url) url = this.context.image._v_src._linkValue;
        if (!url) return false;
        const contextImage = this.context.image;

        try {
            const file = {name: url.split('/').pop(), size: 0};
            if (this.context.modal.updateModal) this.plugins.image.update_src.call(this, url, contextImage._element, file);
            else this.plugins.image.create_image.call(this, url, this.plugins.anchor.createAnchor.call(this, contextImage.anchorCtx, true), contextImage.inputX.value, contextImage.inputY.value, contextImage._align, file, contextImage._altText);
        } catch (e) {
            throw Error('[SUNEDITOR.image.URLRendering.fail] cause : "' + e.message + '"');
        } finally {
            this.closeLoading();
        }
    },

    onRender_link: function (imgTag, anchor) {
        if (anchor) {
            anchor.setAttribute('data-image-link', 'image');
            imgTag.setAttribute('data-image-link', anchor.href);
            anchor.appendChild(imgTag);
            return anchor;
        }

        return imgTag;
    },

    /**
     * @Override resizing
     * @param {string} xy 'x': width, 'y': height
     * @param {KeyboardEvent} e Event object
     */
    setInputSize: function (xy, e) {
        if (e && e.keyCode === 32) {
            e.preventDefault();
            return;
        }

        this.plugins.resizing._module_setInputSize.call(this, this.context.image, xy);
    },

    /**
     * @Override resizing
     */
    setRatio: function () {
        this.plugins.resizing._module_setRatio.call(this, this.context.image);
    },

    /**
     * @Override fileManager
     */
    checkFileInfo: function () {
        const imagePlugin = this.plugins.image;
        const contextImage = this.context.image;

        const modifyHandler = function (tag) {
            imagePlugin.onModifyMode.call(this, tag, null);
            imagePlugin.openModify.call(this, true);
            // get size
            contextImage.inputX.value = contextImage._origin_w;
            contextImage.inputY.value = contextImage._origin_h;
            // get align
            const format = this.format.getLine(tag);
            if (format) contextImage._align = format.style.textAlign || format.style.float;
            // link
            const link = this.util.getParentElement(tag, this.util.isAnchor);
            if (link && !contextImage.anchorCtx.linkValue) contextImage.anchorCtx.linkValue = ' ';
            
            imagePlugin.update_image.call(this, true, false, true);
            imagePlugin.init.call(this);
        }.bind(this);

        this.plugins.fileManager.checkInfo.call(this, 'image', ['img'], this.events.onImageUpload, modifyHandler, true);
    },

    /**
     * @Override fileManager
     */
    resetFileInfo: function () {
        this.plugins.fileManager.resetInfo.call(this, 'image', this.events.onImageUpload);
    },

    create_image: function (src, anchor, width, height, align, file, alt) {
        const imagePlugin = this.plugins.image;
        const contextImage = this.context.image;
        this.context.resizing._resize_plugin = 'image';

        let oImg = this.util.createElement('IMG');
        oImg.src = src;
        oImg.alt = alt;
        oImg.setAttribute('data-rotate', '0');
        anchor = imagePlugin.onRender_link.call(this, oImg, anchor);

        if (contextImage._resizing) {
            oImg.setAttribute('data-proportion', contextImage._proportionChecked);
        }

        const cover = this.plugins.mediaContainer.setCover.call(this, anchor);
        const container = this.plugins.mediaContainer.setContainer.call(this, cover, 'se-image-container');

        // caption
        if (contextImage._captionChecked) {
            contextImage._caption = this.plugins.mediaContainer.create_caption.call(this);
            contextImage._caption.setAttribute('contenteditable', false);
            cover.appendChild(contextImage._caption);
        }

        contextImage._element = oImg;
        contextImage._cover = cover;
        contextImage._container = container;

        // set size
        imagePlugin.applySize.call(this, width, height);

        // align
        imagePlugin.setAlign.call(this, align, oImg, cover, container);

        oImg.onload = imagePlugin._image_create_onload.bind(this, oImg, contextImage.svgDefaultSize, container);
        if (this.component.insert(container, true, true, true)) this.plugins.fileManager.setInfo.call(this, 'image', oImg, this.events.onImageUpload, file, true);
        this.context.resizing._resize_plugin = '';
    },

    _image_create_onload: function (oImg, svgDefaultSize, container) {
        // svg exception handling
        if (oImg.offsetWidth === 0) this.plugins.image.applySize.call(this, svgDefaultSize, '');
        if (this.options.mediaAutoSelect) {
            this.component.select(oImg, 'image');
        } else {
            const line = this.format.addLine(container, null);
            if (line) this.setRange(line, 0, line, 0);
        }
    },

    update_image: function (init, openController, notHistoryPush) {
        const contextImage = this.context.image;
        let imageEl = contextImage._element;
        let cover = contextImage._cover;
        let container = contextImage._container;
        let isNewContainer = false;

        if (cover === null) {
            isNewContainer = true;
            imageEl = contextImage._element.cloneNode(true);
            cover = this.plugins.mediaContainer.setCover.call(this, imageEl);
        }

        if (container === null) {
            cover = cover.cloneNode(true);
            imageEl = cover.querySelector('img');
            isNewContainer = true;
            container = this.plugins.mediaContainer.setContainer.call(this, cover, 'se-image-container');
        } else if (isNewContainer) {
            container.innerHTML = '';
            container.appendChild(cover);
            contextImage._cover = cover;
            contextImage._element = imageEl;
            isNewContainer = false;
        }

        // check size
        let changeSize;
        const x = this.util.isNumber(contextImage.inputX.value) ? contextImage.inputX.value + contextImage.sizeUnit : contextImage.inputX.value;
        const y = this.util.isNumber(contextImage.inputY.value) ? contextImage.inputY.value + contextImage.sizeUnit : contextImage.inputY.value;
        if (/%$/.test(imageEl.style.width)) {
            changeSize = x !== container.style.width || y !== container.style.height;
        } else {
            changeSize = x !== imageEl.style.width || y !== imageEl.style.height;
        }

        // alt
        imageEl.alt = contextImage._altText;
        
        // caption
        let modifiedCaption = false;
        if (contextImage._captionChecked) {
            if (!contextImage._caption) {
                contextImage._caption = this.plugins.mediaContainer.create_caption.call(this);
                cover.appendChild(contextImage._caption);
                modifiedCaption = true;
            }
        } else {
            if (contextImage._caption) {
                this.util.removeItem(contextImage._caption);
                contextImage._caption = null;
                modifiedCaption = true;
            }
        }

        // link
        const anchor = this.plugins.anchor.createAnchor.call(this, contextImage.anchorCtx, true);
        if (anchor) {
            if (contextImage._linkElement !== anchor) {
                contextImage._linkElement = anchor.cloneNode(false);
                cover.insertBefore(this.plugins.image.onRender_link.call(this, imageEl, contextImage._linkElement), contextImage._caption);
                this.util.removeItem(anchor);
            } else {
                contextImage._linkElement.setAttribute('data-image-link', 'image');
            }
        } else if (contextImage._linkElement !== null) {
            const imageElement = imageEl;
            imageElement.setAttribute('data-image-link', '');
            if (cover.contains(contextImage._linkElement)) {
                const newEl = imageElement.cloneNode(true);
                cover.removeChild(contextImage._linkElement);
                cover.insertBefore(newEl, contextImage._caption);
                contextImage._element = imageEl = newEl;
            }
        }

        if (isNewContainer) {
            let existElement = (this.format.isBlock(contextImage._element.parentNode) || this.util.isWysiwygDiv(contextImage._element.parentNode)) ? 
                contextImage._element : 
                /^A$/i.test(contextImage._element.parentNode.nodeName) ? contextImage._element.parentNode : this.format.getLine(contextImage._element) || contextImage._element;
                
            if (this.util.isListCell(existElement)) {
                const refer = this.util.getParentElement(contextImage._element, function (current) { return current.parentNode === existElement; });
                existElement.insertBefore(container, refer);
                this.util.removeItem(contextImage._element);
                this.util.removeEmptyNode(refer, null);
            } else if (this.util.isFormatElement(existElement)) {
                const refer = this.util.getParentElement(contextImage._element, function (current) { return current.parentNode === existElement; });
                existElement = this.util.splitElement(existElement, refer);
                existElement.parentNode.insertBefore(container, existElement);
                this.util.removeItem(contextImage._element);
                this.util.removeEmptyNode(existElement, null);
                if (existElement.children.length === 0) existElement.innerHTML = this.util.removeWhiteSpace(existElement.innerHTML);
            } else {
                if (this.format.isLine(existElement.parentNode)) {
                    const formats = existElement.parentNode;
                    formats.parentNode.insertBefore(container, existElement.previousSibling ? formats.nextElementSibling : formats);
                    this.util.removeItem(existElement);
                } else {
                    existElement.parentNode.replaceChild(container, existElement);
                }
            }

            imageEl = container.querySelector('img');

            contextImage._element = imageEl;
            contextImage._cover = cover;
            contextImage._container = container;
        }

        // transform
        if (modifiedCaption || (!contextImage._onlyPercentage && changeSize)) {
            if (!init && (/\d+/.test(imageEl.style.height) || (this.context.resizing._rotateVertical && contextImage._captionChecked))) {
                if (/%$/.test(contextImage.inputX.value) || /%$/.test(contextImage.inputY.value)) {
                    this.plugins.resizing.resetTransform.call(this, imageEl);
                } else {
                    this.plugins.resizing.setTransformSize.call(this, imageEl, this.util.getNumber(contextImage.inputX.value, 0), this.util.getNumber(contextImage.inputY.value, 0));
                }
            }
        }

        // size
        if (contextImage._resizing) {
            imageEl.setAttribute('data-proportion', contextImage._proportionChecked);
            if (changeSize) {
                this.plugins.image.applySize.call(this);
            }
        }

        // align
        this.plugins.image.setAlign.call(this, null, imageEl, null, null);

        // set imagesInfo
        if (init) {
            this.plugins.fileManager.setInfo.call(this, 'image', imageEl, this.events.onImageUpload, null, true);
        }

        if (openController) {
            this.component.select(imageEl, 'image');
        }

        // history stack
        if (!notHistoryPush) this.history.push(false);
    },

    update_src: function (src, element, file) {
        element.src = src;
        this._w.setTimeout(this.plugins.fileManager.setInfo.bind(this, 'image', element, this.events.onImageUpload, file, true));
        this.component.select(element, 'image');
    },

    /**
     * @Required @Override fileManager, resizing
     */
    onModifyMode: function (element, size) {
        if (!element) return;
        
        const contextImage = this.context.image;
        contextImage._linkElement = contextImage.anchorCtx.linkAnchor = /^A$/i.test(element.parentNode.nodeName) ? element.parentNode : null;
        contextImage._element = element;
        contextImage._cover = this.util.getParentElement(element, 'FIGURE');
        contextImage._container = this.util.getParentElement(element, this.component.is);
        contextImage._caption = this.util.getEdgeChild(contextImage._cover, 'FIGCAPTION');
        contextImage._align = element.style.float || element.getAttribute('data-align') || 'none';
        element.style.float = '';
        this.plugins.anchor.setCtx(contextImage._linkElement, contextImage.anchorCtx);

        if (size) {
            contextImage._element_w = size.w;
            contextImage._element_h = size.h;
            contextImage._element_t = size.t;
            contextImage._element_l = size.l;
        }

        let userSize = contextImage._element.getAttribute('data-size') || contextImage._element.getAttribute('data-origin');
        let w, h;
        if (userSize) {
            userSize = userSize.split(',');
            w = userSize[0];
            h = userSize[1];
        } else if (size) {
            w = size.w;
            h = size.h;
        }

        contextImage._origin_w = w || element.style.width || element.width || '';
        contextImage._origin_h = h || element.style.height || element.height || '';
    },

    /**
     * @Required @Override fileManager, resizing
     */
    openModify: function (notOpen) {
        const contextImage = this.context.image;
        if (contextImage.imgUrlFile) {
            contextImage._v_src._linkValue = contextImage.previewSrc.textContent = contextImage.imgUrlFile.value = contextImage._element.src;
        }
        contextImage._altText = contextImage.altText.value = contextImage._element.alt;
        (contextImage.modal.querySelector('input[name="suneditor_image_radio"][value="' + contextImage._align + '"]') || contextImage.modal.querySelector('input[name="suneditor_image_radio"][value="none"]')).checked = true;
        contextImage._align = contextImage.modal.querySelector('input[name="suneditor_image_radio"]:checked').value;
        contextImage._captionChecked = contextImage.captionCheckEl.checked = !!contextImage._caption;
        
        if (contextImage._resizing) {
            this.plugins.resizing._module_setModifyInputSize.call(this, contextImage, this.plugins.image);
        }

        if (!notOpen) this.plugins.modal.open.call(this, 'image', true);
    },

    /**
     * @Override fileManager
     */
    applySize: function (w, h) {
        const contextImage = this.context.image;

        if (!w) w = contextImage.inputX.value || this.options.imageWidth;
        if (!h) h = contextImage.inputY.value || this.options.imageHeight;
        
        if ((contextImage._onlyPercentage && !!w) || /%$/.test(w)) {
            this.plugins.image.setPercentSize.call(this, w, h);
            return true;
        } else if ((!w || w === 'auto') && (!h || h === 'auto')) {
            this.plugins.image.setAutoSize.call(this);
        } else {
            this.plugins.image.setSize.call(this, w, h, false);
        }

        return false;
    },

    /**
     * @Override resizing
     */
    sizeRevert: function () {
        this.plugins.resizing._module_sizeRevert.call(this, this.context.image);
    },

    /**
     * @Override resizing
     */
    setSize: function (w, h, notResetPercentage, direction) {
        const contextImage = this.context.image;
        const onlyW = /^(rw|lw)$/.test(direction);
        const onlyH = /^(th|bh)$/.test(direction);

        if (!onlyH) {
            contextImage._element.style.width = this.util.isNumber(w) ? w + contextImage.sizeUnit : w;
            this.plugins.image.cancelPercentAttr.call(this);
        }
        if (!onlyW) {
            contextImage._element.style.height = this.util.isNumber(h) ? h + contextImage.sizeUnit : /%$/.test(h) ? '' : h;
        }

        if (contextImage._align === 'center') this.plugins.image.setAlign.call(this, null, null, null, null);
        if (!notResetPercentage) contextImage._element.removeAttribute('data-percentage');

        // save current size
        this.plugins.resizing._module_saveCurrentSize.call(this, contextImage);
    },

    /**
     * @Override resizing
     */
    setAutoSize: function () {
        const contextImage = this.context.image;

        this.plugins.resizing.resetTransform.call(this, contextImage._element);
        this.plugins.image.cancelPercentAttr.call(this);

        contextImage._element.style.maxWidth = '';
        contextImage._element.style.width = '';
        contextImage._element.style.height = '';
        contextImage._cover.style.width = '';
        contextImage._cover.style.height = '';

        this.plugins.image.setAlign.call(this, null, null, null, null);
        contextImage._element.setAttribute('data-percentage', 'auto,auto');

        // save current size
        this.plugins.resizing._module_saveCurrentSize.call(this, contextImage);
    },
    
    /**
     * @Override resizing
     */
    setOriginSize: function () {
        const contextImage = this.context.image;
        contextImage._element.removeAttribute('data-percentage');

        this.plugins.resizing.resetTransform.call(this, contextImage._element);
        this.plugins.image.cancelPercentAttr.call(this);

        const originSize = (contextImage._element.getAttribute('data-origin') || '').split(',');
        const w = originSize[0];
        const h = originSize[1];

        if (originSize) {
            if (contextImage._onlyPercentage || (/%$/.test(w) && (/%$/.test(h) || !/\d/.test(h)))) {
                this.plugins.image.setPercentSize.call(this, w, h);
            } else {
                this.plugins.image.setSize.call(this, w, h);
            }

            // save current size
            this.plugins.resizing._module_saveCurrentSize.call(this, contextImage);
        }
    },

    /**
     * @Override resizing
     */
    setPercentSize: function (w, h) {
        const contextImage = this.context.image;
        h = !!h && !/%$/.test(h) && !this.util.getNumber(h, 0) ? this.util.isNumber(h) ? h + '%' : h : this.util.isNumber(h) ? h + contextImage.sizeUnit : (h || '');
        const heightPercentage = /%$/.test(h);

        contextImage._container.style.width = this.util.isNumber(w) ? w + '%' : w;
        contextImage._container.style.height = '';
        contextImage._cover.style.width = '100%';
        contextImage._cover.style.height = !heightPercentage ? '' : h;
        contextImage._element.style.width = '100%';
        contextImage._element.style.height = heightPercentage ? '' : h;
        contextImage._element.style.maxWidth = '';

        if (contextImage._align === 'center') this.plugins.image.setAlign.call(this, null, null, null, null);

        contextImage._element.setAttribute('data-percentage', w + ',' + h);
        this.plugins.resizing.setCaptionPosition.call(this, contextImage._element);

        // save current size
        this.plugins.resizing._module_saveCurrentSize.call(this, contextImage);
    },

    /**
     * @Override resizing
     */
    cancelPercentAttr: function () {
        const contextImage = this.context.image;
        
        contextImage._cover.style.width = '';
        contextImage._cover.style.height = '';
        contextImage._container.style.width = '';
        contextImage._container.style.height = '';

        this.util.removeClass(contextImage._container, this.context.image._floatClassRegExp);
        this.util.addClass(contextImage._container, '__se__float-' + contextImage._align);

        if (contextImage._align === 'center') this.plugins.image.setAlign.call(this, null, null, null, null);
    },

    /**
     * @Override resizing
     */
    setAlign: function (align, element, cover, container) {
        const contextImage = this.context.image;
        
        if (!align) align = contextImage._align;
        if (!element) element = contextImage._element;
        if (!cover) cover = contextImage._cover;
        if (!container) container = contextImage._container;

        if (align && align !== 'none') {
            cover.style.margin = 'auto';
        } else {
            cover.style.margin = '0';
        }

        if (/%$/.test(element.style.width) && align === 'center') {
            container.style.minWidth = '100%';
            cover.style.width = container.style.width;
        } else {
            container.style.minWidth = '';
            cover.style.width = this.context.resizing._rotateVertical ? (element.style.height || element.offsetHeight) : ((!element.style.width || element.style.width === 'auto') ? '' : element.style.width || '100%');
        }

        if (!this.util.hasClass(container, '__se__float-' + align)) {
            this.util.removeClass(container, contextImage._floatClassRegExp);
            this.util.addClass(container, '__se__float-' + align);
        }
        
        element.setAttribute('data-align', align);
    },

    /**
     * @Override modal
     */
    init: function () {
        const contextImage = this.context.image;
        if (contextImage.imgInputFile) contextImage.imgInputFile.value = '';
        if (contextImage.imgUrlFile) contextImage._v_src._linkValue = contextImage.previewSrc.textContent = contextImage.imgUrlFile.value = '';
        if (contextImage.imgInputFile && contextImage.imgUrlFile) {
            contextImage.imgUrlFile.removeAttribute('disabled');
            contextImage.previewSrc.style.textDecoration = '';
        }

        contextImage.altText.value = '';
        contextImage.modal.querySelector('input[name="suneditor_image_radio"][value="none"]').checked = true;
        contextImage.captionCheckEl.checked = false;
        contextImage._element = null;
        this.plugins.image.openTab.call(this, 'init');

        if (contextImage._resizing) {
            contextImage.inputX.value = this.options.imageWidth === contextImage._defaultSizeX ? '' : this.options.imageWidth;
            contextImage.inputY.value = this.options.imageHeight === contextImage._defaultSizeY ? '' : this.options.imageHeight;
            contextImage.proportion.checked = true;
            contextImage._ratio = false;
            contextImage._ratioX = 1;
            contextImage._ratioY = 1;
        }

        this.plugins.anchor.init.call(this, contextImage.anchorCtx);
    }
};
