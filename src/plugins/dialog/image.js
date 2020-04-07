/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

import dialog from '../modules/dialog';
import resizing from '../modules/resizing';

export default {
    name: 'image',
    display: 'dialog',
    add: function (core) {
        core.addModule([dialog, resizing]);
        
        const context = core.context;
        const contextImage = context.image = {
            _imagesInfo: [],
            _imageIndex: 0,
            sizeUnit: context.option._imageSizeUnit,
            _altText: '',
            _linkElement: null,
            _linkValue: '',
            _align: 'none',
            _floatClassRegExp: '__se__float\\-[a-z]+',
            _uploadFileLength: 0,
            _xmlHttp: null,
            // @overriding resizing properties
            inputX: null,
            inputY: null,
            _container: null,
            _cover: null,
            _element: null,
            _element_w: 1,
            _element_h: 1,
            _element_l: 0,
            _element_t: 0,
            _defaultSizeX: 'auto',
            _defaultSizeY: 'auto',
            _origin_w: context.option.imageWidth === 'auto' ? '' : context.option.imageWidth,
            _origin_h: context.option.imageHeight === 'auto' ? '' : context.option.imageHeight,
            _proportionChecked: true,
            _resizing: context.option.imageResizing,
            _resizeDotHide: !context.option.imageHeightShow,
            _rotation: context.option.imageRotation,
            _onlyPercentage: context.option.imageSizeOnlyPercentage,
            _ratio: false,
            _ratioX: 1,
            _ratioY: 1,
            _captionShow: true,
            _captionChecked: false,
            _caption: null,
            captionCheckEl: null
        };

        /** image dialog */
        let image_dialog = this.setDialog.call(core);
        contextImage.modal = image_dialog;
        contextImage.imgInputFile = image_dialog.querySelector('._se_image_file');
        contextImage.imgUrlFile = image_dialog.querySelector('.se-input-url');
        contextImage.focusElement = (contextImage.imgInputFile || contextImage.imgUrlFile);
        contextImage.altText = image_dialog.querySelector('._se_image_alt');
        contextImage.imgLink = image_dialog.querySelector('._se_image_link');
        contextImage.imgLinkNewWindowCheck = image_dialog.querySelector('._se_image_link_check');
        contextImage.captionCheckEl = image_dialog.querySelector('._se_image_check_caption');

        /** add event listeners */
        image_dialog.querySelector('.se-dialog-tabs').addEventListener('click', this.openTab.bind(core));
        image_dialog.querySelector('.se-btn-primary').addEventListener('click', this.submit.bind(core));
        image_dialog.querySelector('.se-dialog-files-remove').addEventListener('click', this._removeSelectedFiles.bind(core, contextImage.imgInputFile, contextImage.imgUrlFile));
        if (contextImage.imgInputFile && contextImage.imgUrlFile) contextImage.imgInputFile.addEventListener('change', this._fileInputChange.bind(contextImage));
        
        contextImage.proportion = {};
        contextImage.inputX = {};
        contextImage.inputY = {};
        if (context.option.imageResizing) {
            contextImage.proportion = image_dialog.querySelector('._se_image_check_proportion');
            contextImage.inputX = image_dialog.querySelector('._se_image_size_x');
            contextImage.inputY = image_dialog.querySelector('._se_image_size_y');
            contextImage.inputX.value = context.option.imageWidth;
            contextImage.inputY.value = context.option.imageHeight;
            
            contextImage.inputX.addEventListener('keyup', this.setInputSize.bind(core, 'x'));
            contextImage.inputY.addEventListener('keyup', this.setInputSize.bind(core, 'y'));

            contextImage.inputX.addEventListener('change', this.setRatio.bind(core));
            contextImage.inputY.addEventListener('change', this.setRatio.bind(core));
            contextImage.proportion.addEventListener('change', this.setRatio.bind(core));
            
            image_dialog.querySelector('.se-dialog-btn-revert').addEventListener('click', this.sizeRevert.bind(core));
        }

        /** append html */
        context.dialog.modal.appendChild(image_dialog);

        /** empty memory */
        image_dialog = null;
    },

    /** dialog */
    setDialog: function () {
        const option = this.context.option;
        const lang = this.lang;
        const dialog = this.util.createElement('DIV');

        dialog.className = 'se-dialog-content';
        dialog.style.display = 'none';

        let html = '' +
            '<div class="se-dialog-header">' +
                '<button type="button" data-command="close" class="se-btn se-dialog-close" class="close" aria-label="Close" title="' + lang.dialogBox.close + '">' +
                    this.icons.cancel +
                '</button>' +
                '<span class="se-modal-title">' + lang.dialogBox.imageBox.title + '</span>' +
            '</div>' +
            '<div class="se-dialog-tabs">' +
                '<button type="button" class="_se_tab_link active" data-tab-link="image">' + lang.toolbar.image + '</button>' +
                '<button type="button" class="_se_tab_link" data-tab-link="url">' + lang.toolbar.link + '</button>' +
            '</div>' +
            '<form class="editor_image" method="post" enctype="multipart/form-data">' +
                '<div class="_se_tab_content _se_tab_content_image">' +
                    '<div class="se-dialog-body"><div style="border-bottom: 1px dashed #ccc;">';

            if (option.imageFileInput) {
                html += '' +
                        '<div class="se-dialog-form">' +
                            '<label>' + lang.dialogBox.imageBox.file + '</label>' +
                            '<div class="se-dialog-form-files">' +
                                '<input class="se-input-form _se_image_file" type="file" accept="image/*" multiple="multiple" />' +
                                '<button type="button" data-command="filesRemove" class="se-btn se-dialog-files-remove" title="' + lang.controller.remove + '">' + this.icons.cancel + '</button>' +
                            '</div>' +
                        '</div>' ;
            }

            if (option.imageUrlInput) {
                html += '' +
                        '<div class="se-dialog-form">' +
                            '<label>' + lang.dialogBox.imageBox.url + '</label>' +
                            '<input class="se-input-form se-input-url" type="text" />' +
                        '</div>';
            }

            html += '</div>' +
                        '<div class="se-dialog-form">' +
                            '<label>' + lang.dialogBox.imageBox.altText + '</label><input class="se-input-form _se_image_alt" type="text" />' +
                        '</div>';

            if (option.imageResizing) {
                const onlyPercentage = option.imageSizeOnlyPercentage;
                const onlyPercentDisplay = onlyPercentage ? ' style="display: none !important;"' : '';
                const heightDisplay = !option.imageHeightShow ? ' style="display: none !important;"' : '';
                html += '<div class="se-dialog-form">';
                        if (onlyPercentage || !option.imageHeightShow) {
                            html += '' +
                            '<div class="se-dialog-size-text">' +
                                '<label class="size-w">' + lang.dialogBox.size + '</label>' +
                            '</div>';
                        } else {
                            html += '' +
                            '<div class="se-dialog-size-text">' +
                                '<label class="size-w">' + lang.dialogBox.width + '</label>' +
                                '<label class="se-dialog-size-x">&nbsp;</label>' +
                                '<label class="size-h">' + lang.dialogBox.height + '</label>' +
                            '</div>';
                        }
                        html += '' +
                            '<input class="se-input-control _se_image_size_x" placeholder="auto"' + (onlyPercentage ? ' type="number" min="1"' : 'type="text"') + (onlyPercentage ? ' max="100"' : '') + ' />' +
                            '<label class="se-dialog-size-x"' + heightDisplay + '>' + (onlyPercentage ? '%' : 'x') + '</label>' +
                            '<input type="text" class="se-input-control _se_image_size_y" placeholder="auto"' + onlyPercentDisplay + (onlyPercentage ? ' max="100"' : '') + heightDisplay + '/>' +
                            '<label' + onlyPercentDisplay + heightDisplay + '><input type="checkbox" class="se-dialog-btn-check _se_image_check_proportion" checked/>&nbsp;' + lang.dialogBox.proportion + '</label>' +
                            '<button type="button" title="' + lang.dialogBox.revertButton + '" class="se-btn se-dialog-btn-revert" style="float: right;">' + this.icons.revert + '</button>' +
                        '</div>' ;
            }

            html += '' +
                        '<div class="se-dialog-form se-dialog-form-footer">' +
                            '<label><input type="checkbox" class="se-dialog-btn-check _se_image_check_caption" />&nbsp;' + lang.dialogBox.caption + '</label>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="_se_tab_content _se_tab_content_url" style="display: none">' +
                    '<div class="se-dialog-body">' +
                        '<div class="se-dialog-form">' +
                            '<label>' + lang.dialogBox.linkBox.url + '</label><input class="se-input-form _se_image_link" type="text" />' +
                        '</div>' +
                        '<label><input type="checkbox" class="_se_image_link_check"/>&nbsp;' + lang.dialogBox.linkBox.newWindowCheck + '</label>' +
                    '</div>' +
                '</div>' +
                '<div class="se-dialog-footer">' +
                    '<div>' +
                        '<label><input type="radio" name="suneditor_image_radio" class="se-dialog-btn-radio" value="none" checked>' + lang.dialogBox.basic + '</label>' +
                        '<label><input type="radio" name="suneditor_image_radio" class="se-dialog-btn-radio" value="left">' + lang.dialogBox.left + '</label>' +
                        '<label><input type="radio" name="suneditor_image_radio" class="se-dialog-btn-radio" value="center">' + lang.dialogBox.center + '</label>' +
                        '<label><input type="radio" name="suneditor_image_radio" class="se-dialog-btn-radio" value="right">' + lang.dialogBox.right + '</label>' +
                    '</div>' +
                    '<button type="submit" class="se-btn-primary" title="' + lang.dialogBox.submitButton + '"><span>' + lang.dialogBox.submitButton + '</span></button>' +
                '</div>' +
            '</form>';

        dialog.innerHTML = html;

        return dialog;
    },

    _fileInputChange: function () {
        if (!this.imgInputFile.value) this.imgUrlFile.removeAttribute('disabled');
        else this.imgUrlFile.setAttribute('disabled', true);
    },

    _removeSelectedFiles: function (fileInput, urlInput) {
        fileInput.value = '';
        if (urlInput) urlInput.removeAttribute('disabled');
    },

    /**
     * @overriding dialog
     */
    open: function () {
        this.plugins.dialog.open.call(this, 'image', 'image' === this.currentControllerName);
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
        } else if (tabName === 'url' && this.context.image.imgLink) {
            this.context.image.imgLink.focus();
        }

        return false;
    },

    submitAction: function (fileList) {
        if (fileList.length > 0) {
            let fileSize = 0;
            const files = [];
            for (let i = 0, len = fileList.length; i < len; i++) {
                if (/image/i.test(fileList[i].type)) {
                    files.push(fileList[i]);
                    fileSize += fileList[i].size;
                }
            }

            const limitSize = this.context.option.imageUploadSizeLimit;
            if (limitSize > 0) {
                let infoSize = 0;
                const imagesInfo = this.context.image._imagesInfo;
                for (let i = 0, len = imagesInfo.length; i < len; i++) {
                    infoSize += imagesInfo[i].size * 1;
                }

                if ((fileSize + infoSize) > limitSize) {
                    const err = '[SUNEDITOR.imageUpload.fail] Size of uploadable total images: ' + (limitSize/1000) + 'KB';
                    if (this._imageUploadError(err, {
                        'limitSize': limitSize,
                        'currentSize': infoSize,
                        'uploadSize': fileSize
                    })) {
                        this.functions.noticeOpen(err);
                    }

                    this.closeLoading();
                    return;
                }
            }

            const contextImage = this.context.image;
            contextImage._uploadFileLength = files.length;
            const imageUploadUrl = this.context.option.imageUploadUrl;
            const imageUploadHeader = this.context.option.imageUploadHeader;
            const filesLen = this.context.dialog.updateModal ? 1 : files.length;

            const info = {
                linkValue: contextImage._linkValue,
                linkNewWindow: contextImage.imgLinkNewWindowCheck.checked,
                inputWidth: contextImage.inputX.value,
                inputHeight: contextImage.inputY.value,
                align: contextImage._align,
                isUpdate: this.context.dialog.updateModal,
                currentImage: contextImage._element
            };

            if (!this._imageUploadBefore(files, info)) return;

            if (typeof imageUploadUrl === 'string' && imageUploadUrl.length > 0) {
                const formData = new FormData();

                for (let i = 0; i < filesLen; i++) {
                    formData.append('file-' + i, files[i]);
                }

                contextImage._xmlHttp = this.util.getXMLHttpRequest();
                contextImage._xmlHttp.onreadystatechange = this.plugins.image.callBack_imgUpload.bind(this, info);
                contextImage._xmlHttp.open('post', imageUploadUrl, true);
                if(imageUploadHeader !== null && typeof imageUploadHeader === 'object' && this._w.Object.keys(imageUploadHeader).length > 0){
                    for(let key in imageUploadHeader){
                        contextImage._xmlHttp.setRequestHeader(key, imageUploadHeader[key]);
                    }
                }
                contextImage._xmlHttp.send(formData);
            }
            else {
                for (let i = 0; i < filesLen; i++) {
                    this.plugins.image.setup_reader.call(this, files[i], info.linkValue, info.linkNewWindow, info.inputWidth, info.inputHeight, info.align, i, filesLen - 1);
                }
            }
        }
    },

    onRender_imgInput: function () {
        try {
            this.plugins.image.submitAction.call(this, this.context.image.imgInputFile.files);
        } catch (e) {
            throw Error('[SUNEDITOR.imageUpload.fail] cause : "' + e.message + '"');
        } finally {
            this.closeLoading();
        }
    },

    setup_reader: function (file, imgLinkValue, newWindowCheck, width, height, align, index, filesLen) {
        const reader = new FileReader();
        
        if (this.context.dialog.updateModal) {
            this.context.image._element.setAttribute('data-file-name', file.name);
            this.context.image._element.setAttribute('data-file-size', file.size);
        }

        reader.onload = function (update, updateElement, file) {
            try {
                this.context.image.inputX.value = width;
                this.context.image.inputY.value = height;
                if (update) this.plugins.image.update_src.call(this, reader.result, updateElement, file);
                else this.plugins.image.create_image.call(this, reader.result, imgLinkValue, newWindowCheck, width, height, align, file);

                if (index === filesLen) this.closeLoading();
            } catch (e) {
                this.closeLoading();
                throw Error('[SUNEDITOR.imageFileRendering.fail] cause : "' + e.message + '"');
            }
        }.bind(this, this.context.dialog.updateModal, this.context.image._element, file);

        reader.readAsDataURL(file);
    },

    callBack_imgUpload: function (info) {
        if (this.context.image._xmlHttp.readyState === 4) {
            if (this.context.image._xmlHttp.status === 200) {
                
                if (!this._imageUploadHandler(this.context.image._xmlHttp, info)) {
                    const response = JSON.parse(this.context.image._xmlHttp.responseText);

                    if (response.errorMessage) {
                        if (this._imageUploadError(response.errorMessage, response.result)) {
                            this.functions.noticeOpen(response.errorMessage);
                        }
                    } else {
                        const fileList = response.result;
                        for (let i = 0, len = fileList.length, file; i < len; i++) {
                            file = {name: fileList[i].name, size: fileList[i].size};
                            if (info.isUpdate) this.plugins.image.update_src.call(this, fileList[i].url, info.currentImage, file);
                            else this.plugins.image.create_image.call(this, fileList[i].url, info.linkValue, info.linkNewWindow, info.inputWidth, info.inputHeight, info.align, file);
                        }
                    }
                }

                this.closeLoading();
            }
            // error
            else {
                this.closeLoading();
                throw Error('[SUNEDITOR.imageUpload.fail] status: ' + this.context.image._xmlHttp.status + ', responseText: ' + this.context.image._xmlHttp.responseText);
            }
        }
    },

    onRender_imgUrl: function () {
        const contextImage = this.context.image;
        if (contextImage.imgUrlFile.value.trim().length === 0) return false;

        try {
            const file = {name: contextImage.imgUrlFile.value.split('/').pop(), size: 0};
            if (this.context.dialog.updateModal) this.plugins.image.update_src.call(this, contextImage.imgUrlFile.value, contextImage._element, file);
            else this.plugins.image.create_image.call(this, contextImage.imgUrlFile.value, contextImage._linkValue, contextImage.imgLinkNewWindowCheck.checked, contextImage.inputX.value, contextImage.inputY.value, contextImage._align, file);
        } catch (e) {
            throw Error('[SUNEDITOR.imageURLRendering.fail] cause : "' + e.message + '"');
        } finally {
            this.closeLoading();
        }
    },

    onRender_link: function (imgTag, imgLinkValue, newWindowCheck) {
        if (imgLinkValue.trim().length > 0) {
            const link = this.util.createElement('A');
            link.href = /^https?:\/\//.test(imgLinkValue) ? imgLinkValue : 'http://' + imgLinkValue;
            link.target = (newWindowCheck ? '_blank' : '');
            link.setAttribute('data-image-link', 'image');
            imgTag.setAttribute('data-image-link', imgLinkValue);

            link.appendChild(imgTag);
            return link;
        }

        return imgTag;
    },

    /**
     * @overriding resizing
     * @param {String} xy 'x': width, 'y': height
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
     * @overriding resizing
     */
    setRatio: function () {
        this.plugins.resizing._module_setRatio.call(this, this.context.image);
    },

    submit: function (e) {
        const contextImage = this.context.image;
        const imagePlugin = this.plugins.image;
        this.showLoading();

        e.preventDefault();
        e.stopPropagation();

        contextImage._linkValue = contextImage.imgLink.value;
        contextImage._altText = contextImage.altText.value;
        contextImage._align = contextImage.modal.querySelector('input[name="suneditor_image_radio"]:checked').value;
        contextImage._captionChecked = contextImage.captionCheckEl.checked;
        if (contextImage._resizing) contextImage._proportionChecked = contextImage.proportion.checked;

        try {
            if (this.context.dialog.updateModal) {
                imagePlugin.update_image.call(this, false, false, false);
            }
            
            if (contextImage.imgInputFile && contextImage.imgInputFile.files.length > 0) {
                imagePlugin.onRender_imgInput.call(this);
            } else if (contextImage.imgUrlFile && contextImage.imgUrlFile.value.trim().length > 0) {
                imagePlugin.onRender_imgUrl.call(this);
            } else {
                this.closeLoading();
            }
        } catch (error) {
            this.closeLoading();
            throw Error('[SUNEDITOR.image.submit.fail] cause : "' + error.message + '"');
        } finally {
            this.plugins.dialog.close.call(this);
        }

        return false;
    },

    setImagesInfo: function (img, file) {
        const _resize_plugin = this.context.resizing._resize_plugin;
        this.context.resizing._resize_plugin = 'image';

        const imagesInfo = this.context.image._imagesInfo;
        let dataIndex = img.getAttribute('data-index');
        let info = null;
        let state = '';

        // create
        if (!dataIndex || this._componentsInfoInit) {
            state = 'create';
            dataIndex = this.context.image._imageIndex++;

            img.setAttribute('data-index', dataIndex);
            img.setAttribute('data-file-name', file.name);
            img.setAttribute('data-file-size', file.size);

            info = {
                src: img.src,
                index: dataIndex * 1,
                name: file.name,
                size: file.size
            };

            imagesInfo.push(info);
        } else { // update
            state = 'update';
            dataIndex *= 1;

            for (let i = 0, len = imagesInfo.length; i < len; i++) {
                if (dataIndex === imagesInfo[i].index) {
                    info = imagesInfo[i];
                    break;
                }
            }

            if (!info) {
                dataIndex = this.context.image._imageIndex++;
                info = { index: dataIndex };
                imagesInfo.push(info);
            }

            info.src = img.src;
            info.name = img.getAttribute("data-file-name");
            info.size = img.getAttribute("data-file-size") * 1;
        }

        // method bind
        info.element = img;
        info.delete = this.plugins.image.destroy.bind(this, img);
        info.select = function () {
            img.scrollIntoView(true);
            this._w.setTimeout(function () {
                this.plugins.image.onModifyMode.call(this, img, this.plugins.resizing.call_controller_resize.call(this, img, 'image'));
            }.bind(this));
        }.bind(this);

        if (!img.getAttribute('origin-size')) {
            img.setAttribute('origin-size', img.naturalWidth + ',' + img.naturalHeight);
        }
        if (!img.getAttribute('data-origin')) {
            const container = this.util.getParentElement(img, this.util.isMediaComponent);
            const cover = this.util.getParentElement(img, 'FIGURE');

            const w = this.plugins.resizing._module_getSizeX.call(this, this.context.image, img, cover, container);
            const h = this.plugins.resizing._module_getSizeY.call(this, this.context.image, img, cover, container);
            img.setAttribute('data-origin', w + ',' + h);
            img.setAttribute('data-size', w + ',' + h);
        }

        if (!img.style.width) {
            const size = (img.getAttribute('data-size') || img.getAttribute('data-origin') || '').split(',');
            this.plugins.image.onModifyMode.call(this, img, null);
            this.plugins.image.applySize.call(this, (size[0] || this.context.option.imageWidth), (size[1] || this.context.option.imageHeight));
        }

        this.context.resizing._resize_plugin = _resize_plugin;
        this._imageUpload(img, dataIndex, state, info, --this.context.image._uploadFileLength < 0 ? 0 : this.context.image._uploadFileLength);
    },

    /**
     * @overriding core
     */
    checkComponentInfo: function () {
        const images = [].slice.call(this.context.element.wysiwyg.getElementsByTagName('IMG'));
        const imagePlugin = this.plugins.image;
        const imagesInfo = this.context.image._imagesInfo;

        if (images.length === imagesInfo.length) {
            // reset
            if (this._componentsInfoReset) {
                for (let i = 0, len = images.length, img; i < len; i++) {
                    img = images[i];
                    imagePlugin.setImagesInfo.call(this, img, {
                        'name': img.getAttribute('data-file-name') || img.src.split('/').pop(),
                        'size': img.getAttribute('data-file-size') || 0
                    });
                }
                return;
            } else {
                let infoUpdate = false;
                for (let i = 0, len = imagesInfo.length, info; i < len; i++) {
                    info = imagesInfo[i];
                    if (images.filter(function (img) { return info.src === img.src && info.index.toString() === img.getAttribute('data-index'); }).length === 0) {
                        infoUpdate = true;
                        break;
                    }
                }
                // pass
                if (!infoUpdate) return;
            }
        }

        // check images
        const _resize_plugin = this.context.resizing._resize_plugin;
        this.context.resizing._resize_plugin = 'image';
        const currentImages = [];
        const infoIndex = [];
        for (let i = 0, len = imagesInfo.length; i < len; i++) {
            infoIndex[i] = imagesInfo[i].index;
        }
        
        for (let i = 0, len = images.length, img; i < len; i++) {
            img = images[i];
            if (!this.util.getParentElement(img, this.util.isMediaComponent)) {
                currentImages.push(this.context.image._imageIndex);
                imagePlugin.onModifyMode.call(this, img, null);
                imagePlugin.openModify.call(this, true);
                imagePlugin.update_image.call(this, true, false, true);
            } else if (!img.getAttribute('data-index') || infoIndex.indexOf(img.getAttribute('data-index') * 1) < 0) {
                currentImages.push(this.context.image._imageIndex);
                img.removeAttribute('data-index');
                imagePlugin.setImagesInfo.call(this, img, {
                    'name': img.getAttribute('data-file-name') || img.src.split('/').pop(),
                    'size': img.getAttribute('data-file-size') || 0
                });
            } else {
                currentImages.push(img.getAttribute('data-index') * 1);
            }
        }

        for (let i = 0, dataIndex; i < imagesInfo.length; i++) {
            dataIndex = imagesInfo[i].index;
            if (currentImages.indexOf(dataIndex) > -1) continue;

            imagesInfo.splice(i, 1);
            this._imageUpload(null, dataIndex, 'delete', null, 0);
            i--;
        }

        this.context.resizing._resize_plugin = _resize_plugin;
    },

    /**
     * @overriding core
     */
    resetComponentInfo: function () {
        this.context.image._imagesInfo = [];
        this.context.image._imageIndex = 0;
    },

    create_image: function (src, linkValue, linkNewWindow, width, height, align, file) {
        const contextImage = this.context.image;
        this.context.resizing._resize_plugin = 'image';

        let oImg = this.util.createElement('IMG');
        oImg.src = src;
        oImg.alt = contextImage._altText;
        oImg = this.plugins.image.onRender_link.call(this, oImg, linkValue, linkNewWindow);
        oImg.setAttribute('data-rotate', '0');

        if (contextImage._resizing) {
            oImg.setAttribute('data-proportion', contextImage._proportionChecked);
        }

        const cover = this.plugins.resizing.set_cover.call(this, oImg);
        const container = this.plugins.resizing.set_container.call(this, cover, 'se-image-container');

        // caption
        if (contextImage._captionChecked) {
            contextImage._caption = this.plugins.resizing.create_caption.call(this);
            contextImage._caption.setAttribute('contenteditable', false);
            cover.appendChild(contextImage._caption);
        }

        contextImage._element = oImg;
        contextImage._cover = cover;
        contextImage._container = container;

        // set size
        this.plugins.image.applySize.call(this, width, height);

        // align
        this.plugins.image.setAlign.call(this, align, oImg, cover, container);

        this.insertComponent(container, true);
        this.plugins.image.setImagesInfo.call(this, oImg, file || {
            'name': oImg.getAttribute('data-file-name') || oImg.src.split('/').pop(),
            'size': oImg.getAttribute('data-file-size') || 0
        });

        this.context.resizing._resize_plugin = '';
    },

    update_image: function (init, openController, notHistoryPush) {
        const contextImage = this.context.image;
        const linkValue = contextImage._linkValue;
        let imageEl = contextImage._element;
        let cover = contextImage._cover;
        let container = contextImage._container;
        let isNewContainer = false;

        if (cover === null) {
            isNewContainer = true;
            imageEl = contextImage._element.cloneNode(true);
            cover = this.plugins.resizing.set_cover.call(this, imageEl);
        }

        if (container === null) {
            cover = cover.cloneNode(true);
            imageEl = cover.querySelector('img');
            isNewContainer = true;
            container = this.plugins.resizing.set_container.call(this, cover, 'se-image-container');
        } else if (isNewContainer) {
            container.innerHTML = '';
            container.appendChild(cover);
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
        if (contextImage._captionChecked) {
            if (!contextImage._caption) {
                contextImage._caption = this.plugins.resizing.create_caption.call(this);
                cover.appendChild(contextImage._caption);
            }
        } else {
            if (contextImage._caption) {
                this.util.removeItem(contextImage._caption);
                contextImage._caption = null;
            }
        }

        // link
        if (linkValue.trim().length > 0) {
            if (contextImage._linkElement !== null && cover.contains(contextImage._linkElement)) {
                contextImage._linkElement.href = linkValue;
                contextImage._linkElement.target = (contextImage.imgLinkNewWindowCheck.checked ? '_blank' : '');
                imageEl.setAttribute('data-image-link', linkValue);
            } else {
                let newEl = this.plugins.image.onRender_link.call(this, imageEl, linkValue, this.context.image.imgLinkNewWindowCheck.checked);
                cover.insertBefore(newEl, contextImage._caption);
            }
        }
        else if (contextImage._linkElement !== null) {
            const imageElement = imageEl;

            imageElement.setAttribute('data-image-link', '');
            let newEl = imageElement.cloneNode(true);
            cover.removeChild(contextImage._linkElement);
            cover.insertBefore(newEl, contextImage._caption);
            imageEl = newEl;
        }

        if (isNewContainer) {
            const existElement = (this.util.isRangeFormatElement(contextImage._element.parentNode) || this.util.isWysiwygDiv(contextImage._element.parentNode)) ? 
                contextImage._element : 
                /^A$/i.test(contextImage._element.parentNode.nodeName) ? contextImage._element.parentNode : this.util.getFormatElement(contextImage._element) || contextImage._element;
                
            existElement.parentNode.replaceChild(container, existElement);
            imageEl = container.querySelector('img');

            contextImage._element = imageEl;
            contextImage._cover = cover;
            contextImage._container = container;
        }

        // transform
        if (!contextImage._onlyPercentage && changeSize) {
            if (!init && (/\d+/.test(imageEl.style.height) || (this.context.resizing._rotateVertical && contextImage._captionChecked))) {
                if (/%$/.test(contextImage.inputX.value) || /%$/.test(contextImage.inputY.value)) {
                    this.plugins.resizing.resetTransform.call(this, imageEl);
                } else {
                    this.plugins.resizing.setTransformSize.call(this, imageEl, this.util.getNumber(contextImage.inputX.value, 0), this.util.getNumber(contextImage.inputY.value, 0));
                }
            }
        }

        // size
        let isPercent = false;
        if (contextImage._resizing) {
            imageEl.setAttribute('data-proportion', contextImage._proportionChecked);
            if (changeSize) {
                this.plugins.image.applySize.call(this);
            }
        }

        // align
        if (!(isPercent && contextImage._align === 'center')) {
            this.plugins.image.setAlign.call(this, null, imageEl, null, null);
        }

        // set imagesInfo
        if (init) {
            this.plugins.image.setImagesInfo.call(this, imageEl, {
                'name': imageEl.getAttribute('data-file-name') || imageEl.src.split('/').pop(),
                'size': imageEl.getAttribute('data-file-size') || 0
            });
        }

        if (openController) {
            this.plugins.image.init.call(this);
            const size = this.plugins.resizing.call_controller_resize.call(this, imageEl, 'image');
            this.plugins.image.onModifyMode.call(this, imageEl, size);
        }

        // history stack
        if (!notHistoryPush) this.history.push(false);
    },

    update_src: function (src, element, file) {
        element.src = src;
        this._w.setTimeout(this.plugins.image.setImagesInfo.bind(this, element, file));
    },

    /**
     * @overriding resizing
     */
    onModifyMode: function (element, size) {
        if (!element) return;
        
        const contextImage = this.context.image;
        contextImage._linkElement = /^A$/i.test(element.parentNode.nodeName) ? element.parentNode : null;
        contextImage._element = element;
        contextImage._cover = this.util.getParentElement(element, 'FIGURE');
        contextImage._container = this.util.getParentElement(element, this.util.isMediaComponent);
        contextImage._caption = this.util.getChildElement(contextImage._cover, 'FIGCAPTION');
        contextImage._align = element.getAttribute('data-align') || 'none';

        if (size) {
            contextImage._element_w = size.w;
            contextImage._element_h = size.h;
            contextImage._element_t = size.t;
            contextImage._element_l = size.l;
        }

        let userSize = contextImage._element.getAttribute('data-size') || contextImage._element.getAttribute('data-origin');
        if (userSize) {
            userSize = userSize.split(',');
            contextImage._origin_w = userSize[0];
            contextImage._origin_h = userSize[1];
        } else if (size) {
            contextImage._origin_w = size.w;
            contextImage._origin_h = size.h;
        }
    },

    /**
     * @overriding resizing
     */
    openModify: function (notOpen) {
        const contextImage = this.context.image;
        contextImage.imgUrlFile.value = contextImage._element.src;
        contextImage._altText = contextImage.altText.value = contextImage._element.alt;
        contextImage._linkValue = contextImage.imgLink.value = contextImage._linkElement === null ? '' : contextImage._linkElement.href;
        contextImage.imgLinkNewWindowCheck.checked = contextImage._linkElement && contextImage._linkElement.target === '_blank';
        contextImage.modal.querySelector('input[name="suneditor_image_radio"][value="' + contextImage._align + '"]').checked = true;
        contextImage._align = contextImage.modal.querySelector('input[name="suneditor_image_radio"]:checked').value;
        contextImage._captionChecked = contextImage.captionCheckEl.checked = !!contextImage._caption;
        
        if (contextImage._resizing) {
            this.plugins.resizing._module_setModifyInputSize.call(this, contextImage, this.plugins.image);
        }

        if (!notOpen) this.plugins.dialog.open.call(this, 'image', true);
    },

    /**
     * @overriding dialog
     */
    on: function (update) {
        const contextImage = this.context.image;
        
        if (!update) {
            contextImage.inputX.value = contextImage._origin_w = this.context.option.imageWidth === contextImage._defaultSizeX ? '' : this.context.option.imageWidth;
            contextImage.inputY.value = contextImage._origin_h = this.context.option.imageHeight === contextImage._defaultSizeY ? '' : this.context.option.imageHeight;
            if (contextImage.imgInputFile) contextImage.imgInputFile.setAttribute('multiple', 'multiple');
        } else {
            if (contextImage.imgInputFile) contextImage.imgInputFile.removeAttribute('multiple');
        }
    },

    sizeRevert: function () {
        this.plugins.resizing._module_sizeRevert.call(this, this.context.image);
    },

    applySize: function (w, h) {
        const contextImage = this.context.image;

        if (!w) w = contextImage.inputX.value;
        if (!h) h = contextImage.inputY.value;
        
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
     * @overriding resizing
     */
    setSize: function (w, h, notResetPercentage, direction) {
        const contextImage = this.context.image;
        const onlyW = /^(rw|lw)$/.test(direction);
        const onlyH = /^(th|bh)$/.test(direction);

        this.plugins.image.cancelPercentAttr.call(this);

        if (!onlyH) contextImage._element.style.width = this.util.isNumber(w) ? w + contextImage.sizeUnit : w;
        if (!onlyW) contextImage._element.style.height = this.util.isNumber(h) ? h + contextImage.sizeUnit : /%$/.test(h) ? '' : h;

        if (contextImage._align === 'center') this.plugins.image.setAlign.call(this, null, null, null, null);
        if (!notResetPercentage) contextImage._element.removeAttribute('data-percentage');

        // save current size
        this.plugins.resizing._module_saveCurrentSize.call(this, contextImage);
    },

    /**
     * @overriding resizing
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
     * @overriding resizing
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
     * @overriding resizing
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
     * @overriding resizing
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
     * @overriding resizing
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

    resetAlign: function () {
        const contextImage = this.context.image;

        contextImage._element.setAttribute('data-align', '');
        contextImage._align = 'none';
        contextImage._cover.style.margin = '0';
        this.util.removeClass(contextImage._container, contextImage._floatClassRegExp);
    },

    /**
     * @overriding resizing
     */
    destroy: function (element) {
        const imageEl = element || this.context.image._element;
        const imageContainer = this.util.getParentElement(imageEl, this.util.isMediaComponent) || imageEl;
        const dataIndex = imageEl.getAttribute('data-index') * 1;
        let focusEl = (imageContainer.previousElementSibling || imageContainer.nextElementSibling);
        
        const emptyDiv = imageContainer.parentNode;
        this.util.removeItem(imageContainer);
        this.plugins.image.init.call(this);
        this.controllersOff();

        if (emptyDiv !== this.context.element.wysiwyg) this.util.removeItemAllParents(emptyDiv, function (current) { return current.childNodes.length === 0; }, null);

        // focus
        this.focusEdge(focusEl);
        
        // event
        if (dataIndex >= 0) {
            const imagesInfo = this.context.image._imagesInfo;

            for (let i = 0, len = imagesInfo.length; i < len; i++) {
                if (dataIndex === imagesInfo[i].index) {
                    imagesInfo.splice(i, 1);
                    this._imageUpload(null, dataIndex, 'delete', null, 0);
                    return;
                }
            }
        }

        // history stack
        this.history.push(false);
    },

    /**
     * @overriding dialog
     */
    init: function () {
        const contextImage = this.context.image;
        if (contextImage.imgInputFile) contextImage.imgInputFile.value = '';
        if (contextImage.imgUrlFile) contextImage.imgUrlFile.value = '';
        if (contextImage.imgInputFile && contextImage.imgUrlFile) contextImage.imgUrlFile.removeAttribute('disabled');
        contextImage.altText.value = '';
        contextImage.imgLink.value = '';
        contextImage.imgLinkNewWindowCheck.checked = false;
        contextImage.modal.querySelector('input[name="suneditor_image_radio"][value="none"]').checked = true;
        contextImage.captionCheckEl.checked = false;
        contextImage._element = null;
        this.plugins.image.openTab.call(this, 'init');

        if (contextImage._resizing) {
            contextImage.inputX.value = this.context.option.imageWidth === contextImage._defaultSizeX ? '' : this.context.option.imageWidth;
            contextImage.inputY.value = this.context.option.imageHeight === contextImage._defaultSizeY ? '' : this.context.option.imageHeight;
            contextImage.proportion.checked = true;
            contextImage._ratio = false;
            contextImage._ratioX = 1;
            contextImage._ratioY = 1;
        }
    }
};
