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
            _element: null,
            _resize_element: null,
            _element_w: 1,
            _element_h: 1,
            _element_l: 0,
            _element_t: 0,
            _innerCover: document.createElement('SPAN')
        };

        /** Inner node needed to edit video iframe event */
        context.video._innerCover.className = 'sun-editor-iframe-inner-cover';
        context.video._innerCover.addEventListener('click', function (e) {
            const pNode = e.target.parentNode;
            const size = SUNEDITOR.plugin.dialog.call_controller_resize.call(this, pNode, 'video');
            SUNEDITOR.plugin.video.onModifyMode.call(_this, pNode.children[0], size);
        }.bind(_this));

        /** video dialog */
        const video_dialog = eval(this.setDialog());
        context.video.modal = video_dialog;
        context.video.focusElement = video_dialog.getElementsByClassName('sun-editor-id-video-url')[0];
        context.video.videoX = video_dialog.getElementsByClassName('sun-editor-id-video-x')[0];
        context.video.videoY = video_dialog.getElementsByClassName('sun-editor-id-video-y')[0];

        /** set user option value */
        video_dialog.getElementsByClassName('sun-editor-id-video-x')[0].value = context.user.videoX;
        video_dialog.getElementsByClassName('sun-editor-id-video-y')[0].value = context.user.videoY;

        /** add event listeners */
        video_dialog.getElementsByClassName('btn-primary')[0].addEventListener('click', this.submit_dialog.bind(_this));

        /** append html */
        context.dialog.modal.appendChild(video_dialog);
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
            '           <span aria-hidden="true" data-command="close">x</span>' +
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
            '           <input type="text" class="form-size-control sun-editor-id-video-x" /><label class="size-x">x</label><input type="text" class="form-size-control sun-editor-id-video-y" />' +
            '       </div>' +
            '   </div>' +
            '   <div class="modal-footer">' +
            '       <button type="submit" class="btn btn-primary sun-editor-id-submit-video"><span>' + lang.dialogBox.submitButton + '</span></button>' +
            '   </div>' +
            '</form>';

        return dialog;
    },

    submit_dialog: function (e) {
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
            oIframe.contentDocument;

            this.context.video._coverElement = coverSpan;
            coverSpan.appendChild(oIframe);

            this.insertNode(coverSpan);
            this.appendP(coverSpan);
        }

        try {
            submitAction.call(this);
        } finally {
            SUNEDITOR.plugin.dialog.closeDialog.call(this);
            this.closeLoading();
        }

        return false;
    },

    onMouseEnter_cover: function (e) {
        const target = e.target;
        if (target === this.context.video._innerCover.parentNode) return;

        target.appendChild(this.context.video._innerCover);
    },

    onMouseLeave_cover: function (e) {
        const target = e.target;
        if (target === this.context.video._innerCover.parentNode) target.removeChild(this.context.video._innerCover);
    },

    onModifyMode: function (element, size) {
        const pSpan = this.context.video._resize_element = this.context.video._coverElement;
        const frame = this.context.video._element = element;

        if (pSpan === this.context.video._innerCover.parentNode) pSpan.removeChild(this.context.video._innerCover);

        this.context.video._element_w = size.w;
        this.context.video._element_h = size.h;
        this.context.video._element_t = size.t;
        this.context.video._element_l = size.l;

        this.context.dialog.updateModal = true;
        SUNEDITOR.plugin.dialog.call_controller_resize.call(this, frame, 'video');
    },

    openModify: function () {
        const pSpan = this.context.video._coverElement;
        const frame = pSpan.children[0];

        this.context.video.focusElement.value = frame.src;
        this.context.video.videoX.value = pSpan.style.width.match(/\d+/)[0];
        this.context.video.videoY.value = pSpan.style.height.match(/\d+/)[0];

        SUNEDITOR.plugin.dialog.openDialog.call(this, 'video', null, true);
    },

    setSize: function (x, y) {
        this.context.video._resize_element.style.width = x;
        this.context.video._resize_element.style.height = y;
    },

    destroy: function () {
        SUNEDITOR.dom.removeItem(this.context.video._coverElement);
    },

    init: function () {
        this.context.video.focusElement.value = '';
        this.context.video.videoX.value = this.context.user.videoX;
        this.context.video.videoY.value = this.context.user.videoY;
    }
};
