/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

export default {
    name: 'formatBlock',
    display: 'submenu',
    add: function (core, targetElement) {
        const context = core.context;
        context.formatBlock = {
            targetText: targetElement.querySelector('.txt'),
            targetTooltip: targetElement.parentNode.querySelector('.se-tooltip-text'),
            _formatList: null,
            currentFormat: ''
        };

        /** set submenu */
        let listDiv = this.setSubmenu(core);

        /** add event listeners */
        listDiv.querySelector('ul').addEventListener('click', this.pickUp.bind(core));
        context.formatBlock._formatList = listDiv.querySelectorAll('li button');

        /** append target button menu */
        core.initMenuTarget(this.name, targetElement, listDiv);

        /** empty memory */
        listDiv = null;
    },

    setSubmenu: function (core) {
        const option = core.options;
        const lang_toolbar = core.lang.toolbar;
        const listDiv = core.util.createElement('DIV');
        listDiv.className = 'se-submenu se-list-layer se-list-format';

        const defaultFormats = ['p', 'div', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        const formatList = !option.formats || option.formats.length === 0 ? defaultFormats : option.formats;

        let list = '<div class="se-list-inner"><ul class="se-list-basic">';
        for (let i = 0, len = formatList.length, format, tagName, command, name, h, attrs, className; i < len; i++) {
            format = formatList[i];
            
            if (typeof format === 'string' && defaultFormats.indexOf(format) > -1) {
                tagName = format.toLowerCase();
                command = tagName === 'blockquote' ? 'range' : tagName === 'pre' ? 'free' : 'replace';
                h = /^h/.test(tagName) ? tagName.match(/\d+/)[0] : '';
                name = lang_toolbar['tag_' + (h ? 'h' : tagName)] + h;
                className = '';
                attrs = '';
            } else {
                tagName = format.tag.toLowerCase();
                command = format.command;
                name = format.name || tagName;
                className = format.class;
                attrs = className ? ' class="' + className + '"' : '';
            }

            list += '<li>' +
                '<button type="button" class="se-btn-list" data-command="' + command + '" data-value="' + tagName + '" data-class="' + className + '" title="' + name + '">' +
                    '<' + tagName + attrs + '>' + name + '</' + tagName + '>' +
                '</button></li>';
        }
        list += '</ul></div>';

        listDiv.innerHTML = list;

        return listDiv;
    },

     /**
     * @Override core
     */
    active: function (element) {
        let formatTitle = this.lang.toolbar.formats;
        const target = this.context.formatBlock.targetText;
        const tooltip = this.context.formatBlock.targetTooltip;

        if (!element) {
            this.util.changeTxt(target, formatTitle);
            this.util.changeTxt(tooltip, formatTitle);
        } else if (this.util.isFormatElement(element)) {
            const formatContext = this.context.formatBlock;
            const formatList = formatContext._formatList;
            const nodeName = element.nodeName.toLowerCase();
            const className = (element.className.match(/(\s|^)__se__format__[^\s]+/) || [''])[0].trim();

            for (let i = 0, len = formatList.length, f; i < len; i++) {
                f = formatList[i];
                if (nodeName === f.getAttribute('data-value') && className === f.getAttribute('data-class')) {
                    formatTitle = f.title;
                    break;
                }
            }

            this.util.changeTxt(target, formatTitle);
            this.util.changeTxt(tooltip, formatTitle);
            target.setAttribute('data-value', nodeName);
            target.setAttribute('data-class', className);

            return true;
        }

        return false;
    },

     /**
     * @Override submenu
     */
    on: function () {
        const formatContext = this.context.formatBlock;
        const formatList = formatContext._formatList;
        const target = formatContext.targetText;
        const currentFormat = (target.getAttribute('data-value') || '') + (target.getAttribute('data-class') || '');

        if (currentFormat !== formatContext.currentFormat) {
            for (let i = 0, len = formatList.length, f; i < len; i++) {
                f = formatList[i];
                if (currentFormat === f.getAttribute('data-value') + f.getAttribute('data-class')) {
                    this.util.addClass(f, 'active');
                } else {
                    this.util.removeClass(f, 'active');
                }
            }

            formatContext.currentFormat = currentFormat;
        }
    },

    pickUp: function (e) {
        e.preventDefault();
        e.stopPropagation();

        let target = e.target;
        let command = null, value = null, tag = null, className = '';
        
        while (!command && !/UL/i.test(target.tagName)) {
            command = target.getAttribute('data-command');
            value = target.getAttribute('data-value');
            className = target.getAttribute('data-class');
            if (command) {
                tag = target.firstChild;
                break;
            }
            target = target.parentNode;
        }

        if (!command) return;

        // blockquote
        if (command === 'range') {
            const rangeElement = tag.cloneNode(false);
            this.applyRangeFormatElement(rangeElement);
        }
        // free, replace
        else {
            let range = this.getRange();
            let selectedFormsts = this.getSelectedElementsAndComponents(false);

            if (selectedFormsts.length === 0) {
                range = this.getRange_addLine(range, null);
                selectedFormsts = this.getSelectedElementsAndComponents(false);
                if (selectedFormsts.length === 0) return;
            }

            const startOffset = range.startOffset;
            const endOffset = range.endOffset;

            const util = this.util;
            let first = selectedFormsts[0];
            let last = selectedFormsts[selectedFormsts.length - 1];
            const firstPath = util.getNodePath(range.startContainer, first, null, null);
            const lastPath = util.getNodePath(range.endContainer, last, null, null);
            
            // remove selected list
            const rlist = this.detachList(selectedFormsts, false);
            if (rlist.sc) first = rlist.sc;
            if (rlist.ec) last = rlist.ec;

            // change format tag
            this.setRange(util.getNodeFromPath(firstPath, first), startOffset, util.getNodeFromPath(lastPath, last), endOffset);
            const modifiedFormsts = this.getSelectedElementsAndComponents(false);

            // free format
            if (command === 'free') {
                const len = modifiedFormsts.length - 1;
                let parentNode = modifiedFormsts[len].parentNode;
                let freeElement = tag.cloneNode(false);
                const focusElement = freeElement;
    
                for (let i = len, f, html, before, next, inner, isComp, first = true; i >= 0; i--) {
                    f = modifiedFormsts[i];
                    if (f === (!modifiedFormsts[i + 1] ? null : modifiedFormsts[i + 1].parentNode)) continue;
    
                    isComp = util.isComponent(f);
                    html = isComp ? '' : f.innerHTML.replace(/(?!>)\s+(?=<)|\n/g, ' ');
                    before = util.getParentElement(f, function (current) {
                        return current.parentNode === parentNode;
                    });
    
                    if (parentNode !== f.parentNode || isComp) {
                        if (util.isFormatElement(parentNode)) {
                            parentNode.parentNode.insertBefore(freeElement, parentNode.nextSibling);
                            parentNode = parentNode.parentNode;
                        } else {
                            parentNode.insertBefore(freeElement, before ? before.nextSibling : null);
                            parentNode = f.parentNode;
                        }

                        next = freeElement.nextSibling;
                        if (next && freeElement.nodeName === next.nodeName && util.isSameAttributes(freeElement, next)) {
                            freeElement.innerHTML += '<BR>' + next.innerHTML;
                            util.removeItem(next);
                        }

                        freeElement = tag.cloneNode(false);
                        first = true;
                    }
    
                    inner = freeElement.innerHTML;
                    freeElement.innerHTML = ((first || !html || !inner || /<br>$/i.test(html)) ? html : html + '<BR>') + inner;

                    if (i === 0) {
                        parentNode.insertBefore(freeElement, f);
                        next = f.nextSibling;
                        if (next && freeElement.nodeName === next.nodeName && util.isSameAttributes(freeElement, next)) {
                            freeElement.innerHTML += '<BR>' + next.innerHTML;
                            util.removeItem(next);
                        }

                        const prev = freeElement.previousSibling;
                        if (prev && freeElement.nodeName === prev.nodeName && util.isSameAttributes(freeElement, prev)) {
                            prev.innerHTML += '<BR>' + freeElement.innerHTML;
                            util.removeItem(freeElement);
                        }
                    }

                    if (!isComp) util.removeItem(f);
                    if (!!html) first = false;
                }
    
                this.setRange(focusElement, 0, focusElement, 0);
            }
            // replace format
            else {
                for (let i = 0, len = modifiedFormsts.length, node, newFormat; i < len; i++) {
                    node = modifiedFormsts[i];
                    
                    if ((node.nodeName.toLowerCase() !== value.toLowerCase() || (node.className.match(/(\s|^)__se__format__[^\s]+/) || [''])[0].trim() !== className) && !util.isComponent(node)) {
                        newFormat = tag.cloneNode(false);
                        util.copyFormatAttributes(newFormat, node);
                        newFormat.innerHTML = node.innerHTML;
    
                        node.parentNode.replaceChild(newFormat, node);
                    }
    
                    if (i === 0) first = newFormat || node;
                    if (i === len - 1) last = newFormat || node;
                    newFormat = null;
                }
    
                this.setRange(util.getNodeFromPath(firstPath, first), startOffset, util.getNodeFromPath(lastPath, last), endOffset);
            }

            // history stack
            this.history.push(false);
        }

        this.submenuOff();
    }
};
