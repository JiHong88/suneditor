/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

import colorPicker from '../modules/colorPicker';

export default {
    name: 'fontColor',
    add: function (core, targetElement) {
        core.addModule([colorPicker]);

        const context = core.context;
        context.fontColor = {
            previewEl: null,
            colorInput: null,
            colorList: null
        };

        /** set submenu */
        let listDiv = eval(this.setSubmenu.call(core));
        context.fontColor.colorInput = listDiv.getElementsByClassName('sun-editor-id-submenu-color-input')[0];

        /** add event listeners */
        context.fontColor.colorInput.addEventListener('keyup', this.onChangeInput.bind(core));
        listDiv.getElementsByClassName('sun-editor-id-submenu-color-submit')[0].addEventListener('click', this.submit.bind(core));
        listDiv.getElementsByTagName('UL')[0].addEventListener('click', this.pickup.bind(core));

        context.fontColor.colorList = listDiv.getElementsByTagName('UL')[0].querySelectorAll('li button');

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null;
    },

    setSubmenu: function () {
        const colorArea = this.context.colorPicker.colorListHTML;
        const listDiv = this.util.createElement('DIV');

        listDiv.className = 'sun-editor-submenu layer_editor';
        listDiv.style.display = 'none';
        listDiv.innerHTML = colorArea;

        return listDiv;
    },

    on: function () {
        const contextPicker = this.context.colorPicker;
        const contextFontColor = this.context.fontColor;

        contextPicker._colorInput = contextFontColor.colorInput;
        contextPicker._defaultColor = '#000000';
        contextPicker._styleProperty = 'color';
        contextPicker._colorList = contextFontColor.colorList;
        
        this.plugins.colorPicker.init.call(this, this.getSelectionNode(), null);
    },

    onChangeInput: function (e) {
        const value = e.target.value.trim();
        this.plugins.colorPicker.setCurrentColor.call(this, !value ? '' : '#' + value);
    },

    submit: function () {
        this.plugins.fontColor.applyColor.call(this, this.context.colorPicker._currentColor);
    },

    pickup: function (e) {
        e.preventDefault();
        e.stopPropagation();

        this.plugins.fontColor.applyColor.call(this, e.target.getAttribute('data-value'));
    },

    applyColor: function (color) {
        if (!color) return;

        const newNode = this.util.createElement('SPAN');
        newNode.style.color = color;
        this.nodeChange(newNode, ['color']);

        this.submenuOff();
        this.focus();
    }
};
