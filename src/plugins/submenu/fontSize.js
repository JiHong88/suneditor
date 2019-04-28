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
        const context = core.context;
        context.fontSize = {
            _sizeList: [],
            currentSize: ''
        };

        /** set submenu */
        let listDiv = eval(this.setSubmenu.call(core));

        /** add event listeners */
        listDiv.getElementsByTagName('UL')[0].addEventListener('click', this.pickup.bind(core));

        context.fontSize._sizeList = listDiv.getElementsByTagName('UL')[0].querySelectorAll('li button');

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null;
    },

    setSubmenu: function () {
        const option = this.context.option;
        const lang = this.lang;
        const listDiv = this.util.createElement('DIV');

        listDiv.className = 'sun-editor-submenu layer_editor';
        listDiv.style.display = 'none';

        const sizeList = !option.fontSize ? [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72] : option.fontSize;

        let list = '<div class="inner_layer layer_size">' +
            '   <ul class="list_editor font_size_list">' +
            '       <li><button type="button" class="default_value btn_edit" title="' + lang.toolbar.default + '">(' + lang.toolbar.default + ')</button></li>';
        for (let i = 0, len = sizeList.length; i < len; i++) {
            const size = sizeList[i];
            list += '<li><button type="button" class="btn_edit" data-value="' + size + '" title="' + size + '" style="font-size:' + size + 'px;">' + size + '</button></li>';
        }
        list += '   </ul>' +
            '</div>';

        listDiv.innerHTML = list;

        return listDiv;
    },

    on: function () {
        const fontSizeContext = this.context.fontSize;
        const sizeList = fontSizeContext._sizeList;
        const currentSize = this.commandMap.SIZE.getAttribute('title') || '';

        if (currentSize !== fontSizeContext.currentSize) {
            for (let i = 0, len = sizeList.length; i < len; i++) {
                if (currentSize === sizeList[i].getAttribute('data-value')) {
                    this.util.addClass(sizeList[i], 'on');
                } else {
                    this.util.removeClass(sizeList[i], 'on');
                }
            }

            fontSizeContext.currentSize = currentSize;
        }
    },

    pickup: function (e) {
        if (!/^BUTTON$/i.test(e.target.tagName)) return false;
        
        e.preventDefault();
        e.stopPropagation();

        const value = e.target.getAttribute('data-value');

        // if (value !== this.context.fontSize.currentSize) {}

        if (value) {
            const newNode = this.util.createElement('SPAN');
            newNode.style.fontSize = value + 'px';
            this.nodeChange(newNode, ['font-size']);
        } else {
            this.nodeChange(null, ['font-size']);
        }

        this.submenuOff();
        this.focus();
    }
};
