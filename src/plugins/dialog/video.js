/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
SUNEDITOR.plugin.video = {
    add: function (_this) {
        const context = _this.context;
        context.video = {
            _coverElement: null,
            _coverElementInner: document.createElement('SPAN'),
            _element: null,
            _resize_element: null,
            _element_w: 1,
            _element_h: 1,
            _element_l: 0,
            _element_t: 0,
            _origin_w: context.user.videoX,
            _origin_h: context.user.videoY,
            _proportionChecked: false
        };

        /** Inner node needed to edit video iframe event */
        context.video._coverElementInner.className = 'sun-editor-iframe-inner-cover';
        context.video._coverElementInner.addEventListener('click', function (e) {
            const pNode = e.target.parentNode;
            const size = SUNEDITOR.plugin.dialog.call_controller_resize.call(_this, pNode, 'video');
            SUNEDITOR.plugin.video.onModifyMode.call(_this, pNode.children[0], size);
        });

        /** video dialog */
        let video_dialog = eval(this.setDialog());
        context.video.modal = video_dialog;
        context.video.focusElement = video_dialog.getElementsByClassName('sun-editor-id-video-url')[0];
        context.video.videoX = video_dialog.getElementsByClassName('sun-editor-id-video-x')[0];
        context.video.videoY = video_dialog.getElementsByClassName('sun-editor-id-video-y')[0];
        context.video.proportion = video_dialog.querySelector('#suneditor_video_check_proportion');

        /** set user option value */
        video_dialog.getElementsByClassName('sun-editor-id-video-x')[0].value = context.user.videoX;
        video_dialog.getElementsByClassName('sun-editor-id-video-y')[0].value = context.user.videoY;

        /** add event listeners */
        video_dialog.getElementsByClassName('btn-primary')[0].addEventListener('click', this.submit.bind(_this));
        context.video.videoX.addEventListener('change', this.setInputSize.bind(_this, 'x'));
        context.video.videoY.addEventListener('change', this.setInputSize.bind(_this, 'y'));
        video_dialog.getElementsByClassName('sun-editor-id-video-revert-button')[0].addEventListener('click', this.sizeRevert.bind(_this));

        /** append html */
        context.dialog.modal.appendChild(video_dialog);

        /** empty memory */
        video_dialog = null;
    },

    /** dialog */
    setDialog: function () {
        const lang = SUNEDITOR.lang;
        const dialog = document.createElement('DIV');

        dialog.className = 'modal-content sun-editor-id-dialog-video';
        dialog.style.display = 'none';
        dialog.innerHTML = '' +
            '<form class="editor_video">' +
            '   <div class="modal-header">' +
            '       <button type="button" data-command="close" class="close" aria-label="Close">' +
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
            '           <input type="checkbox" id="suneditor_video_check_proportion" style="margin-left: 20px;" disabled/><label for="suneditor_video_check_proportion">&nbsp;' + lang.dialogBox.proportion + '</label>' +
            '           <button type="button" title="' + lang.dialogBox.revertButton + '" class="btn_editor sun-editor-id-video-revert-button" style="float: right;"><div class="icon-revert"></div></button>' +
            '       </div>' +
            '   </div>' +
            '   <div class="modal-footer">' +
            '       <button type="submit" class="btn btn-primary sun-editor-id-submit-video"><span>' + lang.dialogBox.submitButton + '</span></button>' +
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

        function submitAction() {
            if (this.context.video.focusElement.value.trim().length === 0) return false;

            const w = (/^\d+$/.test(this.context.video.videoX.value) ? this.context.video.videoX.value : this.context.user.videoX);
            const h = (/^\d+$/.test(this.context.video.videoY.value) ? this.context.video.videoY.value : this.context.user.videoY);
            let oIframe = null;
            let url = this.context.video.focusElement.value.trim();

            /** iframe source */
            if (/^\<iframe.*iframe\>$/.test(url)) {
                oIframe = (new DOMParser()).parseFromString(url, 'text/html').getElementsByTagName('iframe')[0]
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
                this.context.video._element.src = oIframe.src;
                this.context.video._element.setAttribute('data-proportion', this.context.video._proportionChecked);
                this.context.video._coverElement.style.width = w + 'px';
                this.context.video._coverElement.style.height = h + 'px';
                return;
            }

            /** create */
            const coverSpan = document.createElement('SPAN');
            coverSpan.className = 'sun-editor-iframe-cover';
            coverSpan.style.width = w + 'px';
            coverSpan.style.height = h + 'px';
            coverSpan.setAttribute('contentEditable', false);

            /** cover event */
            coverSpan.addEventListener('mouseenter', SUNEDITOR.plugin.video.onMouseEnter_cover.bind(this));
            coverSpan.addEventListener('mouseleave', SUNEDITOR.plugin.video.onMouseLeave_cover.bind(this).bind(this));

            oIframe.width = '100%';
            oIframe.height = '100%';
            oIframe.frameBorder = '0';
            oIframe.allowFullscreen = true;
            oIframe.setAttribute('data-proportion', this.context.video._proportionChecked);
            oIframe.contentDocument;

            this.context.video._coverElement = coverSpan;
            coverSpan.appendChild(oIframe);

            this.insertNode(coverSpan);
            this.appendP(coverSpan);
        }

        try {
            this.context.video._proportionChecked = this.context.video.proportion.checked;
            submitAction.call(this);
        } finally {
            SUNEDITOR.plugin.dialog.closeDialog.call(this);
            this.closeLoading();
        }

        return false;
    },

    onMouseEnter_cover: function (e) {
        const target = e.target;
        if (target === this.context.video._coverElementInner.parentNode) return;

        target.appendChild(this.context.video._coverElementInner);
    },

    onMouseLeave_cover: function (e) {
        const target = e.target;
        if (target === this.context.video._coverElementInner.parentNode) target.removeChild(this.context.video._coverElementInner);
    },

    sizeRevert: function () {
        const contextVideo = this.context.video;
        if (contextVideo._origin_w) {
            contextVideo.videoX.value = contextVideo._element_w = contextVideo._origin_w;
            contextVideo.videoY.value = contextVideo._element_h = contextVideo._origin_h;
        }
    },

    onModifyMode: function (element, size) {
        const videoContext = this.context.video;
        const pSpan = videoContext._resize_element = videoContext._coverElement;
        videoContext._element = element;

        if (pSpan === videoContext._coverElementInner.parentNode) pSpan.removeChild(videoContext._coverElementInner);

        videoContext._element_w = size.w;
        videoContext._element_h = size.h;
        videoContext._element_t = size.t;
        videoContext._element_l = size.l;

        let origin = videoContext._element.getAttribute('data-origin');
        if (origin) {
            origin = origin.split(',');
            videoContext._origin_w = origin[0] * 1;
            videoContext._origin_h = origin[1] * 1;
        } else {
            videoContext._origin_w = size.w;
            videoContext._origin_h = size.h;
            videoContext._element.setAttribute('data-origin', size.w + ',' + size.h);
        }
    },

    openModify: function () {
        const contextVideo = this.context.video;
        const pSpan = contextVideo._coverElement;
        const frame = pSpan.children[0];

        contextVideo.focusElement.value = frame.src;
        contextVideo.videoX.value = pSpan.style.width.match(/\d+/)[0];
        contextVideo.videoY.value = pSpan.style.height.match(/\d+/)[0];
        contextVideo.proportion.checked = contextVideo._proportionChecked = contextVideo._element.getAttribute('data-proportion') === 'true';
        contextVideo.proportion.disabled = false;

        SUNEDITOR.plugin.dialog.openDialog.call(this, 'video', null, true);
    },

    setSize: function (x, y) {
        this.context.video._resize_element.style.width = x;
        this.context.video._resize_element.style.height = y;
    },

    destroy: function () {
        this.dom.removeItem(this.context.video._coverElement);
        SUNEDITOR.plugin.video.init.call(this);
    },

    init: function () {
        this.context.video.focusElement.value = '';
        this.context.video.videoX.value = this.context.user.videoX;
        this.context.video.videoY.value = this.context.user.videoY;
        this.context.video.proportion.checked = false;
        this.context.video.proportion.disabled = true;
    }
};
