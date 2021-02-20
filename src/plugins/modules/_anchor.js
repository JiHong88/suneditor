/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

export default {
    name: 'anchor',
    add: function (core) {
        core.context.anchor = {
            caller: {},
            forms: this.setDialogForm(core),
            host: core._w.location.origin + core._w.location.pathname
        };
    },

    /** dialog */
    setDialogForm: function (core) {
        const lang = core.lang;
        const relList = core.options.linkRel;
        const defaultRel = (core.options.linkRelDefault.default || '').split(' ');
        const icons = core.icons;
        const forms = core.util.createElement('DIV');

        let html = '<div class="se-dialog-body">' +
            '<div class="se-dialog-form">' +
                '<label>' + lang.dialogBox.linkBox.url + '</label>' +
                '<div class="se-dialog-form-files">' +
                    '<input class="se-input-form se-input-url" type="text" placeholder="' + (core.options.protocol || '') + '" />' +
                    '<button type="button" class="se-btn se-dialog-files-edge-button _se_bookmark_button" title="' + lang.dialogBox.linkBox.bookmark + '">' + icons.bookmark + '</button>' +
                '</div>' +
                '<div class="se-anchor-preview-form">' +
                    '<span class="se-svg se-anchor-preview-icon _se_anchor_bookmark_icon">' + icons.bookmark + '</span>' +
                    '<span class="se-svg se-anchor-preview-icon _se_anchor_download_icon">' + icons.download + '</span>' +
                    '<pre class="se-link-preview"></pre>' +
                '</div>' +
            '</div>' +
            '<div class="se-dialog-form">' +
                '<label>' + lang.dialogBox.linkBox.text + '</label><input class="se-input-form _se_anchor_text" type="text" />' +
            '</div>' +
            '<div class="se-dialog-form-footer">' +
                '<label><input type="checkbox" class="se-dialog-btn-check _se_anchor_check" />&nbsp;' + lang.dialogBox.linkBox.newWindowCheck + '</label>' +
                '<label><input type="checkbox" class="se-dialog-btn-check _se_anchor_download" />&nbsp;' + lang.dialogBox.linkBox.downloadLinkCheck + '</label>';
            if (relList.length > 0) {
                html += '<div class="se-anchor-rel"><button type="button" class="se-btn se-btn-select se-anchor-rel-btn">&lt;rel&gt;</button>' +
                    '<div class="se-anchor-rel-wrapper"><pre class="se-link-preview se-anchor-rel-preview"></pre></div>' +
                    '<div class="se-list-layer">' +
                        '<div class="se-list-inner">' +
                            '<ul class="se-list-basic se-list-checked">';
                for (let i = 0, len = relList.length, rel; i < len; i++) {
                    rel = relList[i];
                    html += '<li><button type="button" class="se-btn-list' + (defaultRel.indexOf(rel) > -1 ? ' se-checked' : '') + '" data-command="' + rel + '" title="' + rel + '"><span class="se-svg">' + icons.checked + '</span>' + rel + '</button></li>';
                }
                html += '</ul></div></div></div>';
            }

        html += '</div></div>';

        forms.innerHTML = html;
        return forms;
    },

    initEvent: function (pluginName, forms) {
        const anchorPlugin = this.plugins.anchor;
        const context = this.context.anchor.caller[pluginName] = {
            modal: forms,
            urlInput: null,
            linkDefaultRel: this.options.linkRelDefault,
            defaultRel: this.options.linkRelDefault.default || '',
            currentRel: [],
            linkAnchor: null,
            linkValue: ''
        };

        if (typeof context.linkDefaultRel.default === 'string') context.linkDefaultRel.default = context.linkDefaultRel.default.trim();
        if (typeof context.linkDefaultRel.check_new_window === 'string') context.linkDefaultRel.check_new_window = context.linkDefaultRel.check_new_window.trim();
        if (typeof context.linkDefaultRel.check_bookmark === 'string') context.linkDefaultRel.check_bookmark = context.linkDefaultRel.check_bookmark.trim();

        context.urlInput = forms.querySelector('.se-input-url');
        context.anchorText = forms.querySelector('._se_anchor_text');
        context.newWindowCheck = forms.querySelector('._se_anchor_check');
        context.downloadCheck = forms.querySelector('._se_anchor_download');
        context.download = forms.querySelector('._se_anchor_download_icon');
        context.preview = forms.querySelector('.se-link-preview');
        context.bookmark = forms.querySelector('._se_anchor_bookmark_icon');
        context.bookmarkButton = forms.querySelector('._se_bookmark_button');
        
        /** rel */
        if (this.options.linkRel.length > 0) {
            context.relButton = forms.querySelector('.se-anchor-rel-btn');
            context.relList = forms.querySelector('.se-list-layer');
            context.relPreview = forms.querySelector('.se-anchor-rel-preview');
            context.relButton.addEventListener('click', anchorPlugin.onClick_relButton.bind(this, context));
            context.relList.addEventListener('click', anchorPlugin.onClick_relList.bind(this, context));
        }

        context.newWindowCheck.addEventListener('change', anchorPlugin.onChange_newWindowCheck.bind(this, context));
        context.downloadCheck.addEventListener('change', anchorPlugin.onChange_downloadCheck.bind(this, context));
        context.urlInput.addEventListener('input', anchorPlugin.setLinkPreview.bind(this, context, this.options.linkProtocol));
        context.bookmarkButton.addEventListener('click', anchorPlugin.onClick_bookmarkButton.bind(this, context));
    },

    on: function (contextAnchor, update) {
        if (!update) {
            this.plugins.anchor.init.call(this, contextAnchor);
            contextAnchor.anchorText.value = this.getSelection().toString();
        } else if (contextAnchor.linkAnchor) {
            this.context.dialog.updateModal = true;
            contextAnchor.linkValue = contextAnchor.preview.textContent = contextAnchor.urlInput.value = (contextAnchor.linkAnchor.id ? '#' + contextAnchor.linkAnchor.id : contextAnchor.linkAnchor.href);
            contextAnchor.anchorText.value = contextAnchor.linkAnchor.getAttribute('alt') || contextAnchor.linkAnchor.textContent;
            contextAnchor.newWindowCheck.checked = (/_blank/i.test(contextAnchor.linkAnchor.target) ? true : false);
            contextAnchor.downloadCheck.checked = contextAnchor.linkAnchor.download;
        }

        this.plugins.anchor.setRel.call(this, contextAnchor, (update && contextAnchor.linkAnchor) ? contextAnchor.linkAnchor.rel : contextAnchor.defaultRel);
        this.plugins.anchor.setLinkPreview.call(this, contextAnchor, this.options.linkProtocol, contextAnchor.linkValue);
    },

    _closeRelMenu: null,
    toggleRelList: function (contextAnchor, show) {
        if (!show) {
            if (this.plugins.anchor._closeRelMenu) this.plugins.anchor._closeRelMenu();
        } else {
            const target = contextAnchor.relButton;
            const relList = contextAnchor.relList;
            this.util.addClass(target, 'active');
            relList.style.visibility = 'hidden';
            relList.style.display = 'block';
            if (!this.options.rtl) relList.style.left = (target.offsetLeft + target.offsetWidth + 1) + 'px';
            else relList.style.left = (target.offsetLeft - relList.offsetWidth - 1) + 'px';
            relList.style.top = (target.offsetTop + (target.offsetHeight / 2) - (relList.offsetHeight / 2)) + 'px';
            relList.style.visibility = '';

            this.plugins.anchor._closeRelMenu = function (context, target, e) {
                if (e && (context.relButton.contains(e.target) || context.relList.contains(e.target))) return;
                this.util.removeClass(target, 'active');
                context.relList.style.display = 'none';
                this.modalForm.removeEventListener('click', this.plugins.anchor._closeRelMenu);
                this.plugins.anchor._closeRelMenu = null;
            }.bind(this, contextAnchor, target);
    
            this.modalForm.addEventListener('click', this.plugins.anchor._closeRelMenu);
        }
    },

    onClick_relButton: function (contextAnchor, e) {
        this.plugins.anchor.toggleRelList.call(this, contextAnchor, !this.util.hasClass(e.target, 'active'));
    },

    onClick_relList: function (contextAnchor, e) {
        const target = e.target;
        const cmd = target.getAttribute('data-command');
        if (!cmd) return;
        
        const current = contextAnchor.currentRel;
        const checked = this.util.toggleClass(target, 'se-checked');
        const index = current.indexOf(cmd);
        if (checked) {
            if (index === -1) current.push(cmd);
        } else {
            if (index > -1) current.splice(index, 1);
        }

        contextAnchor.relPreview.title = contextAnchor.relPreview.textContent = current.join(' ');
    },

    setRel: function (contextAnchor, relAttr) {
        const relListEl = contextAnchor.relList;
        const rels = contextAnchor.currentRel = !relAttr ? [] : relAttr.split(' ');
        if (!relListEl) return;

        const checkedRel = relListEl.querySelectorAll('button');
        for (let i = 0, len = checkedRel.length, cmd; i < len; i++) {
            cmd = checkedRel[i].getAttribute('data-command');
            if (rels.indexOf(cmd) > -1) {
                this.util.addClass(checkedRel[i], 'se-checked');
            } else {
                this.util.removeClass(checkedRel[i], 'se-checked');
            }
        }

        contextAnchor.relPreview.title = contextAnchor.relPreview.textContent = rels.join(' ');
    },

    setLinkPreview: function (context, protocol, e) {
        const preview = context.preview;
        const value = typeof e === 'string' ? e : e.target.value.trim();
        const reservedProtocol  = /^(mailto\:|https*\:\/\/)/.test(value);
        const sameProtocol = !protocol ? false : this._w.RegExp('^' + value.substr(0, protocol.length)).test(protocol);
        context.linkValue = preview.textContent = !value ? '' : (protocol && !reservedProtocol && !sameProtocol) ? protocol + value : reservedProtocol ? value : /^www\./.test(value) ? 'http://' + value : this.context.anchor.host + (/^\//.test(value) ? '' : '/') + value;

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

    updateAnchor: function (anchor, url, alt, contextAnchor, notText) {
        // bookmark
        if (/^\#/.test(url)) {
            anchor.id = url.substr(1);
        } else {
            anchor.removeAttribute('id');
        }

        // download
        if (!/^\#/.test(url) && contextAnchor.downloadCheck.checked) {
            anchor.setAttribute('download', alt || url);
        } else {
            anchor.removeAttribute('download');
        }

        // new window
        if (contextAnchor.newWindowCheck.checked) anchor.target = '_blank';
        else anchor.removeAttribute('target');
        
        // rel
        const rel = contextAnchor.currentRel.join(' ');
        if (!rel) anchor.removeAttribute('rel');
        else anchor.rel = rel;

        // est url, alt
        anchor.href = url;
        anchor.setAttribute('alt', alt);
        anchor.textContent = notText ? '' : alt;
    },

    createAnchor: function (contextAnchor, notText) {
        if (contextAnchor.linkValue.length === 0) return null;
        
        const url = contextAnchor.linkValue;
        const anchor = contextAnchor.anchorText;
        const anchorText = anchor.value.length === 0 ? url : anchor.value;

        const oA = contextAnchor.linkAnchor || this.util.createElement('A');
        this.plugins.anchor.updateAnchor(oA, url, anchorText, contextAnchor, notText);

        contextAnchor.linkValue = contextAnchor.preview.textContent = contextAnchor.urlInput.value = contextAnchor.anchorText.value = '';

        return oA;
    },

    onClick_bookmarkButton: function (contextAnchor) {
        let url = contextAnchor.urlInput.value;
        if (/^\#/.test(url)) {
            url = url.substr(1);
            contextAnchor.bookmark.style.display = 'none';
            this.util.removeClass(contextAnchor.bookmarkButton, 'active');
        } else {
            url = '#' + url;
            contextAnchor.bookmark.style.display = 'block';
            this.util.addClass(contextAnchor.bookmarkButton, 'active');
            contextAnchor.downloadCheck.checked = false;
            contextAnchor.download.style.display = 'none';
        }

        contextAnchor.linkValue = contextAnchor.preview.textContent = contextAnchor.urlInput.value = url;
        contextAnchor.urlInput.focus();
    },

    onChange_newWindowCheck: function (contextAnchor, e) {
        if (typeof contextAnchor.linkDefaultRel.check_new_window !== 'string') return;
        if (e.target.checked) {
            this.plugins.anchor.setRel.call(this, contextAnchor, this.plugins.anchor._relMerge.call(this, contextAnchor, contextAnchor.linkDefaultRel.check_new_window));
        } else {
            this.plugins.anchor.setRel.call(this, contextAnchor, this.plugins.anchor._relDelete.call(this, contextAnchor, contextAnchor.linkDefaultRel.check_new_window));
        }
    },

    onChange_downloadCheck: function (contextAnchor, e) {
        if (e.target.checked) {
            contextAnchor.download.style.display = 'block';
            contextAnchor.bookmark.style.display = 'none';
            this.util.removeClass(contextAnchor.bookmarkButton, 'active');
            contextAnchor.linkValue = contextAnchor.preview.textContent = contextAnchor.urlInput.value = contextAnchor.urlInput.value.replace(/^\#+/, '');
            if (typeof contextAnchor.linkDefaultRel.check_bookmark === 'string') {
                this.plugins.anchor.setRel.call(this, contextAnchor, this.plugins.anchor._relMerge.call(this, contextAnchor, contextAnchor.linkDefaultRel.check_bookmark));
            }
        } else {
            contextAnchor.download.style.display = 'none';
            if (typeof contextAnchor.linkDefaultRel.check_bookmark === 'string') {
                this.plugins.anchor.setRel.call(this, contextAnchor, this.plugins.anchor._relDelete.call(this, contextAnchor, contextAnchor.linkDefaultRel.check_bookmark));
            }
        }
    },

    _relMerge: function (contextAnchor, relAttr) {
        const current = contextAnchor.currentRel;
        if (!relAttr) return current.join(' ');
        
        if (/^only\:/.test(relAttr)) {
            relAttr = relAttr.replace(/^only\:/, '').trim();
            contextAnchor.currentRel = relAttr.split(' ');
            return relAttr;
        }

        const rels = relAttr.split(' ');
        for (let i = 0, len = rels.length, index; i < len; i++) {
            index = current.indexOf(rels[i]);
            if (index === -1) current.push(rels[i]);
        }

        return current.join(' ');
    },

    _relDelete: function (contextAnchor, relAttr) {
        if (!relAttr) return contextAnchor.currentRel.join(' ');
        if (/^only\:/.test(relAttr)) relAttr = relAttr.replace(/^only\:/, '').trim();

        const rels = contextAnchor.currentRel.join(' ').replace(this._w.RegExp(relAttr + '\\s*'), '');
        contextAnchor.currentRel = rels.split(' ');
        return rels;
    },

    init: function (contextAnchor) {
        contextAnchor.linkAnchor = null;
        contextAnchor.linkValue = contextAnchor.preview.textContent = contextAnchor.urlInput.value = '';
        contextAnchor.anchorText.value = '';
        contextAnchor.newWindowCheck.checked = false;
        contextAnchor.downloadCheck.checked = false;
        this.plugins.anchor.setRel.call(this, contextAnchor, contextAnchor.defaultRel);
        if (contextAnchor.relList) {
            this.plugins.anchor.toggleRelList.call(this, contextAnchor, false);
        }
    }
};
