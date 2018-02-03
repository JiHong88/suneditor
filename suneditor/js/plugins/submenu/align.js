/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
SUNEDITOR.plugin.align = {
    add: function (_this, targetElement) {
        /** set submenu */
        var listDiv = eval(this.setSubmenu());

        /** add event listeners */
        listDiv.getElementsByTagName('UL')[0].addEventListener('click', this.pickup.bind(_this));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);
    },

    setSubmenu: function () {
        var lang = SUNEDITOR.lang;
        var listDiv = document.createElement('DIV');
        listDiv.className = 'layer_editor layer_align';
        listDiv.style.display = 'none';

        listDiv.innerHTML = '' +
            '<div class="inner_layer">' +
            '   <ul class="list_editor">' +
            '       <li><button type="button" class="btn_edit btn_align" data-command="justifyleft" title="' + lang.toolbar.alignLeft + '"><span class="img_editor ico_align_l"></span>' + lang.toolbar.alignLeft + '</button></li>' +
            '       <li><button type="button" class="btn_edit btn_align" data-command="justifycenter" title="' + lang.toolbar.alignCenter + '"><span class="img_editor ico_align_c"></span>' + lang.toolbar.alignCenter + '</button></li>' +
            '       <li><button type="button" class="btn_edit btn_align" data-command="justifyright" title="' + lang.toolbar.alignRight + '"><span class="img_editor ico_align_r"></span>' + lang.toolbar.alignRight + '</button></li>' +
            '       <li><button type="button" class="btn_edit btn_align" data-command="justifyfull" title="' + lang.toolbar.justifyFull + '"><span class="img_editor ico_align_f"></span>' + lang.toolbar.justifyFull + '</button></li>' +
            '   </ul>' +
            '</div>';

        return listDiv;
    },

    pickup: function (e) {
        e.preventDefault();
        e.stopPropagation();

        var target = e.target;
        var command = null;
        while (!command && !/UL/i.test(target.tagName)) {
            command = target.getAttribute('data-command');
            target = target.parentNode;
        }

        this.focus();
        this.execCommand(command, false);
        this.submenuOff();
    }
};