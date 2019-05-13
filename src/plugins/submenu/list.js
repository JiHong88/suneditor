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
            '       <li><button type="button" class="btn_edit se-tooltip" data-command="insertOrderedList" data-value="OL">' +
            '           <i class="icon-list-number"></i>' +
            '           <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.toolbar.orderList + '</span></span>' +
            '       </button></li>' +
            '       <li><button type="button" class="btn_edit se-tooltip" data-command="insertUnorderedList" data-value="UL">' +
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
                if (currentList === list[i].getAttribute('data-value')) {
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
        let value = '';

        while (!command && !/^UL$/i.test(target.tagName)) {
            command = target.getAttribute('data-command');
            value = target.getAttribute('data-value');
            target = target.parentNode;
        }

        if (!command || !value) return;

        const formatElement = this.util.getFormatElement(this.getSelectionNode());
        const selectedFormsts = this.getSelectedFormatElements();
        let isRemove = true;

        for (let i = 0, len = selectedFormsts.length; i < len; i++) {
            if (!/^LI$/i.test(selectedFormsts[i].tagName)) {
                isRemove = false;
                break;
            }
        }

        if (isRemove) {
            const cancel = formatElement.parentNode.tagName === value;
            if (cancel) {
                this.detachRangeFormatElement(this.util.getRangeFormatElement(formatElement), selectedFormsts);
            } else {
                this.execCommand(command, false, null);
            }
        } else {
            let rightNode = formatElement.nextSibling;
            const list = this.util.createElement(value);
            const formatElementList = this.getSelectedFormatElements();
            
            for (let i = 0, len = formatElementList.length, fTag = null; i < len; i++) {
                fTag = formatElementList[i];

                if (i === len - 1) {
                    rightNode = fTag.nextSibling;
                }

                list.innerHTML += '<li>' + (this.util.isComponent(fTag) ? fTag.outerHTML : fTag.innerHTML) + '</li>';
                this.util.removeItem(fTag);
            }

            this.context.element.wysiwyg.insertBefore(list, rightNode);

            const edge = this.util.getEdgeChildNodes(list.firstElementChild, list.lastElementChild);
            if (selectedFormsts.length > 1) {
                this.setRange(edge.sc, 0, edge.ec, edge.ec.length);
            } else {
                this.setRange(edge.ec, edge.ec.length, edge.ec, edge.ec.length);
            }

            // history stack
            this.history.push();
        }

        this.submenuOff();
        this.focus();
    }
};
