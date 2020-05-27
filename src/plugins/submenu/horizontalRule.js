/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

export default {
    name: 'horizontalRule',
    display: 'submenu',
    add: function (core, targetElement) {
        /** set submenu */
        let listDiv = this.setSubmenu.call(core);

        /** add event listeners */
        listDiv.querySelector('ul').addEventListener('click', this.horizontalRulePick.bind(core));

        /** append target button menu */
        core.initMenuTarget(this.name, targetElement, listDiv);

        /** empty memory */
        listDiv = null;
    },

    setSubmenu: function () {
        const lang = this.lang;
        const listDiv = this.util.createElement('DIV');

        listDiv.className = 'se-submenu se-list-layer se-list-line';
        listDiv.innerHTML = '' +
            '<div class="se-list-inner">' +
                '<ul class="se-list-basic">' +
                    '<li>' +
                        '<button type="button" class="se-btn-list btn_line" data-command="horizontalRule" data-value="solid" title="' + lang.toolbar.hr_solid + '">' +
                            '<hr style="border-width: 1px 0 0; border-style: solid none none; border-color: black; border-image: initial; height: 1px;" />' +
                        '</button>' +
                    '</li>' +
                    '<li>' +
                        '<button type="button" class="se-btn-list btn_line" data-command="horizontalRule" data-value="dotted" title="' + lang.toolbar.hr_dotted + '">' +
                            '<hr style="border-width: 1px 0 0; border-style: dotted none none; border-color: black; border-image: initial; height: 1px;" />' +
                        '</button>' +
                    '</li>' +
                    '<li>' +
                        '<button type="button" class="se-btn-list btn_line" data-command="horizontalRule" data-value="dashed" title="' + lang.toolbar.hr_dashed + '">' +
                            '<hr style="border-width: 1px 0 0; border-style: dashed none none; border-color: black; border-image: initial; height: 1px;" />' +
                        '</button>' +
                    '</li>' +
                '</ul>' +
            '</div>';

        return listDiv;
    },

    appendHr: function (className) {
        const oHr = this.util.createElement('HR');
        oHr.className = className;
        this.focus();

        let oNode = this.insertComponent(oHr, false);
        this.setRange(oNode, 0, oNode, 0);
    },

    horizontalRulePick: function (e) {
        e.preventDefault();
        e.stopPropagation();

        let target = e.target;
        let value = null;
        
        while (!value && !/UL/i.test(target.tagName)) {
            value = target.getAttribute('data-value');
            target = target.parentNode;
        }

        if (!value) return;

        this.plugins.horizontalRule.appendHr.call(this, '__se__' + value);

        this.submenuOff();
    }
};
