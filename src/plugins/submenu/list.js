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
        /** set submenu */
        let listDiv = eval(this.setSubmenu(core.lang));

        /** add event listeners */
        listDiv.getElementsByTagName('UL')[0].addEventListener('click', this.pickup.bind(core));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null;
    },

    setSubmenu: function (lang) {
        const listDiv = document.createElement('DIV');

        listDiv.className = 'layer_editor layer_list';
        listDiv.style.display = 'none';
        listDiv.innerHTML = '' +
            '<div class="inner_layer">' +
            '   <ul class="list_editor">' +
            '       <li><button type="button" class="btn_edit" data-command="insertOrderedList" data-value="OL" title="' + lang.toolbar.orderList + '"><div class="icon-list-number"></div></button></li>' +
            '       <li><button type="button" class="btn_edit" data-command="insertUnorderedList" data-value="UL" title="' + lang.toolbar.unorderList + '"><div class="icon-list-bullets"></div></button></li>' +
            '   </ul>' +
            '</div>';

        return listDiv;
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

        const formatElement = this.util.getFormatElement(this.getSelectionNode());

        if (/^LI$/i.test(formatElement.tagName)) {
            const cancel = formatElement.parentNode.tagName === value;
            this.execCommand(command, false, null);
            if (cancel) this.execCommand('formatBlock', false, 'DIV');
        } else {
            let rightNode = formatElement.nextSibling;
            let pNode = formatElement.parentNode;

            const list = document.createElement(value);
            const formatElementList = this.getSelectedFormatElements();
            
            for (let i = 0, len = formatElementList.length, fTag = null; i < len; i++) {
                fTag = formatElementList[i];

                if (i === len - 1) {
                    rightNode = fTag.nextSibling;
                    pNode = fTag.parentNode;
                }

                list.innerHTML += '<li>' + fTag.innerHTML + '</li>';
                this.util.removeItem(fTag);
            }

            pNode.insertBefore(list, rightNode);
        }

        this.submenuOff();
        this.focus();
    }
};
