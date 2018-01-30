/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
SUNEDITOR.plugin.image = {
    add : function(_this) {
        var context = _this.context;
        context.image = {
            _imageElement : null,
            _imageElement_w : 0,
            _imageElement_h : 0,
            _imageElement_l : 0,
            _imageElement_t : 0,
            _imageClientX : 0,
            _imageResize_parent_t : 0,
            _imageResize_parent_l : 0
        };

        /** image dialog */
        var image_dialog = eval(this.setDialog());
        context.image.modal = image_dialog;
        context.image.focusElement = image_dialog.getElementsByClassName('sun-editor-id-image-url')[0];
        context.image.imgInputFile = image_dialog.getElementsByClassName('sun-editor-id-image-file')[0];
        
        /** image resize controller, button */
        var resize_img_div = eval(this.setController_ImageResizeController());
        context.image.imageResizeDiv = resize_img_div;
        context.image.imageResizeDisplay = resize_img_div.getElementsByClassName('sun-editor-id-img-display')[0];

        var resize_img_button = eval(this.setController_ImageButton());
        context.image.imageResizeBtn = resize_img_button;

        /** add event listeners */
        context.image.imgInputFile.addEventListener('change', SUNEDITOR.plugin.image.onChange_imgInput.bind(_this));
        context.image.modal.getElementsByClassName("btn-primary")[0].addEventListener('click', SUNEDITOR.plugin.image.submit_dialog.bind(_this));
        resize_img_div.getElementsByClassName('sun-editor-img-controller')[0].addEventListener('mousedown', SUNEDITOR.plugin.image.onMouseDown_image_ctrl.bind(_this));
        context.image.imageResizeBtn.addEventListener('click', SUNEDITOR.plugin.image.onClick_imageResizeBtn.bind(_this));

        /** append html */
        context.dialog.modal.appendChild(image_dialog);
        context.element.relative.appendChild(resize_img_div);
        context.element.relative.appendChild(resize_img_button);
    },

    /** dialog */
    setDialog : function() {
        var lang = SUNEDITOR.lang;
        var dialog = document.createElement('DIV');
        dialog.className = 'modal-content sun-editor-id-dialog-image';
        dialog.style.display = 'none';
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
                this.showLoading();
                SUNEDITOR.plugin.dialog.closeDialog.call(this);

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
                    xmlHttp.onreadystatechange = SUNEDITOR.plugin.image.callBack_imgUpload.bind(this);
                    xmlHttp.open("post", imageUploadUrl, true);
                    xmlHttp.send(formData);
                } else {
                    for(i=0; i<filesLen; i++) {
                        SUNEDITOR.plugin.image.setup_reader.call(this, files[i])
                    }

                    this.closeLoading();
                }

                this.context.image.imgInputFile.value = "";
                this.context.image.focusElement.value = "";
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

    callBack_imgUpload : function() {
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
            if(this.context.image.focusElement.value.trim().length === 0) return false;

            var oImg = document.createElement("IMG");
            oImg.src = this.context.image.focusElement.value;
            oImg.style.width = "350px";

            this.insertNode(oImg);
            this.appendP(oImg);

            this.context.image.imgInputFile.value = "";
            this.context.image.focusElement.value = "";
        }

        try {
            submitAction.call(this);
        } finally {
            SUNEDITOR.plugin.dialog.closeDialog.call(this);
            this.closeLoading();
        }

        return false;
    },

    /** image resize controller, button*/
    setController_ImageResizeController : function() {
        var resize_img_div = document.createElement("DIV");
        resize_img_div.className = "modal-image-resize";
        resize_img_div.style.display = "none";
        resize_img_div.innerHTML = ''+
            '<div class="image-resize-dot tl"></div>'+
            '<div class="image-resize-dot tr"></div>'+
            '<div class="image-resize-dot bl"></div>'+
            '<div class="image-resize-dot br-controller sun-editor-img-controller"></div>'+
            '<div class="image-size-display sun-editor-id-img-display"></div>';

        return resize_img_div;
    },

    setController_ImageButton : function() {
        var lang = SUNEDITOR.lang;
        var resize_img_button = document.createElement("DIV");
        resize_img_button.className = "image-resize-btn";
        resize_img_button.style.display = "none";
        resize_img_button.innerHTML = ''+
            '<div class="btn-group">'+
            '   <button type="button" data-command="100" title="'+lang.dialogBox.imageBox.resize100+'"><span class="note-fontsize-10">100%</span></button>'+
            '   <button type="button" data-command="75" title="'+lang.dialogBox.imageBox.resize75+'"><span class="note-fontsize-10">75%</span></button>'+
            '   <button type="button" data-command="50" title="'+lang.dialogBox.imageBox.resize50+'"><span class="note-fontsize-10">50%</span></button>'+
            '   <button type="button" data-command="25" title="'+lang.dialogBox.imageBox.resize25+'"><span class="note-fontsize-10">25%</span></button>'+
            '</div>'+
            '<div class="btn-group remove">'+
            '   <button type="button" data-command="remove" title="'+lang.dialogBox.imageBox.remove+'"><span class="image_remove">x</span></button>'+
            '</div>';

        return resize_img_button;
    },

    call_controller_imageResize_ : function(targetElement) {
        /** ie,firefox image resize handle : false*/
        targetElement.setAttribute('unselectable', 'on');
        targetElement.contentEditable = false;

        var resizeDiv = this.context.image.imageResizeDiv;
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

        this.context.image.imageResizeBtn.style.top = (h + t) + "px";
        this.context.image.imageResizeBtn.style.left = l + "px";

        SUNEDITOR.dom.changeTxt(this.context.image.imageResizeDisplay, w + " x " + h);

        this.context.image._imageElement = targetElement;
        this.context.image._imageElement_w = w;
        this.context.image._imageElement_h = h;
        this.context.image._imageElement_t = t;
        this.context.image._imageElement_l = l;

        this.context.image.imageResizeDiv.style.display = "block";
        this.context.image.imageResizeBtn.style.display = "block";

        this.controllerArray = [this.context.image.imageResizeDiv, this.context.image.imageResizeBtn];
    },

    cancel_controller_imageResize : function() {
        this.context.element.resizeBackground.style.display = "none";
        this.context.image.imageResizeDiv.style.display = "none";
        this.context.image.imageResizeBtn.style.display = "none";
        this.context.image._imageElement = null;
    },

    onClick_imageResizeBtn : function(e) {
        e.stopPropagation();

        var command = e.target.getAttribute("data-command") || e.target.parentNode.getAttribute("data-command");
        if(!command) return;

        e.preventDefault();

        if(/^\d+$/.test(command)) {
            this.context.image._imageElement.style.height = "";
            this.context.image._imageElement.style.width = command + "%";
        }
        else if(/remove/.test(command)){
            SUNEDITOR.dom.removeItem(this.context.image._imageElement);
        }

        this.submenuOff();
        this.focus();
    },

    onMouseDown_image_ctrl : function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.context.argument._imageClientX = e.clientX;
        this.context.element.resizeBackground.style.display = "block";
        this.context.image.imageResizeBtn.style.display = "none";

        function closureFunc() {
            SUNEDITOR.plugin.image.cancel_controller_imageResize.call(this);
            document.removeEventListener('mousemove', resize_image_bind);
            document.removeEventListener('mouseup', closureFunc_bind);
        }

        var resize_image_bind = SUNEDITOR.plugin.image.resize_image.bind(this);
        var closureFunc_bind = closureFunc.bind(this);

        document.addEventListener('mousemove', resize_image_bind);
        document.addEventListener('mouseup', closureFunc_bind);
    },

    resize_image : function(e) {
        var w = this.context.image._imageElement_w + (e.clientX - this.context.argument._imageClientX);
        var h = ((this.context.image._imageElement_h/this.context.image._imageElement_w) * w);

        this.context.image._imageElement.style.width = w + "px";
        this.context.image._imageElement.style.height = h + "px";

        var parentElement = this.context.image._imageElement.offsetParent;
        var parentT = 0;
        var parentL = 0;
        while(parentElement) {
            parentT += (parentElement.offsetTop + parentElement.clientTop);
            parentL += (parentElement.offsetLeft + + parentElement.clientLeft);
            parentElement = parentElement.offsetParent;
        }

        var t = (this.context.image._imageElement.offsetTop + this.context.argument._imageResize_parent_t - this.context.element.wysiwygWindow.document.body.scrollTop);
        var l = (this.context.image._imageElement.offsetLeft + parentL);

        this.context.image.imageResizeDiv.style.top = t + "px";
        this.context.image.imageResizeDiv.style.left = l + "px";
        this.context.image.imageResizeDiv.style.width = w + "px";
        this.context.image.imageResizeDiv.style.height = h + "px";

        SUNEDITOR.dom.changeTxt(this.context.image.imageResizeDisplay, Math.round(w) + " x " + Math.round(h));
    }
};