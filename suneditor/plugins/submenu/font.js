/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
SUNEDITOR.plugin.font = {
    add: function (_this, targetElement) {
        /** set submenu */
        var listDiv = eval(this.setSubmenu(_this.context.user));

        /** add event listeners */
        listDiv.getElementsByClassName('list_family')[0].addEventListener('click', this.pickup.bind(_this));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);
    },

    setSubmenu: function (user) {
        var lang = SUNEDITOR.lang;
        var listDiv = document.createElement('DIV');
        listDiv.className = 'layer_editor';
        listDiv.style.display = 'none';

        var font, text, i, len;
        var fontList = !user.fontList ?
            [
                'Arial',
                'Comic Sans MS',
                'Courier New,Courier',
                'Georgia',
                'tahoma',
                'Trebuchet MS,Helvetica',
                'Verdana'
            ] : user.fontList;

        var list = '<div class="inner_layer list_family">' +
            '   <ul class="list_editor sun-editor-list-font-family">';
        for (i = 0, len = fontList.length; i < len; i++) {
            font = fontList[i];
            text = font.split(',')[0];
            list += '<li><button type="button" class="btn_edit" data-value="' + font + '" data-txt="' + text + '" style="font-family:' + font + ';">' + text + '</button></li>';
        }
        list += '   </ul>';

        if (user.addFont) {
            fontList = user.addFont;
            list += '<ul class="list_editor list_family_add sun-editor-list-font-family-add">';
            for (i = 0, len = fontList.length; i < len; i++) {
                font = fontList[i];
                text = font.split(',')[0];
                list += '<li><button type="button" class="btn_edit" data-value="' + font + '" data-txt="' + text + '" style="font-family:' + font + ';">' + text + '</button></li>';
            }
            list += '</ul>';
        }
        list += '</div>';

        listDiv.innerHTML = list;

        return listDiv;
    },

    pickup: function (e) {
        if (!/^BUTTON$/i.test(e.target.tagName)) {
            return false;
        }

        e.preventDefault();
        e.stopPropagation();

        var target = e.target;

        this.focus();

        SUNEDITOR.dom.changeTxt(this.context.tool.font, target.getAttribute('data-txt'));
        var newNode = document.createElement('SPAN'); newNode.style.fontFamily = target.getAttribute('data-value');
        this.wrapRangeToTag(newNode, ['font-family']);
        this.submenuOff();
    }
};