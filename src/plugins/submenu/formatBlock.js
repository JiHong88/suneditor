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
    add: function (core, targetElement) {
        const context = core.context;
        context.formatBlock = {
            _formatList: null,
            currentFormat: ''
        };

        /** set submenu */
        let listDiv = this.setSubmenu.call(core);

        /** add event listeners */
        listDiv.querySelector('ul').addEventListener('click', this.pickUp.bind(core));

        context.formatBlock._formatList = listDiv.querySelectorAll('li button');

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null;
    },

    setSubmenu: function () {
        const option = this.context.option;
        const lang_toolbar = this.lang.toolbar;
        const listDiv = this.util.createElement('DIV');
        listDiv.className = 'se-submenu se-list-layer';

        const defaultFormats = ['p', 'div', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        const formatList = !option.formats || option.formats.length === 0 ? defaultFormats : option.formats;

        let list = '<div class="se-list-inner"><ul class="se-list-basic se-list-format">';
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

    active: function (element) {
        const formatContext = this.context.formatBlock;
        const formatList = formatContext._formatList;
        const nodeName = element.nodeName.toLowerCase();
        const className = (element.className.match(/(\s|^)__se__format__[^\s]+/) || [''])[0].trim();
        let formatTitle = this.lang.formats;

        for (let i = 0, len = formatList.length, f; i < len; i++) {
            f = formatList[i];
            if (nodeName === f.getAttribute('data-value') && className === f.getAttribute('data-class')) {
                formatTitle = f.title;
                break;
            }
        }

        this.util.changeTxt(this.commandMap.FORMAT, formatTitle);
        this.util.changeTxt(this.commandMap.FORMAT_TOOLTIP, formatTitle);
        this.commandMap.FORMAT.setAttribute('data-value', nodeName);
        this.commandMap.FORMAT.setAttribute('data-class', className);

        return formatTitle !== this.lang.formats;
    },

    on: function () {
        const formatContext = this.context.formatBlock;
        const formatList = formatContext._formatList;
        const currentFormat = (this.commandMap.FORMAT.getAttribute('data-value') || '') + (this.commandMap.FORMAT.getAttribute('data-class') || '');

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
        // free, others
        else {
            const range = this.getRange();
            const startOffset = range.startOffset;
            const endOffset = range.endOffset;

            const selectedFormsts = this.getSelectedElementsAndComponents();
            if (selectedFormsts.length === 0) return;

            let first = selectedFormsts[0];
            let last = selectedFormsts[selectedFormsts.length - 1];
            const firstPath = this.util.getNodePath(range.startContainer, first, null);
            const lastPath = this.util.getNodePath(range.endContainer, last, null);
            
            // remove selected list
            let rangeArr = {};
            let listFirst = false;
            let listLast = false;
            const passComponent = function (current) { return !this.isComponent(current); }.bind(this.util);

            for (let i = 0, len = selectedFormsts.length, r, o, lastIndex, isList; i < len; i++) {
                lastIndex = i === len - 1;
                o = this.util.getRangeFormatElement(selectedFormsts[i], passComponent);
                isList = this.util.isList(o);
                if (!r && isList) {
                    r = o;
                    rangeArr = {r: r, f: [this.util.getParentElement(selectedFormsts[i], 'LI')]};
                    if (i === 0) listFirst = true;
                } else if (r && isList) {
                    if (r !== o) {
                        const edge = this.detachRangeFormatElement(rangeArr.r, rangeArr.f, null, false, true);
                        if (listFirst) {
                            first = edge.sc;
                            listFirst = false;
                        }
                        if (lastIndex) last = edge.ec;

                        if (isList) {
                            r = o;
                            rangeArr = {r: r, f: [this.util.getParentElement(selectedFormsts[i], 'LI')]};
                            if (lastIndex) listLast = true;
                        } else {
                            r = null;
                        }
                    } else {
                        rangeArr.f.push(this.util.getParentElement(selectedFormsts[i], 'LI'));
                        if (lastIndex) listLast = true;
                    }
                }

                if (lastIndex && this.util.isList(r)) {
                    const edge = this.detachRangeFormatElement(rangeArr.r, rangeArr.f, null, false, true);
                    if (listLast || len === 1) last = edge.ec;
                    if (listFirst) first = edge.sc || last;
                }
            }

            // change format tag
            this.setRange(this.util.getNodeFromPath(firstPath, first), startOffset, this.util.getNodeFromPath(lastPath, last), endOffset);
            const modifiedFormsts = this.getSelectedElementsAndComponents();

            // free format
            if (command === 'free') {
                const getParentFunc = function (current) {
                    return !this.isFormatElement(current);
                }.bind(this.util);
                const getBeforeFunc = function (current) {
                    return !this.isFormatElement(current.parentNode);
                }.bind(this.util);
    
                let parentNode = this.util.getParentElement(modifiedFormsts[0].parentNode, getParentFunc);
                let freeElement = tag.cloneNode(false);
                const focusElement = freeElement;
    
                for (let i = 0, len = modifiedFormsts.length, f, before, html, isComp, first = true; i < len; i++) {
                    f = modifiedFormsts[i];
                    if (f === (!modifiedFormsts[i + 1] ? null : modifiedFormsts[i + 1].parentNode)) continue;
    
                    isComp = this.util.isComponent(f);
                    html = isComp ? '' : f.innerHTML.replace(/(?!>)\s+(?=<)|\n/g, ' ');
                    before = this.util.getParentElement(f, getBeforeFunc);
    
                    if (parentNode !== f.parentNode || isComp) {
                        parentNode.insertBefore(freeElement, before);
                        parentNode = before.parentNode;
                        freeElement = tag.cloneNode(false);
                    }
    
                    freeElement.innerHTML += (first || !html || /<br>$/i.test(html)) ? html : '<BR>' + html;
                    first = false;

                    if (len - 1 === i) before.parentNode.insertBefore(freeElement, before);
                    if (!isComp) this.util.removeItem(before);
                }
    
                this.setRange(focusElement, 0, focusElement, 0);
            }
            // others format
            else {
                for (let i = 0, len = modifiedFormsts.length, node, newFormat; i < len; i++) {
                    node = modifiedFormsts[i];
                    
                    if ((node.nodeName.toLowerCase() !== value.toLowerCase() || (node.className.match(/(\s|^)__se__format__[^\s]+/) || [''])[0].trim() !== className) && !this.util.isComponent(node)) {
                        newFormat = tag.cloneNode(false);
                        this.util.copyFormatAttributes(newFormat, node);
                        newFormat.innerHTML = node.innerHTML;
    
                        node.parentNode.insertBefore(newFormat, node);
                        this.util.removeItem(node);
                    }
    
                    if (i === 0) first = newFormat || node;
                    if (i === len - 1) last = newFormat || node;
                    newFormat = null;
                }
    
                this.setRange(this.util.getNodeFromPath(firstPath, first), startOffset, this.util.getNodeFromPath(lastPath, last), endOffset);
            }

            // history stack
            this.history.push(false);
        }

        this.submenuOff();
    }
};
