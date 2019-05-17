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

        const currentFormat = this.util.getFormatElement(this.getSelectionNode());
        const selectedFormsts = this.getSelectedFormatElements();
        let isRemove = false;
        let edgeFirst = null;
        let edgeLast = null;
        
        // merge
        const firstSel = selectedFormsts[0];
        const lastSel = selectedFormsts[selectedFormsts.length - 1];
        const topEl = this.util.isListCell(firstSel) && !firstSel.previousSibling ? firstSel.parentNode.previousSibling : firstSel.previousSibling;
        const bottomEl = this.util.isListCell(lastSel) && !lastSel.nextSibling ? lastSel.parentNode.nextSibling : lastSel.nextSibling;

        for (let i = 0, len = selectedFormsts.length; i < len; i++) {
            if (this.util.isListCell(selectedFormsts[i].tagName)) {
                isRemove = true;
                break;
            }
        }

        if (isRemove && (!topEl || command !== topEl.tagName) && (!bottomEl || command !== bottomEl.tagName)) {
            const cancel = currentFormat.parentNode.tagName === command;
            let rangeArr, tempList;

            if (!cancel) tempList = this.util.createElement(command);

            for (let i = 0, len = selectedFormsts.length, r, o; i < len; i++) {
                o = this.util.getRangeFormatElement(selectedFormsts[i]);
                if (!r) {
                    r = o;
                    rangeArr = {r: r, f: [selectedFormsts[i]]};
                } else {
                    if (r !== o) {
                        const edge = this.detachRangeFormatElement(rangeArr.r, rangeArr.f,tempList, false, true);
                        if (!edgeFirst) edgeFirst = edge;
                        if (!cancel) tempList = this.util.createElement(command);
                        r = o;
                        rangeArr = {r: r, f: [selectedFormsts[i]]};
                    } else {
                        rangeArr.f.push(selectedFormsts[i])
                    }
                }

                if (i === len - 1) {
                    edgeLast = this.detachRangeFormatElement(rangeArr.r, rangeArr.f, tempList, false, true);
                    if (!edgeFirst) edgeFirst = edgeLast;
                }
            }
        } else {
            const mergeTop = topEl && topEl.tagName === command;
            const mergeBottom = bottomEl && bottomEl.tagName === command;
            let list = mergeTop ? topEl : this.util.createElement(command);
            let firstList = null;
            let lastList = null;
            let topNumber = null;
            let bottomNumber = null;
            
            for (let i = 0, len = selectedFormsts.length, fTag, next, parentTag, siblingTag, rangeTag; i < len; i++) {
                fTag = selectedFormsts[i];
                next = selectedFormsts[i + 1];
                rangeTag = this.util.isRangeFormatElement(fTag.parentNode) ? fTag.parentNode : null;
                parentTag = this.util.isListCell(fTag) ? fTag.parentNode.parentNode : fTag.parentNode;
                siblingTag = this.util.isListCell(fTag) ? fTag.parentNode.nextSibling : fTag.nextSibling;

                list.innerHTML += this.util.isListCell(fTag) ? fTag.outerHTML : '<li>' + (this.util.isComponent(fTag) ? fTag.outerHTML : fTag.innerHTML) + '</li>';
                if (mergeTop && topNumber === null) topNumber = list.children.length - 1;

                if (i === len - 1) lastList = list;
                if (i === len - 1 || !next || parentTag !== next.parentNode || this.util.isRangeFormatElement(siblingTag)) {
                    if (!firstList) firstList = list;

                    if (!mergeTop) {
                        parentTag.insertBefore(list, siblingTag);
                        if (!mergeBottom) list = this.util.createElement(command);
                    }
                }

                this.util.removeItem(fTag);
                if (rangeTag && rangeTag.children.length === 0) this.util.removeItem(rangeTag);
            }

            if (topNumber) {
                firstList = list.children[topNumber];
            }

            if (mergeBottom) {
                bottomNumber = list.children.length - 1;
                list.innerHTML += bottomEl.innerHTML;
                lastList = list.children[bottomNumber];
                this.util.removeItem(bottomEl);
            }

            edgeFirst = edgeLast = this.util.getEdgeChildNodes(firstList.firstChild, lastList.lastChild);
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
