/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
SUNEDITOR.plugin.image = {
    add: function (_this) {
        var context = _this.context;
        context.image = {
            _imageElementLink: null,
            _imageElement: null,
            _imageElement_w: 0,
            _imageElement_h: 0,
            _imageElement_l: 0,
            _imageElement_t: 0,
            _imageClientX: 0,
            _imageResize_parent_t: 0,
            _imageResize_parent_l: 0,
            _linkValue: '',
            _align: 'none'
        };

        /** image dialog */
        var image_dialog = eval(this.setDialog());
        context.image.modal = image_dialog;
        context.image.focusElement = image_dialog.getElementsByClassName('sun-editor-id-image-url')[0];
        context.image.imgInputFile = image_dialog.getElementsByClassName('sun-editor-id-image-file')[0];
        context.image.imgLink = image_dialog.getElementsByClassName('sun-editor-id-image-link')[0];
        context.image.imgLinkNewWindowCheck = image_dialog.getElementsByClassName('sun-editor-id-linkCheck')[0];

        /** image resize controller, button */
        var resize_img_div = eval(this.setController_ImageResizeController());
        context.image.imageResizeDiv = resize_img_div;
        context.image.imageResizeDisplay = resize_img_div.getElementsByClassName('sun-editor-id-img-display')[0];

        var resize_img_button = eval(this.setController_ImageButton());
        context.image.imageResizeBtn = resize_img_button;

        /** add event listeners */
        context.image.modal.getElementsByClassName('sun-editor-tab-button')[0].addEventListener('click', SUNEDITOR.plugin.image.openTab);
        context.image.modal.getElementsByClassName("btn-primary")[0].addEventListener('click', SUNEDITOR.plugin.image.submit_dialog.bind(_this));
        resize_img_div.getElementsByClassName('sun-editor-img-controller')[0].addEventListener('mousedown', SUNEDITOR.plugin.image.onMouseDown_image_ctrl.bind(_this));
        context.image.imageResizeBtn.addEventListener('click', SUNEDITOR.plugin.image.onClick_imageResizeBtn.bind(_this));

        /** append html */
        context.dialog.modal.appendChild(image_dialog);
        context.element.relative.appendChild(resize_img_div);
        context.element.relative.appendChild(resize_img_button);
    },

    /** dialog */
    setDialog: function () {
        var lang = SUNEDITOR.lang;
        var dialog = document.createElement('DIV');
        dialog.className = 'modal-content sun-editor-id-dialog-image';
        dialog.style.display = 'none';
        dialog.innerHTML = '' +
			'<div class="modal-header">' +
			'   <button type="button" data-command="close" class="close" aria-label="Close">' +
			'       <span aria-hidden="true" data-command="close">x</span>' +
			'   </button>' +
			'   <h5 class="modal-title">' + lang.dialogBox.imageBox.title + '</h5>' +
			'</div>' +
            '<div class="sun-editor-tab-button">' +
            '   <button type="button" class="sun-editor-id-tab-link active" data-tab-link="image">' + lang.toolbar.image + '</button>' +
			'   <button type="button" class="sun-editor-id-tab-link" data-tab-link="url">' + lang.toolbar.link + '</button>' +
            '</div>' +
            '<form class="editor_image" method="post" enctype="multipart/form-data">' +
			'   <div class="sun-editor-id-tab-content sun-editor-id-tab-content-image">' +
            '       <div class="modal-body">' +
            '           <div class="form-group">' +
            '               <label>' + lang.dialogBox.imageBox.file + '</label>' +
            '                   <input class="form-control sun-editor-id-image-file" type="file" accept="image/*" multiple="multiple" />' +
            '           </div>' +
            '           <div class="form-group">' +
            '               <label>' + lang.dialogBox.imageBox.url + '</label><input class="form-control sun-editor-id-image-url" type="text" />' +
            '           </div>' +
            '       </div>' +
			'   </div>' +
			'   <div class="sun-editor-id-tab-content sun-editor-id-tab-content-url" style="display: none">' +
			'       <div class="modal-body">' +
			'           <div class="form-group">' +
			'               <label>' + lang.dialogBox.linkBox.url + '</label><input class="form-control sun-editor-id-image-link" type="text" />' +
			'           </div>' +
            '           <label><input type="checkbox" class="sun-editor-id-linkCheck" />&nbsp;' + lang.dialogBox.linkBox.newWindowCheck + '</label>' +
			'       </div>' +
			'   </div>' +
			'   <div class="modal-footer">' +
            '       <div style="float: left;">' +
			'           <input type="radio" id="suneditor_image_radio_none" name="suneditor_image_radio" class="modal-radio" value="none" checked><label for="suneditor_image_radio_none">' + lang.dialogBox.imageBox.basic + '</label>' +
			'           <input type="radio" id="suneditor_image_radio_left" name="suneditor_image_radio" class="modal-radio" value="left"><label for="suneditor_image_radio_left">' + lang.dialogBox.imageBox.left + '</label>' +
            '           <input type="radio" id="suneditor_image_radio_right" name="suneditor_image_radio" class="modal-radio" value="right"><label for="suneditor_image_radio_right">' + lang.dialogBox.imageBox.right + '</label>' +
			'           <input type="radio" id="suneditor_image_radio_center" name="suneditor_image_radio" class="modal-radio" value="center"><label for="suneditor_image_radio_center">' + lang.dialogBox.imageBox.center + '</label>' +
            '       </div>' +
			'       <button type="submit" class="btn btn-primary sun-editor-id-submit-image"><span>' + lang.dialogBox.submitButton + '</span></button>' +
			'   </div>' +
            '</form>';

        return dialog;
    },

	openTab: function (e) {
        var targetElement = (e === 'init' ? document.getElementsByClassName('sun-editor-id-tab-link')[0] : e.target);

		if (!/^BUTTON$/i.test(targetElement.tagName)) {
			return false;
		}

		// Declare all variables
		var i, tabcontent, tablinks;
		var contentClassName = 'sun-editor-id-tab-content';

		// Get all elements with class="tabcontent" and hide them
		tabcontent = document.getElementsByClassName(contentClassName);
		for (i = 0; i < tabcontent.length; i++) {
			tabcontent[i].style.display = 'none';
		}

		// Get all elements with class="tablinks" and remove the class "active"
		tablinks = document.getElementsByClassName('sun-editor-id-tab-link');
		for (i = 0; i < tablinks.length; i++) {
		    SUNEDITOR.dom.removeClass(tablinks[i], 'active');
		}

		// Show the current tab, and add an "active" class to the button that opened the tab
		document.getElementsByClassName(contentClassName + '-' + targetElement.getAttribute('data-tab-link'))[0].style.display = 'block';
        SUNEDITOR.dom.addClass(targetElement, 'active');

		return false;
	},

    xmlHttp: null,

    onRender_imgInput: function () {
        function inputAction(files) {
            if (files) {
                var imageUploadUrl = this.context.user.imageUploadUrl;
                var filesLen = files.length;
                var i;

                if (imageUploadUrl !== null && imageUploadUrl.length > 0) {
                    var formData = new FormData();

                    for (i = 0; i < filesLen; i++) {
                        formData.append("file-" + i, files[i]);
                    }

                    SUNEDITOR.plugin.image.xmlHttp = SUNEDITOR.func.getXMLHttpRequest();
                    SUNEDITOR.plugin.image.xmlHttp.onreadystatechange = SUNEDITOR.plugin.image.callBack_imgUpload.bind(this);
                    SUNEDITOR.plugin.image.xmlHttp.open("post", imageUploadUrl, true);
                    SUNEDITOR.plugin.image.xmlHttp.send(formData);
                } else {
                    for (i = 0; i < filesLen; i++) {
                        SUNEDITOR.plugin.image.setup_reader.call(this, files[i], this.context.image._linkValue, this.context.image.imgLinkNewWindowCheck.checked);
                    }
                }
            }
        }

        try {
            inputAction.call(this, this.context.image.imgInputFile.files);
        } catch (e) {
            this.closeLoading();
            throw Error('[SUNEDITOR.imageUpload.fail] cause : "' + e.message + '"');
        }
    },

    setup_reader: function (file, imgLinkValue, newWindowCheck) {
        var reader = new FileReader();

        reader.onload = function () {
            SUNEDITOR.plugin.image.create_image.call(this, reader.result, imgLinkValue, newWindowCheck, this.context.user.imageSize, this.context.image._align);
        }.bind(this);

        reader.readAsDataURL(file);
    },

    create_image: function (src, linkValue, linkNewWindow, width, align) {
        var oImg = document.createElement("IMG");
        var oSpan = document.createElement("SPAN");
        var oDiv = document.createElement("DIV");

        oImg.src = src;
        oImg.style.width = width;
        oImg.setAttribute('data-align', align);
        oImg = SUNEDITOR.plugin.image.onRender_link(oImg, linkValue, linkNewWindow);

        oSpan.className = 'sun-editor-image-span';
        oSpan.appendChild(oImg);

        oDiv.className = 'sun-editor-image-id-container';
        oDiv.setAttribute('contenteditable', false);
        oDiv.style.textAlign = 'center';
        oDiv.appendChild(oSpan);

        if ('center' !== align) {
            oDiv.style.display = 'inline-block';
            oDiv.style.float = align;
        }

        this.insertNode(oDiv);
        this.appendP(oDiv);
    },

    callBack_imgUpload: function () {
        var xmlHttp = SUNEDITOR.plugin.image.xmlHttp;
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status === 200) {
                var result = eval(xmlHttp.responseText);
                var resultLen = result.length;

                for (var i = 0; i < resultLen; i++) {
                    var oImg = document.createElement("IMG");
                    oImg.src = result[i].SUNEDITOR_IMAGE_SRC;
                    oImg.style.width = this.context.user.imageSize;
                    this.insertNode(oImg);
                    this.appendP(oImg);
                }
            } else {
                var WindowObject = window.open('', "_blank");
                WindowObject.document.writeln(xmlHttp.responseText);
            }

            this.closeLoading();
        }
    },

    onRender_imgUrl: function () {
        if (this.context.image.focusElement.value.trim().length === 0) return false;

        try {
            SUNEDITOR.plugin.image.create_image.call(this, this.context.image.focusElement.value, this.context.image._linkValue, this.context.image.imgLinkNewWindowCheck.checked, this.context.user.imageSize, this.context.image._align);
        } catch (e) {
            this.closeLoading();
            throw Error('[SUNEDITOR.inseretImageUrl.fail] cause : "' + e.message + '"');
        }
    },

    onRender_link: function (imgTag, imgLinkValue, newWindowCheck) {
        if (imgLinkValue.trim().length > 0) {
            var link = document.createElement("A");
            link.href = /^https?:\/\//.test(imgLinkValue) ? imgLinkValue : "http://" + imgLinkValue;
            link.target = (newWindowCheck ? "_blank" : "");
            link.setAttribute('data-image-link', 'image');

            imgTag.setAttribute('data-image-link', imgLinkValue);
            imgTag.style.padding = '1px';
            imgTag.style.margin = '1px';
            imgTag.style.outline = '1px solid #f4b124';

            link.appendChild(imgTag);
            return link;
        }

        return imgTag;
    },

    update_imageAttribute: function () {
        var contextImage = this.context.image;
        var linkValue = contextImage._linkValue;
        var imageContainer = SUNEDITOR.dom.getParentNode(contextImage._imageElement, '.sun-editor-image-id-container');
        var imageSpan = SUNEDITOR.dom.getParentNode(contextImage._imageElement, '.sun-editor-image-span');
        var newEl;

        if (contextImage.focusElement.value.trim().length > 0) {
            contextImage._imageElement.src = contextImage.focusElement.value;
        } else {
            SUNEDITOR.dom.removeItem(imageContainer);
            return;
        }

        if ('center' !== contextImage._align) {
            imageContainer.style.display = 'inline-block';
            imageContainer.style.float = contextImage._align;
        } else {
            imageContainer.style.display = '';
            imageContainer.style.float = 'none';
        }

        contextImage._imageElement.setAttribute('data-align', contextImage._align);

        if (linkValue.trim().length > 0) {
            if (contextImage._imageElementLink !== null) {
                contextImage._imageElementLink.href = linkValue;
                contextImage._imageElementLink.target = this.context.image.imgLinkNewWindowCheck.checked;
                contextImage._imageElement.setAttribute('data-image-link', linkValue);
            } else {
                newEl = SUNEDITOR.plugin.image.onRender_link(contextImage._imageElement.cloneNode(true), linkValue, this.context.image.imgLinkNewWindowCheck.checked);
                imageSpan.innerHTML = '';
                imageSpan.appendChild(newEl);
            }
        }
        else if (contextImage._imageElementLink !== null) {
            var imageElement = contextImage._imageElement;

            imageElement.setAttribute('data-image-link', '');
            imageElement.style.padding = '';
            imageElement.style.margin = '';
            imageElement.style.outline = '';

            newEl = imageElement.cloneNode(true);
            imageSpan.innerHTML = '';
            imageSpan.appendChild(newEl);
        }
    },

    submit_dialog: function (e) {
        this.showLoading();
        this.context.image._linkValue = this.context.image.imgLink.value;

        e.preventDefault();
        e.stopPropagation();

        this.context.image._align = this.context.image.modal.querySelector('input[name="suneditor_image_radio"]:checked').value;

        try {
            if (this.context.dialog.updateModal) {
                SUNEDITOR.plugin.image.update_imageAttribute.call(this);
            } else {
                SUNEDITOR.plugin.image.onRender_imgInput.call(this);
                SUNEDITOR.plugin.image.onRender_imgUrl.call(this);
            }
        } finally {
            SUNEDITOR.plugin.dialog.closeDialog.call(this);
            this.closeLoading();
        }

        return false;
    },

    init: function () {
        this.context.image.imgInputFile.value = "";
        this.context.image.focusElement.value = "";
        this.context.image.imgLink.value = "";
        this.context.image.imgLinkNewWindowCheck.checked = false;
        this.context.image.modal.querySelector('#suneditor_image_radio_none').checked = true;
        SUNEDITOR.plugin.image.openTab('init');
    },

    /** image resize controller, button*/
    setController_ImageResizeController: function () {
        var resize_img_div = document.createElement("DIV");
        resize_img_div.className = "modal-image-resize";
        resize_img_div.style.display = "none";
        resize_img_div.innerHTML = '' +
            '<div class="image-resize-dot tl"></div>' +
            '<div class="image-resize-dot tr"></div>' +
            '<div class="image-resize-dot bl"></div>' +
            '<div class="image-resize-dot br-controller sun-editor-img-controller"></div>' +
            '<div class="image-size-display sun-editor-id-img-display"></div>';

        return resize_img_div;
    },

    setController_ImageButton: function () {
        var lang = SUNEDITOR.lang;
        var resize_img_button = document.createElement("DIV");
        resize_img_button.className = "image-resize-btn";
        resize_img_button.style.display = "none";
        resize_img_button.innerHTML = '' +
            '<div class="btn-group">' +
            '   <button type="button" data-command="100" title="' + lang.dialogBox.imageBox.resize100 + '"><span class="note-fontsize-10">100%</span></button>' +
            '   <button type="button" data-command="75" title="' + lang.dialogBox.imageBox.resize75 + '"><span class="note-fontsize-10">75%</span></button>' +
            '   <button type="button" data-command="50" title="' + lang.dialogBox.imageBox.resize50 + '"><span class="note-fontsize-10">50%</span></button>' +
            '   <button type="button" data-command="25" title="' + lang.dialogBox.imageBox.resize25 + '"><span class="note-fontsize-10">25%</span></button>' +
            '   <button type="button" data-command="update" title="' + lang.toolbar.image + '" style="padding: 6px 10px !important;"><div class="ico_picture"></div></button>' +
            '</div>' +
            '<div class="btn-group remove">' +
            '   <button type="button" data-command="delete" title="' + lang.dialogBox.imageBox.remove + '"><span class="image_remove">x</span></button>' +
            '</div>';

        return resize_img_button;
    },

    _call_controller_imageResize: function (targetElement) {
        /** ie,firefox image resize handle : false*/
        targetElement.setAttribute('unselectable', 'on');
        targetElement.contentEditable = false;

        var resizeDiv = this.context.image.imageResizeDiv;
        var w = targetElement.offsetWidth;
        var h = targetElement.offsetHeight;

        var parentElement = targetElement.offsetParent;
        var parentT = 0;
        var parentL = 0;
        while (parentElement) {
            parentT += (parentElement.offsetTop + parentElement.clientTop);
            parentL += (parentElement.offsetLeft + +parentElement.clientLeft);
            parentElement = parentElement.offsetParent;
        }
        this.context.image._imageResize_parent_t = (this.context.tool.bar.offsetHeight + parentT);
        this.context._imageResize_parent_l = parentL;

        var t = (targetElement.offsetTop + this.context.image._imageResize_parent_t - this.context.element.wysiwygWindow.document.body.scrollTop);
        var l = (targetElement.offsetLeft + parentL);

        resizeDiv.style.top = t + "px";
        resizeDiv.style.left = l + "px";
        resizeDiv.style.width = w + "px";
        resizeDiv.style.height = h + "px";

        this.context.image.imageResizeBtn.style.top = (h + t) + "px";
        this.context.image.imageResizeBtn.style.left = l + "px";

        SUNEDITOR.dom.changeTxt(this.context.image.imageResizeDisplay, w + " x " + h);

        this.context.image._imageElementLink = /^A$/i.test(targetElement.parentNode.nodeName) ? targetElement.parentNode : null;
        this.context.image._imageElement = targetElement;
        this.context.image._imageElement_w = w;
        this.context.image._imageElement_h = h;
        this.context.image._imageElement_t = t;
        this.context.image._imageElement_l = l;

        this.context.image.imageResizeDiv.style.display = "block";
        this.context.image.imageResizeBtn.style.display = "block";

        this.controllerArray = [this.context.image.imageResizeDiv, this.context.image.imageResizeBtn];
    },

    cancel_controller_imageResize: function () {
        this.context.element.resizeBackground.style.display = "none";
        this.context.image.imageResizeDiv.style.display = "none";
        this.context.image.imageResizeBtn.style.display = "none";
        this.context.image._imageElement = null;
    },

    onClick_imageResizeBtn: function (e) {
        e.stopPropagation();

        var command = e.target.getAttribute("data-command") || e.target.parentNode.getAttribute("data-command");
        if (!command) return;

        e.preventDefault();

        var contextImage = this.context.image;

        if (/^\d+$/.test(command)) {
            contextImage._imageElement.style.height = "";
            contextImage._imageElement.style.width = command + "%";
        }
        else if (/update/.test(command)) {
            contextImage.focusElement.value = contextImage._imageElement.src;
            contextImage.imgLink.value = contextImage._imageElementLink === null ? "" : contextImage._imageElementLink.href;
            contextImage.imgLinkNewWindowCheck.checked = !contextImage._imageElementLink || contextImage._imageElementLink.target === "_blank";
            contextImage.modal.querySelector('#suneditor_image_radio_' + contextImage._imageElement.getAttribute('data-align')).checked = true;

            SUNEDITOR.plugin.dialog.openDialog.call(this, 'image', null, true);
        }
        else if (/delete/.test(command)) {
            var imageContainer = SUNEDITOR.dom.getParentNode(contextImage._imageElement, '.sun-editor-image-id-container');
            SUNEDITOR.dom.removeItem(imageContainer);
        }

        this.submenuOff();
        this.focus();
    },

    onMouseDown_image_ctrl: function (e) {
        e.stopPropagation();
        e.preventDefault();

        this.context.image._imageClientX = e.clientX;
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

    resize_image: function (e) {
        var w = this.context.image._imageElement_w + (e.clientX - this.context.image._imageClientX);
        var h = ((this.context.image._imageElement_h / this.context.image._imageElement_w) * w);

        this.context.image._imageElement.style.width = w + "px";
        this.context.image._imageElement.style.height = h + "px";

        var parentElement = this.context.image._imageElement.offsetParent;
        var parentT = 0;
        var parentL = 0;
        while (parentElement) {
            parentT += (parentElement.offsetTop + parentElement.clientTop);
            parentL += (parentElement.offsetLeft + +parentElement.clientLeft);
            parentElement = parentElement.offsetParent;
        }

        var t = (this.context.image._imageElement.offsetTop + this.context.image._imageResize_parent_t - this.context.element.wysiwygWindow.document.body.scrollTop);
        var l = (this.context.image._imageElement.offsetLeft + parentL);

        this.context.image.imageResizeDiv.style.top = t + "px";
        this.context.image.imageResizeDiv.style.left = l + "px";
        this.context.image.imageResizeDiv.style.width = w + "px";
        this.context.image.imageResizeDiv.style.height = h + "px";

        SUNEDITOR.dom.changeTxt(this.context.image.imageResizeDisplay, Math.round(w) + " x " + Math.round(h));
    }
};