/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

export default {
    name: 'hiliteColor',
    add: function (core, targetElement) {
        /** set submenu */
        let listDiv = eval(this.setSubmenu());

        /** add event listeners */
        listDiv.getElementsByTagName('UL')[0].addEventListener('click', this.colorPick.bind(core));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null;
    },

    setSubmenu: function () {
        const listDiv = document.createElement('DIV');
        listDiv.className = 'layer_editor';
        listDiv.style.display = 'none';

        const colorList = ['#1e9af9', '#00b8c6', '#6cce02', '#ff9702', '#ff0000', '#ff00dd', '#6600ff', '#cce9ff', '#fcfd4c', '#ffffff', '#dfdede', '#8c8c8c', '#000000', '#222222'];

        let list = '<div class="inner_layer">' +
            '   <div class="pallet_hilite_color">' +
            '       <ul class="list_color">';
        for (let i = 0, len = colorList.length; i < len; i++) {
            const color = colorList[i];
            list += '<li>' +
                '   <button type="button" class="' + (/ffffff/.test(color) ? ' color_white' : '') + '" data-value="' + color + '" title="' + color + '" style="background-color:' + color + ';"></button>' +
                '</li>';
        }
        list += '   </ul>' +
            '   </div>' +
            '</div>';

        listDiv.innerHTML = list;

        return listDiv;
    },

    colorPick: function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (!/^BUTTON$/i.test(e.target.tagName)) {
            return false;
        }

        this.focus();

        const newNode = document.createElement('SPAN'); newNode.style.backgroundColor = e.target.getAttribute('data-value');
        this.wrapRangeToTag(newNode, ['background-color']);

        this.submenuOff();
        this.focus();
    }
};
