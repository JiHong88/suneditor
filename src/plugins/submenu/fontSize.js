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
            _sizeList: null,
            currentSize: ''
        };

        /** set submenu */
        let listDiv = this.setSubmenu.call(core);
        let listUl = listDiv.querySelector('ul');

        /** add event listeners */
        listUl.addEventListener('click', this.pickup.bind(core));

        context.fontSize._sizeList = listUl.querySelectorAll('li button');

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null, listUl = null;
    },

    setSubmenu: function () {
        const option = this.context.option;
        const lang = this.lang;
        const listDiv = this.util.createElement('DIV');

        listDiv.className = 'se-submenu se-list-layer';

        const sizeList = !option.fontSize ? [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72] : option.fontSize;

        let list = '<div class="se-list-inner se-list-font-size">' +
                '<ul class="se-list-basic">' +
                    '<li><button type="button" class="default_value se-btn-list" title="' + lang.toolbar.default + '">(' + lang.toolbar.default + ')</button></li>';
        for (let i = 0, unit = option.fontSizeUnit, len = sizeList.length, size; i < len; i++) {
            size = sizeList[i];
            list += '<li><button type="button" class="se-btn-list" data-value="' + size + unit + '" title="' + size + unit + '" style="font-size:' + size + unit + ';">' + size + '</button></li>';
        }
        list += '</ul></div>';

        listDiv.innerHTML = list;

        return listDiv;
    },

    on: function () {
        const fontSizeContext = this.context.fontSize;
        const sizeList = fontSizeContext._sizeList;
        const currentSize = this.commandMap.SIZE.textContent;

        if (currentSize !== fontSizeContext.currentSize) {
            for (let i = 0, len = sizeList.length; i < len; i++) {
                if (currentSize === sizeList[i].getAttribute('data-value')) {
                    this.util.addClass(sizeList[i], 'active');
                } else {
                    this.util.removeClass(sizeList[i], 'active');
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

        if (value) {
            const newNode = this.util.createElement('SPAN');
            newNode.style.fontSize = value;
            this.nodeChange(newNode, ['font-size'], null, null);
        } else {
            this.nodeChange(null, ['font-size'], ['span'], true);
        }

        this.submenuOff();
    }
};
