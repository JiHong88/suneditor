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
    name: 'video',
    add: function (core) {
        core.addModule([dialog, resizing]);

        const context = core.context;
        context.video = {
            _containerElement: null,
            _element: null,
            _resize_element: null,
            _element_w: context.user.videoWidth,
            _element_h: context.user.videoHeight,
            _element_l: 0,
            _element_t: 0,
            _origin_w: context.user.videoWidth,
            _origin_h: context.user.videoHeight,
            _caption: null,
            captionCheckEl: null,
            _captionChecked: false,
            _proportionChecked: true,
            _align: 'none',
            _floatClassRegExp: 'float\\-[a-z]+'
        };

        /** video dialog */
        let video_dialog = eval(this.setDialog(core.lang));
        context.video.modal = video_dialog;
        context.video.focusElement = video_dialog.getElementsByClassName('sun-editor-id-video-url')[0];
        context.video.videoWidth = video_dialog.getElementsByClassName('sun-editor-id-video-x')[0];
        context.video.videoHeight = video_dialog.getElementsByClassName('sun-editor-id-video-y')[0];
        context.video.captionCheckEl = video_dialog.getElementsByClassName('suneditor-id-video-check-caption')[0];
        context.video.proportion = video_dialog.getElementsByClassName('suneditor-id-video-check-proportion')[0];

        /** set user option value */
        video_dialog.getElementsByClassName('sun-editor-id-video-x')[0].value = context.user.videoWidth;
        video_dialog.getElementsByClassName('sun-editor-id-video-y')[0].value = context.user.videoHeight;

        /** add event listeners */
        video_dialog.getElementsByClassName('btn-primary')[0].addEventListener('click', this.submit.bind(core));
        context.video.videoWidth.addEventListener('change', this.setInputSize.bind(core, 'x'));
        context.video.videoHeight.addEventListener('change', this.setInputSize.bind(core, 'y'));
        video_dialog.getElementsByClassName('sun-editor-id-video-revert-button')[0].addEventListener('click', this.sizeRevert.bind(core));

        /** append html */
        context.dialog.modal.appendChild(video_dialog);

        /** empty memory */
        video_dialog = null;
    },

    /** dialog */
    setDialog: function (lang) {
        const dialog = document.createElement('DIV');

        dialog.className = 'modal-content sun-editor-id-dialog-video';
        dialog.style.display = 'none';
        dialog.innerHTML = '' +
            '<form class="editor_video">' +
            '   <div class="modal-header">' +
            '       <button type="button" data-command="close" class="close" aria-label="Close" title="' + lang.dialogBox.close + '">' +
            '           <div aria-hidden="true" data-command="close" class="icon-cancel"></div>' +
            '       </button>' +
            '       <h5 class="modal-title">' + lang.dialogBox.videoBox.title + '</h5>' +
            '   </div>' +
            '   <div class="modal-body">' +
            '       <div class="form-group">' +
            '           <label>' + lang.dialogBox.videoBox.url + '</label>' +
            '           <input class="form-control sun-editor-id-video-url" type="text" />' +
            '       </div>' +
            '       <div class="form-group">' +
            '           <div class="size-text"><label class="size-w">' + lang.dialogBox.width + '</label><label class="size-x">&nbsp;</label><label class="size-h">' + lang.dialogBox.height + '</label></div>' +
            '           <input type="number" class="form-size-control sun-editor-id-video-x" /><label class="size-x">x</label><input type="number" class="form-size-control sun-editor-id-video-y" />' +
            '           <label><input type="checkbox" class="suneditor-id-video-check-proportion" style="margin-left: 20px;" checked/>&nbsp;' + lang.dialogBox.proportion + '</label>' +
            '           <button type="button" title="' + lang.dialogBox.revertButton + '" class="btn_editor sun-editor-id-video-revert-button" style="float: right;"><div class="icon-revert"></div></button>' +
            '       </div>' +
            '       <div class="form-group-footer">' +
            '           <label><input type="checkbox" class="suneditor-id-video-check-caption" />&nbsp;' + lang.dialogBox.caption + '</label>' +
            '       </div>' +
            '   </div>' +
            '   <div class="modal-footer">' +
            '       <div style="float: left;">' +
            '           <label><input type="radio" name="suneditor_video_radio" class="modal-radio" value="none" checked>' + lang.dialogBox.basic + '</label>' +
            '           <label><input type="radio" name="suneditor_video_radio" class="modal-radio" value="left">' + lang.dialogBox.left + '</label>' +
            '           <label><input type="radio" name="suneditor_video_radio" class="modal-radio" value="center">' + lang.dialogBox.center + '</label>' +
            '           <label><input type="radio" name="suneditor_video_radio" class="modal-radio" value="right">' + lang.dialogBox.right + '</label>' +
            '       </div>' +
            '       <button type="submit" class="btn btn-primary sun-editor-id-submit-video" title="' + lang.dialogBox.submitButton + '"><span>' + lang.dialogBox.submitButton + '</span></button>' +
            '   </div>' +
            '</form>';

        return dialog;
    },

    setInputSize: function (xy) {
        if (this.context.video.proportion.checked) {
            if (xy === 'x') {
                this.context.video.videoHeight.value = Math.round((this.context.video._element_h / this.context.video._element_w) * this.context.video.videoWidth.value);
            } else {
                this.context.video.videoWidth.value = Math.round((this.context.video._element_w / this.context.video._element_h) * this.context.video.videoHeight.value);
            }
        }
    },

    create_caption: function () {
        const caption = document.createElement('FIGCAPTION');
        caption.setAttribute('contenteditable', false);
        caption.innerHTML = '<p>' + this.lang.dialogBox.caption + '</p>';
        return caption;
    },

    set_cover: function (iframeElement) {
        const cover = document.createElement('FIGURE');
        cover.className = 'sun-editor-id-comp-figure-cover';
        cover.appendChild(iframeElement);

        return cover;
    },

    submit: function (e) {
        this.showLoading();

        e.preventDefault();
        e.stopPropagation();

        this.context.video._captionChecked = this.context.video.captionCheckEl.checked;
        this.context.video._proportionChecked = this.context.video.proportion.checked;

        const submitAction = function () {
            if (this.context.video.focusElement.value.trim().length === 0) return false;

            const contextVideo = this.context.video;
            const w = (/^\d+$/.test(contextVideo.videoWidth.value) ? contextVideo.videoWidth.value : this.context.user.videoWidth);
            const h = (/^\d+$/.test(contextVideo.videoHeight.value) ? contextVideo.videoHeight.value : this.context.user.videoHeight);
            let oIframe = null;
            let cover = null;
            let container = null;
            let url = contextVideo.focusElement.value.trim();
            contextVideo._align = contextVideo.modal.querySelector('input[name="suneditor_video_radio"]:checked').value;

            /** iframe source */
            if (/^<iframe.*\/iframe>$/.test(url)) {
                oIframe = (new DOMParser()).parseFromString(url, 'text/html').getElementsByTagName('iframe')[0];
            }
            /** url */
            else {
                oIframe = document.createElement('IFRAME');
                /** youtube */
                if (/youtu\.?be/.test(url)) {
                    url = url.replace('watch?v=', '');
                    if (!/^\/\/.+\/embed\//.test(url)) {
                        url = url.replace(url.match(/\/\/.+\//)[0], '//www.youtube.com/embed/');
                    }
                }
                oIframe.src = url;
            }

            /** update */
            if (this.context.dialog.updateModal) {
                contextVideo._element.src = oIframe.src;
                contextVideo._element.setAttribute('data-proportion', contextVideo._proportionChecked);
                container = contextVideo._containerElement;
                cover = this.util.getParentElement(contextVideo._element, '.sun-editor-id-comp-figure-cover');
                oIframe = contextVideo._element;
            }
            /** create */
            else {
                /** container */
                container = document.createElement('DIV');
                container.className = 'sun-editor-id-comp sun-editor-id-iframe-container';
                container.setAttribute('contentEditable', false);
                
                oIframe.frameBorder = '0';
                oIframe.allowFullscreen = true;
                oIframe.setAttribute('data-proportion', contextVideo._proportionChecked);
                oIframe.contentDocument;
                oIframe.onload = function () {
                    this.setAttribute('origin-size', this.offsetWidth + ',' + this.offsetHeight);
                    this.setAttribute('data-origin', this.offsetWidth + ',' + this.offsetHeight);
                    this.style.height = this.offsetHeight + 'px';
                }.bind(oIframe);

                /** cover */
                cover = this.plugins.video.set_cover.call(this, oIframe);

                /** resizingDiv */
                const resizingDiv = document.createElement('DIV');
                resizingDiv.className = 'sun-editor-id-iframe-inner-resizing-cover';
                container.appendChild(resizingDiv);
            }

            // caption
            if (contextVideo._captionChecked && !contextVideo._caption) {
                contextVideo._caption = this.plugins.video.create_caption.call(this);
                contextVideo._caption.setAttribute('contenteditable', false);
                cover.appendChild(contextVideo._caption);
            }

            // size
            oIframe.style.width = w + 'px';
            oIframe.style.height = h + 'px';

            // align
            if ('none' !== contextVideo._align) {
                cover.style.margin = 'auto';
            } else {
                cover.style.margin = '0';
            }
            
            this.util.removeClass(container, this.context.video._floatClassRegExp);
            this.util.addClass(container, 'float-' + contextVideo._align);
            oIframe.setAttribute('data-align', contextVideo._align);

            if (!this.context.dialog.updateModal) {
                contextVideo._containerElement = container;
                container.appendChild(cover);
    
                this.insertNode(container, this.util.getFormatElement(this.getSelectionNode()));
                this.appendP(container);
            }
        }.bind(this);

        try {
            submitAction();
        } finally {
            this.plugins.dialog.closeDialog.call(this);
            this.closeLoading();
        }

        this.focus();

        return false;
    },

    sizeRevert: function () {
        const contextVideo = this.context.video;
        if (contextVideo._origin_w) {
            contextVideo.videoWidth.value = contextVideo._element_w = contextVideo._origin_w;
            contextVideo.videoHeight.value = contextVideo._element_h = contextVideo._origin_h;
        }
    },

    onModifyMode: function (element, size) {
        const contextVideo = this.context.video;
        contextVideo._resize_element = contextVideo._element = element;
        contextVideo._containerElement = this.util.getParentElement(element, '.sun-editor-id-iframe-container');
        contextVideo._caption = element.nextElementSibling;

        contextVideo._element_w = size.w;
        contextVideo._element_h = size.h;
        contextVideo._element_t = size.t;
        contextVideo._element_l = size.l;

        let origin = contextVideo._element.getAttribute('data-origin');
        if (origin) {
            origin = origin.split(',');
            contextVideo._origin_w = origin[0] * 1;
            contextVideo._origin_h = origin[1] * 1;
        } else {
            contextVideo._origin_w = size.w;
            contextVideo._origin_h = size.h;
            contextVideo._element.setAttribute('data-origin', size.w + ',' + size.h);
        }
    },

    openModify: function () {
        const contextVideo = this.context.video;
        const container = contextVideo._containerElement;

        contextVideo.focusElement.value = contextVideo._element.src;
        contextVideo.videoWidth.value = container.offsetWidth;
        contextVideo.videoHeight.value = container.offsetHeight;
        contextVideo._captionChecked = contextVideo.captionCheckEl.checked = !!contextVideo._caption;
        contextVideo.proportion.checked = contextVideo._proportionChecked = contextVideo._element.getAttribute('data-proportion') === 'true';
        contextVideo.proportion.disabled = false;
        contextVideo.modal.querySelector('input[name="suneditor_video_radio"][value="' + (contextVideo._element.getAttribute('data-align') || 'none') + '"]').checked = true;

        this.plugins.dialog.openDialog.call(this, 'video', null, true);
    },

    setPercentSize: function (w) {
        const contextVideo = this.context.video;
        const container = this.util.getParentElement(contextVideo._resize_element, '.sun-editor-id-iframe-container');

        contextVideo._resize_element.style.width = '100%';
        container.style.width = w;

        contextVideo._resize_element.style.width = contextVideo._resize_element.offsetWidth + 'px';
        contextVideo._resize_element.style.height = ((contextVideo._element_h / contextVideo._element_w) * contextVideo._resize_element.offsetWidth) + 'px';
        container.style.width = '';
    },

    destroy: function () {
        this.util.removeItem(this.context.video._containerElement);
        this.plugins.video.init.call(this);
    },

    init: function () {
        const contextVideo = this.context.video;
        contextVideo.focusElement.value = '';
        contextVideo.videoWidth.value = this.context.user.videoWidth;
        contextVideo.videoHeight.value = this.context.user.videoHeight;
        contextVideo.captionCheckEl.checked = false;
        contextVideo.proportion.checked = true;
        contextVideo.proportion.disabled = true;
        contextVideo.modal.querySelector('input[name="suneditor_video_radio"][value="none"]').checked = true;
    }
};
