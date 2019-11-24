/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

export default {
    name: 'font',
    add: function (core, targetElement) {
        const context = core.context;
        context.font = {
            _fontList: null,
            currentFont: ''
        };

        /** set submenu */
        let listDiv = this.setSubmenu.call(core);

        /** add event listeners */
        listDiv.querySelector('.se-list-font-family').addEventListener('click', this.pickup.bind(core));

        context.font._fontList = listDiv.querySelectorAll('ul li button');

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null;
    },

    setSubmenu: function () {
        const option = this.context.option;
        const lang = this.lang;
        const listDiv = this.util.createElement('DIV');

        listDiv.className = 'se-list-layer';

        let font, text, i, len;
        let fontList = !option.font ?
            [
                'Arial',
                'Comic Sans MS',
                'Courier New',
                'Impact',
                'Georgia',
                'tahoma',
                'Trebuchet MS',
                'Verdana'
            ] : option.font;

        let list = '<div class="se-submenu se-list-inner se-list-font-family">' +
                '<ul class="se-list-basic">' +
                    '<li><button type="button" class="default_value se-btn-list" title="' + lang.toolbar.default + '">(' + lang.toolbar.default + ')</button></li>';
        for (i = 0, len = fontList.length; i < len; i++) {
            font = fontList[i];
            text = font.split(',')[0];
            list += '<li><button type="button" class="se-btn-list" data-value="' + font + '" data-txt="' + text + '" title="' + text + '" style="font-family:' + font + ';">' + text + '</button></li>';
        }
        list += '</ul></div>';
        listDiv.innerHTML = list;

        return listDiv;
    },

    on: function () {
        const fontContext = this.context.font;
        const fontList = fontContext._fontList;
        const currentFont = this.commandMap.FONT.textContent;

        if (currentFont !== fontContext.currentFont) {
            for (let i = 0, len = fontList.length; i < len; i++) {
                if (currentFont === fontList[i].getAttribute('data-value')) {
                    this.util.addClass(fontList[i], 'active');
                } else {
                    this.util.removeClass(fontList[i], 'active');
                }
            }

            fontContext.currentFont = currentFont;
        }
    },

    pickup: function (e) {
        if (!/^BUTTON$/i.test(e.target.tagName)) return false;

        e.preventDefault();
        e.stopPropagation();

        const value = e.target.getAttribute('data-value');

        if (value) {
            const newNode = this.util.createElement('SPAN');
            newNode.style.fontFamily = value;
            this.nodeChange(newNode, ['font-family'], null, null);
        } else {
            this.nodeChange(null, ['font-family'], ['span'], true);
        }
        
        this.submenuOff();
    }
};
