(function () {
    SUNEDITOR.plugin.image = {
        add : function(_this) {
            var context = _this.context;
            var dialog_div = context.dialog.modalArea;

            context.dialog.modal.appendChild(eval(this.setDialog()));
            context.dialog.forms.image = dialog_div.getElementsByClassName('sun-editor-id-dialog-image')[0];
            context.dialog.image = dialog_div.getElementsByClassName('sun-editor-id-dialog-image')[0];
            context.dialog.imgInputFile = dialog_div.getElementsByClassName('sun-editor-id-image-file')[0];
            context.dialog.imgInputUrl = dialog_div.getElementsByClassName('sun-editor-id-image-url')[0];

            /** 이벤트 선언 */
            context.dialog.imgInputFile.addEventListener('change', SUNEDITOR.plugin.image.onChange_imgInput.bind(_this));
            context.dialog.forms.image.addEventListener('click', SUNEDITOR.plugin.image.submit_dialog_image.bind(_this));

            return context;
        },

        setDialog : function() {
            var lang = SUNEDITOR.lang;
            var dialog = document.createElement('DIV');
            dialog.className = 'modal-content sun-editor-id-dialog-image';
            dialog.style.display = 'none';
            /** 이미지 삽입 다이얼로그 */
            dialog.innerHTML = ''+
                '<form class="editor_image" method="post" enctype="multipart/form-data">'+
                '   <div class="modal-header">'+
                '       <button type="button" data-command="close" class="close" aria-label="Close">'+
                '           <span aria-hidden="true" data-command="close">x</span>'+
                '       </button>'+
                '       <h5 class="modal-title">'+lang.dialogBox.imageBox.title+'</h5>'+
                '   </div>'+
                '   <div class="modal-body">'+
                '       <div class="form-group">'+
                '           <label>'+lang.dialogBox.imageBox.file+'</label>'+
                '               <input class="form-control sun-editor-id-image-file" type="file" accept="image/*" multiple="multiple" />'+
                '       </div>'+
                '       <div class="form-group">'+
                '           <label>'+lang.dialogBox.imageBox.url+'</label><input class="form-control sun-editor-id-image-url" type="text" />'+
                '       </div>'+
                '   </div>'+
                '   <div class="modal-footer">'+
                '       <button type="submit" class="btn btn-primary sun-editor-id-submit-image"><span>'+lang.dialogBox.submitButton+'</span></button>'+
                '   </div>'+
                '</form>';

            return dialog;
        },

        xmlHttp : null,

        onChange_imgInput : function(e) {
            e = e || window.event;
            function inputAction(files) {
                if(files) {
                    SUNEDITOR.editor.showLoading.call(this);
                    SUNEDITOR.editor.subOff.call(this);

                    var imageUploadUrl = this.context.user.imageUploadUrl;
                    var filesLen = files.length;
                    var xmlHttp = SUNEDITOR.plugin.image.xmlHttp;
                    var i;

                    if(imageUploadUrl !== null && imageUploadUrl.length > 0) {
                        var formData = new FormData();

                        for(i=0; i<filesLen; i++) {
                            formData.append("file-" + i, files[i]);
                        }

                        xmlHttp = SUNEDITOR.func.getXMLHttpRequest();
                        xmlHttp.onreadystatechange = SUNEDITOR.plugin.image.imgUpload_collBack.bind(this);
                        xmlHttp.open("post", imageUploadUrl, true);
                        xmlHttp.send(formData);
                    } else {
                        for(i=0; i<filesLen; i++) {
                            SUNEDITOR.plugin.image.setup_reader.call(this, files[i])
                        }

                        SUNEDITOR.editor.closeLoading.call(this);
                    }

                    this.context.dialog.imgInputFile.value = "";
                    this.context.dialog.imgInputUrl.value = "";
                }
            }

            try {
                inputAction.call(this, e.target.files);
            } catch(e) {
                SUNEDITOR.editor.closeLoading.call(this);
                throw Error('[SUNEDITOR.imageUpload.fail] cause : "' + e.message +'"');
            }
        },

        setup_reader : function(file) {
            var reader = new FileReader();

            reader.onload = function () {
                var oImg = document.createElement("IMG");
                oImg.src = reader.result;
                oImg.style.width = this.context.user.imageSize;
                SUNEDITOR.editor.insertNode.call(this, oImg);
                SUNEDITOR.editor.appendP.call(this, oImg);
            }.bind(this);

            reader.readAsDataURL(file);
        },

        imgUpload_collBack : function() {
            var xmlHttp = SUNEDITOR.plugin.image.xmlHttp;
            if(xmlHttp.readyState === 4){
                if(xmlHttp.status === 200){
                    var result = eval(xmlHttp.responseText);
                    var resultLen = result.length;

                    for(var i=0; i<resultLen; i++) {
                        var oImg = document.createElement("IMG");
                        oImg.src = result[i].SUNEDITOR_IMAGE_SRC;
                        oImg.style.width = this.context.user.imageSize;
                        SUNEDITOR.editor.insertNode.call(this, oImg);
                        SUNEDITOR.editor.appendP.call(this, oImg);
                    }
                } else{
                    var WindowObject = window.open('', "_blank");
                    WindowObject.document.writeln(xmlHttp.responseText);
                    WindowObject.document.close();
                    WindowObject.focus();
                }

                SUNEDITOR.editor.closeLoading.call(this);
            }
        },

        submit_dialog_image : function(e) {
            SUNEDITOR.editor.showLoading.call(this);

            e.preventDefault();
            e.stopPropagation();

            function submitAction() {
                if(this.dialog.imgInputUrl.value.trim().length === 0) return;

                var oImg = document.createElement("IMG");
                oImg.src = this.dialog.imgInputUrl.value;
                oImg.style.width = "350px";

                SUNEDITOR.editor.insertNode.call(this, oImg);
                SUNEDITOR.editor.appendP.call(this, oImg);

                this.dialog.imgInputFile.value = "";
                this.dialog.imgInputUrl.value = "";
            }

            try {
                submitAction.call(this);
            } finally {
                SUNEDITOR.editor.subOff.call(this);
                SUNEDITOR.editor.closeLoading.call(this);
            }

            return false;
        }
    }
})();