/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
SUNEDITOR.plugin.dialog = {
    add: function (_this) {
        var context = _this.context;

        /** dialog */
        var dialog_div = document.createElement("DIV");
        dialog_div.className = "sun-editor-id-dialogBox";

        var dialog_back = document.createElement("DIV");
        dialog_back.className = "modal-dialog-background sun-editor-id-dialog-back";
        dialog_back.style.display = "none";

        var dialog_area = document.createElement("DIV");
        dialog_area.className = "modal-dialog sun-editor-id-dialog-modal";
        dialog_area.style.display = "none";

        dialog_div.appendChild(dialog_back);
        dialog_div.appendChild(dialog_area);

        context.dialog.modalArea = dialog_div;
        context.dialog.back = dialog_back;
        context.dialog.modal = dialog_area;

        /** add event listeners */
        context.dialog.modal.addEventListener('click', this.onClick_dialog.bind(_this));
        context.element.topArea.getElementsByClassName('sun-editor-container')[0].appendChild(dialog_div);
    },

    onClick_dialog: function (e) {
        e.stopPropagation();

        if (/modal-dialog/.test(e.target.className) || /close/.test(e.target.getAttribute("data-command"))) {
            SUNEDITOR.plugin.dialog.closeDialog.call(this);
        }
    },

    openDialog: function (kind, option, update)  {
        if (!!this.modalForm) return false;

        this.context.dialog.updateModal = update;

        if (option === 'full') {
            this.context.dialog.modalArea.style.position = "fixed";
        } else {
            this.context.dialog.modalArea.style.position = "absolute";
        }

        this.context.dialog.kind = kind;
        this.modalForm = this.context[kind].modal;
        var focusElement = this.context[kind].focusElement;

        this.context.dialog.modalArea.style.display = "block";
        this.context.dialog.back.style.display = "block";
        this.context.dialog.modal.style.display = "block";
        this.modalForm.style.display = "block";

        if (focusElement) focusElement.focus();
    },

    closeDialog: function () {
        this.modalForm.style.display = "none";
        this.context.dialog.back.style.display = "none";
        this.context.dialog.modalArea.style.display = "none";
        this.modalForm = null;
        this.context.dialog.updateModal = false;
        SUNEDITOR.plugin[this.context.dialog.kind].init.call(this);
    }
};