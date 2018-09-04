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

    const align = {
        name: 'align',
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
    
            listDiv.className = 'layer_editor layer_align';
            listDiv.style.display = 'none';
            listDiv.innerHTML = '' +
                '<div class="inner_layer">' +
                '   <ul class="list_editor">' +
                '       <li><button type="button" class="btn_edit btn_align" data-command="justifyleft" title="' + lang.toolbar.alignLeft + '"><span class="img_editor icon-align-left"></span>' + lang.toolbar.alignLeft + '</button></li>' +
                '       <li><button type="button" class="btn_edit btn_align" data-command="justifycenter" title="' + lang.toolbar.alignCenter + '"><span class="img_editor icon-align-center"></span>' + lang.toolbar.alignCenter + '</button></li>' +
                '       <li><button type="button" class="btn_edit btn_align" data-command="justifyright" title="' + lang.toolbar.alignRight + '"><span class="img_editor icon-align-right"></span>' + lang.toolbar.alignRight + '</button></li>' +
                '       <li><button type="button" class="btn_edit btn_align" data-command="justifyfull" title="' + lang.toolbar.justifyFull + '"><span class="img_editor icon-align-just"></span>' + lang.toolbar.justifyFull + '</button></li>' +
                '   </ul>' +
                '</div>';
    
            return listDiv;
        },
    
        pickup: function (e) {
            e.preventDefault();
            e.stopPropagation();
    
            let target = e.target;
            let command = null;
            
            while (!command && !/UL/i.test(target.tagName)) {
                command = target.getAttribute('data-command');
                target = target.parentNode;
            }
    
            this.focus();
            this.execCommand(command, false);
            this.submenuOff();
        }
    };

    if (typeof noGlobal === typeof undefined) {
        window.SUNEDITOR.plugins.align = align;
    }

    return align;
}));
