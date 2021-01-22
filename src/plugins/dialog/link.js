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
    display: 'dialog',
    add: function (core) {
        core.addModule([dialog]);

        const context = core.context;
        context.link = {
            focusElement: null, // @Override dialog // This element has focus when the dialog is opened.
            _linkAnchor: null,
            _linkValue: ''
        };

        /** link dialog */
        let link_dialog = this.setDialog(core);
        context.link.modal = link_dialog;
        context.link.focusElement = link_dialog.querySelector('._se_link_url');
        context.link.linkAnchorText = link_dialog.querySelector('._se_link_text');
        context.link.linkNewWindowCheck = link_dialog.querySelector('._se_link_check');
        context.link.downloadCheck = link_dialog.querySelector('._se_link_download');
        context.link.download = link_dialog.querySelector('._se_link_download_icon');
        context.link.preview = link_dialog.querySelector('.se-link-preview');
        context.link.bookmark = link_dialog.querySelector('._se_link_bookmark_icon');
        context.link.bookmarkButton = link_dialog.querySelector('._se_bookmark_button');
        context.link.rel = core.options.linkRel.length > 0 ? link_dialog.querySelector('.se-link-rel') : null;

        /** link controller */
        let link_controller = this.setController_LinkButton(core);
        context.link.linkController = link_controller;
        context.link._linkAnchor = null;

        /** add event listeners */
        context.link.downloadCheck.addEventListener('change', this.onChange_download.bind(core));
        link_dialog.querySelector('form').addEventListener('submit', this.submit.bind(core));
        link_controller.addEventListener('click', this.onClick_linkController.bind(core));
        context.link.focusElement.addEventListener('input', this._onLinkPreview.bind(core, context.link.preview, context.link, core.options.linkProtocol));
        context.link.bookmarkButton.addEventListener('click', this.onClick_bookmarkButton.bind(core));

        /** append html */
        context.dialog.modal.appendChild(link_dialog);

        /** append controller */
        context.element.relative.appendChild(link_controller);

        /** empty memory */
        link_dialog = null, link_controller = null;
    },

    /** dialog */
    setDialog: function (core) {
        const lang = core.lang;
        const dialog = core.util.createElement('DIV');
        const rel = core.options.linkRel;

        dialog.className = 'se-dialog-content';
        dialog.style.display = 'none';
        let html = '' +
            '<form class="editor_link">' +
                '<div class="se-dialog-header">' +
                    '<button type="button" data-command="close" class="se-btn se-dialog-close" aria-label="Close" title="' + lang.dialogBox.close + '">' +
                        core.icons.cancel +
                    '</button>' +
                    '<span class="se-modal-title">' + lang.dialogBox.linkBox.title + '</span>' +
                '</div>' +
                '<div class="se-dialog-body">' +
                    '<div class="se-dialog-form">' +
                        '<label>' + lang.dialogBox.linkBox.url + '</label>' +
                        '<div class="se-dialog-form-files">' +
                            '<input class="se-input-form se-input-url _se_link_url" type="text" placeholder="' + (core.options.protocol || '') + '" />' +
                            '<button type="button" class="se-btn se-dialog-files-edge-button _se_bookmark_button" title="' + lang.dialogBox.linkBox.bookmark + '">' + core.icons.bookmark + '</button>' +
                        '</div>' +
                        '<div class="se-link-preview-form">' +
                            '<span class="se-svg se-link-preview-icon _se_link_bookmark_icon">' + core.icons.bookmark + '</span>' +
                            '<span class="se-svg se-link-preview-icon _se_link_download_icon">' + core.icons.download + '</span>' +
                            '<pre class="se-link-preview"></pre>' +
                        '</div>' +
                    '</div>' +
                    '<div class="se-dialog-form">' +
                        '<label>' + lang.dialogBox.linkBox.text + '</label><input class="se-input-form _se_link_text" type="text" />' +
                    '</div>' +
                    '<div class="se-dialog-form-footer">' +
                        '<label><input type="checkbox" class="se-dialog-btn-check _se_link_check" />&nbsp;' + lang.dialogBox.linkBox.newWindowCheck + '</label>' +
                        '<label><input type="checkbox" class="se-dialog-btn-check _se_link_download" />&nbsp;' + lang.dialogBox.linkBox.downloadLinkCheck + '</label>' +
                    '</div>' +
                '</div>' +
                '<div class="se-dialog-footer">';
                    if (rel.length > 0) {
                        html += '<select class="se-input-select se-link-rel" title="rel">';
                        for (let i = 0, len = rel.length; i < len; i++) {
                            html += '<option value="' + rel[i] + '">' + rel[i] + '</option>';
                        }
                        html += '</select>';
                    }
                    html += '' +
                    '<button type="submit" class="se-btn-primary" title="' + lang.dialogBox.submitButton + '"><span>' + lang.dialogBox.submitButton + '</span></button>' +
                '</div>' +
            '</form>';

        dialog.innerHTML = html;
        return dialog;
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
     * @Override dialog
     */
    open: function () {
        this.plugins.dialog.open.call(this, 'link', 'link' === this.currentControllerName);
    },

    _onLinkPreview: function (preview, context, protocol, e) {
        const value = typeof e === 'string' ? e : e.target.value.trim();
        const linkHTTP = value.indexOf('://') === -1 && value.indexOf('#') !== 0;
        context._linkValue = preview.textContent = !value ? '' : (protocol && linkHTTP) ? protocol + value : linkHTTP ? '/' + value : value;

        if (value.indexOf('#') === 0) {
            context.bookmark.style.display = 'block';
            this.util.addClass(context.bookmarkButton, 'active');
        } else {
            context.bookmark.style.display = 'none';
            this.util.removeClass(context.bookmarkButton, 'active');
        }

        if (value.indexOf('#') === -1 && context.downloadCheck.checked) {
            context.download.style.display = 'block';
        } else {
            context.download.style.display = 'none';
        }
    },

    _updateAnchor: function (anchor, url, alt, contextLink) {
        const targetEl = contextLink.linkNewWindowCheck;
        const relEl = contextLink.rel;
        const downloadEl = contextLink.downloadCheck;

        if (/^\#/.test(url)) {
            anchor.id = url.substr(1);
        } else {
            anchor.removeAttribute('id');
        }

        if (!/^\#/.test(url) && downloadEl.checked) {
            anchor.setAttribute('download', alt || url);
        } else {
            anchor.removeAttribute('download');
        }

        anchor.href = url;
        anchor.textContent = alt;

        if (targetEl.checked) anchor.target = '_blank';
        else anchor.removeAttribute('target');

        if (relEl) {
            anchor.rel = relEl.options[relEl.selectedIndex].value;
        } else if (anchor.id) {
            anchor.rel = 'bookmark';
        } else {
            anchor.removeAttribute('rel');
        }
    },

    submit: function (e) {
        this.showLoading();

        e.preventDefault();
        e.stopPropagation();

        const submitAction = function () {
            const contextLink = this.context.link;
            if (contextLink._linkValue.length === 0) return false;
            
            const url = contextLink._linkValue;
            const anchor = contextLink.linkAnchorText;
            const anchorText = anchor.value.length === 0 ? url : anchor.value;

            if (!this.context.dialog.updateModal) {
                const oA = this.util.createElement('A');
                this.plugins.link._updateAnchor(oA, url, anchorText, contextLink);

                const selectedFormats = this.getSelectedElements();
                if (selectedFormats.length > 1) {
                    const oFormat = this.util.createElement(selectedFormats[0].nodeName);
                    oFormat.appendChild(oA);
                    if (!this.insertNode(oFormat, null, true)) return;
                } else {
                    if (!this.insertNode(oA, null, true)) return;
                }

                this.setRange(oA.childNodes[0], 0, oA.childNodes[0], oA.textContent.length);
            } else {
                this.plugins.link._updateAnchor(contextLink._linkAnchor, url, anchorText, contextLink);

                // set range
                const textNode = contextLink._linkAnchor.childNodes[0];
                this.setRange(textNode, 0, textNode, textNode.textContent.length);
            }

            contextLink._linkValue = contextLink.preview.textContent = contextLink.focusElement.value = contextLink.linkAnchorText.value = '';
        }.bind(this);

        try {
            submitAction();
        } finally {
            this.plugins.dialog.close.call(this);
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
            if (this.controllerArray.indexOf(this.context.link.linkController) > -1) {
                this.controllersOff();
            }
        } else if (this.util.isAnchor(element) && element.getAttribute('data-image-link') === null) {
            if (this.controllerArray.indexOf(this.context.link.linkController) < 0) {
                this.plugins.link.call_controller.call(this, element);
            }
            return true;
        }

        return false;
    },

    /**
     * @Override dialog
     */
    on: function (update) {
        const contextLink = this.context.link;
        if (!update) {
            this.plugins.link.init.call(this);
            contextLink.linkAnchorText.value = this.getSelection().toString();
        } else if (contextLink._linkAnchor) {
            this.context.dialog.updateModal = true;
            contextLink._linkValue = contextLink.preview.textContent = contextLink.focusElement.value = (contextLink._linkAnchor.id ? '#' + contextLink._linkAnchor.id : contextLink._linkAnchor.href);
            contextLink.linkAnchorText.value = contextLink._linkAnchor.textContent;
            contextLink.linkNewWindowCheck.checked = (/_blank/i.test(contextLink._linkAnchor.target) ? true : false);
            contextLink.downloadCheck.checked = contextLink._linkAnchor.download;
            if (contextLink.rel) contextLink.rel.value = contextLink._linkAnchor.rel;
        }

        this.plugins.link._onLinkPreview.call(this, contextLink.preview, contextLink, this.options.linkProtocol, contextLink._linkValue);
    },

    call_controller: function (selectionATag) {
        this.editLink = this.context.link._linkAnchor = selectionATag;
        const linkBtn = this.context.link.linkController;
        const link = linkBtn.querySelector('a');

        link.href = selectionATag.href;
        link.title = selectionATag.textContent;
        link.textContent = selectionATag.textContent;

        this.util.addClass(selectionATag, 'on');
        this.setControllerPosition(linkBtn, selectionATag, 'bottom', {left: 0, top: 0});
        this.controllersOn(linkBtn, selectionATag, 'link', this.util.removeClass.bind(this.util, this.context.link._linkAnchor, 'on'));
    },

    onClick_bookmarkButton: function () {
        const contextLink = this.context.link;
        let url = contextLink.focusElement.value;
        if (/^\#/.test(url)) {
            url = url.substr(1);
            contextLink.bookmark.style.display = 'none';
            this.util.removeClass(contextLink.bookmarkButton, 'active');
        } else {
            url = '#' + url;
            contextLink.bookmark.style.display = 'block';
            this.util.addClass(contextLink.bookmarkButton, 'active');
            contextLink.downloadCheck.checked = false;
            contextLink.download.style.display = 'none';
        }

        contextLink._linkValue = contextLink.preview.textContent = contextLink.focusElement.value = url;
        contextLink.focusElement.focus();
    },

    onChange_download(e) {
        const contextLink = this.context.link;
        if (e.target.checked) {
            contextLink.download.style.display = 'block';
            contextLink.bookmark.style.display = 'none';
            this.util.removeClass(contextLink.bookmarkButton, 'active');
            contextLink._linkValue = contextLink.preview.textContent = contextLink.focusElement.value = contextLink.focusElement.value.replace(/^\#+/, '');
        } else {
            contextLink.download.style.display = 'none';
        }
    },

    onClick_linkController: function (e) {
        e.stopPropagation();

        const command = e.target.getAttribute('data-command') || e.target.parentNode.getAttribute('data-command');
        if (!command) return;

        e.preventDefault();

        if (/update/.test(command)) {
            const contextLink = this.context.link;
            contextLink._linkValue = contextLink.preview.textContent = contextLink.focusElement.value = contextLink._linkAnchor.href;
            contextLink.linkAnchorText.value = contextLink._linkAnchor.textContent;
            contextLink.linkNewWindowCheck.checked = (/_blank/i.test(contextLink._linkAnchor.target) ? true : false);
            contextLink.downloadCheck.checked = contextLink._linkAnchor.download;
            if (contextLink.rel) contextLink.rel.value = contextLink._linkAnchor.rel;
            this.plugins.dialog.open.call(this, 'link', true);
        }
        else if (/unlink/.test(command)) {
            const sc = this.util.getChildElement(this.context.link._linkAnchor, function (current) { return current.childNodes.length === 0 || current.nodeType === 3; }, false);
            const ec = this.util.getChildElement(this.context.link._linkAnchor, function (current) { return current.childNodes.length === 0 || current.nodeType === 3; }, true);
            this.setRange(sc, 0, ec, ec.textContent.length);
            this.nodeChange(null, null, ['A'], false);
        }
        else {
            /** delete */
            this.util.removeItem(this.context.link._linkAnchor);
            this.context.link._linkAnchor = null;
            this.focus();

            // history stack
            this.history.push(false);
        }

        this.controllersOff();
    },

    /**
     * @Override dialog
     */
    init: function () {
        const contextLink = this.context.link;
        contextLink.linkController.style.display = 'none';
        contextLink._linkAnchor = null;
        contextLink._linkValue = contextLink.preview.textContent = contextLink.focusElement.value = '';
        contextLink.linkAnchorText.value = '';
        contextLink.linkNewWindowCheck.checked = false;
        contextLink.downloadCheck.checked = false;
        if (contextLink.rel) contextLink.rel.value = contextLink.rel.options[0].value;
    }
};
