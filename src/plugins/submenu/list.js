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

    editList: function (command, selectedCells, detach) {
        const selectedFormats = !selectedCells ? this.getSelectedElementsAndComponents(false) : selectedCells;
        if (!selectedFormats || selectedFormats.length === 0) return;
        
        const util = this.util;
        util.sortByDepth(selectedFormats, true);

        // merge
        let firstSel = selectedFormats[0];
        let lastSel = selectedFormats[selectedFormats.length - 1];
        let topEl = (util.isListCell(firstSel) || util.isComponent(firstSel)) && !firstSel.previousElementSibling ? firstSel.parentNode.previousElementSibling : firstSel.previousElementSibling;
        let bottomEl = (util.isListCell(lastSel) || util.isComponent(lastSel)) && !lastSel.nextElementSibling ? lastSel.parentNode.nextElementSibling : lastSel.nextElementSibling;

        const range = this.getRange();
        const originRange = {
            sc: range.startContainer,
            so: range.startOffset,
            ec: range.endContainer,
            eo: range.endOffset
        };

        let isRemove = true;

        for (let i = 0, len = selectedFormats.length; i < len; i++) {
            if (!util.isList(util.getRangeFormatElement(selectedFormats[i], function (current) {
                return this.getRangeFormatElement(current) && current !== selectedFormats[i];
            }.bind(util)))) {
                isRemove = false;
                break;
            }
        }

        if (isRemove && (!topEl || (firstSel.tagName !== topEl.tagName || command !== topEl.tagName.toUpperCase())) && (!bottomEl || (lastSel.tagName !== bottomEl.tagName || command !== bottomEl.tagName.toUpperCase()))) {
            if (detach) {
                for (let i = 0, len = selectedFormats.length; i < len; i++) {
                    for (let j = i - 1; j >= 0; j--) {
                        if (selectedFormats[j].contains(selectedFormats[i])) {
                            selectedFormats.splice(i, 1);
                            i--; len--;
                            break;
                        }
                    }
                }
            }

            const currentFormat = util.getRangeFormatElement(firstSel);
            const cancel = currentFormat && currentFormat.tagName === command;
            let rangeArr, tempList;
            const passComponent = function (current) {
                return !this.isComponent(current);
            }.bind(util);
            
            if (!cancel) tempList = util.createElement(command);

            for (let i = 0, len = selectedFormats.length, r, o; i < len; i++) {
                o = util.getRangeFormatElement(selectedFormats[i], passComponent);
                if (!o || !util.isList(o)) continue;

                if (!r) {
                    r = o;
                    rangeArr = {r: r, f: [util.getParentElement(selectedFormats[i], 'LI')]};
                } else {
                    if (r !== o) {
                        if (detach && util.isListCell(o.parentNode)) {
                            this.plugins.list._detachNested.call(this, rangeArr.f);
                        } else {
                            this.detachRangeFormatElement(rangeArr.f[0].parentNode, rangeArr.f, tempList, false, true);
                        }
                        
                        o = selectedFormats[i].parentNode;
                        if (!cancel) tempList = util.createElement(command);
                        
                        r = o;
                        rangeArr = {r: r, f: [util.getParentElement(selectedFormats[i], 'LI')]};
                    } else {
                        rangeArr.f.push(util.getParentElement(selectedFormats[i], 'LI'));
                    }
                }
                
                if (i === len - 1) {
                    if (detach && util.isListCell(o.parentNode)) {
                        this.plugins.list._detachNested.call(this, rangeArr.f);
                    } else {
                        this.detachRangeFormatElement(rangeArr.f[0].parentNode, rangeArr.f, tempList, false, true);
                    }
                }
            }
        } else {
            const topElParent = topEl ? topEl.parentNode : topEl;
            const bottomElParent = bottomEl ? bottomEl.parentNode : bottomEl;
            topEl = topElParent && !util.isWysiwygDiv(topElParent) && topElParent.nodeName === command ? topElParent : topEl;
            bottomEl = bottomElParent && !util.isWysiwygDiv(bottomElParent) && bottomElParent.nodeName === command ? bottomElParent : bottomEl;

            const mergeTop = topEl && topEl.tagName === command;
            const mergeBottom = bottomEl && bottomEl.tagName === command;
            
            let list = mergeTop ? topEl : util.createElement(command);
            let firstList = null;
            let lastList = null;
            let topNumber = null;
            let bottomNumber = null;

            const passComponent = function (current) {
                return !this.isComponent(current) && !this.isList(current);
            }.bind(util);
            
            for (let i = 0, len = selectedFormats.length, newCell, fTag, isCell, next, originParent, nextParent, parentTag, siblingTag, rangeTag; i < len; i++) {
                fTag = selectedFormats[i];
                if (fTag.childNodes.length === 0 && !util._isIgnoreNodeChange(fTag)) {
                    util.removeItem(fTag);
                    continue;
                }
                next = selectedFormats[i + 1];
                originParent = fTag.parentNode;
                nextParent = next ? next.parentNode : null;
                isCell = util.isListCell(fTag);
                rangeTag = util.isRangeFormatElement(originParent) ? originParent : null;
                parentTag = isCell && !util.isWysiwygDiv(originParent) ? originParent.parentNode : originParent;
                siblingTag = isCell && !util.isWysiwygDiv(originParent) ? (!next || util.isListCell(parentTag)) ? originParent : originParent.nextSibling : fTag.nextSibling;

                newCell = util.createElement('LI');
                util.copyFormatAttributes(newCell, fTag);
                if (util.isComponent(fTag)) {
                    const isHR = /^HR$/i.test(fTag.nodeName);
                    if (!isHR) newCell.innerHTML = '<br>';
                    newCell.innerHTML += fTag.outerHTML;
                    if (isHR) newCell.innerHTML += '<br>';
                } else {
                    const fChildren = fTag.childNodes;
                    while (fChildren[0]) {
                        newCell.appendChild(fChildren[0]);
                    }
                }
                list.appendChild(newCell);

                if (!next) lastList = list;
                if (!next || parentTag !== nextParent || util.isRangeFormatElement(siblingTag)) {
                    if (!firstList) firstList = list;
                    if ((!mergeTop || !next || parentTag !== nextParent) && !(next && util.isList(nextParent) && nextParent === originParent)) {
                        if (list.parentNode !== parentTag) parentTag.insertBefore(list, siblingTag);
                    }
                }

                util.removeItem(fTag);
                if (mergeTop && topNumber === null) topNumber = list.children.length - 1;
                if (next && (util.getRangeFormatElement(nextParent, passComponent) !== util.getRangeFormatElement(originParent, passComponent) || (util.isList(nextParent) && util.isList(originParent) && util.getElementDepth(nextParent) !== util.getElementDepth(originParent)))) {
                    list = util.createElement(command);
                }

                if (rangeTag && rangeTag.children.length === 0) util.removeItem(rangeTag);
            }

            if (topNumber) {
                firstList = firstList.children[topNumber];
            }

            if (mergeBottom) {
                bottomNumber = list.children.length - 1;
                list.innerHTML += bottomEl.innerHTML;
                lastList = list.children[bottomNumber];
                util.removeItem(bottomEl);
            }
        }
        
        return originRange;
    },

    _detachNested: function (cells) {
        const first = cells[0];
        const last = cells[cells.length - 1];
        const next = last.nextElementSibling;
        const originList = first.parentNode;
        const sibling = originList.parentNode.nextElementSibling;
        const parentNode = originList.parentNode.parentNode;

        for (let c = 0, cLen = cells.length; c < cLen; c++) {
            parentNode.insertBefore(cells[c], sibling);
        }

        if (next && originList.children.length > 0) {
            const newList = originList.cloneNode(false);
            const children = originList.childNodes;
            const index = this.util.getPositionIndex(next);
            while (children[index]) {
                newList.appendChild(children[index]);
            }
            last.appendChild(newList);
        }

        if (originList.children.length === 0) this.util.removeItem(originList);

        const edge = this.util.getEdgeChildNodes(first, last);

        return {
            cc: first.parentNode,
            sc: edge.sc,
            ec: edge.ec
        };
    },

    editInsideList: function (remove, selectedCells) {
        selectedCells = !selectedCells ? this.getSelectedElements().filter(function (el) { return this.isListCell(el); }.bind(this.util)) : selectedCells;
        const cellsLen = selectedCells.length;
        if (cellsLen === 0 || (!remove && (!this.util.isListCell(selectedCells[0].previousElementSibling) && !this.util.isListCell(selectedCells[cellsLen - 1].nextElementSibling)))) {
            return {
                sc: selectedCells[0],
                so: 0,
                ec: selectedCells[cellsLen - 1],
                eo: 1
            };
        }

        let originList = selectedCells[0].parentNode;
        let lastCell = selectedCells[cellsLen - 1];
        let range = null;

        if (remove) {
            if (originList !== lastCell.parentNode && this.util.isList(lastCell.parentNode.parentNode) && lastCell.nextElementSibling) {
                lastCell = lastCell.nextElementSibling;
                while (lastCell) {
                    selectedCells.push(lastCell);
                    lastCell = lastCell.nextElementSibling;
                }
            }
            range = this.plugins.list.editList.call(this, originList.nodeName.toUpperCase(), selectedCells, true);
        } else {
            range = { sc: selectedCells[0], so: cellsLen > 1 || !this.getRange().collapsed ? 0 : 1, ec: lastCell, eo: 1 };
            let innerList = this.util.createElement(originList.nodeName);
            let prev = range.sc.previousElementSibling;
            let next = range.sc.nextElementSibling;

            for (let i = 0, len = cellsLen, c; i < len; i++) {
                c = selectedCells[i];
                if (c.parentNode !== originList) {
                    this.plugins.list._insiedList.call(this, originList, innerList, prev, next);
                    originList = c.parentNode;
                    innerList = this.util.createElement(originList.nodeName);
                }
                
                prev = c.previousElementSibling;
                next = c.nextElementSibling;
                innerList.appendChild(c);
            }
            
            innerList = this.plugins.list._insiedList.call(this, originList, innerList, prev, next);
        }

        return range;
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

        if (!insertPrev) {
            if (this.util.isListCell(prev)) {
                originList = prev;
                next = null;
            }

            originList.insertBefore(innerList, next);
            this.util.mergeSameTags(originList, null, null, false);
            this.util.mergeNestedTags(originList);
        }

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

        const range = this.plugins.list.editList.call(this, command, null, false);
        this.setRange(range.sc, range.so, range.ec, range.eo);

        this.submenuOff();

        // history stack
        this.history.push(false);
    }
};
