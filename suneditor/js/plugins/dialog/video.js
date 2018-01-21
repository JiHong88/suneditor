/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
SUNEDITOR.plugin.video = {
    add : function(_this) {
        var context = _this.context;
        context.video = {};

        /** video dialog */
        var video_dialog = eval(this.setDialog());
        context.dialog.video = video_dialog;
        context.dialog.videoInputUrl = video_dialog.getElementsByClassName('sun-editor-id-video-url')[0];
        context.dialog.video_x = video_dialog.getElementsByClassName('sun-editor-id-video-x')[0];
        context.dialog.video_y = video_dialog.getElementsByClassName('sun-editor-id-video-y')[0];

        /** set user option value */
        video_dialog.getElementsByClassName('sun-editor-id-video-x')[0].value = context.user.videoX;
        video_dialog.getElementsByClassName('sun-editor-id-video-y')[0].value = context.user.videoY;

        /** add event listeners */
        context.dialog.video.getElementsByClassName("btn-primary")[0].addEventListener('click', SUNEDITOR.plugin.video.submit_dialog.bind(_this));

        /** append html */
        context.dialog.modal.appendChild(video_dialog);
    },

    /** dialog */
    setDialog : function() {
        var lang = SUNEDITOR.lang;
        var dialog = document.createElement('DIV');
        dialog.className = 'modal-content sun-editor-id-dialog-video';
        dialog.style.display = 'none';
        dialog.innerHTML = ''+
            '<form class="editor_video">'+
            '   <div class="modal-header">'+
            '       <button type="button" data-command="close" class="close" aria-label="Close">'+
            '           <span aria-hidden="true" data-command="close">×</span>'+
            '       </button>'+
            '       <h5 class="modal-title">'+lang.dialogBox.videoBox.title+'</h5>'+
            '   </div>'+
            '   <div class="modal-body">'+
            '       <div class="form-group">'+
            '           <label>'+lang.dialogBox.videoBox.url+'</label>'+
            '           <input class="form-control sun-editor-id-video-url" type="text" />'+
            '       </div>'+
            '       <div class="form-group form-size">'+
            '           <div class="size-text"><label class="size-w">'+lang.dialogBox.videoBox.width+'</label><label class="size-x"> </label><label class="size-h">'+lang.dialogBox.videoBox.height+'</label></div>'+
            '           <input type="text" class="form-size-control sun-editor-id-video-x" /><label class="size-x">x</label><input type="text" class="form-size-control sun-editor-id-video-y" />'+
            '       </div>'+
            '   </div>'+
            '   <div class="modal-footer">'+
            '       <button type="submit" class="btn btn-primary sun-editor-id-submit-video"><span>'+lang.dialogBox.submitButton+'</span></button>'+
            '   </div>'+
            '</form>';

        return dialog;
    },

    submit_dialog : function(e) {
        this.showLoading();

        e.preventDefault();
        e.stopPropagation();

        function submitAction() {
            if(this.context.dialog.videoInputUrl.value.trim().length === 0) return false;

            var url = this.context.dialog.videoInputUrl.value.replace(/^https?:/, '');
            var oIframe = document.createElement("IFRAME");
            var x_v = this.context.dialog.video_x.value;
            var y_v = this.context.dialog.video_y.value;

            /** youtube */
            if(/youtu\.?be/.test(url)) {
                url = url.replace('watch?v=', '');
                if(!/^\/\/.+\/embed\//.test(url)) {
                    var youtubeUrl = url.match(/^\/\/.+\//)[0];
                    url = url.replace(youtubeUrl, '//www.youtube.com/embed/');
                }
            }

            oIframe.src = url;
            oIframe.width = (/^\d+$/.test(x_v)? x_v: this.context.user.videoX);
            oIframe.height = (/^\d+$/.test(y_v)? y_v: this.context.user.videoY);
            oIframe.frameBorder = "0";
            oIframe.allowFullscreen = true;

            this.insertNode(oIframe);
            this.appendP(oIframe);

            this.context.dialog.videoInputUrl.value = "";
            this.context.dialog.video_x.value = this.context.user.videoX;
            this.context.dialog.video_y.value = this.context.user.videoY;
        }

        try {
            submitAction.call(this);
        } finally {
            SUNEDITOR.plugin.dialog.closeDialog.call(this);
            this.closeLoading();
        }

        return false;
    }
};