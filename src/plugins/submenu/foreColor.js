/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
SUNEDITOR.plugin.foreColor = {
    add: function (_this, targetElement) {
        /** set submenu */
        let listDiv = eval(this.setSubmenu());

        /** add event listeners */
        listDiv.getElementsByTagName('UL')[0].addEventListener('click', this.pickUp.bind(_this));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null;
    },

    setSubmenu: function () {
        const listDiv = document.createElement('DIV');
        listDiv.className = 'layer_editor layer_color';
        listDiv.style.display = 'none';

        const colorList = ['#ff0000', '#ff5e00', '#ffe400', '#abf200', '#00d8ff', '#0055ff', '#6600ff', '#ff00dd', '#000000', '#ffd8d8', '#fae0d4', '#faf4c0', '#e4f7ba', '#d4f4fa', '#d9e5ff', '#e8d9ff', '#ffd9fa',
            '#ffffff', '#ffa7a7', '#ffc19e', '#faed7d', '#cef279', '#b2ebf4', '#b2ccff', '#d1b2ff', '#ffb2f5', '#bdbdbd', '#f15f5f', '#f29661', '#e5d85c', '#bce55c', '#5cd1e5', '#6699ff', '#a366ff', '#f261df', '#8c8c8c',
            '#980000', '#993800', '#998a00', '#6b9900', '#008299', '#003399', '#3d0099', '#990085', '#353535', '#670000', '#662500', '#665c00', '#476600', '#005766', '#002266', '#290066', '#660058', '#222222'];

        let list = '<div class="inner_layer">' +
            '   <div class="pallet_bgcolor">' +
            '       <ul class="list_color list_bgcolor">';
        for (let i = 0, len = colorList.length; i < len; i++) {
            const color = colorList[i];
            list += '<li>' +
                '   <button type="button" class="' + (/ffffff/.test(color) ? ' color_white' : '') + '" data-value="' + color + '" style="background-color:' + color + ';">' + color + '' +
                '       <span class="bg_check"></span>' +
                '       <span class="bg_btnframe"></span>' +
                '   </button>' +
                '</li>';
        }
        list += '       </ul>' +
            '   </div>' +
            '</div>';

        listDiv.innerHTML = list;

        return listDiv;
    },

    pickUp: function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (!/^BUTTON$/i.test(e.target.tagName)) {
            return false;
        }

        this.focus();

        const newNode = document.createElement('SPAN'); newNode.style.color = e.target.getAttribute('data-value');
        this.wrapRangeToTag(newNode, ['color']);
        this.submenuOff();
    }
};