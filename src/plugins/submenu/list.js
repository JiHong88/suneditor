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
        let listDiv = eval(this.setSubmenu());

        /** add event listeners */
        listDiv.getElementsByTagName('UL')[0].addEventListener('click', this.pickup.bind(_this));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null;
    },

    setSubmenu: function () {
        const lang = SUNEDITOR.lang;
        const listDiv = document.createElement('DIV');

        listDiv.className = 'layer_editor layer_list';
        listDiv.style.display = 'none';
        listDiv.innerHTML = '' +
            '<div class="inner_layer">' +
            '   <ul class="list_editor">' +
            '       <li><button type="button" class="btn_edit" data-command="insertOrderedList" data-value="DECIMAL" title="' + lang.toolbar.orderList + '"><div class="icon-list-number"></div></button></li>' +
            '       <li><button type="button" class="btn_edit" data-command="insertUnorderedList" data-value="DISC" title="' + lang.toolbar.unorderList + '"><div class="icon-list-bullets"></div></button></li>' +
            '   </ul>' +
            '</div>';

        return listDiv;
    },

    pickup: function (e) {
        e.preventDefault();
        e.stopPropagation();

        let target = e.target;
        let command = null;
        let value = null;

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