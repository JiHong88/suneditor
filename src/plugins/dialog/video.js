/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

import util from '../../lib/util';
import dialog from '../modules/dialog';
import resizing from '../modules/resizing';

export default {
    name: 'video',
    add: function (core) {
        core.addModule([dialog, resizing]);

        const context = core.context;
        context.video = {
            _container: null,
            _cover: null,
            _element: null,
            _resizingDiv: null,
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
            let resizingDiv = null;
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
                container = contextVideo._container;
                cover = util.getParentElement(contextVideo._element, '.sun-editor-figure-cover');
                oIframe = contextVideo._element;
                resizingDiv = contextVideo._resizingDiv;
            }
            /** create */
            else {
                oIframe.frameBorder = '0';
                oIframe.allowFullscreen = true;
                oIframe.setAttribute('data-proportion', contextVideo._proportionChecked);
                oIframe.contentDocument;
                oIframe.onload = function () {
                    this.setAttribute('origin-size', this.offsetWidth + ',' + this.offsetHeight);
                    this.setAttribute('data-origin', this.offsetWidth + ',' + this.offsetHeight);
                    this.style.height = this.offsetHeight + 'px';
                }.bind(oIframe);
                contextVideo._element = oIframe;

                /** cover */
                cover = this.plugins.resizing.set_cover.call(this, oIframe);

                /** resizingDiv */
                contextVideo._resizingDiv = resizingDiv = document.createElement('DIV');
                resizingDiv.className = 'sun-editor-id-iframe-inner-resizing-cover';
                cover.appendChild(resizingDiv);

                /** container */
                container = this.plugins.resizing.set_container.call(this, cover, 'sun-editor-id-iframe-container');
            }

            const changeSize = w * 1 !== oIframe.offsetWidth || h * 1 !== oIframe.offsetHeight;

            // caption
            if (contextVideo._captionChecked) {
                if (!contextVideo._caption) {
                    contextVideo._caption = this.plugins.resizing.create_caption.call(this);
                    cover.appendChild(contextVideo._caption);
                }
            } else {
                if (contextVideo._caption) {
                    util.removeItem(contextVideo._caption);
                    contextVideo._caption = null;
                }
            }

            // size
            if (changeSize) {
                this.plugins.video.setSize.call(this, w, h);
            }

            // align
            if (contextVideo._align && 'none' !== contextVideo._align) {
                cover.style.margin = 'auto';
            } else {
                cover.style.margin = '0';
            }
            
            util.removeClass(container, this.context.video._floatClassRegExp);
            util.addClass(container, 'float-' + contextVideo._align);
            oIframe.setAttribute('data-align', contextVideo._align);

            if (!this.context.dialog.updateModal) {
                this.insertNode(container, util.getFormatElement(this.getSelectionNode()));
                this.appendFormatTag(container);
            } else if(changeSize) {
                this.plugins.resizing.setTransformSize.call(this, oIframe);
            }

        }.bind(this);

        try {
            submitAction();
        } finally {
            this.plugins.dialog.close.call(this);
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
        contextVideo._element = element;
        contextVideo._cover = util.getParentElement(element, '.sun-editor-figure-cover');
        contextVideo._container = util.getParentElement(element, '.sun-editor-id-iframe-container');
        contextVideo._caption = util.getChildElement(contextVideo._cover, 'FIGCAPTION');
        contextVideo._resizingDiv = util.getChildElement(contextVideo._cover, '.sun-editor-id-iframe-inner-resizing-cover');

        contextVideo._align = element.getAttribute('data-align') || 'none';

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

        contextVideo.focusElement.value = contextVideo._element.src;
        contextVideo.videoWidth.value = contextVideo._element.offsetWidth;
        contextVideo.videoHeight.value = contextVideo._element.offsetHeight;
        contextVideo._captionChecked = contextVideo.captionCheckEl.checked = !!contextVideo._caption;
        contextVideo.proportion.checked = contextVideo._proportionChecked = contextVideo._element.getAttribute('data-proportion') === 'true';
        contextVideo.proportion.disabled = false;
        contextVideo.modal.querySelector('input[name="suneditor_video_radio"][value="' + contextVideo._align + '"]').checked = true;

        this.plugins.dialog.open.call(this, 'video', true);
    },

    setSize: function (w, h, isVertical) {
        const contextVideo = this.context.video;
        contextVideo._element.style.width = w + 'px';
        contextVideo._element.style.height = h + 'px';
        contextVideo._resizingDiv.style.height = (isVertical ? w : h) + 'px';
    },

    setPercentSize: function (w) {
        const contextVideo = this.context.video;

        contextVideo._container.style.width = w;
        contextVideo._container.style.height = '';
        contextVideo._cover.style.width = '100%';
        contextVideo._cover.style.height = '';
        contextVideo._element.style.width = '100%';
        contextVideo._element.style.height = contextVideo._resizingDiv.style.height = ((contextVideo._origin_h / contextVideo._origin_w) * contextVideo._element.offsetWidth) + 'px';

        if (/100/.test(w)) {
            util.removeClass(contextVideo._container, this.context.video._floatClassRegExp);
            util.addClass(contextVideo._container, 'float-center');
        }
    },

    cancelPercentAttr: function () {
        const contextVideo = this.context.video;
        
        contextVideo._cover.style.width = '';
        contextVideo._cover.style.height = '';
        contextVideo._container.style.width = '';
        contextVideo._container.style.height = '';

        util.removeClass(contextVideo._container, this.context.video._floatClassRegExp);
        util.addClass(contextVideo._container, 'float-' + contextVideo._align);
    },

    resetAlign: function () {
        const contextVideo = this.context.video;

        contextVideo._element.setAttribute('data-align', '');
        contextVideo._align = 'none';
        contextVideo._cover.style.margin = '0';
        util.removeClass(contextVideo._container, contextVideo._floatClassRegExp);
    },

    destroy: function () {
        util.removeItem(this.context.video._container);
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
