/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
SUNEDITOR.plugin.dialog = {
    add: function (_this) {
        const context = _this.context;
        context.dialog = {
            _resizeClientX: 0,
            _resizeClientY: 0,
            _resize_plugin: '',
            _resize_w: 0,
            _resize_h: 0,
            _resize_direction: ''
        };

        /** dialog */
        let dialog_div = document.createElement('DIV');
        dialog_div.className = 'sun-editor-id-dialogBox';

        let dialog_back = document.createElement('DIV');
        dialog_back.className = 'modal-dialog-background sun-editor-id-dialog-back';
        dialog_back.style.display = 'none';

        let dialog_area = document.createElement('DIV');
        dialog_area.className = 'modal-dialog sun-editor-id-dialog-modal';
        dialog_area.style.display = 'none';

        dialog_div.appendChild(dialog_back);
        dialog_div.appendChild(dialog_area);

        context.dialog.modalArea = dialog_div;
        context.dialog.back = dialog_back;
        context.dialog.modal = dialog_area;

        /** resize controller, button */
        let resize_div_container = eval(this.setController_resize());
        context.dialog.resizeContainer = resize_div_container;

        context.dialog.resizeDiv = resize_div_container.getElementsByClassName('modal-resize')[0];
        context.dialog.resizeDot = resize_div_container.getElementsByClassName('resize-dot')[0];
        context.dialog.resizeDisplay = resize_div_container.getElementsByClassName('resize-display')[0];

        let resize_button = eval(this.setController_button());;
        context.dialog.resizeButton = resize_button;

        let resize_handles = resize_div_container.getElementsByClassName('sun-editor-name-resize-handle');

        /** add event listeners */
        context.dialog.modal.addEventListener('click', this.onClick_dialog.bind(_this));
        context.element.topArea.getElementsByClassName('sun-editor-container')[0].appendChild(dialog_div);
        resize_handles[0].addEventListener('mousedown', this.onMouseDown_resize_handle.bind(_this));
        resize_handles[1].addEventListener('mousedown', this.onMouseDown_resize_handle.bind(_this));
        resize_handles[2].addEventListener('mousedown', this.onMouseDown_resize_handle.bind(_this));
        resize_handles[3].addEventListener('mousedown', this.onMouseDown_resize_handle.bind(_this));
        resize_handles[4].addEventListener('mousedown', this.onMouseDown_resize_handle.bind(_this));
        resize_handles[5].addEventListener('mousedown', this.onMouseDown_resize_handle.bind(_this));
        resize_handles[6].addEventListener('mousedown', this.onMouseDown_resize_handle.bind(_this));
        resize_handles[7].addEventListener('mousedown', this.onMouseDown_resize_handle.bind(_this));
        resize_button.addEventListener('click', this.onClick_resizeButton.bind(_this));

        /** append html */
        context.element.relative.appendChild(resize_div_container);
        context.element.relative.appendChild(resize_button);

        /** empty memory */
        dialog_div = null, dialog_back = null, dialog_area = null, resize_div_container = null, resize_button = null, resize_handles = null;
    },

    onClick_dialog: function (e) {
        e.stopPropagation();

        if (/modal-dialog/.test(e.target.className) || /close/.test(e.target.getAttribute('data-command'))) {
            SUNEDITOR.plugin.dialog.closeDialog.call(this);
        }
    },

    openDialog: function (kind, option, update)  {
        if (this.modalForm) return false;

        this.context.dialog.updateModal = update;

        if (option === 'full') {
            this.context.dialog.modalArea.style.position = 'fixed';
        } else {
            this.context.dialog.modalArea.style.position = 'absolute';
        }

        this.context.dialog.kind = kind;
        this.modalForm = this.context[kind].modal;
        const focusElement = this.context[kind].focusElement;

        this.context.dialog.modalArea.style.display = 'block';
        this.context.dialog.back.style.display = 'block';
        this.context.dialog.modal.style.display = 'block';
        this.modalForm.style.display = 'block';

        if (focusElement) focusElement.focus();
    },

    closeDialog: function () {
        this.modalForm.style.display = 'none';
        this.context.dialog.back.style.display = 'none';
        this.context.dialog.modalArea.style.display = 'none';
        this.modalForm = null;
        this.context.dialog.updateModal = false;
        SUNEDITOR.plugin[this.context.dialog.kind].init.call(this);
    },

    /** resize controller, button (image, iframe) */
    setController_resize: function () {
        const resize_container = document.createElement('DIV');
        resize_container.className = 'modal-resize-container';
        resize_container.style.display = 'none';
        resize_container.innerHTML = '' +
            '<div class="modal-resize">' +
            '   <div class="resize-display"></div>' +
            '</div>' +
            '<div class="resize-dot">' +
            '   <div class="tl sun-editor-name-resize-handle"></div>' +
            '   <div class="tr sun-editor-name-resize-handle"></div>' +
            '   <div class="bl sun-editor-name-resize-handle"></div>' +
            '   <div class="br sun-editor-name-resize-handle"></div>' +
            '   <div class="lw sun-editor-name-resize-handle"></div>' +
            '   <div class="th sun-editor-name-resize-handle"></div>' +
            '   <div class="rw sun-editor-name-resize-handle"></div>' +
            '   <div class="bh sun-editor-name-resize-handle"></div>' +
            '</div>';

        return resize_container;
    },

    setController_button: function () {
        const lang = SUNEDITOR.lang;
        const resize_button = document.createElement("DIV");
        resize_button.className = "image-resize-btn";
        resize_button.style.display = "none";
        resize_button.innerHTML = '' +
            '<div class="btn-group">' +
            '   <button type="button" data-command="100" title="' + lang.dialogBox.resize100 + '"><span class="note-fontsize-10">100%</span></button>' +
            '   <button type="button" data-command="75" title="' + lang.dialogBox.resize75 + '"><span class="note-fontsize-10">75%</span></button>' +
            '   <button type="button" data-command="50" title="' + lang.dialogBox.resize50 + '"><span class="note-fontsize-10">50%</span></button>' +
            '   <button type="button" data-command="25" title="' + lang.dialogBox.resize25 + '"><span class="note-fontsize-10">25%</span></button>' +
            '   <button type="button" data-command="update" title="' + lang.toolbar.image + '"><div class="icon-modify"></div></button>' +
            '</div>' +
            '<div class="btn-group remove">' +
            '   <button type="button" data-command="delete" title="' + lang.dialogBox.remove + '"><div aria-hidden="true" class="icon-cancel"></div></button>' +
            '</div>';

        return resize_button;
    },

    call_controller_resize: function (targetElement, plugin) {
        this.context.dialog._resize_plugin = plugin;
        targetElement.setAttribute('unselectable', 'on');
        targetElement.contentEditable = false;

        const resizeContainer = this.context.dialog.resizeContainer;
        const resizeDiv = this.context.dialog.resizeDiv;
        const w = targetElement.offsetWidth;
        const h = targetElement.offsetHeight;

        let parentElement = targetElement.offsetParent;
        let parentT = 0;
        let parentL = 0;
        while (parentElement) {
            parentT += (parentElement.offsetTop + parentElement.clientTop);
            parentL += (parentElement.offsetLeft + +parentElement.clientLeft);
            parentElement = parentElement.offsetParent;
        }

        const t = (targetElement.offsetTop + this.context.tool.bar.offsetHeight + parentT - this.context.element.wysiwygWindow.document.body.scrollTop);
        const l = (targetElement.offsetLeft + parentL);

        resizeContainer.style.top = t + 'px';
        resizeContainer.style.left = l + 'px';
        resizeContainer.style.width = w + 'px';
        resizeContainer.style.height = h + 'px';

        resizeDiv.style.top = '0px';
        resizeDiv.style.left = '0px';
        resizeDiv.style.width =  w + 'px';
        resizeDiv.style.height =  h + 'px';

        this.context.dialog.resizeButton.style.top = (h + t) + 'px';
        this.context.dialog.resizeButton.style.left = l + 'px';

        this.dom.changeTxt(this.context.dialog.resizeDisplay, w + ' x ' + h);

        this.context.dialog.resizeContainer.style.display = 'block';
        this.context.dialog.resizeButton.style.display = 'block';
        this.context.dialog.resizeDot.style.display = 'block';

        this.context.dialog._resize_w = w;
        this.context.dialog._resize_h = h;

        this.controllerArray = [this.context.dialog.resizeContainer, this.context.dialog.resizeButton];

        return {
            w: w,
            h: h,
            t: t,
            l: l
        };
    },

    cancel_controller_resize: function () {
        this.context[this.context.dialog._resize_plugin]._resize_element.style.width = this.context.dialog._resize_w + 'px';
        this.context[this.context.dialog._resize_plugin]._resize_element.style.height =this.context.dialog._resize_h + 'px';

        this.context.element.resizeBackground.style.display = 'none';
        this.context.dialog.resizeContainer.style.display = 'none';
        this.context.dialog.resizeButton.style.display = 'none';
        SUNEDITOR.plugin[this.context.dialog._resize_plugin].init.call(this);
    },

    onClick_resizeButton: function (e) {
        e.stopPropagation();

        const command = e.target.getAttribute('data-command') || e.target.parentNode.getAttribute('data-command');
        if (!command) return;

        e.preventDefault();

        if (/^\d+$/.test(command)) {
            SUNEDITOR.plugin[this.context.dialog._resize_plugin].setSize.call(this, command + '%', '');
        }
        else if (/update/.test(command)) {
            SUNEDITOR.plugin[this.context.dialog._resize_plugin].openModify.call(this);
        }
        else if (/delete/.test(command)) {
            SUNEDITOR.plugin[this.context.dialog._resize_plugin].destroy.call(this);
        }

        this.submenuOff();
        this.focus();
    },

    onMouseDown_resize_handle: function (e) {
        const direction = this.context.dialog._resize_direction = e.target.classList[0];
        e.stopPropagation();
        e.preventDefault();

        this.context.dialog.resizeDot.style.display = 'none';
        this.context.dialog._resizeClientX = e.clientX;
        this.context.dialog._resizeClientY = e.clientY;
        this.context.element.resizeBackground.style.display = 'block';
        this.context.dialog.resizeButton.style.display = 'none';
        this.context.dialog.resizeDiv.style.float = /l/.test(direction) ? 'right' : /r/.test(direction) ? 'left' : 'none';

        function closureFunc() {
            SUNEDITOR.plugin.dialog.cancel_controller_resize.call(this);
            document.removeEventListener('mousemove', resizing_element_bind);
            document.removeEventListener('mouseup', closureFunc_bind);
        }

        const resizing_element_bind = SUNEDITOR.plugin.dialog.resizing_element.bind(this);
        const closureFunc_bind = closureFunc.bind(this);

        document.addEventListener('mousemove', resizing_element_bind);
        document.addEventListener('mouseup', closureFunc_bind);
    },

    resizing_element: function (e) {
        const direction = this.context.dialog._resize_direction;
        const clientX = e.clientX;
        const clientY = e.clientY;
        const plugin = this.context[this.context.dialog._resize_plugin];

        let resultW = plugin._element_w;
        let resultH = plugin._element_h;

        const w = plugin._element_w + (/r/.test(direction) ? clientX - this.context.dialog._resizeClientX : this.context.dialog._resizeClientX - clientX);
        const h = plugin._element_h + (/b/.test(direction) ? clientY - this.context.dialog._resizeClientY : this.context.dialog._resizeClientY - clientY);
        const wh = ((plugin._element_h / plugin._element_w) * w);

        if (/t/.test(direction)) this.context.dialog.resizeDiv.style.top = (plugin._element_h - (/h/.test(direction) ? h : wh)) + 'px';
        if (/l/.test(direction)) this.context.dialog.resizeDiv.style.left = (plugin._element_w - w) + 'px';

        if (/r|l/.test(direction)) {
            this.context.dialog.resizeDiv.style.width = w + 'px';
            resultW =w;
        }

        if (/^(?:t|b)[^h]$/.test(direction)) {
            this.context.dialog.resizeDiv.style.height = wh + 'px';
            resultH = wh;
        }
        else if (/^(?:t|b)h$/.test(direction)) {
            this.context.dialog.resizeDiv.style.height = h + 'px';
            resultH = h;
        }

        this.context.dialog._resize_w = resultW;
        this.context.dialog._resize_h = resultH;
        this.dom.changeTxt(this.context.dialog.resizeDisplay, Math.round(resultW) + ' x ' + Math.round(resultH));
    }
};
