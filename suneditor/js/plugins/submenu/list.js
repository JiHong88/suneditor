/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
(function () {
    SUNEDITOR.plugin.list = {
        add : function (_this, targetElement) {
            /** set submenu */
            var listDiv = eval(this.setSubmenu());

            /** add event listeners */
            listDiv.getElementsByTagName('UL')[0].addEventListener('click', this.pickup.bind(_this));

            /** append html */
            targetElement.parentNode.appendChild(listDiv);
        },

        setSubmenu : function () {
            var lang = SUNEDITOR.lang;
            var listDiv = document.createElement('DIV');
            listDiv.className = 'layer_editor layer_list';
            listDiv.style.display = 'none';

            listDiv.innerHTML = ''+
                '<div class="inner_layer">'+
                '   <ul class="list_editor">'+
                '       <li><button type="button" class="btn_edit" data-command="insertOrderedList" data-value="DECIMAL" title="'+lang.toolbar.orderList+'"><span class="img_editor ico_list ico_list_num"></span></button></li>'+
                '       <li><button type="button" class="btn_edit" data-command="insertUnorderedList" data-value="DISC" title="'+lang.toolbar.unorderList+'"><span class="img_editor ico_list ico_list_square"></span></button></li>'+
                '   </ul>'+
                '</div>';

            return listDiv;
        },

        pickup : function (e) {
            if(!/btn_edit/.test(e.target.className)) {
                return false;
            }

            e.preventDefault();
            e.stopPropagation();

            this.focus();
            this.execCommand(e.target.getAttribute('data-command'), false, e.target.getAttribute('data-value'));
            this.subOff();
        }
    }
})();