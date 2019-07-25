/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

import dialog from '../modules/dialog';

export default {
    name: 'link',
    add: function (core) {
        core.addModule([dialog]);

        const context = core.context;
        context.link = {};

        /** link dialog */
        let link_dialog = this.setDialog.call(core);
        context.link.modal = link_dialog;
        context.link.focusElement = link_dialog.querySelector('._se_link_url');
        context.link.linkAnchorText = link_dialog.querySelector('._se_link_text');
        context.link.linkNewWindowCheck = link_dialog.querySelector('._se_link_check');

        /** link button */
        let link_button = this.setController_LinkButton.call(core);
        context.link.linkBtn = link_button;
        context.link._linkAnchor = null;
        link_button.addEventListener('mousedown', function (e) { e.stopPropagation(); }, false);

        /** add event listeners */
        link_dialog.querySelector('.se-btn-primary').addEventListener('click', this.submit.bind(core));
        link_button.addEventListener('click', this.onClick_linkBtn.bind(core));

        /** append html */
        context.dialog.modal.appendChild(link_dialog);
        context.element.relative.appendChild(link_button);

        /** empty memory */
        link_dialog = null, link_button = null;
    },

    /** dialog */
    setDialog: function () {
        const lang = this.lang;
        const dialog = this.util.createElement('DIV');

        dialog.className = 'se-dialog-content';
        dialog.style.display = 'none';
        dialog.innerHTML = '' +
            '<form class="editor_link">' +
            '   <div class="se-dialog-header">' +
            '       <button type="button" data-command="close" class="close" aria-label="Close" title="' + lang.dialogBox.close + '">' +
            '           <i aria-hidden="true" data-command="close" class="se-icon-cancel"></i>' +
            '       </button>' +
            '       <span class="se-modal-title">' + lang.dialogBox.linkBox.title + '</span>' +
            '   </div>' +
            '   <div class="se-dialog-body">' +
            '       <div class="se-dialog-form">' +
            '           <label>' + lang.dialogBox.linkBox.url + '</label>' +
            '           <input class="se-input-form _se_link_url" type="text" />' +
            '       </div>' +
            '       <div class="se-dialog-form">' +
            '           <label>' + lang.dialogBox.linkBox.text + '</label><input class="se-input-form _se_link_text" type="text" />' +
            '       </div>' +
            '       <div class="se-dialog-form-footer">' +
            '           <label><input type="checkbox" class="se-dialog-btn-check _se_link_check" />&nbsp;' + lang.dialogBox.linkBox.newWindowCheck + '</label>' +
            '       </div>' +
            '   </div>' +
            '   <div class="se-dialog-footer">' +
            '       <button type="submit" class="se-btn-primary" title="' + lang.dialogBox.submitButton + '"><span>' + lang.dialogBox.submitButton + '</span></button>' +
            '   </div>' +
            '</form>';

        return dialog;
    },

    /** modify controller button */
    setController_LinkButton: function () {
        const lang = this.lang;
        const link_btn = this.util.createElement('DIV');

        link_btn.className = 'se-controller se-controller-link';
        link_btn.innerHTML = '' +
            '<div class="se-arrow se-arrow-up"></div>' +
            '<div class="link-content"><span><a target="_blank" href=""></a>&nbsp;</span>' +
            '   <div class="se-btn-group">' +
            '       <button type="button" data-command="update" tabindex="-1" class="se-tooltip">' +
            '           <i class="se-icon-edit"></i>' +
            '           <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.edit + '</span></span>' +
            '       </button>' +
            '       <button type="button" data-command="delete" tabindex="-1" class="se-tooltip">' +
            '           <i class="se-icon-delete"></i>' +
            '           <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.remove + '</span></span>' +
            '       </button>' +
            '   </div>' +
            '</div>';

        return link_btn;
    },

    submit: function (e) {
        this.showLoading();

        e.preventDefault();
        e.stopPropagation();

        const submitAction = function () {
            if (this.context.link.focusElement.value.trim().length === 0) return false;

            const url = this.context.link.focusElement.value;
            const anchor = this.context.link.linkAnchorText;
            const anchorText = anchor.value.length === 0 ? url : anchor.value;

            if (!this.context.dialog.updateModal) {
                const oA = this.util.createElement('A');
                oA.href = url;
                oA.textContent = anchorText;
                oA.target = (this.context.link.linkNewWindowCheck.checked ? '_blank' : '');

                this.insertNode(oA);
                this.setRange(oA.childNodes[0], 0, oA.childNodes[0], oA.textContent.length);
            } else {
                this.context.link._linkAnchor.href = url;
                this.context.link._linkAnchor.textContent = anchorText;
                this.context.link._linkAnchor.target = (this.context.link.linkNewWindowCheck.checked ? '_blank' : '');
                // history stack
                this.history.push();
                // set range
                this.setRange(this.context.link._linkAnchor.childNodes[0], 0, this.context.link._linkAnchor.childNodes[0], this.context.link._linkAnchor.textContent.length);
            }

            this.context.link.focusElement.value = '';
            this.context.link.linkAnchorText.value = '';
        }.bind(this);

        try {
            submitAction();
        } finally {
            this.plugins.dialog.close.call(this);
            this.closeLoading();
            this.focus();
        }

        return false;
    },

    call_controller_linkButton: function (selectionATag) {
        this.editLink = this.context.link._linkAnchor = selectionATag;
        const linkBtn = this.context.link.linkBtn;
        const link = linkBtn.querySelector('a');

        link.href = selectionATag.href;
        link.title = selectionATag.textContent;
        link.textContent = selectionATag.textContent;

        const offset = this.util.getOffset(selectionATag);
        linkBtn.style.top = (offset.top + selectionATag.offsetHeight + 10) + 'px';
        linkBtn.style.left = (offset.left - this.context.element.wysiwyg.scrollLeft) + 'px';

        linkBtn.style.display = 'block';

        const overLeft = this.context.element.wysiwyg.offsetWidth - (linkBtn.offsetLeft + linkBtn.offsetWidth);
        if (overLeft < 0) {
            linkBtn.style.left = (linkBtn.offsetLeft + overLeft) + 'px';
            linkBtn.firstElementChild.style.left = (20 - overLeft) + 'px';
        } else {
            linkBtn.firstElementChild.style.left = '20px';
        }
        
        this.controllersOn(linkBtn);
    },

    onClick_linkBtn: function (e) {
        e.stopPropagation();

        const command = e.target.getAttribute('data-command') || e.target.parentNode.getAttribute('data-command');
        if (!command) return;

        e.preventDefault();

        if (/update/.test(command)) {
            this.context.link.focusElement.value = this.context.link._linkAnchor.href;
            this.context.link.linkAnchorText.value = this.context.link._linkAnchor.textContent;
            this.context.link.linkNewWindowCheck.checked = (/_blank/i.test(this.context.link._linkAnchor.target) ? true : false);
            this.plugins.dialog.open.call(this, 'link', true);
        }
        else {
            /** delete */
            this.util.removeItem(this.context.link._linkAnchor);
            this.context.link._linkAnchor = null;
            this.focus();
        }

        this.controllersOff();
        
        // history stack
        this.history.push();
    },

    init: function () {
        const contextLink = this.context.link;
        contextLink.linkBtn.style.display = 'none';
        contextLink._linkAnchor = null;
        contextLink.focusElement.value = '';
        contextLink.linkAnchorText.value = '';
        contextLink.linkNewWindowCheck.checked = false;
    }
};
