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

        const commonCon = this.getRange().commonAncestorContainer;
        const myComponent = this.util.getParentElement(commonCon, this.util.isComponent);
        const selectedFormsts = this.util.isTable(commonCon) ? 
            this.getSelectedElements() :
            this.getSelectedElements(function (current) {
                const component = this.getParentElement(current, this.isComponent);
                return (this.isFormatElement(current) && (!component || component === myComponent)) || this.isComponent(current);
        }.bind(this.util));

        if (!selectedFormsts || selectedFormsts.length === 0) return;

        const passComponent = function (current) {
            return !this.isComponent(current);
        }.bind(this.util);

        let isRemove = true;
        let edgeFirst = null;
        let edgeLast = null;
        
        // merge
        const firstSel = selectedFormsts[0];
        const lastSel = selectedFormsts[selectedFormsts.length - 1];
        let topEl = (this.util.isListCell(firstSel) || this.util.isComponent(firstSel)) && !firstSel.previousElementSibling ? firstSel.parentNode.previousElementSibling : firstSel.previousElementSibling;
        let bottomEl = (this.util.isListCell(lastSel) || this.util.isComponent(lastSel)) && !lastSel.nextElementSibling ? lastSel.parentNode.nextElementSibling : lastSel.nextElementSibling;

        for (let i = 0, len = selectedFormsts.length; i < len; i++) {
            if (!this.util.isListCell(selectedFormsts[i]) && !this.util.isComponent(selectedFormsts[i])) {
                isRemove = false;
                break;
            }
        }

        if (isRemove && (!topEl || command !== topEl.tagName) && (!bottomEl || command !== bottomEl.tagName)) {
            const currentFormat = this.util.getFormatElement(this.getSelectionNode());
            const cancel = currentFormat ? currentFormat.parentNode.tagName === command : selectedFormsts[0];
            let rangeArr, tempList;

            if (!cancel) tempList = this.util.createElement(command);

            for (let i = 0, len = selectedFormsts.length, r, o; i < len; i++) {
                o = this.util.getRangeFormatElement(selectedFormsts[i], passComponent);
                if (!o || !this.util.isList(o)) continue;

                if (!r) {
                    r = o;
                    rangeArr = {r: r, f: [selectedFormsts[i]]};
                } else {
                    if (r !== o) {
                        const edge = this.detachRangeFormatElement(rangeArr.r, rangeArr.f, tempList, false, true);
                        if (!edgeFirst) edgeFirst = edge;
                        if (!cancel) tempList = this.util.createElement(command);
                        r = o;
                        rangeArr = {r: r, f: [selectedFormsts[i]]};
                    } else {
                        rangeArr.f.push(selectedFormsts[i]);
                    }
                }

                if (i === len - 1) {
                    edgeLast = this.detachRangeFormatElement(rangeArr.r, rangeArr.f, tempList, false, true);
                    if (!edgeFirst) edgeFirst = edgeLast;
                }
            }
        } else {
            const topElParent = topEl.parentNode;
            const bottomElParent = bottomEl.parentNode;
            topEl = topEl && topElParent.nodeName === command && topElParent.parentNode === bottomElParent ? topElParent : topEl;
            bottomEl = bottomEl && bottomElParent.nodeName === command && bottomElParent.parentNode === topEl.parentNode ? bottomElParent : bottomEl;

            const mergeTop = topEl && topEl.tagName === command;
            const mergeBottom = bottomEl && bottomEl.tagName === command;
            
            let list = mergeTop ? topEl : this.util.createElement(command);
            let firstList = null;
            let lastList = null;
            let topNumber = null;
            let bottomNumber = null;
            
            for (let i = 0, len = selectedFormsts.length, fTag, isCell, next, originParent, parentTag, siblingTag, rangeTag; i < len; i++) {
                fTag = selectedFormsts[i];
                next = selectedFormsts[i + 1];
                originParent = fTag.parentNode;
                isCell = this.util.isListCell(fTag) || this.util.isComponent(fTag);
                rangeTag = this.util.isRangeFormatElement(originParent) ? originParent : null;
                parentTag = isCell ? originParent.parentNode : originParent;
                siblingTag = isCell ? !next ? originParent : originParent.nextSibling : fTag.nextSibling;

                list.innerHTML += isCell ? fTag.outerHTML : '<li>' + fTag.innerHTML + '</li>';
                if (mergeTop && topNumber === null) topNumber = list.children.length - 1;

                if (!next) lastList = list;
                if (!next || parentTag !== next.parentNode || this.util.isRangeFormatElement(siblingTag)) {
                    if (!firstList) firstList = list;
                    if (!mergeTop && !(next && this.util.isList(next.parentNode))) {
                        parentTag.insertBefore(list, siblingTag);
                        if (!mergeBottom && this.util.getRangeFormatElement(next, passComponent) !== this.util.getRangeFormatElement(fTag, passComponent)) list = this.util.createElement(command);
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

        // history stack
        this.history.push();

        if (selectedFormsts.length > 1) {
            this.setRange(edgeFirst.sc, 0, edgeLast.ec, edgeLast.ec.textContent.length);
        } else {
            this.setRange(edgeFirst.ec, edgeFirst.ec.textContent.length, edgeLast.ec, edgeLast.ec.textContent.length);
        }

        this.submenuOff();
        this.focus();
    }
};
