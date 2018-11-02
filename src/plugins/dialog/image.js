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
    add: function (core) {
        core.addModule([dialog, resizing]);
        
        const context = core.context;
        context.image = {
            _linkElement: null,
            _element: null,
            _resize_element: null,
            _element_w: 1,
            _element_h: 1,
            _element_l: 0,
            _element_t: 0,
            _user_w: context.user.imageSize,
            _user_h: 0,
            _altText: '',
            _caption: null,
            captionCheckEl: null,
            _linkValue: '',
            _align: 'none',
            _captionChecked: false,
            _proportionChecked: true,
            _onCaption: false,
            _floatClassRegExp: 'float\\-[a-z]+',
            _xmlHttp: null
        };

        /** image dialog */
        let image_dialog = eval(this.setDialog(core.context.user, core.lang));
        context.image.modal = image_dialog;
        context.image.imgUrlFile = image_dialog.getElementsByClassName('sun-editor-id-image-url')[0];
        context.image.imgInputFile = context.image.focusElement = image_dialog.getElementsByClassName('sun-editor-id-image-file')[0];
        context.image.altText = image_dialog.getElementsByClassName('sun-editor-id-image-alt')[0];
        context.image.imgLink = image_dialog.getElementsByClassName('sun-editor-id-image-link')[0];
        context.image.imgLinkNewWindowCheck = image_dialog.getElementsByClassName('sun-editor-id-linkCheck')[0];
        context.image.captionCheckEl = image_dialog.getElementsByClassName('suneditor-id-image-check-caption')[0];
        context.image.proportion = image_dialog.getElementsByClassName('suneditor-id-image-check-proportion')[0];
        context.image.imageX = image_dialog.getElementsByClassName('sun-editor-id-image-x')[0];
        context.image.imageY = image_dialog.getElementsByClassName('sun-editor-id-image-y')[0];

        context.image.imageX.value = context.user.imageSize;

        /** add event listeners */
        context.image.modal.getElementsByClassName('sun-editor-tab-button')[0].addEventListener('click', this.openTab.bind(core));
        context.image.modal.getElementsByClassName('btn-primary')[0].addEventListener('click', this.submit.bind(core));
        context.image.imageX.addEventListener('change', this.setInputSize.bind(core, 'x'));
        context.image.imageY.addEventListener('change', this.setInputSize.bind(core, 'y'));
        image_dialog.getElementsByClassName('sun-editor-id-image-revert-button')[0].addEventListener('click', this.sizeRevert.bind(core));

        /** append html */
        context.dialog.modal.appendChild(image_dialog);

        /** empty memory */
        image_dialog = null;
    },

    /** dialog */
    setDialog: function (user, lang) {
        const dialog = document.createElement('DIV');
        dialog.className = 'modal-content sun-editor-id-dialog-image';
        dialog.style.display = 'none';

        let html = '' +
            '<div class="modal-header">' +
            '   <button type="button" data-command="close" class="close" aria-label="Close" title="' + lang.dialogBox.close + '">' +
            '       <div aria-hidden="true" data-command="close" class="icon-cancel"></div>' +
            '   </button>' +
            '   <h5 class="modal-title">' + lang.dialogBox.imageBox.title + '</h5>' +
            '</div>' +
            '<div class="sun-editor-tab-button">' +
            '   <button type="button" class="sun-editor-id-tab-link active" data-tab-link="image">' + lang.toolbar.image + '</button>' +
            '   <button type="button" class="sun-editor-id-tab-link" data-tab-link="url">' + lang.toolbar.link + '</button>' +
            '</div>' +
            '<form class="editor_image" method="post" enctype="multipart/form-data">' +
            '   <div class="sun-editor-id-tab-content sun-editor-id-tab-content-image">' +
            '       <div class="modal-body">';

            if (user.imageFileInput) {
                html += '' +
                    '   <div class="form-group">' +
                    '       <label>' + lang.dialogBox.imageBox.file + '</label>' +
                    '       <input class="form-control sun-editor-id-image-file" type="file" accept="image/*" multiple="multiple" />' +
                    '   </div>' ;
            }

            if (user.imageUrlInput) {
                html += '' +
                    '   <div class="form-group">' +
                    '       <label>' + lang.dialogBox.imageBox.url + '</label>' +
                    '       <input class="form-control sun-editor-id-image-url" type="text" />' +
                    '   </div>';
            }

            html += '' +
            '           <div class="form-group">' +
            '               <label>' + lang.dialogBox.imageBox.altText + '</label><input class="form-control sun-editor-id-image-alt" type="text" />' +
            '           </div>' +
            '           <div class="form-group">' +
            '               <div class="size-text"><label class="size-w">' + lang.dialogBox.width + '</label><label class="size-x">&nbsp;</label><label class="size-h">' + lang.dialogBox.height + '</label></div>' +
            '               <input class="form-size-control sun-editor-id-image-x" type="number" min="1" /><label class="size-x">x</label><input class="form-size-control sun-editor-id-image-y" type="number" min="1" disabled />' +
            '               <label><input type="checkbox" class="suneditor-id-image-check-proportion" style="margin-left: 20px;" checked disabled/>&nbsp;' + lang.dialogBox.proportion + '</label>' +
            '               <button type="button" title="' + lang.dialogBox.revertButton + '" class="btn_editor sun-editor-id-image-revert-button" style="float: right;"><div class="icon-revert"></div></button>' +
            '           </div>' +
            '           <div class="form-group-footer">' +
            '               <label><input type="checkbox" class="suneditor-id-image-check-caption" />&nbsp;' + lang.dialogBox.caption + '</label>' +
            '           </div>' +
            '       </div>' +
            '   </div>' +
            '   <div class="sun-editor-id-tab-content sun-editor-id-tab-content-url" style="display: none">' +
            '       <div class="modal-body">' +
            '           <div class="form-group">' +
            '               <label>' + lang.dialogBox.linkBox.url + '</label><input class="form-control sun-editor-id-image-link" type="text" />' +
            '           </div>' +
            '           <label><input type="checkbox" class="sun-editor-id-linkCheck"/>&nbsp;' + lang.dialogBox.linkBox.newWindowCheck + '</label>' +
            '       </div>' +
            '   </div>' +
            '   <div class="modal-footer">' +
            '       <div style="float: left;">' +
            '           <label><input type="radio" name="suneditor_image_radio" class="modal-radio" value="none" checked>' + lang.dialogBox.basic + '</label>' +
            '           <label><input type="radio" name="suneditor_image_radio" class="modal-radio" value="left">' + lang.dialogBox.left + '</label>' +
            '           <label><input type="radio" name="suneditor_image_radio" class="modal-radio" value="center">' + lang.dialogBox.center + '</label>' +
            '           <label><input type="radio" name="suneditor_image_radio" class="modal-radio" value="right">' + lang.dialogBox.right + '</label>' +
            '       </div>' +
            '       <button type="submit" class="btn btn-primary sun-editor-id-submit-image" title="' + lang.dialogBox.submitButton + '"><span>' + lang.dialogBox.submitButton + '</span></button>' +
            '   </div>' +
            '</form>';

        dialog.innerHTML = html;

        return dialog;
    },

    openTab: function (e) {
        const modal = this.context.image.modal;
        const targetElement = (e === 'init' ? modal.getElementsByClassName('sun-editor-id-tab-link')[0] : e.target);

        if (!/^BUTTON$/i.test(targetElement.tagName)) {
            return false;
        }

        // Declare all variables
        const tabName = targetElement.getAttribute('data-tab-link');
        const contentClassName = 'sun-editor-id-tab-content';
        let i, tabContent, tabLinks;

        // Get all elements with class="tabcontent" and hide them
        tabContent = modal.getElementsByClassName(contentClassName);
        for (i = 0; i < tabContent.length; i++) {
            tabContent[i].style.display = 'none';
        }

        // Get all elements with class="tablinks" and remove the class "active"
        tabLinks = modal.getElementsByClassName('sun-editor-id-tab-link');
        for (i = 0; i < tabLinks.length; i++) {
            this.util.removeClass(tabLinks[i], 'active');
        }

        // Show the current tab, and add an "active" class to the button that opened the tab
        modal.getElementsByClassName(contentClassName + '-' + tabName)[0].style.display = 'block';
        this.util.addClass(targetElement, 'active');

        // focus
        if (tabName === 'image') {
            this.context.image.imgInputFile.focus();
        } else if (tabName === 'url') {
            this.context.image.imgLink.focus();
        }

        return false;
    },

    onRender_imgInput: function () {
        const submitAction = function (files) {
            if (files.length > 0) {
                const imageUploadUrl = this.context.user.imageUploadUrl;
                const filesLen = this.context.dialog.updateModal ? 1 : files.length;

                if (imageUploadUrl !== null && imageUploadUrl.length > 0) {
                    const formData = new FormData();

                    for (let i = 0; i < filesLen; i++) {
                        formData.append('file-' + i, files[i]);
                    }

                    this.context.image._xmlHttp = this.util.getXMLHttpRequest();
                    this.context.image._xmlHttp.onreadystatechange = this.plugins.image.callBack_imgUpload.bind(this, this.context.image._linkValue, this.context.image.imgLinkNewWindowCheck.checked, this.context.image.imageX.value + 'px', this.context.image._align, this.context.dialog.updateModal, this.context.image._element);
                    this.context.image._xmlHttp.open('post', imageUploadUrl, true);
                    this.context.image._xmlHttp.send(formData);
                }
                else {
                    for (let i = 0; i < filesLen; i++) {
                        this.plugins.image.setup_reader.call(this, files[i], this.context.image._linkValue, this.context.image.imgLinkNewWindowCheck.checked, this.context.image.imageX.value + 'px', this.context.image._align, i, filesLen - 1);
                    }
                }
            }
        }.bind(this);

        try {
            submitAction(this.context.image.imgInputFile.files);
        } catch (e) {
            this.closeLoading();
            throw Error('[SUNEDITOR.imageUpload.fail] cause : "' + e.message + '"');
        }
    },

    setup_reader: function (file, imgLinkValue, newWindowCheck, width, align, index, filesLen) {
        const reader = new FileReader();

        reader.onload = function (update, updateElement) {
            try {
                this.plugins.image.create_image.call(this, reader.result, imgLinkValue, newWindowCheck, width, align, update, updateElement);
                if (index === filesLen) this.closeLoading();
            } catch (e) {
                this.closeLoading();
                throw Error('[SUNEDITOR.imageFileRendering.fail] cause : "' + e.message + '"');
            }
        }.bind(this, this.context.dialog.updateModal, this.context.image._element);

        reader.readAsDataURL(file);
    },

    callBack_imgUpload: function (linkValue, linkNewWindow, width, align, update, updateElement) {
        if (this.context.image._xmlHttp.readyState === 4) {
            if (this.context.image._xmlHttp.status === 200) {
                const result = eval(this.context.image._xmlHttp.responseText);

                for (let i = 0, len = (update && result.length > 0 ? 1 : result.length); i < len; i++) {
                    this.plugins.image.create_image.call(this, result[i].SUNEDITOR_IMAGE_SRC, linkValue, linkNewWindow, width, align, update, updateElement);
                }

                this.closeLoading();
            }
            // error
            else {
                this.closeLoading();
                throw Error('[SUNEDITOR.imageUpload.fail] status: ' + this.context.image._xmlHttp.status);
            }
        }
    },

    onRender_imgUrl: function () {
        if (this.context.image.imgUrlFile.value.trim().length === 0) return false;

        try {
            this.plugins.image.create_image.call(this, this.context.image.imgUrlFile.value, this.context.image._linkValue, this.context.image.imgLinkNewWindowCheck.checked, this.context.image.imageX.value + 'px', this.context.image._align, this.context.dialog.updateModal, this.context.image._element);
        } catch (e) {
            throw Error('[SUNEDITOR.imageURLRendering.fail] cause : "' + e.message + '"');
        } finally {
            this.closeLoading();
        }
    },

    onRender_link: function (imgTag, imgLinkValue, newWindowCheck) {
        if (imgLinkValue.trim().length > 0) {
            const link = document.createElement('A');
            link.href = /^https?:\/\//.test(imgLinkValue) ? imgLinkValue : 'http://' + imgLinkValue;
            link.target = (newWindowCheck ? '_blank' : '');
            link.setAttribute('data-image-link', 'image');
            link.addEventListener('click', function (e) { e.preventDefault(); });

            imgTag.setAttribute('data-image-link', imgLinkValue);

            link.appendChild(imgTag);
            return link;
        }

        return imgTag;
    },

    setInputSize: function (xy) {
        if (!this.context.dialog.updateModal) return;

        if (this.context.image.proportion.checked) {
            if (xy === 'x') {
                this.context.image.imageY.value = Math.round((this.context.image._element_h / this.context.image._element_w) * this.context.image.imageX.value);
            } else {
                this.context.image.imageX.value = Math.round((this.context.image._element_w / this.context.image._element_h) * this.context.image.imageY.value);
            }
        }
    },

    submit: function (e) {
        this.showLoading();

        e.preventDefault();
        e.stopPropagation();

        this.context.image._linkValue = this.context.image.imgLink.value;
        this.context.image._altText = this.context.image.altText.value;
        this.context.image._align = this.context.image.modal.querySelector('input[name="suneditor_image_radio"]:checked').value;
        this.context.image._captionChecked = this.context.image.captionCheckEl.checked;
        this.context.image._proportionChecked = this.context.image.proportion.checked;

        try {
            if (this.context.dialog.updateModal) {
                this.plugins.image.update_image.call(this);
            }
            
            if (this.context.image.imgInputFile.files.length > 0) {
                this.plugins.image.onRender_imgInput.call(this);
            } else if (this.context.image.imgUrlFile.value.trim().length > 0) {
                this.plugins.image.onRender_imgUrl.call(this);
            } else {
                this.closeLoading();
            }
        } catch (error) {
            this.closeLoading();
            throw Error('[SUNEDITOR.image.submit.fail] cause : "' + error.message + '"');
        } finally {
            this.plugins.dialog.closeDialog.call(this);
        }

        return false;
    },

    create_caption: function () {
        const caption = document.createElement('FIGCAPTION');
        caption.setAttribute('contenteditable', false);
        caption.innerHTML = '<p>' + this.lang.dialogBox.caption + '</p>';
        return caption;
    },

    set_cover: function (imageElement) {
        const cover = document.createElement('FIGURE');
        cover.className = 'sun-editor-id-comp-figure-cover';
        cover.appendChild(imageElement);

        return cover;
    },

    set_container: function (cover) {
        const container = document.createElement('DIV');
        container.className = 'sun-editor-id-comp sun-editor-id-image-container';
        container.setAttribute('contenteditable', false);
        container.appendChild(cover);

        return container;
    },

    create_image: function (src, linkValue, linkNewWindow, width, align, update, updateElement) {
        if (update) {
            updateElement.src = src;
            return;
        }

        const contextImage = this.context.image;

        let oImg = document.createElement('IMG');
        oImg.src = src;
        oImg.style.width = width;
        oImg.setAttribute('data-align', align);
        oImg.setAttribute('data-proportion', contextImage._proportionChecked);
        oImg.alt = contextImage._altText;
        oImg = this.plugins.image.onRender_link(oImg, linkValue, linkNewWindow);
        oImg.setAttribute('data-rotate', '0');
        oImg.onload = function () {
            this.setAttribute('origin-size', this.naturalWidth + ',' + this.naturalHeight);
            this.setAttribute('data-origin', this.offsetWidth + ',' + this.offsetHeight);
            this.style.height = this.offsetHeight + 'px';
        }.bind(oImg);

        const cover = this.plugins.image.set_cover.call(this, oImg);
        const container = this.plugins.image.set_container.call(this, cover);

        // caption
        if (contextImage._captionChecked) {
            contextImage._caption = this.plugins.image.create_caption.call(this);
            contextImage._caption.setAttribute('contenteditable', false);
            cover.appendChild(contextImage._caption);
        }

        // align
        if ('none' !== align) {
            cover.style.margin = 'auto';
        } else {
            cover.style.margin = '0';
        }
        
        this.util.removeClass(container, contextImage._floatClassRegExp);
        this.util.addClass(container, 'float-' + align);

        this.insertNode(container, this.util.getFormatElement(this.getSelectionNode()));
        this.appendP(container);
    },

    update_image: function () {
        const contextImage = this.context.image;
        const linkValue = contextImage._linkValue;
        let cover = this.util.getParentElement(contextImage._element, '.sun-editor-id-comp-figure-cover');
        let container = this.util.getParentElement(contextImage._element, '.sun-editor-id-image-container');
        let imageEl = contextImage._element;
        let isNewContainer = false;

        if (cover === null) {
            isNewContainer = true;
            imageEl = contextImage._element.cloneNode(true);
            cover = this.plugins.image.set_cover.call(this, imageEl);
        }

        if (container === null) {
            isNewContainer = true;
            container = this.plugins.image.set_container.call(this, cover.cloneNode(true));
        }
        
        if (isNewContainer) {
            container.innerHTML = '';
            container.appendChild(cover);
        }

        // input update
        this.plugins.image.onRender_imgInput.call(this);

        // src, size
        imageEl.src = contextImage.imgUrlFile.value;
        imageEl.alt = contextImage._altText;
        imageEl.setAttribute('data-proportion', contextImage._proportionChecked);
        imageEl.style.width = contextImage.imageX.value + 'px';
        imageEl.style.height = contextImage.imageY.value + 'px';

        // caption
        if (contextImage._captionChecked) {
            if (contextImage._caption === null) {
                contextImage._caption = this.plugins.image.create_caption.call(this);
                cover.appendChild(contextImage._caption);
            }
        } else {
            if (contextImage._caption) {
                this.util.removeItem(contextImage._caption);
                contextImage._caption = null;
            }
        }

        // align
        if ('none' !== contextImage._align) {
            cover.style.margin = 'auto';
        } else {
            cover.style.margin = '0';
        }

        this.util.removeClass(container, this.context.image._floatClassRegExp);
        this.util.addClass(container, 'float-' + contextImage._align);
        imageEl.setAttribute('data-align', contextImage._align);

        // link
        if (linkValue.trim().length > 0) {
            if (contextImage._linkElement !== null) {
                contextImage._linkElement.href = linkValue;
                contextImage._linkElement.target = (contextImage.imgLinkNewWindowCheck.checked ? '_blank' : '');
                imageEl.setAttribute('data-image-link', linkValue);
            } else {
                let newEl = this.plugins.image.onRender_link(imageEl, linkValue, this.context.image.imgLinkNewWindowCheck.checked);
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
            const existElement = this.util.getFormatElement(contextImage._element);
            existElement.parentNode.insertBefore(container, existElement);
            this.util.removeItem(existElement);
        }
    },

    toggle_caption_contenteditable: function (on, figcaption) {
        this.context.image._onCaption = on;

        if (on) {
            this.context.image._caption = figcaption;
            figcaption.setAttribute('contenteditable', on);
            this.context.image._caption.focus();
        } else {
            this.context.image._caption.setAttribute('contenteditable', on);
        }
    },

    sizeRevert: function () {
        const contextImage = this.context.image;
        if (contextImage._user_w) {
            contextImage.imageX.value = contextImage._element_w = contextImage._user_w;
            contextImage.imageY.value = contextImage._element_h = contextImage._user_h;
        }
    },

    onModifyMode: function (element, size) {
        const contextImage = this.context.image;
        contextImage._linkElement = /^A$/i.test(element.parentNode.nodeName) ? element.parentNode : null;
        contextImage._element = contextImage._resize_element = element;
        contextImage._caption = contextImage._linkElement ? contextImage._linkElement.nextElementSibling : element.nextElementSibling;

        contextImage._element_w = size.w;
        contextImage._element_h = size.h;
        contextImage._element_t = size.t;
        contextImage._element_l = size.l;

        let userSize = contextImage._element.getAttribute('data-origin');
        if (userSize) {
            userSize = userSize.split(',');
            contextImage._user_w = userSize[0] * 1;
            contextImage._user_h = userSize[1] * 1;
        } else {
            contextImage._user_w = size.w;
            contextImage._user_h = size.h;
            contextImage._element.setAttribute('data-origin', size.w + ',' + size.h);
        }
    },

    openModify: function () {
        const contextImage = this.context.image;
        contextImage.imgUrlFile.value = contextImage._element.src;
        contextImage.altText.value = contextImage._element.alt;
        contextImage.imgLink.value = contextImage._linkElement === null ? '' : contextImage._linkElement.href;
        contextImage.imgLinkNewWindowCheck.checked = contextImage._linkElement && contextImage._linkElement.target === '_blank';
        contextImage.modal.querySelector('input[name="suneditor_image_radio"][value="' + (contextImage._element.getAttribute('data-align') || 'none') + '"]').checked = true;
        contextImage._captionChecked = contextImage.captionCheckEl.checked = !!contextImage._caption;
        contextImage.proportion.checked = contextImage._proportionChecked = contextImage._element.getAttribute('data-proportion') === 'true';
        contextImage.imageX.value = contextImage._element.offsetWidth;
        contextImage.imageY.value = contextImage._element.offsetHeight;
        contextImage.imageY.disabled = false;
        contextImage.proportion.disabled = false;

        this.plugins.dialog.openDialog.call(this, 'image', null, true);
    },

    setPercentSize: function (w, h) {
        this.context.image._resize_element.style.width = w;
        this.context.image._resize_element.style.height = h;
    },

    destroy: function () {
        const imageContainer = this.util.getParentElement(this.context.image._element, '.sun-editor-id-image-container') || this.context.image._element;
        this.util.removeItem(imageContainer);
        this.plugins.image.init.call(this);
    },

    init: function () {
        const contextImage = this.context.image;
        contextImage.imgInputFile.value = '';
        contextImage.imgUrlFile.value = '';
        contextImage.altText.value = '';
        contextImage.imgLink.value = '';
        contextImage.imgLinkNewWindowCheck.checked = false;
        contextImage.modal.querySelector('input[name="suneditor_image_radio"][value="none"]').checked = true;
        contextImage.captionCheckEl.checked = false;
        contextImage.proportion.checked = false;
        contextImage.imageX.value = this.context.user.imageSize;
        contextImage.imageY.value = '';
        contextImage.imageY.disabled = true;
        contextImage.proportion.disabled = true;
        contextImage._element = null;
        this.plugins.image.openTab.call(this, 'init');
    }
};
