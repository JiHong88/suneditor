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
    display: 'submenu',
    add: function (core, targetElement) {
        const context = core.context;
        context.list = {
            targetButton: targetElement,
            targetIcon: targetElement.querySelector('i'),
            _list: null,
            currentList: ''
        };

        /** set submenu */
        let listDiv = this.setSubmenu.call(core);
        let listUl = listDiv.querySelector('ul');

        /** add event listeners */
        listUl.addEventListener('click', this.pickup.bind(core));

        context.list._list = listUl.querySelectorAll('li button');

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null, listUl = null;
    },

    setSubmenu: function () {
        const lang = this.lang;
        const listDiv = this.util.createElement('DIV');

        listDiv.className = 'se-submenu se-list-layer';
        listDiv.innerHTML = '' +
            '<div class="se-list-inner">' +
                '<ul class="se-list-basic">' +
                    '<li><button type="button" class="se-btn-list se-tooltip" data-command="OL">' +
                        '<i class="se-icon-list-number"></i>' +
                        '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.toolbar.orderList + '</span></span>' +
                    '</button></li>' +
                    '<li><button type="button" class="se-btn-list se-tooltip" data-command="UL">' +
                        '<i class="se-icon-list-bullets"></i>' +
                        '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.toolbar.unorderList + '</span></span>' +
                    '</button></li>' +
                '</ul>' +
            '</div>';

        return listDiv;
    },

    active: function (element) {
        const button = this.context.list.targetButton;
        const icon = this.context.list.targetIcon;
        const util = this.util;

        if (!element) {
            button.removeAttribute('data-focus');
            util.removeClass(icon, 'se-icon-list-bullets');
            util.addClass(icon, 'se-icon-list-number');
            util.removeClass(button, 'active');
        } else if (util.isList(element)) {
            const nodeName = element.nodeName;
            button.setAttribute('data-focus', nodeName);
            util.addClass(button, 'active');
            if (/UL/i.test(nodeName)) {
                util.removeClass(icon, 'se-icon-list-number');
                util.addClass(icon, 'se-icon-list-bullets');
            } else {
                util.removeClass(icon, 'se-icon-list-bullets');
                util.addClass(icon, 'se-icon-list-number');
            }
            
            return true;
        }

        return false;
    },

    on: function () {
        const listContext = this.context.list;
        const list = listContext._list;
        const currentList = listContext.targetButton.getAttribute('data-focus') || '';

        if (currentList !== listContext.currentList) {
            for (let i = 0, len = list.length; i < len; i++) {
                if (currentList === list[i].getAttribute('data-command')) {
                    this.util.addClass(list[i], 'active');
                } else {
                    this.util.removeClass(list[i], 'active');
                }
            }

            listContext.currentList = currentList;
        }
    },

    editList: function (command, selectedCells) {
        const selectedFormsts = !selectedCells ? this.getSelectedElementsAndComponents() : selectedCells;
        if (!selectedFormsts || selectedFormsts.length === 0) return;

        let isRemove = true;
        let edgeFirst = null;
        let edgeLast = null;
        
        // merge
        const firstSel = selectedFormsts[0];
        const lastSel = selectedFormsts[selectedFormsts.length - 1];
        let topEl = (this.util.isListCell(firstSel) || this.util.isComponent(firstSel)) && !firstSel.previousElementSibling ? firstSel.parentNode.previousElementSibling : firstSel.previousElementSibling;
        let bottomEl = (this.util.isListCell(lastSel) || this.util.isComponent(lastSel)) && !lastSel.nextElementSibling ? lastSel.parentNode.nextElementSibling : lastSel.nextElementSibling;

        for (let i = 0, len = selectedFormsts.length; i < len; i++) {
            if (!this.util.isList(this.util.getRangeFormatElement(selectedFormsts[i], function (current) {
                return this.getRangeFormatElement(current) && current !== selectedFormsts[i];
            }.bind(this.util)))) {
                isRemove = false;
                break;
            }
        }

        if (isRemove && (!topEl || (firstSel.tagName !== topEl.tagName || command !== topEl.tagName.toUpperCase())) && (!bottomEl || (lastSel.tagName !== bottomEl.tagName || command !== bottomEl.tagName.toUpperCase()))) {
            const currentFormat = this.util.getRangeFormatElement(this.getSelectionNode());
            const cancel = currentFormat && currentFormat.tagName === command;
            let rangeArr, tempList;
            const passComponent = function (current) {
                return !this.isComponent(current);
            }.bind(this.util);

            if (!cancel) tempList = this.util.createElement(command);

            for (let i = 0, len = selectedFormsts.length, r, o; i < len; i++) {
                o = this.util.getRangeFormatElement(selectedFormsts[i], passComponent);
                if (!o || !this.util.isList(o)) continue;

                if (!r) {
                    r = o;
                    rangeArr = {r: r, f: [this.util.getParentElement(selectedFormsts[i], 'LI')]};
                } else {
                    if (r !== o) {
                        const edge = this.detachRangeFormatElement(rangeArr.r, rangeArr.f, tempList, false, true);
                        if (!edgeFirst) edgeFirst = edge;
                        if (!cancel) tempList = this.util.createElement(command);
                        r = o;
                        rangeArr = {r: r, f: [this.util.getParentElement(selectedFormsts[i], 'LI')]};
                    } else {
                        rangeArr.f.push(this.util.getParentElement(selectedFormsts[i], 'LI'));
                    }
                }

                if (i === len - 1) {
                    edgeLast = this.detachRangeFormatElement(rangeArr.r, rangeArr.f, tempList, false, true);
                    if (!edgeFirst) edgeFirst = edgeLast;
                }
            }
        } else {
            const topElParent = topEl ? topEl.parentNode : topEl;
            const bottomElParent = bottomEl ? bottomEl.parentNode : bottomEl;
            topEl = topElParent && !this.util.isWysiwygDiv(topElParent) && topElParent.nodeName === command ? topElParent : topEl;
            bottomEl = bottomElParent && !this.util.isWysiwygDiv(bottomElParent) && bottomElParent.nodeName === command ? bottomElParent : bottomEl;

            const mergeTop = topEl && topEl.tagName === command;
            const mergeBottom = bottomEl && bottomEl.tagName === command;
            
            let list = mergeTop ? topEl : this.util.createElement(command);
            let firstList = null;
            let lastList = null;
            let topNumber = null;
            let bottomNumber = null;

            const passComponent = function (current) {
                return !this.isComponent(current) && !this.isList(current);
            }.bind(this.util);
            
            for (let i = 0, len = selectedFormsts.length, newCell, fTag, isCell, next, originParent, nextParent, parentTag, siblingTag, rangeTag; i < len; i++) {
                fTag = selectedFormsts[i];
                if (fTag.childNodes.length === 0 && !this.util._isIgnoreNodeChange(fTag)) {
                    this.util.removeItem(fTag);
                    continue;
                }
                next = selectedFormsts[i + 1];
                originParent = fTag.parentNode;
                nextParent = next ? next.parentNode : null;
                isCell = this.util.isListCell(fTag);
                rangeTag = this.util.isRangeFormatElement(originParent) ? originParent : null;
                parentTag = isCell && !this.util.isWysiwygDiv(originParent) ? originParent.parentNode : originParent;
                siblingTag = isCell && !this.util.isWysiwygDiv(originParent) ? !next ? originParent : originParent.nextSibling : fTag.nextSibling;

                newCell = this.util.createElement('LI');
                this.util.copyFormatAttributes(newCell, fTag);
                if (this.util.isComponent(fTag)) {
                    const isHR = /^HR$/i.test(fTag.nodeName);
                    if (!isHR) newCell.innerHTML = '<br>';
                    newCell.innerHTML += fTag.outerHTML;
                    if (isHR) newCell.innerHTML += '<br>';
                } else {
                    newCell.innerHTML = fTag.innerHTML;
                }
                list.appendChild(newCell);

                if (!next) lastList = list;
                if (!next || parentTag !== nextParent || this.util.isRangeFormatElement(siblingTag)) {
                    if (!firstList) firstList = list;
                    if ((!mergeTop || !next || parentTag !== nextParent) && !(next && this.util.isList(nextParent) && nextParent === originParent)) {
                        if (list.parentNode !== parentTag) parentTag.insertBefore(list, siblingTag);
                    }
                }

                this.util.removeItem(fTag);
                if (mergeTop && topNumber === null) topNumber = list.children.length - 1;
                if (next && this.util.getRangeFormatElement(nextParent, passComponent) !== this.util.getRangeFormatElement(originParent, passComponent)) {
                    list = this.util.createElement(command);
                }

                if (rangeTag && rangeTag.children.length === 0) this.util.removeItem(rangeTag);
            }

            if (topNumber) {
                firstList = firstList.children[topNumber];
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
            this.setRange(edgeFirst.sc, 0, edgeLast.ec, edgeLast.ec.textContent.length);
        } else {
            this.setRange(edgeFirst.ec, edgeFirst.ec.textContent.length, edgeLast.ec, edgeLast.ec.textContent.length);
        }

        this.submenuOff();

        // history stack
        this.history.push(false);
    },

    editInsideList: function (remove) {
        const selectedCells = this.getSelectedElements().filter(function (el) { return this.isListCell(el); }.bind(this.util));
        const cellsLen = selectedCells.length;
        if (cellsLen === 0 || (!remove && (!selectedCells[0].previousElementSibling || !selectedCells[cellsLen - 1].nextElementSibling))) return;

        let originList = selectedCells[0].parentNode;
        
        if (remove) {
            this.plugins.list.editList.call(this, originList.nodeName.toUpperCase(), selectedCells);
        } else {
            const sc = selectedCells[0], so = cellsLen > 1 ? 0 : 1, ec = selectedCells[cellsLen - 1], eo = 1;
            let innerList = this.util.createElement(originList.nodeName);
            let prev = sc.previousElementSibling;
            let next = sc.nextElementSibling;

            for (let i = 0, len = cellsLen, c; i < len; i++) {
                c = selectedCells[i];
                if (c.parentNode !== originList) {
                    this.plugins.list._insiedList(originList, innerList, prev, next);
                    originList = c.parentNode;
                    innerList = this.util.createElement(originList.nodeName);
                }
                
                prev = c.previousElementSibling;
                next = c.nextElementSibling;
                innerList.appendChild(c);
            }
            
            innerList = this.plugins.list._insiedList(originList, innerList, prev, next);
            this.setRange(sc, so, ec, eo);

            // history stack
            this.history.push(false);
        }
    },

    _insiedList: function (originList, innerList, prev, next) {
        let insertPrev = false;

        if (prev && innerList.tagName === prev.tagName) {
            const children = innerList.children;
            while (children[0]) {
                prev.appendChild(children[0]);
            }

            innerList = prev;
            insertPrev = true;
        }

        if (next && innerList.tagName === next.tagName) {
            const children = next.children;
            while (children[0]) {
                innerList.appendChild(children[0]);
            }

            const temp = next.nextElementSibling;
            next.parentNode.removeChild(next);
            next = temp;
        }

        if (!insertPrev) originList.insertBefore(innerList, next);

        return innerList;
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

        this.plugins.list.editList.call(this, command, null);
    }
};
