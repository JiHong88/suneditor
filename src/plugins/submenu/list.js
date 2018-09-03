/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
(function (global, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = global.document ?
            factory(global, true) :
            function (w) {
                if (!w.document) {
                    throw new Error('SUNEDITOR requires a window with a document');
                }
                return factory(w);
            };
    } else {
        factory(global);
    }

}(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
    'use strict';

    const list = {
        name: 'list',
        add: function (_this, targetElement) {
            /** set submenu */
            let listDiv = eval(this.setSubmenu(_this.lang));
    
            /** add event listeners */
            listDiv.getElementsByTagName('UL')[0].addEventListener('click', this.pickup.bind(_this));
    
            /** append html */
            targetElement.parentNode.appendChild(listDiv);
    
            /** empty memory */
            listDiv = null;
        },
    
        setSubmenu: function (lang) {
            const listDiv = document.createElement('DIV');
    
            listDiv.className = 'layer_editor layer_list';
            listDiv.style.display = 'none';
            listDiv.innerHTML = '' +
                '<div class="inner_layer">' +
                '   <ul class="list_editor">' +
                '       <li><button type="button" class="btn_edit" data-command="insertOrderedList" data-value="DECIMAL" title="' + lang.toolbar.orderList + '"><div class="icon-list-number"></div></button></li>' +
                '       <li><button type="button" class="btn_edit" data-command="insertUnorderedList" data-value="DISC" title="' + lang.toolbar.unorderList + '"><div class="icon-list-bullets"></div></button></li>' +
                '   </ul>' +
                '</div>';
    
            return listDiv;
        },
    
        pickup: function (e) {
            e.preventDefault();
            e.stopPropagation();
    
            let target = e.target;
            let command = null;
            let value = null;
    
            while (!value && !/UL/i.test(target.tagName)) {
                command = target.getAttribute('data-command');
                value = target.getAttribute('data-value');
                target = target.parentNode;
            }
    
            this.focus();
            this.execCommand(command, false, value);
            this.submenuOff();
        }
    };

    if (typeof noGlobal === typeof undefined) {
        window.SUNEDITOR.plugins.list = list;
    }

    return list;
}));
