/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
SUNEDITOR.plugin.fontFamily = {
    add : function (_this, targetElement) {
        /** set submenu */
        var listDiv = eval(this.setSubmenu(_this.context.user));

        /** add event listeners */
        listDiv.getElementsByClassName('list_family')[0].addEventListener('click', this.pickup.bind(_this));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);
    },

    setSubmenu : function (user) {
        var lang = SUNEDITOR.lang;
        var listDiv = document.createElement('DIV');
        listDiv.className = 'layer_editor';
        listDiv.style.display = 'none';

        function createFontFamilyList(fontList) {
            if(!fontList) return;

            var list = '';
            for(var i=0; i<fontList.length; i++) {
                var font = fontList[i];
                var text = font.split(',')[0];
                list += '<li><button type="button" class="btn_edit" data-value="'+font+'" data-txt="'+text+'" style="font-family:'+font+';">'+text+'</button></li>';
            }

            return list;
        }

        var defaultFontList = !user.fontList?
            [
                'Arial',
                'Comic Sans MS',
                'Courier New,Courier',
                'Georgia',
                'tahoma',
                'Trebuchet MS,Helvetica',
                'Verdana'
            ]:
            user.fontList;

        var list = '<div class="inner_layer list_family">'+
                   '   <ul class="list_editor sun-editor-list-font-family">'+
                   '       <li><button type="button" class="btn_edit default" data-value="inherit" data-txt="'+lang.toolbar.fontFamily+'" style="font-family:inherit;">'+lang.toolbar.fontFamilyDelete+'</button></li>';
        list += createFontFamilyList(defaultFontList);
        list += '   </ul>';
        if(user.addFont) {
            list += '<ul class="list_editor list_family_add sun-editor-list-font-family-add">';
            list += createFontFamilyList(user.addFont);
            list += '</ul>';
        }
        list += '</div>';

        listDiv.innerHTML = list;

        return listDiv;
    },

    pickup : function (e) {
        if(!/^BUTTON$/i.test(e.target.tagName)) {
            return false;
        }

        e.preventDefault();
        e.stopPropagation();

        var target = e.target;

        this.focus();
        SUNEDITOR.dom.changeTxt(this.context.tool.fontFamily, target.getAttribute('data-txt'));
        this.execCommand('fontName', false, target.getAttribute('data-value'));
        this.submenuOff();
    }
};