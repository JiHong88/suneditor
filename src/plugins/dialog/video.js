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
            _resizingDiv: null,
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
            _floatClassRegExp: 'float\\-[a-z]+',
            _resizing: context.option.videoResizing,
            _youtubeQuery: context.option.youtubeQuery
        };

        /** video dialog */
        let video_dialog = eval(this.setDialog.call(core));
        context.video.modal = video_dialog;
        context.video.focusElement = video_dialog.getElementsByClassName('sun-editor-id-video-url')[0];
        context.video.captionCheckEl = video_dialog.getElementsByClassName('suneditor-id-video-check-caption')[0];

        /** add event listeners */
        video_dialog.getElementsByClassName('btn-primary')[0].addEventListener('click', this.submit.bind(core));

        context.video.videoWidth = {};
        context.video.videoHeight = {};

        if (context.option.videoResizing) {
            context.video.videoWidth = video_dialog.getElementsByClassName('sun-editor-id-video-x')[0];
            context.video.videoHeight = video_dialog.getElementsByClassName('sun-editor-id-video-y')[0];
            context.video.proportion = video_dialog.getElementsByClassName('suneditor-id-video-check-proportion')[0];

            context.video.videoWidth.value = context.option.videoWidth;
            context.video.videoHeight.value = context.option.videoHeight;

            context.video.videoWidth.addEventListener('change', this.setInputSize.bind(core, 'x'));
            context.video.videoHeight.addEventListener('change', this.setInputSize.bind(core, 'y'));
            video_dialog.getElementsByClassName('sun-editor-id-video-revert-button')[0].addEventListener('click', this.sizeRevert.bind(core));
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

        dialog.className = 'modal-content sun-editor-id-dialog-video';
        dialog.style.display = 'none';
        let html = '' +
            '<form class="editor_video">' +
            '   <div class="modal-header">' +
            '       <button type="button" data-command="close" class="close" aria-label="Close" title="' + lang.dialogBox.close + '">' +
            '           <i aria-hidden="true" data-command="close" class="icon-cancel"></i>' +
            '       </button>' +
            '       <h5 class="modal-title">' + lang.dialogBox.videoBox.title + '</h5>' +
            '   </div>' +
            '   <div class="modal-body">' +
            '       <div class="form-group">' +
            '           <label>' + lang.dialogBox.videoBox.url + '</label>' +
            '           <input class="form-control sun-editor-id-video-url" type="text" />' +
            '       </div>';

            if (option.videoResizing) {
                html += '' +
                '   <div class="form-group">' +
                '       <div class="size-text"><label class="size-w">' + lang.dialogBox.width + '</label><label class="size-x">&nbsp;</label><label class="size-h">' + lang.dialogBox.height + '</label></div>' +
                '       <input type="number" class="form-size-control sun-editor-id-video-x" /><label class="size-x">x</label><input type="number" class="form-size-control sun-editor-id-video-y" />' +
                '       <label><input type="checkbox" class="suneditor-id-video-check-proportion" style="margin-left: 20px;" checked/>&nbsp;' + lang.dialogBox.proportion + '</label>' +
                '       <button type="button" title="' + lang.dialogBox.revertButton + '" class="btn_editor btn-revert sun-editor-id-video-revert-button" style="float: right;"><i class="icon-revert"></i></button>' +
                '   </div>';
            }

            html += '' +
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

    submit: function (e) {
        this.showLoading();

        e.preventDefault();
        e.stopPropagation();

        this.context.video._captionChecked = this.context.video.captionCheckEl.checked;

        const submitAction = function () {
            if (this.context.video.focusElement.value.trim().length === 0) return false;

            const contextVideo = this.context.video;
            const w = (/^\d+$/.test(contextVideo.videoWidth.value) ? contextVideo.videoWidth.value : this.context.option.videoWidth);
            const h = (/^\d+$/.test(contextVideo.videoHeight.value) ? contextVideo.videoHeight.value : this.context.option.videoHeight);
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
                cover = this.util.getParentElement(contextVideo._element, '.sun-editor-figure-cover');
                oIframe = contextVideo._element;
                resizingDiv = contextVideo._resizingDiv;
            }
            /** create */
            else {
                oIframe.frameBorder = '0';
                oIframe.allowFullscreen = true;
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
                contextVideo._resizingDiv = resizingDiv = this.util.createElement('DIV');
                resizingDiv.className = 'sun-editor-id-iframe-inner-resizing-cover';
                cover.appendChild(resizingDiv);

                /** container */
                container = this.plugins.resizing.set_container.call(this, cover, 'sun-editor-id-iframe-container');
            }

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
            this.util.addClass(container, 'float-' + contextVideo._align);
            oIframe.setAttribute('data-align', contextVideo._align);

            if (!this.context.dialog.updateModal) {
                this.insertNode(container, this.util.getFormatElement(this.getSelectionNode()));
                this.appendFormatTag(container);
            }
            else if (/\d+/.test(cover.style.height) || (contextVideo._resizing && changeSize) || (this.context.resizing._rotateVertical && contextVideo._captionChecked)) {
                this.plugins.resizing.setTransformSize.call(this, oIframe);
            }

            // history stack
            this.history.push();
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
        contextVideo._cover = this.util.getParentElement(element, '.sun-editor-figure-cover');
        contextVideo._container = this.util.getParentElement(element, '.sun-editor-id-iframe-container');
        contextVideo._caption = this.util.getChildElement(contextVideo._cover, 'FIGCAPTION');
        contextVideo._resizingDiv = this.util.getChildElement(contextVideo._cover, '.sun-editor-id-iframe-inner-resizing-cover');

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
        contextVideo.modal.querySelector('input[name="suneditor_video_radio"][value="' + contextVideo._align + '"]').checked = true;

        if (contextVideo._resizing) {
            contextVideo.proportion.checked = contextVideo._proportionChecked = contextVideo._element.getAttribute('data-proportion') === 'true';
            contextVideo.proportion.disabled = false;
        }

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
            this.util.removeClass(contextVideo._container, this.context.video._floatClassRegExp);
            this.util.addClass(contextVideo._container, 'float-center');
        }
    },

    cancelPercentAttr: function () {
        const contextVideo = this.context.video;
        
        contextVideo._cover.style.width = '';
        contextVideo._cover.style.height = '';
        contextVideo._container.style.width = '';
        contextVideo._container.style.height = '';

        this.util.removeClass(contextVideo._container, this.context.video._floatClassRegExp);
        this.util.addClass(contextVideo._container, 'float-' + contextVideo._align);
    },

    resetAlign: function () {
        const contextVideo = this.context.video;

        contextVideo._element.setAttribute('data-align', '');
        contextVideo._align = 'none';
        contextVideo._cover.style.margin = '0';
        this.util.removeClass(contextVideo._container, contextVideo._floatClassRegExp);
    },

    destroy: function () {
        this.util.removeItem(this.context.video._container);
        this.plugins.video.init.call(this);
        this.controllersOff();
    },

    init: function () {
        const contextVideo = this.context.video;
        contextVideo.focusElement.value = '';
        contextVideo.captionCheckEl.checked = false;
        contextVideo.modal.querySelector('input[name="suneditor_video_radio"][value="none"]').checked = true;
        
        if (contextVideo._resizing) {
            contextVideo.videoWidth.value = this.context.option.videoWidth;
            contextVideo.videoHeight.value = this.context.option.videoHeight;
            contextVideo.proportion.checked = true;
            contextVideo.proportion.disabled = true;
        }
    }
};
