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
    /**
     * @description Constructor
     * @param {Object} core Core object 
     */
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
        context.colorPicker.colorListHTML = this.createColorList(core, this._makeColorList);
    },

    /**
     * @description Create color list
     * @param {Object} core Core object 
     * @param {Function} makeColor this._makeColorList
     * @returns {String} HTML string
     */
    createColorList: function (core, makeColor) {
        const option = core.options;
        const lang = core.lang;
        const colorList = !option.colorList || option.colorList.length === 0 ?
            [
                '#ff0000', '#ff5e00', '#ffe400', '#abf200', '#00d8ff', '#0055ff', '#6600ff', '#ff00dd', '#000000',
                '#ffd8d8', '#fae0d4', '#faf4c0', '#e4f7ba', '#d4f4fa', '#d9e5ff', '#e8d9ff', '#ffd9fa', '#f1f1f1',
                '#ffa7a7', '#ffc19e', '#faed7d', '#cef279', '#b2ebf4', '#b2ccff', '#d1b2ff', '#ffb2f5', '#bdbdbd',
                '#f15f5f', '#f29661', '#e5d85c', '#bce55c', '#5cd1e5', '#6699ff', '#a366ff', '#f261df', '#8c8c8c',
                '#980000', '#993800', '#998a00', '#6b9900', '#008299', '#003399', '#3d0099', '#990085', '#353535',
                '#670000', '#662500', '#665c00', '#476600', '#005766', '#002266', '#290066', '#660058', '#222222'
            ] : option.colorList;

        let colorArr = [];
        let list = '<div class="se-list-inner">';
            for (let i = 0, len = colorList.length, color; i < len; i++) {
                color = colorList[i];
                if (!color) continue;
                
                if (typeof color === 'string') {
                    colorArr.push(color);
                    if (i < len - 1) continue;
                }
                if (colorArr.length > 0) {
                    list += '<div class="se-selector-color">' + makeColor(colorArr) + '</div>';
                    colorArr = [];
                }
                if (typeof color === 'object') {
                    list += '<div class="se-selector-color">' + makeColor(color) + '</div>';
                }
            }
            list += '' +
            '<form class="se-form-group">' +
                '<input type="text" maxlength="9" class="_se_color_picker_input se-color-input"/>' +
                '<button type="submit" class="se-btn-primary _se_color_picker_submit" title="' + lang.dialogBox.submitButton + '">' +
                    core.icons.checked +
                '</button>' +
                '<button type="button" class="se-btn _se_color_picker_remove" title="' + lang.toolbar.removeFormat + '">' +
                    core.icons.erase +
                '</button>' +
            '</form>' +
            '</div>';

        return list;
    },

    /**
     * @description Internal function used by this.createColorList
     * @param {Array} colorList Color list
     * @private
     */
    _makeColorList: function (colorList) {
        let list = '';

        list += '<ul class="se-color-pallet">';
        for (let i = 0, len = colorList.length, color; i < len; i++) {
            color = colorList[i];
            if (typeof color === 'string') {
                list += '<li>' +
                            '<button type="button" data-value="' + color + '" title="' + color + '" style="background-color:' + color + ';"></button>' +
                        '</li>';
            }
        }
        list += '</ul>';

        return list;
    },
    
    /**
     * @description Displays or resets the currently selected color at color list.
     * @param {Node} node Current Selected node
     * @param {String|null} color Color value
     */
    init: function (node, color) {
        const colorPicker = this.plugins.colorPicker;
        let fillColor = color ? color : colorPicker.getColorInNode.call(this, node) || this.context.colorPicker._defaultColor;
        fillColor = colorPicker.isHexColor(fillColor) ? fillColor : colorPicker.rgb2hex(fillColor) || fillColor;

        const colorList = this.context.colorPicker._colorList;
        if (colorList) {
            for (let i = 0, len = colorList.length; i < len; i++) {
                if (fillColor.toLowerCase() === colorList[i].getAttribute('data-value').toLowerCase()) {
                    this.util.addClass(colorList[i], 'active');
                } else {
                    this.util.removeClass(colorList[i], 'active');
                }
            }
        }

        colorPicker.setInputText.call(this, colorPicker.colorName2hex.call(this, fillColor));
    },

    /**
     * @description Store color values
     * @param {String} hexColorStr Hax color value
     */
    setCurrentColor: function (hexColorStr) {
        this.context.colorPicker._currentColor = hexColorStr;
        this.context.colorPicker._colorInput.style.borderColor = hexColorStr;
    },

    /**
     * @description Set color at input element
     * @param {String} hexColorStr Hax color value
     */
    setInputText: function (hexColorStr) {
        hexColorStr = /^#/.test(hexColorStr) ? hexColorStr : '#' + hexColorStr;
        this.context.colorPicker._colorInput.value = hexColorStr;
        this.plugins.colorPicker.setCurrentColor.call(this, hexColorStr);
    },

    /**
     * @description Gets color value at color property of node
     * @param {Node} node Selected node 
     * @returns {String}
     */
    getColorInNode: function (node) {
        let findColor = '';
        const styleProperty = this.context.colorPicker._styleProperty;

        while (node && !this.util.isWysiwygDiv(node) && findColor.length === 0) {
            if (node.nodeType === 1 && node.style[styleProperty]) findColor = node.style[styleProperty];
            node = node.parentNode;
        }

        return findColor;
    },

    /**
     * @description Function to check hex format color
     * @param {String} str Color value
     */
    isHexColor: function (str) {
        return /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(str);
    },

    /**
     * @description Function to convert hex format to a rgb color
     * @param {String} rgb RGB color format
     * @returns {String}
     */
    rgb2hex: function (rgb) {
        const rgbMatch = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);

        return (rgbMatch && rgbMatch.length === 4) ? "#" +
            ("0" + parseInt(rgbMatch[1],10).toString(16)).slice(-2) +
            ("0" + parseInt(rgbMatch[2],10).toString(16)).slice(-2) +
            ("0" + parseInt(rgbMatch[3],10).toString(16)).slice(-2) : '';
    },

    /**
     * @description Converts color values of other formats to hex color values and returns.
     * @param {String} colorName Color value
     * @returns {String}
     */
    colorName2hex: function (colorName) {
        if (/^#/.test(colorName)) return colorName;
        var temp = this.util.createElement('div');
        temp.style.display = 'none';
        temp.style.color = colorName;
        var colors = this._w.getComputedStyle(this._d.body.appendChild(temp)).color.match(/\d+/g).map(function (a) { return parseInt(a,10); });
        this.util.removeItem(temp);
        return (colors.length >= 3) ? '#' + (((1 << 24) + (colors[0] << 16) + (colors[1] << 8) + colors[2]).toString(16).substr(1)) : false;
    }
};