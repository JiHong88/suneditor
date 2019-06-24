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
            _fontList: [],
            currentFont: ''
        };

        /** set submenu */
        let listDiv = eval(this.setSubmenu.call(core));

        /** add event listeners */
        listDiv.getElementsByClassName('list_family')[0].addEventListener('click', this.pickup.bind(core));

        context.font._fontList = listDiv.getElementsByTagName('UL')[0].querySelectorAll('li button');

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null;
    },

    setSubmenu: function () {
        const option = this.context.option;
        const lang = this.lang;
        const listDiv = this.util.createElement('DIV');

        listDiv.className = 'layer_editor';
        listDiv.style.display = 'none';

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

        let list = '<div class="sun-editor-submenu inner_layer list_family">' +
            '   <ul class="list_editor">' +
            '       <li><button type="button" class="default_value btn_edit" title="' + lang.toolbar.default + '">(' + lang.toolbar.default + ')</button></li>';
        for (i = 0, len = fontList.length; i < len; i++) {
            font = fontList[i];
            text = font.split(',')[0];
            list += '<li><button type="button" class="btn_edit" data-value="' + font + '" data-txt="' + text + '" title="' + text + '" style="font-family:' + font + ';">' + text + '</button></li>';
        }
        list += '   </ul>';
        list += '</div>';
        listDiv.innerHTML = list;

        return listDiv;
    },

    on: function () {
        const fontContext = this.context.font;
        const fontList = fontContext._fontList;
        const currentFont = this.commandMap.FONT.getAttribute('title') || '';

        if (currentFont !== fontContext.currentFont) {
            for (let i = 0, len = fontList.length; i < len; i++) {
                if (currentFont === fontList[i].getAttribute('data-value')) {
                    this.util.addClass(fontList[i], 'on');
                } else {
                    this.util.removeClass(fontList[i], 'on');
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
            this.nodeChange(newNode, ['font-family']);
        } else {
            this.nodeChange(null, ['font-family']);
        }
        
        this.submenuOff();
    }
};
