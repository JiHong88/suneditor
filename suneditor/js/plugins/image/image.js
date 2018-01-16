(function () {
    SUNEDITOR.plugin.image = {
        add : function(_this) {
            var context = _this.context;
            var dialog_div = context.dialog.modalArea;

            /** 이미지 다이얼로그 */
            context.dialog.modal.appendChild(eval(this.setDialog()));
            context.dialog.forms.image = dialog_div.getElementsByClassName('sun-editor-id-dialog-image')[0];
            context.dialog.image = dialog_div.getElementsByClassName('sun-editor-id-dialog-image')[0];
            context.dialog.imgInputFile = dialog_div.getElementsByClassName('sun-editor-id-image-file')[0];
            context.dialog.imgInputUrl = dialog_div.getElementsByClassName('sun-editor-id-image-url')[0];

            context.dialog.imgInputFile.addEventListener('change', SUNEDITOR.plugin.image.onChange_imgInput.bind(_this));
            context.dialog.forms.image.getElementsByClassName("btn-primary")[0].addEventListener('click', SUNEDITOR.plugin.image.submit_dialog.bind(_this));

            /** 이미지 조절 */
            var resize_img_div = eval(this.setImgDiv());
            var resize_img_button = eval(this.setImgBtn());

            context.element.imageResizeDiv = resize_img_div;
            context.element.imageResizeController = resize_img_div.getElementsByClassName('sun-editor-img-controller')[0];
            context.element.imageResizeDisplay = resize_img_div.getElementsByClassName('sun-editor-id-img-display')[0];
            context.element.imageResizeBtn = resize_img_button;

            context.element.imageResizeController.addEventListener('mousedown', SUNEDITOR.plugin.image.onMouseDown_image_ctrl.bind(_this));
            context.element.imageResizeBtn.addEventListener('click', SUNEDITOR.plugin.image.onClick_imageResizeBtn.bind(_this));

            context.element.relative.appendChild(resize_img_div);
            context.element.relative.appendChild(resize_img_button);

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

        setImgDiv : function() {
            var resize_img_div = document.createElement("DIV");
            resize_img_div.className = "modal-image-resize";
            resize_img_div.innerHTML = ''+
                '<div class="image-resize-dot tl"></div>'+
                '<div class="image-resize-dot tr"></div>'+
                '<div class="image-resize-dot bl"></div>'+
                '<div class="image-resize-dot br-controller sun-editor-img-controller"></div>'+
                '<div class="image-size-display sun-editor-id-img-display"></div>';

            return resize_img_div;
        },

        setImgBtn : function() {
            var lang = SUNEDITOR.lang;
            var resize_img_button = document.createElement("DIV");
            resize_img_button.className = "image-resize-btn";
            resize_img_button.innerHTML = ''+
                '<div class="btn-group">'+
                '   <button type="button" data-command="100" title="'+lang.dialogBox.imageBox.resize100+'"><span class="note-fontsize-10">100%</span></button>'+
                '   <button type="button" data-command="75" title="'+lang.dialogBox.imageBox.resize75+'"><span class="note-fontsize-10">75%</span></button>'+
                '   <button type="button" data-command="50" title="'+lang.dialogBox.imageBox.resize50+'"><span class="note-fontsize-10">50%</span></button>'+
                '   <button type="button" data-command="25" title="'+lang.dialogBox.imageBox.resize25+'"><span class="note-fontsize-10">25%</span></button>'+
                '</div>'+
                '<div class="btn-group remove">'+
                '   <button type="button" data-command="remove" title="'+lang.dialogBox.imageBox.remove+'"><span class="image_remove">X</span></button>'+
                '</div>';

            return resize_img_button;
        },

        xmlHttp : null,

        onChange_imgInput : function(e) {
            e = e || window.event;
            function inputAction(files) {
                if(files) {
                    this.showLoading();
                    this.subOff();

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

                        this.closeLoading();
                    }

                    this.context.dialog.imgInputFile.value = "";
                    this.context.dialog.imgInputUrl.value = "";
                }
            }

            try {
                inputAction.call(this, e.target.files);
            } catch(e) {
                this.closeLoading();
                throw Error('[SUNEDITOR.imageUpload.fail] cause : "' + e.message +'"');
            }
        },

        setup_reader : function(file) {
            var reader = new FileReader();

            reader.onload = function () {
                var oImg = document.createElement("IMG");
                oImg.src = reader.result;
                oImg.style.width = this.context.user.imageSize;
                this.insertNode(oImg);
                this.appendP(oImg);
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
                        this.insertNode(oImg);
                        this.appendP(oImg);
                    }
                } else{
                    var WindowObject = window.open('', "_blank");
                    WindowObject.document.writeln(xmlHttp.responseText);
                    WindowObject.document.close();
                    WindowObject.focus();
                }

                this.closeLoading();
            }
        },

        submit_dialog : function(e) {
            this.showLoading();

            e.preventDefault();
            e.stopPropagation();

            function submitAction() {
                if(this.context.dialog.imgInputUrl.value.trim().length === 0) return false;

                var oImg = document.createElement("IMG");
                oImg.src = this.context.dialog.imgInputUrl.value;
                oImg.style.width = "350px";

                this.insertNode(oImg);
                this.appendP(oImg);

                this.context.dialog.imgInputFile.value = "";
                this.context.dialog.imgInputUrl.value = "";
            }

            try {
                submitAction();
            } finally {
                this.subOff();
                this.closeLoading();
            }

            return false;
        },

        /** 이미지 조절 */
        call_image_resize_div : function(targetElement) {
            /** ie,firefox image resize handle : false*/
            targetElement.setAttribute('unselectable', 'on');
            targetElement.contentEditable = false;

            var resizeDiv = this.context.element.imageResizeDiv;
            var w = targetElement.offsetWidth;
            var h = targetElement.offsetHeight;

            var parentElement = targetElement.offsetParent;
            var parentT = 0;
            var parentL = 0;
            while(parentElement) {
                parentT += (parentElement.offsetTop + parentElement.clientTop);
                parentL += (parentElement.offsetLeft + + parentElement.clientLeft);
                parentElement = parentElement.offsetParent;
            }
            this.context.argument._imageResize_parent_t = (this.context.tool.bar.offsetHeight + parentT);
            this.context._imageResize_parent_l = parentL;

            var t = (targetElement.offsetTop + this.context.argument._imageResize_parent_t - this.context.element.wysiwygWindow.document.body.scrollTop);
            var l = (targetElement.offsetLeft + parentL);

            resizeDiv.style.top = t + "px";
            resizeDiv.style.left = l + "px";
            resizeDiv.style.width = w + "px";
            resizeDiv.style.height = h + "px";

            this.context.element.imageResizeBtn.style.top = (h + t) + "px";
            this.context.element.imageResizeBtn.style.left = l + "px";

            SUNEDITOR.dom.changeTxt(this.context.element.imageResizeDisplay, w + " x " + h);

            this.context.argument._imageElement = targetElement;
            this.context.argument._imageElement_w = w;
            this.context.argument._imageElement_h = h;
            this.context.argument._imageElement_t = t;
            this.context.argument._imageElement_l = l;

            this.context.element.imageResizeDiv.style.display = "block";
            this.context.element.imageResizeBtn.style.display = "block";
        },

        onClick_imageResizeBtn : function(e) {
            e.stopPropagation();

            var command = e.target.getAttribute("data-command") || e.target.parentNode.getAttribute("data-command");
            if(!command) return;

            e.preventDefault();

            if(/^\d+$/.test(command)) {
                this.context.argument._imageElement.style.height = "";
                this.context.argument._imageElement.style.width = command + "%";
            }
            else if(/remove/.test(command)){
                SUNEDITOR.dom.removeItem(this.context.argument._imageElement);
            }

            this.subOff();
            this.focus();
        },

        onMouseDown_image_ctrl : function(e) {
            e.stopPropagation();
            e.preventDefault();

            this.context.argument._imageClientX = e.clientX;
            this.context.element.resizeBackground.style.display = "block";
            this.context.element.imageResizeBtn.style.display = "none";

            function closureFunc() {
                SUNEDITOR.plugin.image.cancel_resize_image.call(this);
                document.removeEventListener('mousemove', resize_image_bind);
                document.removeEventListener('mouseup', closureFunc_bind);
            }

            var resize_image_bind = SUNEDITOR.plugin.image.resize_image.bind(this);
            var closureFunc_bind = closureFunc.bind(this);

            document.addEventListener('mousemove', resize_image_bind);
            document.addEventListener('mouseup', closureFunc_bind);
        },

        resize_image : function(e) {
            var w = this.context.argument._imageElement_w + (e.clientX - this.context.argument._imageClientX);
            var h = ((this.context.argument._imageElement_h/this.context.argument._imageElement_w) * w);

            this.context.argument._imageElement.style.width = w + "px";
            this.context.argument._imageElement.style.height = h + "px";

            var parentElement = this.context.argument._imageElement.offsetParent;
            var parentT = 0;
            var parentL = 0;
            while(parentElement) {
                parentT += (parentElement.offsetTop + parentElement.clientTop);
                parentL += (parentElement.offsetLeft + + parentElement.clientLeft);
                parentElement = parentElement.offsetParent;
            }

            var t = (this.context.argument._imageElement.offsetTop + this.context.argument._imageResize_parent_t - this.context.element.wysiwygWindow.document.body.scrollTop);
            var l = (this.context.argument._imageElement.offsetLeft + parentL);

            this.context.element.imageResizeDiv.style.top = t + "px";
            this.context.element.imageResizeDiv.style.left = l + "px";
            this.context.element.imageResizeDiv.style.width = w + "px";
            this.context.element.imageResizeDiv.style.height = h + "px";

            SUNEDITOR.dom.changeTxt(this.context.element.imageResizeDisplay, Math.round(w) + " x " + Math.round(h));
        },

        cancel_resize_image : function() {
            this.context.element.resizeBackground.style.display = "none";
            this.context.element.imageResizeDiv.style.display = "none";
            this.context.element.imageResizeBtn.style.display = "none";
            this.context.argument._imageElement = null;
        }
    }
})();