/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

export default {
    name: 'dialog',
    add: function (core) {
        const context = core.context;
        context.dialog = {};

        /** dialog */
        let dialog_div = core.util.createElement('DIV');
        dialog_div.className = 'se-dialog sun-editor-common';

        let dialog_back = core.util.createElement('DIV');
        dialog_back.className = 'se-dialog-back';
        dialog_back.style.display = 'none';

        let dialog_area = core.util.createElement('DIV');
        dialog_area.className = 'se-dialog-inner';
        dialog_area.style.display = 'none';

        dialog_div.appendChild(dialog_back);
        dialog_div.appendChild(dialog_area);

        context.dialog.modalArea = dialog_div;
        context.dialog.back = dialog_back;
        context.dialog.modal = dialog_area;

        /** add event listeners */
        context.dialog.modal.addEventListener('click', this.onClick_dialog.bind(core));
        
        /** append html */
        context.element.relative.appendChild(dialog_div);
        
        /** empty memory */
        dialog_div = null, dialog_back = null, dialog_area = null;
    },

    onClick_dialog: function (e) {
        e.stopPropagation();

        if (/se-dialog-inner/.test(e.target.className) || /close/.test(e.target.getAttribute('data-command'))) {
            this.plugins.dialog.close.call(this);
        }
    },

    open: function (kind, update)  {
        if (this.modalForm) return false;
        if (this.plugins.dialog._bindClose) {
            this._d.removeEventListener('keydown', this.plugins.dialog._bindClose);
            this.plugins.dialog._bindClose = null;
        }

        this.plugins.dialog._bindClose = function (e) {
            if (!/27/.test(e.keyCode)) return;
            this.plugins.dialog.close.call(this);
        }.bind(this);
        this._d.addEventListener('keydown', this.plugins.dialog._bindClose);

        this.context.dialog.updateModal = update;

        if (this.context.option.popupDisplay === 'full') {
            this.context.dialog.modalArea.style.position = 'fixed';
        } else {
            this.context.dialog.modalArea.style.position = 'absolute';
        }

        this.context.dialog.kind = kind;
        this.modalForm = this.context[kind].modal;
        const focusElement = this.context[kind].focusElement;

        if (typeof this.plugins[kind].on === 'function') this.plugins[kind].on.call(this, update);

        this.context.dialog.modalArea.style.display = 'block';
        this.context.dialog.back.style.display = 'block';
        this.context.dialog.modal.style.display = 'block';
        this.modalForm.style.display = 'block';

        if (focusElement) focusElement.focus();
    },

    _bindClose: null,
    close: function () {
        if (this.plugins.dialog._bindClose) {
            this._d.removeEventListener('keydown', this.plugins.dialog._bindClose);
            this.plugins.dialog._bindClose = null;
        }

        this.modalForm.style.display = 'none';
        this.context.dialog.back.style.display = 'none';
        this.context.dialog.modalArea.style.display = 'none';
        this.modalForm = null;
        this.context.dialog.updateModal = false;
        this.plugins[this.context.dialog.kind].init.call(this);
        this.focus();
    }
};
