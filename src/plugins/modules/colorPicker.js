/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2018 JiHong Lee.
 * MIT license.
 */
'use strict';

import util from '../../lib/util';

export default {
    name: 'colorPicker',
    add: function (core) {
        const context = core.context;
        context.colorPicker = {
            colorListHTML: '',
            _colorInput: '',
            _defaultColor: '#000',
            _styleProperty: 'color',
            _currentColor: '',
            _colorList: []
        };

        /** set submenu */
        let listDiv = this.createColorList(core.context.option, core.lang);

        /** caching */
        context.colorPicker.colorListHTML = listDiv;

        /** empty memory */
        listDiv = null;
    },

    createColorList: function (option, lang) {
        const colorList = !option.colorList ?
            [
                '#ff0000', '#ff5e00', '#ffe400', '#abf200', '#00d8ff', '#0055ff', '#6600ff', '#ff00dd', '#000000', '#ffd8d8', '#fae0d4', '#faf4c0', '#e4f7ba', '#d4f4fa', '#d9e5ff', '#e8d9ff', '#ffd9fa',
                '#ffffff', '#ffa7a7', '#ffc19e', '#faed7d', '#cef279', '#b2ebf4', '#b2ccff', '#d1b2ff', '#ffb2f5', '#bdbdbd', '#f15f5f', '#f29661', '#e5d85c', '#bce55c', '#5cd1e5', '#6699ff', '#a366ff', '#f261df', '#8c8c8c',
                '#980000', '#993800', '#998a00', '#6b9900', '#008299', '#003399', '#3d0099', '#990085', '#353535', '#670000', '#662500', '#665c00', '#476600', '#005766', '#002266', '#290066', '#660058', '#222222'
            ] : option.colorList;

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
            '   <button type="submit" data-command="100" class="sun-editor-id-submenu-color-submit" title="' + lang.dialogBox.submitButton + '"><span>' + lang.dialogBox.submitButton + '</span></button>' +
            '</form>' +
            '</div>';

        return list;
    },
    
    init: function (node, color) {
        const colorPicker = this.plugins.colorPicker;
        let fillColor = color ? color : colorPicker.getColorInNode.call(this, node) || this.context.colorPicker._defaultColor;
        fillColor = colorPicker.isHexColor(fillColor) ? fillColor : colorPicker.rgb2hex(fillColor);

        const colorList = this.context.colorPicker._colorList;
        if (colorList) {
            for (let i = 0, len = colorList.length; i < len; i++) {
                if (fillColor === colorList[i].getAttribute('data-value')) {
                    colorList[i].style.border = '2px dashed #000';
                } else {
                    colorList[i].style.border = '';
                }
            }
        }

        colorPicker.setInputText.call(this, fillColor);
    },

    setCurrentColor: function (hexColorStr) {
        this.context.colorPicker._currentColor = hexColorStr;
        this.context.colorPicker._colorInput.style.borderColor = hexColorStr;
    },

    setInputText: function (hexColorStr) {
        this.context.colorPicker._colorInput.value = hexColorStr.replace('#', '');
        this.plugins.colorPicker.setCurrentColor.call(this, hexColorStr);
    },

    getColorInNode: function (node) {
        let findedColor = '';
        const styleProperty = this.context.colorPicker._styleProperty;

        while (!util.isWysiwygDiv(node) && findedColor.length === 0) {
            if (node.nodeType === 1 && node.style[styleProperty]) findedColor = node.style[styleProperty];
            node = node.parentNode;
        }

        return findedColor;
    },

    /**
     * @description Function to check hex format color
     * @param {String} str
     */
    isHexColor: function (str) {
        return /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(str);
    },

    /**
     * @description Function to convert hex format to a rgb color
     * @param {String} rgb - RGB color format
     * @returns {String}
     */
    rgb2hex: function (rgb) {
        rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);

        return (rgb && rgb.length === 4) ? "#" +
            ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
    }
};