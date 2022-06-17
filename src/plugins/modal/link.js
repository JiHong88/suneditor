/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 Yi JiHong.
 * MIT license.
 */
'use strict';

import modal from '../modules/modal';
import anchor from '../modules/_anchor';

export default {
    name: 'link',
    type: 'modal',
    add: function (core) {
        core.addModule([modal, anchor]);

        const context = core.context;
        const contextLink = context.link = {
            focusElement: null, // @Override modal // This element has focus when the modal is opened.
            _linkAnchor: null,
            anchorCtx: null
        };

        /** link modal */
        let link_modal = this.setModal(core);
        contextLink.modal = link_modal;
        
        /** link controller */
        let link_controller = this.setController_LinkButton(core);
        contextLink.linkController = link_controller;

        link_modal.querySelector('form').addEventListener('submit', this.submit.bind(core));
        link_controller.addEventListener('click', this.onClick_linkController.bind(core));

        /** append html */
        context.modal.modal.appendChild(link_modal);

        /** append controller */
        context.element.relative.appendChild(link_controller);

        /** link event */
        core.plugins.anchor.initEvent.call(core, 'link', link_modal);
        contextLink.focusElement = context.anchor.caller.link.urlInput;

        /** empty memory */
        link_modal = null, link_controller = null;
    },

    /** modal */
    setModal: function (core) {
        const lang = core.lang;
        const modal = core.util.createElement('DIV');
        const icons = core.icons;

        modal.className = 'se-modal-content';
        modal.style.display = 'none';
        let html = '' +
            '<form>' +
                '<div class="se-modal-header">' +
                    '<button type="button" data-command="close" class="se-btn se-modal-close" title="' + lang.modalBox.close + '" aria-label="' + lang.modalBox.close + '">' +
                        icons.cancel +
                    '</button>' +
                    '<span class="se-modal-title">' + lang.modalBox.linkBox.title + '</span>' +
                '</div>' +
                core.context.anchor.forms.innerHTML +
                '<div class="se-modal-footer">' +
                    '<button type="submit" class="se-btn-primary" title="' + lang.modalBox.submitButton + '" aria-label="' + lang.modalBox.submitButton + '"><span>' + lang.modalBox.submitButton + '</span></button>' +
                '</div>' +
            '</form>';

        modal.innerHTML = html;
        return modal;
    },

    /** modify controller button */
    setController_LinkButton: function (core) {
        const lang = core.lang;
        const icons = core.icons;
        const link_btn = core.util.createElement('DIV');

        link_btn.className = 'se-controller se-controller-link';
        link_btn.innerHTML = '' +
            '<div class="se-arrow se-arrow-up"></div>' +
            '<div class="link-content"><span><a target="_blank" href=""></a>&nbsp;</span>' +
                '<div class="se-btn-group">' +
                    '<button type="button" data-command="update" tabindex="-1" class="se-btn se-tooltip">' +
                        icons.edit +
                        '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.edit + '</span></span>' +
                    '</button>' +
                    '<button type="button" data-command="unlink" tabindex="-1" class="se-btn se-tooltip">' +
                        icons.unlink +
                        '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.unlink + '</span></span>' +
                    '</button>' +
                    '<button type="button" data-command="delete" tabindex="-1" class="se-btn se-tooltip">' +
                        icons.delete +
                        '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.controller.remove + '</span></span>' +
                    '</button>' +
                '</div>' +
            '</div>';

        return link_btn;
    },

    /**
     * @Override modal
     */
    open: function () {
        this.plugins.modal.open.call(this, 'link', 'link' === this.currentControllerName);
    },

    submit: function (e) {
        this.openLoading();

        e.preventDefault();
        e.stopPropagation();

        try {
            const oA = this.plugins.anchor.createAnchor.call(this, this.context.anchor.caller.link, false);
            if (oA === null) return;
    
            if (!this.context.modal.updateModal) {
                const selectedFormats = this.format.getLines();
                if (selectedFormats.length > 1) {
                    const oFormat = this.util.createElement(selectedFormats[0].nodeName);
                    oFormat.appendChild(oA);
                    if (!this.html.insertNode(oFormat, null, true)) return;
                } else {
                    if (!this.html.insertNode(oA, null, true)) return;
                }
    
                this.setRange(oA.childNodes[0], 0, oA.childNodes[0], oA.textContent.length);
            } else {
                // set range
                const textNode = this.context.link._linkAnchor.childNodes[0];
                this.setRange(textNode, 0, textNode, textNode.textContent.length);
            }
        } finally {
            this.plugins.modal.close.call(this);
            this.closeLoading();
            // history stack
            this.history.push(false);
        }

        return false;
    },

    /**
     * @Override core
     */
    active: function (element) {
        if (!element) {
            if (this.menu.hasController(this.context.link.linkController)) {
                this.menu.controllerOff();
            }
        } else if (this.util.isAnchor(element) && element.getAttribute('data-image-link') === null) {
            if (!this.menu.hasController(this.context.link.linkController)) {
                this.plugins.link.call_controller.call(this, element);
            }
            return true;
        }

        return false;
    },

    /**
     * @Override modal
     */
    on: function (update) {
        this.plugins.anchor.on.call(this, this.context.anchor.caller.link, update);
    },

    call_controller: function (selectionATag) {
        this.editLink = this.context.link._linkAnchor = this.context.anchor.caller.link.linkAnchor = selectionATag;
        const linkBtn = this.context.link.linkController;
        const link = linkBtn.querySelector('a');

        link.href = selectionATag.href;
        link.title = selectionATag.textContent;
        link.textContent = selectionATag.textContent;

        this.util.addClass(selectionATag, 'on');
        this.menu.setControllerPosition(linkBtn, selectionATag, 'bottom', {left: 0, top: 0});
        this.menu.controllerOn(linkBtn, selectionATag, 'link', this.util.removeClass.bind(this.util, this.context.link._linkAnchor, 'on'));
    },

    onClick_linkController: function (e) {
        e.stopPropagation();

        const command = e.target.getAttribute('data-command') || e.target.parentNode.getAttribute('data-command');
        if (!command) return;

        e.preventDefault();

        if (/update/.test(command)) {
            this.plugins.modal.open.call(this, 'link', true);
        } else if (/unlink/.test(command)) {
            const sc = this.util.getEdgeChild(this.context.link._linkAnchor, function (current) { return current.childNodes.length === 0 || current.nodeType === 3; }, false);
            const ec = this.util.getEdgeChild(this.context.link._linkAnchor, function (current) { return current.childNodes.length === 0 || current.nodeType === 3; }, true);
            this.setRange(sc, 0, ec, ec.textContent.length);
            this.format.applyTextStyle(null, null, ['A'], false);
        } else {
            /** delete */
            this.util.removeItem(this.context.link._linkAnchor);
            this.context.anchor.caller.link.linkAnchor = null;
            this.editor.focus();

            // history stack
            this.history.push(false);
        }

        this.menu.controllerOff();
    },

    /**
     * @Override modal
     */
    init: function () {
        this.context.link.linkController.style.display = 'none';
        this.plugins.anchor.init.call(this, this.context.anchor.caller.link);
    }
};
