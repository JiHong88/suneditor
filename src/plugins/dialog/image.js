/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
SUNEDITOR.plugin.image = {
    add: function (_this) {
        const context = _this.context;
        context.image = {
            _linkElement: null,
            _element: null,
            _resize_element: null,
            _element_w: 1,
            _element_h: 1,
            _element_l: 0,
            _element_t: 0,
            _origin_w: context.user.imageSize,
            _origin_h: 0,
            _altText: '',
            _imageCaption: null,
            _linkValue: '',
            _align: 'none',
            _captionChecked: false,
            _proportionChecked: true,
            _onCaption: false
        };

        /** image dialog */
        let image_dialog = eval(this.setDialog(_this.context.user));
        context.image.modal = image_dialog;
        context.image.imgUrlFile = image_dialog.getElementsByClassName('sun-editor-id-image-url')[0];
        context.image.imgInputFile = context.image.focusElement = image_dialog.getElementsByClassName('sun-editor-id-image-file')[0];
        context.image.altText = image_dialog.getElementsByClassName('sun-editor-id-image-alt')[0];
        context.image.imgLink = image_dialog.getElementsByClassName('sun-editor-id-image-link')[0];
        context.image.imgLinkNewWindowCheck = image_dialog.getElementsByClassName('sun-editor-id-linkCheck')[0];
        context.image.caption = image_dialog.querySelector('#suneditor_image_check_caption');
        context.image.proportion = image_dialog.querySelector('#suneditor_image_check_proportion');
        context.image.imageX = image_dialog.getElementsByClassName('sun-editor-id-image-x')[0];
        context.image.imageY = image_dialog.getElementsByClassName('sun-editor-id-image-y')[0];

        context.image.imageX.value = _this.context.user.imageSize;

        /** add event listeners */
        context.image.modal.getElementsByClassName('sun-editor-tab-button')[0].addEventListener('click', this.openTab.bind(_this));
        context.image.modal.getElementsByClassName('btn-primary')[0].addEventListener('click', this.submit.bind(_this));
        context.image.imageX.addEventListener('change', this.setInputSize.bind(_this, 'x'));
        context.image.imageY.addEventListener('change', this.setInputSize.bind(_this, 'y'));
        image_dialog.getElementsByClassName('sun-editor-id-image-revert-button')[0].addEventListener('click', this.sizeRevert.bind(_this));

        /** append html */
        context.dialog.modal.appendChild(image_dialog);

        /** empty memory */
        image_dialog = null;
    },

    /** dialog */
    setDialog: function (user) {
        const lang = SUNEDITOR.lang;
        const dialog = document.createElement('DIV');
        dialog.className = 'modal-content sun-editor-id-dialog-image';
        dialog.style.display = 'none';

        let html = '' +
			'<div class="modal-header">' +
			'   <button type="button" data-command="close" class="close" aria-label="Close">' +
			'       <div aria-hidden="true" data-command="close" class="icon-cancel"></div>' +
			'   </button>' +
			'   <h5 class="modal-title">' + lang.dialogBox.imageBox.title + '</h5>' +
			'</div>' +
            '<div class="sun-editor-tab-button">' +
            '   <button type="button" class="sun-editor-id-tab-link active" data-tab-link="image">' + lang.toolbar.image + '</button>' +
			'   <button type="button" class="sun-editor-id-tab-link" data-tab-link="url">' + lang.toolbar.link + '</button>' +
            '</div>' +
            '<form class="editor_image" method="post" enctype="multipart/form-data">' +
			'   <div class="sun-editor-id-tab-content sun-editor-id-tab-content-image">' +
            '       <div class="modal-body">';

            if (user.imageFileInput) {
                html += '' +
                    '   <div class="form-group">' +
                    '       <label>' + lang.dialogBox.imageBox.file + '</label>' +
                    '       <input class="form-control sun-editor-id-image-file" type="file" accept="image/*" multiple="multiple" />' +
                    '   </div>' ;
            }

            if (user.imageUrlInput) {
                html += '' +
                    '   <div class="form-group">' +
                    '       <label>' + lang.dialogBox.imageBox.url + '</label>' +
                    '       <input class="form-control sun-editor-id-image-url" type="text" />' +
                    '   </div>';
            }

            html += '' +
            '           <div class="form-group">' +
            '               <label>' + lang.dialogBox.imageBox.altText + '</label><input class="form-control sun-editor-id-image-alt" type="text" />' +
            '           </div>' +
            '           <div class="form-group">' +
            '               <div class="size-text"><label class="size-w">' + lang.dialogBox.width + '</label><label class="size-x">&nbsp;</label><label class="size-h">' + lang.dialogBox.height + '</label></div>' +
            '               <input class="form-size-control sun-editor-id-image-x" type="number" min="1" /><label class="size-x">x</label><input class="form-size-control sun-editor-id-image-y" type="number" min="1" disabled />' +
            '               <input type="checkbox" id="suneditor_image_check_proportion" style="margin-left: 20px;" checked disabled/><label for="suneditor_image_check_proportion">&nbsp;' + lang.dialogBox.proportion + '</label>' +
            '               <button type="button" title="' + lang.dialogBox.revertButton + '" class="btn_editor sun-editor-id-image-revert-button" style="float: right;"><div class="icon-revert"></div></button>' +
            '           </div>' +
            '           <div class="form-group-footer">' +
            '               <input type="checkbox" id="suneditor_image_check_caption" /><label for="suneditor_image_check_caption">&nbsp;' + lang.dialogBox.imageBox.caption + '</label>' +
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
			'           <input type="radio" id="suneditor_image_radio_none" name="suneditor_image_radio" class="modal-radio" value="none" checked><label for="suneditor_image_radio_none">' + lang.dialogBox.basic + '</label>' +
			'           <input type="radio" id="suneditor_image_radio_left" name="suneditor_image_radio" class="modal-radio" value="left"><label for="suneditor_image_radio_left">' + lang.dialogBox.left + '</label>' +
            '           <input type="radio" id="suneditor_image_radio_center" name="suneditor_image_radio" class="modal-radio" value="center"><label for="suneditor_image_radio_center">' + lang.dialogBox.center + '</label>' +
            '           <input type="radio" id="suneditor_image_radio_right" name="suneditor_image_radio" class="modal-radio" value="right"><label for="suneditor_image_radio_right">' + lang.dialogBox.right + '</label>' +
            '       </div>' +
			'       <button type="submit" class="btn btn-primary sun-editor-id-submit-image"><span>' + lang.dialogBox.submitButton + '</span></button>' +
			'   </div>' +
            '</form>';

        dialog.innerHTML = html;

        return dialog;
    },

	openTab: function (e) {
        const targetElement = (e === 'init' ? document.getElementsByClassName('sun-editor-id-tab-link')[0] : e.target);

		if (!/^BUTTON$/i.test(targetElement.tagName)) {
			return false;
		}

		// Declare all variables
        const tabName = targetElement.getAttribute('data-tab-link');
        const contentClassName = 'sun-editor-id-tab-content';
        let i, tabcontent, tablinks;

		// Get all elements with class="tabcontent" and hide them
		tabcontent = document.getElementsByClassName(contentClassName);
		for (i = 0; i < tabcontent.length; i++) {
			tabcontent[i].style.display = 'none';
		}

		// Get all elements with class="tablinks" and remove the class "active"
		tablinks = document.getElementsByClassName('sun-editor-id-tab-link');
		for (i = 0; i < tablinks.length; i++) {
            this.dom.removeClass(tablinks[i], 'active');
		}

		// Show the current tab, and add an "active" class to the button that opened the tab
        this.context.image.modal.getElementsByClassName(contentClassName + '-' + tabName)[0].style.display = 'block';
        this.dom.addClass(targetElement, 'active');

        // focus
        if (tabName === 'image') {
            this.context.image.imgUrlFile.focus();
        } else if (tabName === 'url') {
            this.context.image.imgLink.focus();
        }

		return false;
	},

    xmlHttp: null,

    onRender_imgInput: function () {
        function inputAction(files) {
            if (files.length > 0) {
                const imageUploadUrl = this.context.user.imageUploadUrl;
                const filesLen = this.context.dialog.updateModal ? 1 : files.length;

                if (imageUploadUrl !== null && imageUploadUrl.length > 0) {
                    const formData = new FormData();

                    for (let i = 0; i < filesLen; i++) {
                        formData.append('file-' + i, files[i]);
                    }

                    SUNEDITOR.plugin.image.xmlHttp = this.util.getXMLHttpRequest();
                    SUNEDITOR.plugin.image.xmlHttp.onreadystatechange = SUNEDITOR.plugin.image.callBack_imgUpload.bind(this, this.context.image._linkValue, this.context.image.imgLinkNewWindowCheck.checked, this.context.image.imageX.value + 'px', this.context.image._align, this.context.dialog.updateModal);
                    SUNEDITOR.plugin.image.xmlHttp.open('post', imageUploadUrl, true);
                    SUNEDITOR.plugin.image.xmlHttp.send(formData);
                } else {
                    for (let i = 0; i < filesLen; i++) {
                        SUNEDITOR.plugin.image.setup_reader.call(this, files[i], this.context.image._linkValue, this.context.image.imgLinkNewWindowCheck.checked, this.context.dialog.updateModal);
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

    setup_reader: function (file, imgLinkValue, newWindowCheck, update) {
        const reader = new FileReader();

        reader.onload = function (update) {
            SUNEDITOR.plugin.image.create_image.call(this, reader.result, imgLinkValue, newWindowCheck, this.context.image.imageX.value + 'px', this.context.image._align, update);
        }.bind(this, update);

        reader.readAsDataURL(file);
    },

    callBack_imgUpload: function (linkValue, linkNewWindow, width, align, update) {
        const xmlHttp = SUNEDITOR.plugin.image.xmlHttp;
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status === 200) {
                const result = eval(xmlHttp.responseText);

                for (let i = 0, len = (update && result.length > 0 ? 1 : result.length); i < len; i++) {
                    SUNEDITOR.plugin.image.create_image.call(this, result[i].SUNEDITOR_IMAGE_SRC, linkValue, linkNewWindow, width, align, update);
                }
            } else {
                window.open('', '_blank').document.writeln(xmlHttp.responseText);
            }

            this.closeLoading();
        }
    },

    onRender_imgUrl: function () {
        if (this.context.image.imgUrlFile.value.trim().length === 0) return false;

        try {
            SUNEDITOR.plugin.image.create_image.call(this, this.context.image.imgUrlFile.value, this.context.image._linkValue, this.context.image.imgLinkNewWindowCheck.checked, this.context.image.imageX.value + 'px', this.context.image._align);
        } catch (e) {
            this.closeLoading();
            throw Error('[SUNEDITOR.inseretImageUrl.fail] cause : "' + e.message + '"');
        }
    },

    onRender_link: function (imgTag, imgLinkValue, newWindowCheck) {
        if (imgLinkValue.trim().length > 0) {
            const link = document.createElement('A');
            link.href = /^https?:\/\//.test(imgLinkValue) ? imgLinkValue : 'http://' + imgLinkValue;
            link.target = (newWindowCheck ? '_blank' : '');
            link.setAttribute('data-image-link', 'image');
            link.addEventListener('click', function (e) { e.preventDefault(); });

            imgTag.setAttribute('data-image-link', imgLinkValue);
            imgTag.style.padding = '1px';
            imgTag.style.margin = '1px';
            imgTag.style.outline = '1px solid #f4b124';

            link.appendChild(imgTag);
            return link;
        }

        return imgTag;
    },

    setInputSize: function (xy) {
        if (!this.context.dialog.updateModal) return;

        if (this.context.image.proportion.checked) {
            if (xy === 'x') {
                this.context.image.imageY.value = Math.round((this.context.image._element_h / this.context.image._element_w) * this.context.image.imageX.value);
            } else {
                this.context.image.imageX.value = Math.round((this.context.image._element_w / this.context.image._element_h) * this.context.image.imageY.value);
            }
        }
    },

    submit: function (e) {
        this.showLoading();

        e.preventDefault();
        e.stopPropagation();

        this.context.image._linkValue = this.context.image.imgLink.value;
        this.context.image._altText = this.context.image.altText.value;
        this.context.image._align = this.context.image.modal.querySelector('input[name="suneditor_image_radio"]:checked').value;
        this.context.image._captionChecked = this.context.image.caption.checked;
        this.context.image._proportionChecked = this.context.image.proportion.checked;

        try {
            if (this.context.dialog.updateModal) {
                SUNEDITOR.plugin.image.update_image.call(this);
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

    create_caption: function () {
        const caption = document.createElement('FIGCAPTION');
        
        caption.innerHTML = '<p>' + SUNEDITOR.lang.dialogBox.imageBox.caption + '</p>';
        caption.addEventListener('click', SUNEDITOR.plugin.image.toggle_caption_contenteditable.bind(this, true));

        return caption;
    },

    set_cover: function (imageElement) {
        const cover = document.createElement('FIGURE');
        cover.className = 'sun-editor-image-cover';
        cover.appendChild(imageElement);

        return cover;
    },

    set_container: function (cover) {
        const container = document.createElement('DIV');
        container.className = 'sun-editor-id-image-container';
        container.setAttribute('contenteditable', false);
        container.style.textAlign = 'center';
        container.appendChild(cover);

        return container;
    },

    create_image: function (src, linkValue, linkNewWindow, width, align, update) {
        if (update) {
            this.context.image._element.src = src;
            return;
        }

        let oImg = document.createElement('IMG');
        oImg.src = src;
        oImg.style.width = width;
        oImg.setAttribute('data-align', align);
        oImg.setAttribute('data-proportion', this.context.image._proportionChecked);
        oImg.alt = this.context.image._altText;
        oImg = SUNEDITOR.plugin.image.onRender_link(oImg, linkValue, linkNewWindow);

        const cover = SUNEDITOR.plugin.image.set_cover.call(this, oImg);
        const container = SUNEDITOR.plugin.image.set_container.call(this, cover);

        // caption
        if (this.context.image._captionChecked) {
            this.context.image._imageCaption = SUNEDITOR.plugin.image.create_caption.call(this);
            cover.appendChild(this.context.image._imageCaption);
        }
        
        // align
        if ('center' !== align) {
            container.style.display = 'inline-block';
            container.style.float = align;
        }

        this.insertNode(container, this.dom.getFormatElement(this.getSelectionNode()));
        this.appendP(container);
    },

    update_image: function () {
        const contextImage = this.context.image;
        const linkValue = contextImage._linkValue;
        let cover = this.dom.getParentElement(contextImage._element, '.sun-editor-image-cover');
        let container = this.dom.getParentElement(contextImage._element, '.sun-editor-id-image-container');
        let isNewContainer = false;

        if (cover === null) {
            isNewContainer = true;
            cover = SUNEDITOR.plugin.image.set_cover.call(this, contextImage._element.cloneNode(true));
        }

        if (container === null) {
            isNewContainer = true;
            container = SUNEDITOR.plugin.image.set_container.call(this, cover.cloneNode(true));
        } else if (isNewContainer) {
            container.innerHTML = '';
            container.appendChild(cover);
        }

        // input update
        SUNEDITOR.plugin.image.onRender_imgInput.call(this);

        // src, size
        contextImage._element.src = contextImage.imgUrlFile.value;
        contextImage._element.alt = contextImage._altText;
        contextImage._element.setAttribute('data-proportion', contextImage._proportionChecked);;
        contextImage._element.style.width = contextImage.imageX.value + 'px';
        contextImage._element.style.height = contextImage.imageY.value + 'px';

        // caption
        if (contextImage._captionChecked) {
            if (contextImage._imageCaption === null) {
                contextImage._imageCaption = SUNEDITOR.plugin.image.create_caption.call(this);
                cover.appendChild(contextImage._imageCaption);
            }
        } else {
            if (contextImage._imageCaption) {
                this.dom.removeItem(contextImage._imageCaption);
            }
        }

        // align
        if ('center' !== contextImage._align) {
            container.style.display = 'inline-block';
            container.style.float = contextImage._align;
        } else {
            container.style.display = '';
            container.style.float = 'none';
        }

        contextImage._element.setAttribute('data-align', contextImage._align);

        // link
        if (linkValue.trim().length > 0) {
            if (contextImage._linkElement !== null) {
                contextImage._linkElement.href = linkValue;
                contextImage._linkElement.target = this.context.image.imgLinkNewWindowCheck.checked;
                contextImage._element.setAttribute('data-image-link', linkValue);
            } else {
                let newEl = SUNEDITOR.plugin.image.onRender_link(contextImage._element.cloneNode(true), linkValue, this.context.image.imgLinkNewWindowCheck.checked);
                cover.innerHTML = '';
                cover.appendChild(newEl);
            }
        }
        else if (contextImage._linkElement !== null) {
            const imageElement = contextImage._element;

            imageElement.setAttribute('data-image-link', '');
            imageElement.style.padding = '';
            imageElement.style.margin = '';
            imageElement.style.outline = '';

            let newEl = imageElement.cloneNode(true);
            cover.innerHTML = '';
            cover.appendChild(newEl);
        }

        if (isNewContainer) {
            const existElement = this.dom.getFormatElement(contextImage._element);
            existElement.parentNode.insertBefore(container, existElement);
            this.dom.removeItem(existElement);
        }
    },

    toggle_caption_contenteditable: function (on, e) {
        this.context.image._onCaption = on;
        this.context.image._imageCaption.setAttribute('contenteditable', on);
        this.context.image._imageCaption.focus();
    },

    sizeRevert: function () {
        const contextImage = this.context.image;
        if (contextImage._origin_w) {
            contextImage.imageX.value = contextImage._element_w = contextImage._origin_w;
            contextImage.imageY.value = contextImage._element_h = contextImage._origin_h;
        }
    },

    onModifyMode: function (element, size) {
        const contextImage = this.context.image;
        contextImage._linkElement = /^A$/i.test(element.parentNode.nodeName) ? element.parentNode : null;
        contextImage._element = contextImage._resize_element = element;
        contextImage._imageCaption = element.nextSibling;

        contextImage._element_w = size.w;
        contextImage._element_h = size.h;
        contextImage._element_t = size.t;
        contextImage._element_l = size.l;

        let origin = contextImage._element.getAttribute('data-origin');
        if (origin) {
            origin = origin.split(',');
            contextImage._origin_w = origin[0] * 1;
            contextImage._origin_h = origin[1] * 1;
        } else {
            contextImage._origin_w = size.w;
            contextImage._origin_h = size.h;
            contextImage._element.setAttribute('data-origin', size.w + ',' + size.h);
        }
    },

    openModify: function () {
        const contextImage = this.context.image;
        contextImage.imgUrlFile.value = contextImage._element.src;
        contextImage.altText.value = contextImage._element.alt;
        contextImage.imgLink.value = contextImage._linkElement === null ? '' : contextImage._linkElement.href;
        contextImage.imgLinkNewWindowCheck.checked = !contextImage._linkElement || contextImage._linkElement.target === '_blank';
        contextImage.modal.querySelector('#suneditor_image_radio_' + (contextImage._element.getAttribute('data-align') || 'none')).checked = true;
        contextImage._captionChecked = contextImage.caption.checked = !!contextImage._imageCaption;
        contextImage.proportion.checked = contextImage._proportionChecked = contextImage._element.getAttribute('data-proportion') === 'true';
        contextImage.imageX.value = contextImage._element.offsetWidth;
        contextImage.imageY.value = contextImage._element.offsetHeight;
        contextImage.imageY.disabled = false;
        contextImage.proportion.disabled = false;

        SUNEDITOR.plugin.dialog.openDialog.call(this, 'image', null, true);
    },

    setSize: function (x, y) {
        this.context.image._resize_element.style.width = x;
        this.context.image._resize_element.style.height = y;
    },

    destroy: function () {
        const imageContainer = this.dom.getParentElement(this.context.image._element, '.sun-editor-id-image-container') || this.context.image._element;
        this.dom.removeItem(imageContainer);
        SUNEDITOR.plugin.image.init.call(this);
    },

    init: function () {
        this.context.image.imgInputFile.value = '';
        this.context.image.imgUrlFile.value = '';
        this.context.image.altText.value = '';
        this.context.image.imgLink.value = '';
        this.context.image.imgLinkNewWindowCheck.checked = false;
        this.context.image.modal.querySelector('#suneditor_image_radio_none').checked = true;
        this.context.image.caption.checked = false;
        this.context.image.proportion.checked = false;
        this.context.image.imageX.value = this.context.user.imageSize;
        this.context.image.imageY.value = '';
        this.context.image.imageY.disabled = true;
        this.context.image.proportion.disabled = true;
        this.context.image._element = null;
        SUNEDITOR.plugin.image.openTab.call(this, 'init');
    }
};
