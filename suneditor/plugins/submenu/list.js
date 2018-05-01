/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
SUNEDITOR.plugin.list = {
    add: function (_this, targetElement) {
        /** set submenu */
        var listDiv = eval(this.setSubmenu());

        /** add event listeners */
        listDiv.getElementsByTagName('UL')[0].addEventListener('click', this.pickup.bind(_this));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);
    },

    setSubmenu: function () {
        var lang = SUNEDITOR.lang;
        var listDiv = document.createElement('DIV');
        listDiv.className = 'layer_editor layer_list';
        listDiv.style.display = 'none';

        listDiv.innerHTML = '' +
            '<div class="inner_layer">' +
            '   <ul class="list_editor">' +
            '       <li><button type="button" class="btn_edit" data-command="insertOrderedList" data-value="DECIMAL" title="' + lang.toolbar.orderList + '"><div class="ico_list_num"></div></button></li>' +
            '       <li><button type="button" class="btn_edit" data-command="insertUnorderedList" data-value="DISC" title="' + lang.toolbar.unorderList + '"><div class="ico_list_square"></div></button></li>' +
            '   </ul>' +
            '</div>';

        return listDiv;
    },

    pickup: function (e) {
        e.preventDefault();
        e.stopPropagation();

        var target = e.target;
        var command = null;
        var value = null;
        while (!value && !/UL/i.test(target.tagName)) {
            command = target.getAttribute('data-command');
            value = target.getAttribute('data-value');
            target = target.parentNode;
        }

        this.focus();
        this.execCommand(command, false, value);
        this.submenuOff();
    }
};