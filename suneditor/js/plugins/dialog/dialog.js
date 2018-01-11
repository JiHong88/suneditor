(function () {
    SUNEDITOR.plugin.dialog = {
        add : function(context, dialogName) {
            var dialog_div = null;
            if(!context.dialog.modalArea) {
                dialog_div = document.createElement("DIV");
                dialog_div.className = "sun-editor-id-dialogBox";

                var dialog_back = document.createElement("DIV");
                dialog_back.className = "modal-dialog-background sun-editor-id-dialog-back";
                dialog_back.style.display = "none";

                var dialog_area = document.createElement("DIV");
                dialog_area.className = "modal-dialog sun-editor-id-dialog-modal";
                dialog_area.style.display = "none";

                dialog_area.innerHTML += this.setDialog(dialogName);

                dialog_div.appendChild(dialog_back);
                dialog_div.appendChild(dialog_area);

                context.dialog.modalArea = dialog_div;
                context.dialog.back = dialog_back;
                context.dialog.modal = dialog_area;
                context.dialog.forms = {};
            } else {
                dialog_div = context.dialog.modalArea;
                context.dialog.forms.image = this.setDialog();
            }

            context.dialog.image = dialog_div.getElementsByClassName('sun-editor-id-dialog-image')[0];
            context.dialog.imgInputFile = dialog_div.getElementsByClassName('sun-editor-id-image-file')[0];
            context.dialog.imgInputUrl = dialog_div.getElementsByClassName('sun-editor-id-image-url')[0];

            context.dialog.modal.addEventListener('click', SUNEDITOR.plugin.dialog.onClick_dialog.bind(context));

            // SUNEDITOR.dialogFunc.showDialog(dialogName, context);

            context.dialog.imgInputFile.addEventListener('change', SUNEDITOR.plugin.dialog.onChange_imgInput.bind(context));
            context.dialog.forms.image.addEventListener('click', SUNEDITOR.plugin.dialog.submit_dialog.bind(context));
            context.element.topArea.getElementsByClassName('sun-editor-container')[0].appendChild(dialog_div);

            alert(12);
            return context;
        },

        setDialog : function() {
            var lang = SUNEDITOR.lang;
            var dialog = document.createElement('DIV');
            dialog.className = 'modal-content sun-editor-id-dialog-image';
            dialog.style.display = 'none';
            /** 이미지 삽입 다이얼로그 */
            dialog.innerHTML = ''+
                '    <div class="modal-content sun-editor-id-dialog-image" style="display: none;">'+
                '        <form class="editor_image" method="post" enctype="multipart/form-data">'+
                '            <div class="modal-header">'+
                '                <button type="button" data-command="close" class="close" aria-label="Close">'+
                '                    <span aria-hidden="true" data-command="close">x</span>'+
                '                </button>'+
                '                <h5 class="modal-title">'+lang.dialogBox.imageBox.title+'</h5>'+
                '            </div>'+
                '            <div class="modal-body">'+
                '                <div class="form-group">'+
                '                    <label>'+lang.dialogBox.imageBox.file+'</label>'+
                '                    <input class="form-control sun-editor-id-image-file" type="file" accept="image/*" multiple="multiple" />'+
                '                </div>'+
                '                <div class="form-group">'+
                '                    <label>'+lang.dialogBox.imageBox.url+'</label><input class="form-control sun-editor-id-image-url" type="text" />'+
                '                </div>'+
                '            </div>'+
                '            <div class="modal-footer">'+
                '                <button type="submit" class="btn btn-primary sun-editor-id-submit-image"><span>'+lang.dialogBox.submitButton+'</span></button>'+
                '            </div>'+
                '        </form>'+
                '    </div>';

            return dialog;
        },

        onClick_dialog : function(e) {
            e.stopPropagation();

            if(/modal-dialog/.test(e.target.className) || /close/.test(e.target.getAttribute("data-command"))) {
                SUNEDITOR.dialogFunc.dialogOff(this);
            }
        },

        xmlHttp : null,

        onChange_imgInput : function(e) {
            e = e || window.event;
            function inputAction(files) {
                if(files) {
                    SUNEDITOR.editor.showLoading(this.context);
                    SUNEDITOR.dialogFunc.dialogOff(this.context);

                    var imageUploadUrl = this.user.imageUploadUrl;
                    var filesLen = files.length;
                    var xmlHttp = SUNEDITOR.plugin.image.xmlHttp;
                    var i;

                    if(imageUploadUrl !== null && imageUploadUrl.length > 0) {
                        var formData = new FormData();

                        for(i=0; i<filesLen; i++) {
                            formData.append("file-" + i, files[i]);
                        }

                        xmlHttp = SUNEDITOR.func.getXMLHttpRequest();
                        xmlHttp.onreadystatechange = editor.imgUpload_collBack;
                        xmlHttp.open("post", imageUploadUrl, true);
                        xmlHttp.send(formData);
                    } else {
                        for(i=0; i<filesLen; i++) {
                            SUNEDITOR.editor.setup_reader(files[i])
                        }

                        SUNEDITOR.dialogFunc.closeLoading();
                    }

                    this.dialog.imgInputFile.value = "";
                    this.dialog.imgInputUrl.value = "";
                }
            }

            try {
                inputAction.call(this, e.target.files);
            } catch(e) {
                SUNEDITOR.dialogFunc.closeLoading();
                throw Error('[SUNEDITOR.imageUpload.fail] cause : "' + e.message +'"');
            }
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
                        oImg.style.width = context.user.imageSize;
                        editor.insertNode(oImg);
                        editor.appendP(oImg);
                    }
                } else{
                    var WindowObject = window.open('', "_blank");
                    WindowObject.document.writeln(xmlHttp.responseText);
                    WindowObject.document.close();
                    WindowObject.focus();
                }

                SUNEDITOR.dialogFunc.closeLoading();
            }
        },

        submit_dialog : function(e) {
            SUNEDITOR.editor.showLoading();

            e.preventDefault();
            e.stopPropagation();

            function submitAction() {
                if(this.dialog.imgInputUrl.value.trim().length === 0) return;

                var oImg = document.createElement("IMG");
                oImg.src = this.dialog.imgInputUrl.value;
                oImg.style.width = "350px";

                SUNEDITOR.editor.insertNode(oImg);
                SUNEDITOR.editor.appendP(oImg);

                this.dialog.imgInputFile.value = "";
                this.dialog.imgInputUrl.value = "";
            }

            try {
                submitAction.call(this);
            } finally {
                SUNEDITOR.dialogFunc.dialogOff(this.context);
                SUNEDITOR.dialogFunc.closeLoading(this.context);
            }

            return false;
        }
    }
})();