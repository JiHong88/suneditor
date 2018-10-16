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
            _coverElement: document.createElement('SPAN'),
            _element: null,
            _resize_element: null,
            _element_w: context.user.videoX,
            _element_h: context.user.videoY,
            _element_l: 0,
            _element_t: 0,
            _origin_w: context.user.videoX,
            _origin_h: context.user.videoY,
            _proportionChecked: true,
            _align: 'none',
            _floatClassRegExp: 'float\\-[a-z]+'
        };

        /** Inner node needed to edit video iframe event */
        context.video._coverElement.className = 'sun-editor-iframe-inner-cover';
        context.video._coverElement.addEventListener('click', function (e) {
            const pNode = e.target.parentNode;
            const size = core.plugins.resizing.call_controller_resize.call(core, pNode, 'video');
            core.plugins.video.onModifyMode.call(core, pNode.children[0], size);
        });

        /** video dialog */
        let video_dialog = eval(this.setDialog(core.lang));
        context.video.modal = video_dialog;
        context.video.focusElement = video_dialog.getElementsByClassName('sun-editor-id-video-url')[0];
        context.video.videoX = video_dialog.getElementsByClassName('sun-editor-id-video-x')[0];
        context.video.videoY = video_dialog.getElementsByClassName('sun-editor-id-video-y')[0];
        context.video.proportion = video_dialog.querySelector('#suneditor_video_check_proportion');

        /** set user option value */
        video_dialog.getElementsByClassName('sun-editor-id-video-x')[0].value = context.user.videoX;
        video_dialog.getElementsByClassName('sun-editor-id-video-y')[0].value = context.user.videoY;

        /** add event listeners */
        video_dialog.getElementsByClassName('btn-primary')[0].addEventListener('click', this.submit.bind(core));
        context.video.videoX.addEventListener('change', this.setInputSize.bind(core, 'x'));
        context.video.videoY.addEventListener('change', this.setInputSize.bind(core, 'y'));
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
            '           <input type="checkbox" id="suneditor_video_check_proportion" style="margin-left: 20px;" checked/><label for="suneditor_video_check_proportion">&nbsp;' + lang.dialogBox.proportion + '</label>' +
            '           <button type="button" title="' + lang.dialogBox.revertButton + '" class="btn_editor sun-editor-id-video-revert-button" style="float: right;"><div class="icon-revert"></div></button>' +
            '       </div>' +
            '   </div>' +
            '   <div class="modal-footer">' +
            '       <div style="float: left;">' +
            '           <input type="radio" id="suneditor_video_radio_none" name="suneditor_video_radio" class="modal-radio" value="none" checked><label for="suneditor_video_radio_none">' + lang.dialogBox.basic + '</label>' +
            '           <input type="radio" id="suneditor_video_radio_left" name="suneditor_video_radio" class="modal-radio" value="left"><label for="suneditor_video_radio_left">' + lang.dialogBox.left + '</label>' +
            '           <input type="radio" id="suneditor_video_radio_center" name="suneditor_video_radio" class="modal-radio" value="center"><label for="suneditor_video_radio_center">' + lang.dialogBox.center + '</label>' +
            '           <input type="radio" id="suneditor_video_radio_right" name="suneditor_video_radio" class="modal-radio" value="right"><label for="suneditor_video_radio_right">' + lang.dialogBox.right + '</label>' +
            '       </div>' +
            '       <button type="submit" class="btn btn-primary sun-editor-id-submit-video" title="' + lang.dialogBox.submitButton + '"><span>' + lang.dialogBox.submitButton + '</span></button>' +
            '   </div>' +
            '</form>';

        return dialog;
    },

    setInputSize: function (xy) {
        if (this.context.video.proportion.checked) {
            if (xy === 'x') {
                this.context.video.videoY.value = Math.round((this.context.video._element_h / this.context.video._element_w) * this.context.video.videoX.value);
            } else {
                this.context.video.videoX.value = Math.round((this.context.video._element_w / this.context.video._element_h) * this.context.video.videoY.value);
            }
        }
    },

    submit: function (e) {
        this.showLoading();

        e.preventDefault();
        e.stopPropagation();

        this.context.video._proportionChecked = this.context.video.proportion.checked;

        const submitAction = function () {
            if (this.context.video.focusElement.value.trim().length === 0) return false;

            const contextVideo = this.context.video;
            const w = (/^\d+$/.test(contextVideo.videoX.value) ? contextVideo.videoX.value : this.context.user.videoX);
            const h = (/^\d+$/.test(contextVideo.videoY.value) ? contextVideo.videoY.value : this.context.user.videoY);
            let oIframe = null;
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
                oIframe = contextVideo._element;
            }
            /** create */
            else {
                /** container */
                container = document.createElement('DIV');
                container.className = 'sun-editor-id-media-container sun-editor-id-iframe-container';
                container.setAttribute('contentEditable', false);
    
                /** container event */
                container.addEventListener('mouseenter', this.plugins.video.onMouseenter_container.bind(this));
                container.addEventListener('mouseleave', this.plugins.video.onMouseleave_container.bind(this).bind(this));

                oIframe.width = '100%';
                oIframe.height = '100%';
                oIframe.frameBorder = '0';
                oIframe.allowFullscreen = true;
                oIframe.setAttribute('data-proportion', contextVideo._proportionChecked);
                oIframe.contentDocument;
            }

            // size
            container.style.width = w + 'px';
            container.style.height = h + 'px';

            // align
            if ('center' !== contextVideo._align) {
                container.style.display = 'inline-block';
                this.util.removeClass(container, this.context.video._floatClassRegExp);
                this.util.addClass(container, 'float-' + contextVideo._align);
            } else {
                container.style.display = 'table';
                this.util.removeClass(container, this.context.video._floatClassRegExp);
                this.util.addClass(container, 'float-none');
            }

            oIframe.setAttribute('data-align', contextVideo._align);

            if (!this.context.dialog.updateModal) {
                contextVideo._containerElement = container;
                container.appendChild(oIframe);
    
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

    onMouseenter_container: function (e) {
        const target = e.target;
        if (target === this.context.video._coverElement.parentNode) return;

        target.appendChild(this.context.video._coverElement);
    },

    onMouseleave_container: function (e) {
        const target = e.target;
        if (target === this.context.video._coverElement.parentNode) target.removeChild(this.context.video._coverElement);
    },

    sizeRevert: function () {
        const contextVideo = this.context.video;
        if (contextVideo._origin_w) {
            contextVideo.videoX.value = contextVideo._element_w = contextVideo._origin_w;
            contextVideo.videoY.value = contextVideo._element_h = contextVideo._origin_h;
        }
    },

    onModifyMode: function (element, size) {
        const contextVideo = this.context.video;
        const container = contextVideo._resize_element = contextVideo._containerElement = element.parentNode;
        contextVideo._element = container.firstChild;

        if (container === contextVideo._coverElement.parentNode) container.removeChild(contextVideo._coverElement);

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
        contextVideo.videoX.value = container.offsetWidth;
        contextVideo.videoY.value = container.offsetHeight;
        contextVideo.proportion.checked = contextVideo._proportionChecked = contextVideo._element.getAttribute('data-proportion') === 'true';
        contextVideo.proportion.disabled = false;
        contextVideo.modal.querySelector('#suneditor_video_radio_' + (contextVideo._element.getAttribute('data-align') || 'none')).checked = true;

        this.plugins.dialog.openDialog.call(this, 'video', null, true);
    },

    setSize: function (x) {
        const contextVideo = this.context.video;
        contextVideo._resize_element.style.width = x;
        contextVideo._resize_element.style.height = ((contextVideo._element_h / contextVideo._element_w) * contextVideo._resize_element.offsetWidth) + 'px';
    },

    destroy: function () {
        this.util.removeItem(this.context.video._containerElement);
        this.plugins.video.init.call(this);
    },

    init: function () {
        const contextVideo = this.context.video;
        contextVideo.focusElement.value = '';
        contextVideo.videoX.value = this.context.user.videoX;
        contextVideo.videoY.value = this.context.user.videoY;
        contextVideo.proportion.checked = true;
        contextVideo.proportion.disabled = true;
        contextVideo.modal.querySelector('#suneditor_video_radio_none').checked = true;
    }
};
