/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

export default {
    name: 'list',
    add: function (core, targetElement) {
        const context = core.context;
        context.list = {
            _list: [],
            currentList: ''
        };

        /** set submenu */
        let listDiv = eval(this.setSubmenu.call(core));

        /** add event listeners */
        listDiv.getElementsByTagName('UL')[0].addEventListener('click', this.pickup.bind(core));

        context.list._list = listDiv.getElementsByTagName('UL')[0].querySelectorAll('li button');

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null;
    },

    setSubmenu: function () {
        const lang = this.lang;
        const listDiv = this.util.createElement('DIV');

        listDiv.className = 'sun-editor-submenu layer_editor';
        listDiv.style.display = 'none';
        listDiv.innerHTML = '' +
            '<div class="inner_layer">' +
            '   <ul class="list_editor">' +
            '       <li><button type="button" class="btn_edit se-tooltip" data-command="OL">' +
            '           <i class="icon-list-number"></i>' +
            '           <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.toolbar.orderList + '</span></span>' +
            '       </button></li>' +
            '       <li><button type="button" class="btn_edit se-tooltip" data-command="UL">' +
            '           <i class="icon-list-bullets"></i>' +
            '           <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.toolbar.unorderList + '</span></span>' +
            '       </button></li>' +
            '   </ul>' +
            '</div>';

        return listDiv;
    },

    on: function () {
        const listContext = this.context.list;
        const list = listContext._list;
        const currentList = this.commandMap.LI.getAttribute('data-focus') || '';

        if (currentList !== listContext.currentList) {
            for (let i = 0, len = list.length; i < len; i++) {
                if (currentList === list[i].getAttribute('data-command')) {
                    this.util.addClass(list[i], 'on');
                } else {
                    this.util.removeClass(list[i], 'on');
                }
            }

            listContext.currentList = currentList;
        }
    },

    pickup: function (e) {
        e.preventDefault();
        e.stopPropagation();

        let target = e.target;
        let command = '';

        while (!command && !/^UL$/i.test(target.tagName)) {
            command = target.getAttribute('data-command');
            target = target.parentNode;
        }

        if (!command) return;

        const formatElement = this.util.getFormatElement(this.getSelectionNode());
        const selectedFormsts = this.getSelectedFormatElements();
        let isRemove = true;
        let edgeFirst = null;
        let edgeLast = null;

        for (let i = 0, len = selectedFormsts.length; i < len; i++) {
            if (!/^LI$/i.test(selectedFormsts[i].tagName)) {
                isRemove = false;
                break;
            }
        }

        if (isRemove) {
            const cancel = formatElement.parentNode.tagName === command;
            if (cancel) {
                let rangeArr;
                for (let i = 0, len = selectedFormsts.length, r; i < len; i++) {
                    if (!r) {
                        r = this.util.getRangeFormatElement(selectedFormsts[i]);
                        rangeArr = {r: r, f: [selectedFormsts[i]]};
                    } else {
                        if (r !== this.util.getRangeFormatElement(selectedFormsts[i])) {
                            const edge = this.detachRangeFormatElement(rangeArr.r, rangeArr.f, true);
                            if (!edgeFirst) edgeFirst = edge;

                            r = this.util.getRangeFormatElement(selectedFormsts[i]);
                            rangeArr = {r: r, f: [selectedFormsts[i]]};
                        } else {
                            rangeArr.f.push(selectedFormsts[i])
                        }
                    }

                    if (i === len - 1) {
                        edgeLast = this.detachRangeFormatElement(rangeArr.r, rangeArr.f, true);
                        if (!edgeFirst) edgeFirst = edgeLast;
                    }
                }
            } else {
                let firstList = null;
                let lastList = null;

                for (let i = 0, len = selectedFormsts.length, r; i < len; i++) {
                    if (!r) {
                        r = this.util.getRangeFormatElement(selectedFormsts[i]);
                    } else if (r !== this.util.getRangeFormatElement(selectedFormsts[i])) {
                        r.parentNode.insertBefore(eval(r.outerHTML.replace(/\b(?<=<\/?)(ol|ul)\b\s*(?:[^>^<]+)?\s*(?=>)/ig, command)), r);

                        if (!firstList) firstList = r;
                        this.util.removeItem(r);
                        r = this.util.getRangeFormatElement(selectedFormsts[i]);
                    }

                    if (i === len - 1) {
                        r.outerHTML = r.outerHTML.replace(/\b(?<=<\/?)(ol|ul)\b\s*(?:[^>^<]+)?\s*(?=>)/ig, command);
                        lastList = r;
                        if (!firstList) firstList = lastList;
                        this.util.removeItem(r);
                    }
                }

                edgeFirst = edgeLast = this.util.getEdgeChildNodes(firstList.firstElementChild, lastList.lastElementChild);
            }
        } else {
            let list = this.util.createElement(command);
            let firstList = null;
            let lastList = null;
            
            for (let i = 0, len = selectedFormsts.length, fTag, next; i < len; i++) {
                fTag = selectedFormsts[i];
                next = selectedFormsts[i + 1];
                list.innerHTML += '<li>' + (this.util.isComponent(fTag) ? fTag.outerHTML : fTag.innerHTML) + '</li>';

                if (i === len - 1) lastList = list;
                if (i === len - 1 || !next || fTag.parentNode !== next.parentNode || this.util.isRangeFormatElement(fTag.nextSibling)) {
                    if (!firstList) firstList = list;

                    fTag.parentNode.insertBefore(list, fTag.nextSibling);
                    list = this.util.createElement(command);
                }

                this.util.removeItem(fTag);
            }

            edgeFirst = edgeLast = this.util.getEdgeChildNodes(firstList.firstElementChild, lastList.lastElementChild);
        }

        if (selectedFormsts.length > 1) {
            this.setRange(edgeFirst.sc, 0, edgeLast.ec, edgeLast.ec.length);
        } else {
            this.setRange(edgeFirst.ec, edgeFirst.ec.length, edgeLast.ec, edgeLast.ec.length);
        }

        // history stack
        this.history.push();

        this.submenuOff();
        this.focus();
    }
};
