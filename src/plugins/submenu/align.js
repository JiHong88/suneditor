/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

export default {
    name: 'align',
    add: function (core, targetElement) {
        const context = core.context;
        context.align = {
            _alignList: [],
            currentAlign: ''
        };

        /** set submenu */
        let listDiv = eval(this.setSubmenu.call(core));

        /** add event listeners */
        listDiv.getElementsByTagName('UL')[0].addEventListener('click', this.pickup.bind(core));

        context.align._alignList = listDiv.getElementsByTagName('UL')[0].querySelectorAll('li button');

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null;
    },

    setSubmenu: function () {
        const lang = this.lang;
        const listDiv = this.util.createElement('DIV');

        listDiv.className = 'layer_editor';
        listDiv.style.display = 'none';
        listDiv.innerHTML = '' +
            '<div class="sun-editor-submenu inner_layer layer_align">' +
            '   <ul class="list_editor">' +
            '       <li><button type="button" class="btn_edit btn_align" data-command="justifyleft" data-value="left" title="' + lang.toolbar.alignLeft + '"><span class="icon-align-left"></span>' + lang.toolbar.alignLeft + '</button></li>' +
            '       <li><button type="button" class="btn_edit btn_align" data-command="justifycenter" data-value="center" title="' + lang.toolbar.alignCenter + '"><span class="icon-align-center"></span>' + lang.toolbar.alignCenter + '</button></li>' +
            '       <li><button type="button" class="btn_edit btn_align" data-command="justifyright" data-value="right" title="' + lang.toolbar.alignRight + '"><span class="icon-align-right"></span>' + lang.toolbar.alignRight + '</button></li>' +
            '       <li><button type="button" class="btn_edit btn_align" data-command="justifyfull" data-value="justify" title="' + lang.toolbar.alignJustify + '"><span class="icon-align-justify"></span>' + lang.toolbar.alignJustify + '</button></li>' +
            '   </ul>' +
            '</div>';

        return listDiv;
    },

    on: function () {
        const alignContext = this.context.align;
        const alignList = alignContext._alignList;
        const currentAlign = this.commandMap.ALIGN.getAttribute('data-focus');

        if (currentAlign !== alignContext.currentAlign) {
            for (let i = 0, len = alignList.length; i < len; i++) {
                if (currentAlign === alignList[i].getAttribute('data-value')) {
                    this.util.addClass(alignList[i], 'on');
                } else {
                    this.util.removeClass(alignList[i], 'on');
                }
            }

            alignContext.currentAlign = currentAlign;
        }
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

        if (!command) return;

        this.focus();
        this.execCommand(command, false, null);
        this.submenuOff();
    }
};
