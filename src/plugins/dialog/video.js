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
            _container: null,
            _cover: null,
            _element: null,
            _element_w: context.option.videoWidth,
            _element_h: context.option.videoHeight,
            _element_l: 0,
            _element_t: 0,
            _origin_w: context.option.videoWidth,
            _origin_h: context.option.videoHeight,
            _caption: null,
            captionCheckEl: null,
            _captionChecked: false,
            _proportionChecked: true,
            _align: 'none',
            _floatClassRegExp: '__se__float\\-[a-z]+',
            _resizing: context.option.videoResizing,
            _youtubeQuery: context.option.youtubeQuery
        };

        /** video dialog */
        let video_dialog = this.setDialog.call(core);
        context.video.modal = video_dialog;
        context.video.focusElement = video_dialog.querySelector('._se_video_url');
        context.video.captionCheckEl = video_dialog.querySelector('._se_video_check_caption');

        /** add event listeners */
        video_dialog.querySelector('.se-btn-primary').addEventListener('click', this.submit.bind(core));

        context.video.videoWidth = {};
        context.video.videoHeight = {};

        if (context.option.videoResizing) {
            context.video.videoWidth = video_dialog.querySelector('._se_video_size_x');
            context.video.videoHeight = video_dialog.querySelector('._se_video_size_y');
            context.video.proportion = video_dialog.querySelector('._se_video_check_proportion');

            context.video.videoWidth.value = context.option.videoWidth;
            context.video.videoHeight.value = context.option.videoHeight;

            context.video.videoWidth.addEventListener('change', this.setInputSize.bind(core, 'x'));
            context.video.videoHeight.addEventListener('change', this.setInputSize.bind(core, 'y'));
            video_dialog.querySelector('.se-dialog-btn-revert').addEventListener('click', this.sizeRevert.bind(core));
        }

        /** append html */
        context.dialog.modal.appendChild(video_dialog);

        /** empty memory */
        video_dialog = null;
    },

    /** dialog */
    setDialog: function () {
        const option = this.context.option;
        const lang = this.lang;
        const dialog = this.util.createElement('DIV');

        dialog.className = 'se-dialog-content';
        dialog.style.display = 'none';
        let html = '' +
            '<form class="editor_video">' +
                '<div class="se-dialog-header">' +
                    '<button type="button" data-command="close" class="close" aria-label="Close" title="' + lang.dialogBox.close + '">' +
                        '<i aria-hidden="true" data-command="close" class="se-icon-cancel"></i>' +
                    '</button>' +
                    '<span class="se-modal-title">' + lang.dialogBox.videoBox.title + '</span>' +
                '</div>' +
                '<div class="se-dialog-body">' +
                    '<div class="se-dialog-form">' +
                        '<label>' + lang.dialogBox.videoBox.url + '</label>' +
                        '<input class="se-input-form _se_video_url" type="text" />' +
                    '</div>';

            if (option.videoResizing) {
                html += '' +
                    '<div class="se-dialog-form">' +
                        '<div class="se-dialog-size-text"><label class="size-w">' + lang.dialogBox.width + '</label><label class="se-dialog-size-x">&nbsp;</label><label class="size-h">' + lang.dialogBox.height + '</label></div>' +
                        '<input type="number" class="se-input-control _se_video_size_x" />' +
                        '<label class="se-dialog-size-x">x</label>' +
                        '<input type="number" class="se-input-control _se_video_size_y" />' +
                        '<label><input type="checkbox" class="se-dialog-btn-check _se_video_check_proportion" checked/>&nbsp;' + lang.dialogBox.proportion + '</label>' +
                        '<button type="button" title="' + lang.dialogBox.revertButton + '" class="se-btn se-dialog-btn-revert" style="float: right;"><i class="se-icon-revert"></i></button>' +
                    '</div>';
            }

            html += '' +
                    '<div class="se-dialog-form-footer">' +
                        '<label><input type="checkbox" class="se-dialog-btn-check _se_video_check_caption" />&nbsp;' + lang.dialogBox.caption + '</label>' +
                    '</div>' +
                '</div>' +
                '<div class="se-dialog-footer">' +
                    '<div>' +
                        '<label><input type="radio" name="suneditor_video_radio" class="se-dialog-btn-radio" value="none" checked>' + lang.dialogBox.basic + '</label>' +
                        '<label><input type="radio" name="suneditor_video_radio" class="se-dialog-btn-radio" value="left">' + lang.dialogBox.left + '</label>' +
                        '<label><input type="radio" name="suneditor_video_radio" class="se-dialog-btn-radio" value="center">' + lang.dialogBox.center + '</label>' +
                        '<label><input type="radio" name="suneditor_video_radio" class="se-dialog-btn-radio" value="right">' + lang.dialogBox.right + '</label>' +
                    '</div>' +
                    '<button type="submit" class="se-btn-primary" title="' + lang.dialogBox.submitButton + '"><span>' + lang.dialogBox.submitButton + '</span></button>' +
                '</div>' +
            '</form>';

        dialog.innerHTML = html;

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

    submitAction: function () {
        if (this.context.video.focusElement.value.trim().length === 0) return false;

        const contextVideo = this.context.video;
        const w = (/^\d+$/.test(contextVideo.videoWidth.value) ? contextVideo.videoWidth.value : this.context.option.videoWidth);
        const h = (/^\d+$/.test(contextVideo.videoHeight.value) ? contextVideo.videoHeight.value : this.context.option.videoHeight);
        let oIframe = null;
        let cover = null;
        let container = null;
        let url = contextVideo.focusElement.value.trim();
        contextVideo._align = contextVideo.modal.querySelector('input[name="suneditor_video_radio"]:checked').value;

        /** iframe source */
        if (/^<iframe.*\/iframe>$/.test(url)) {
            oIframe = (new this._w.DOMParser()).parseFromString(url, 'text/html').querySelector('iframe');
        }
        /** url */
        else {
            oIframe = this.util.createElement('IFRAME');
            /** youtube */
            if (/youtu\.?be/.test(url)) {
                url = url.replace('watch?v=', '');
                if (!/^\/\/.+\/embed\//.test(url)) {
                    url = url.replace(url.match(/\/\/.+\//)[0], '//www.youtube.com/embed/');
                }

                if (contextVideo._youtubeQuery.length > 0) {
                    if (/\?/.test(url)) {
                        const splitUrl = url.split('?');
                        url = splitUrl[0] + '?' + contextVideo._youtubeQuery + '&' + splitUrl[1];
                    } else {
                        url += '?' + contextVideo._youtubeQuery;
                    }
                }
            }
            oIframe.src = url;
        }

        /** update */
        if (this.context.dialog.updateModal) {
            contextVideo._element.src = oIframe.src;
            container = contextVideo._container;
            cover = this.util.getParentElement(contextVideo._element, 'FIGURE');
            oIframe = contextVideo._element;
        }
        /** create */
        else {
            oIframe.frameBorder = '0';
            oIframe.allowFullscreen = true;
            oIframe.onload = function () {
                this.setAttribute('origin-size', this.offsetWidth + ',' + this.offsetHeight);
                this.setAttribute('data-origin', this.offsetWidth + ',' + this.offsetHeight);
                this.style.height = this.offsetHeight + 'px';
            }.bind(oIframe);
            contextVideo._element = oIframe;

            /** cover */
            cover = this.plugins.resizing.set_cover.call(this, oIframe);

            /** container */
            container = this.plugins.resizing.set_container.call(this, cover, 'se-video-container');
            this._variable._videosCnt++;
        }

        contextVideo._cover = cover;
        contextVideo._container = container;

        const changeSize = w * 1 !== oIframe.offsetWidth || h * 1 !== oIframe.offsetHeight;

        if (contextVideo._resizing) {
            this.context.video._proportionChecked = contextVideo.proportion.checked;
            oIframe.setAttribute('data-proportion', contextVideo._proportionChecked);
        }

        // caption
        if (contextVideo._captionChecked) {
            if (!contextVideo._caption) {
                contextVideo._caption = this.plugins.resizing.create_caption.call(this);
                cover.appendChild(contextVideo._caption);
            }
        } else {
            if (contextVideo._caption) {
                this.util.removeItem(contextVideo._caption);
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
        
        this.util.removeClass(container, this.context.video._floatClassRegExp);
        this.util.addClass(container, '__se__float-' + contextVideo._align);
        oIframe.setAttribute('data-align', contextVideo._align);

        if (!this.context.dialog.updateModal) {
            this.insertComponent(container);
        }
        else if (/\d+/.test(cover.style.height) || (contextVideo._resizing && changeSize) || (this.context.resizing._rotateVertical && contextVideo._captionChecked)) {
            this.plugins.resizing.setTransformSize.call(this, oIframe, null, null);
        }

        // history stack
        this.history.push();
    },

    submit: function (e) {
        this.showLoading();

        e.preventDefault();
        e.stopPropagation();

        this.context.video._captionChecked = this.context.video.captionCheckEl.checked;

        try {
            this.plugins.video.submitAction.call(this);
        } finally {
            this.plugins.dialog.close.call(this);
            this.closeLoading();
        }

        this.focus();

        return false;
    },

    _update_videoCover: function (oIframe) {
        const contextVideo = this.context.video;

        oIframe.frameBorder = '0';
        oIframe.allowFullscreen = true;
        oIframe.onload = function () {
            this.setAttribute('origin-size', this.offsetWidth + ',' + this.offsetHeight);
            this.setAttribute('data-origin', this.offsetWidth + ',' + this.offsetHeight);
            this.style.height = this.offsetHeight + 'px';
        }.bind(oIframe);
        
        const existElement = this.util.getParentElement(oIframe, this.util.isComponent) || 
            this.util.getParentElement(oIframe, function (current) {
                return this.isWysiwygDiv(current.parentNode);
            }.bind(this.util));

        contextVideo._element = oIframe = oIframe.cloneNode(false);
        const cover = this.plugins.resizing.set_cover.call(this, oIframe);
        const container = this.plugins.resizing.set_container.call(this, cover, 'se-video-container');

        const figcaption = existElement.getElementsByTagName('FIGCAPTION')[0];
        if (!!figcaption) {
            const caption = this.plugins.resizing.create_caption.call(this);
            caption.innerHTML = figcaption.innerHTML;
            cover.appendChild(caption);
        }

        const originSize = (oIframe.getAttribute('origin-size') || '').split(',');
        const w = originSize[0] || this.context.option.videoWidth;
        const h = originSize[1] || this.context.option.videoHeight;
        this.plugins.video.setSize.call(this, w, h);

        existElement.parentNode.insertBefore(container, existElement);
        this.util.removeItem(existElement);
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
        contextVideo._cover = this.util.getParentElement(element, 'FIGURE');
        contextVideo._container = this.util.getParentElement(element, '.se-video-container');
        contextVideo._caption = this.util.getChildElement(contextVideo._cover, 'FIGCAPTION');

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

    openModify: function (notOpen) {
        const contextVideo = this.context.video;

        contextVideo.focusElement.value = contextVideo._element.src;
        contextVideo.videoWidth.value = contextVideo._element.offsetWidth;
        contextVideo.videoHeight.value = contextVideo._element.offsetHeight;
        contextVideo._captionChecked = contextVideo.captionCheckEl.checked = !!contextVideo._caption;
        contextVideo.modal.querySelector('input[name="suneditor_video_radio"][value="' + contextVideo._align + '"]').checked = true;

        if (contextVideo._resizing) {
            contextVideo.proportion.checked = contextVideo._proportionChecked = contextVideo._element.getAttribute('data-proportion') !== 'false';
            contextVideo.proportion.disabled = false;
        }

        if (!notOpen) this.plugins.dialog.open.call(this, 'video', true);
    },

    checkVideosInfo: function () {
        const videos = this.context.element.wysiwyg.getElementsByTagName('IFRAME');
        if (videos.length === this._variable._videosCnt) return;

        const videoPlugin = this.plugins.video;
        this._variable._videosCnt = videos.length;

        for (let i = 0, len = this._variable._videosCnt, video; i < len; i++) {
            video = videos[i];
            if (!this.util.getParentElement(video, '.se-video-container')) {
                videoPlugin._update_videoCover.call(this, video);
            }
        }
    },

    setSize: function (w, h) {
        const contextVideo = this.context.video;
        contextVideo._element.style.width = /^\d+$/.test(w) ? w + 'px' : w;
        contextVideo._element.style.height = /^\d+$/.test(h) ? h + 'px' : h;
    },

    setAutoSize: function () {
        const contextVideo = this.context.video;

        this.plugins.resizing.resetTransform.call(this, contextVideo._element);
        this.plugins.video.cancelPercentAttr.call(this);

        const originSize = (contextVideo._element.getAttribute('data-origin') || '').split(',');
        const w = (originSize[0] || this.context.option.videoWidth) + 'px';
        const h = (originSize[1] || this.context.option.videoHeight) + 'px';

        contextVideo._element.style.maxWidth = '100%';
        contextVideo._cover.style.width = contextVideo._element.style.width = w;
        contextVideo._cover.style.height = contextVideo._element.style.height = h;
    },

    setPercentSize: function (w) {
        const contextVideo = this.context.video;

        contextVideo._element.style.maxWidth = '100%';
        contextVideo._container.style.width = w;
        contextVideo._container.style.height = '';
        contextVideo._cover.style.width = '100%';
        contextVideo._cover.style.height = '';
        contextVideo._element.style.width = '100%';
        contextVideo._element.style.height = ((contextVideo._origin_h / contextVideo._origin_w) * contextVideo._element.offsetWidth) + 'px';

        if (/100/.test(w)) {
            this.util.removeClass(contextVideo._container, this.context.video._floatClassRegExp);
            this.util.addClass(contextVideo._container, '__se__float-center');
        }
    },

    cancelPercentAttr: function () {
        const contextVideo = this.context.video;
        
        contextVideo._element.style.maxWidth = 'none';
        contextVideo._cover.style.width = '';
        contextVideo._cover.style.height = '';
        contextVideo._container.style.width = '';
        contextVideo._container.style.height = '';

        this.util.removeClass(contextVideo._container, this.context.video._floatClassRegExp);
        this.util.addClass(contextVideo._container, '__se__float-' + contextVideo._align);
    },

    resetAlign: function () {
        const contextVideo = this.context.video;

        contextVideo._element.setAttribute('data-align', '');
        contextVideo._align = 'none';
        contextVideo._cover.style.margin = '0';
        this.util.removeClass(contextVideo._container, contextVideo._floatClassRegExp);
    },

    destroy: function () {
        this._variable._videosCnt--;
        this.util.removeItem(this.context.video._container);
        this.plugins.video.init.call(this);
        this.controllersOff();

        // history stack
        this.history.push();
    },

    init: function () {
        const contextVideo = this.context.video;
        contextVideo.focusElement.value = '';
        contextVideo.captionCheckEl.checked = false;
        contextVideo._origin_w = this.context.option.videoWidth;
        contextVideo._origin_h = this.context.option.videoHeight;

        contextVideo.modal.querySelector('input[name="suneditor_video_radio"][value="none"]').checked = true;
        
        if (contextVideo._resizing) {
            contextVideo.videoWidth.value = this.context.option.videoWidth;
            contextVideo.videoHeight.value = this.context.option.videoHeight;
            contextVideo.proportion.checked = true;
            contextVideo.proportion.disabled = true;
        }
    }
};
