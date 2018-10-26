/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2018 JiHong Lee.
 * MIT license.
 */
'use strict';

export default {
    name: 'colorPicker',
    add: function (core) {
        const context = core.context;
        context.colorPicker = {
            colorListHTML: '',
            _previewEl: '',
            _colorInput: '',
            _defaultColor: '#000',
            _styleProperty: 'color',
            _currentColor: ''
        };

        /** set submenu */
        let listDiv = this.createColorList(core.context.user, core.lang);

        /** caching */
        context.colorPicker.colorListHTML = listDiv;

        /** empty memory */
        listDiv = null;
    },

    createColorList: function (user, lang) {
        const colorList = !user.colorList ?
            [
                '#ff0000', '#ff5e00', '#ffe400', '#abf200', '#00d8ff', '#0055ff', '#6600ff', '#ff00dd', '#000000', '#ffd8d8', '#fae0d4', '#faf4c0', '#e4f7ba', '#d4f4fa', '#d9e5ff', '#e8d9ff', '#ffd9fa',
                '#ffffff', '#ffa7a7', '#ffc19e', '#faed7d', '#cef279', '#b2ebf4', '#b2ccff', '#d1b2ff', '#ffb2f5', '#bdbdbd', '#f15f5f', '#f29661', '#e5d85c', '#bce55c', '#5cd1e5', '#6699ff', '#a366ff', '#f261df', '#8c8c8c',
                '#980000', '#993800', '#998a00', '#6b9900', '#008299', '#003399', '#3d0099', '#990085', '#353535', '#670000', '#662500', '#665c00', '#476600', '#005766', '#002266', '#290066', '#660058', '#222222'
            ] : user.colorList;

        let list = '<div class="inner_layer">' +
            '<div class="pallet_color_selector">' +
            '   <ul class="list_color">';
        for (let i = 0, len = colorList.length; i < len; i++) {
            const color = colorList[i];
            list += '<li>' +
                    '   <button type="button" data-value="' + color + '" title="' + color + '" style="background-color:' + color + ';"></button>' +
                    '</li>';
        }
        list += '</ul>' +
            '</div>' +
            '<form class="sub-form-group">' +
            '   <label>#</label>' +
            '   <input type="text" maxlength="6" class="sun-editor-id-submenu-color-input" />' +
            '   <div class="sun-editor-id-submenu-color-preview"></div>' +
            '   <button type="submit" data-command="100" class="sun-editor-id-submenu-color-submit" title="' + lang.dialogBox.submitButton + '"><span>' + lang.dialogBox.submitButton + '</span></button>' +
            '</form>' +
            '</div>';

        return list;
    },
    
    setCurrentColor: function (node, color) {
        const fillColor = color ? color : this.plugins.colorPicker.getColorInNode.call(this, node) || this.context.colorPicker._defaultColor;
        const hexColor = this.util.isHexColor(fillColor) ? fillColor : this.util.rgb2hex(fillColor);

        this.context.colorPicker._currentColor = hexColor;
        this.plugins.colorPicker.setColorPreviewEl.call(this, hexColor);
        this.plugins.colorPicker.setInputText.call(this, hexColor);
    },

    setColorPreviewEl: function (hexColorStr) {
        this.context.colorPicker._previewEl.style.backgroundColor = hexColorStr;
    },

    setInputText: function (hexColorStr) {
        this.context.colorPicker._colorInput.value = hexColorStr.replace('#', '');
    },

    getColorInNode: function (node) {
        let findedColor = '';
        const styleProperty = this.context.colorPicker._styleProperty;

        while (!this.util.isWysiwygDiv(node) && findedColor.length === 0) {
            if (node.nodeType === 1 && node.style[styleProperty]) findedColor = node.style[styleProperty];
            node = node.parentNode;
        }

        return findedColor;
    }
};