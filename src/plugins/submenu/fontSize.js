/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

export default {
    name: 'fontSize',
    add: function (core, targetElement) {
        /** set submenu */
        let listDiv = eval(this.setSubmenu(core.context.user));

        /** add event listeners */
        listDiv.getElementsByTagName('UL')[0].addEventListener('click', this.pickup.bind(core));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null;
    },

    setSubmenu: function (user) {
        const listDiv = document.createElement('DIV');
        listDiv.className = 'layer_editor layer_size';
        listDiv.style.display = 'none';

        const sizeList = !user.fontSize ? [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72] : user.fontSize;

        let list = '<div class="inner_layer">' +
            '   <ul class="list_editor font_size_list">';
        for (let i = 0, len = sizeList.length; i < len; i++) {
            const size = sizeList[i];
            list += '<li><button type="button" class="btn_edit" data-value="' + size + '" title="' + size + '" style="font-size:' + size + 'px;">' + size + '</button></li>';
        }
        list += '   </ul>' +
            '</div>';

        listDiv.innerHTML = list;

        return listDiv;
    },

    pickup: function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (!/^BUTTON$/i.test(e.target.tagName)) {
            return false;
        }

        this.focus();

        this.util.changeTxt(this.context.tool.fontSize, e.target.getAttribute('data-value'));
        const newNode = document.createElement('SPAN'); newNode.style.fontSize = e.target.getAttribute('data-value') + 'px';
        this.wrapRangeToTag(newNode, ['font-size']);

        this.submenuOff();
        this.focus();
    }
};
