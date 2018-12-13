/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

import util from '../../lib/util';
import colorPicker from '../modules/colorPicker';

export default {
    name: 'hiliteColor',
    add: function (core, targetElement) {
        core.addModule([colorPicker]);

        const context = core.context;
        context.hiliteColor = {
            previewEl: null,
            colorInput: null
        };

        /** set submenu */
        let listDiv = eval(this.setSubmenu(context.colorPicker.colorListHTML));
        context.hiliteColor.colorInput = listDiv.getElementsByClassName('sun-editor-id-submenu-color-input')[0];

        /** add event listeners */
        context.hiliteColor.colorInput.addEventListener('keyup', this.onChangeInput.bind(core));
        listDiv.getElementsByClassName('sun-editor-id-submenu-color-submit')[0].addEventListener('click', this.submit.bind(core));
        listDiv.getElementsByTagName('UL')[0].addEventListener('click', this.pickup.bind(core));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null;
    },

    setSubmenu: function (colorArea) {
        const listDiv = util.createElement('DIV');

        listDiv.className = 'sun-editor-submenu layer_editor';
        listDiv.style.display = 'none';
        listDiv.innerHTML = colorArea;

        return listDiv;
    },

    on: function () {
        const contextPicker = this.context.colorPicker;

        contextPicker._colorInput = this.context.hiliteColor.colorInput;
        contextPicker._defaultColor = '#FFFFFF';
        contextPicker._styleProperty = 'backgroundColor';

        this.plugins.colorPicker.init.call(this, this.getSelectionNode(), null);
    },

    onChangeInput: function (e) {
        this.plugins.colorPicker.setCurrentColor.call(this, '#' + e.target.value);
    },

    submit: function () {
        this.plugins.hiliteColor.applyColor.call(this, this.context.colorPicker._currentColor);
    },

    pickup: function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (!/^BUTTON$/i.test(e.target.tagName)) {
            return false;
        }

        this.plugins.hiliteColor.applyColor.call(this, e.target.getAttribute('data-value'));
    },

    applyColor: function (color) {
        const newNode = util.createElement('SPAN');
        newNode.style.backgroundColor = color;

        this.nodeChange(newNode, ['background-color']);
        
        this.submenuOff();
        this.focus();
    }
};
