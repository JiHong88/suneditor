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
        core.context.horizontalRule = {
            currentHR: null,
        };

        /** set submenu */
        let listDiv = this.setSubmenu(core);

        /** add event listeners */
        listDiv.querySelector('ul').addEventListener('click', this.horizontalRulePick.bind(core));

        /** append target button menu */
        core.initMenuTarget(this.name, targetElement, listDiv);

        /** empty memory */
        listDiv = null;
    },

    setSubmenu: function (core) {
        const lang = core.lang;
        const listDiv = core.util.createElement('DIV');
        const items = core.options.hrItems || [{name: lang.toolbar.hr_solid, class: '__se__solid'}, {name: lang.toolbar.hr_dashed, class: '__se__dashed'}, {name: lang.toolbar.hr_dotted, class: '__se__dotted'}];
        
        let list = '';
        for (let i = 0, len = items.length; i < len; i++) {
            list += '<li>' +
                '<button type="button" class="se-btn-list btn_line" data-command="horizontalRule" data-value="' + items[i].class + '" title="' + items[i].name + '">' +
                    '<hr' + (items[i].class ? ' class="' + items[i].class + '"' : '') + (items[i].style ? ' style="' + items[i].style + '"' : '') + '/>' +
                '</button>' +
            '</li>';
        }
        
        listDiv.className = 'se-submenu se-list-layer se-list-line';
        listDiv.innerHTML = '' +
            '<div class="se-list-inner">' +
                '<ul class="se-list-basic">' +
                    list +
                '</ul>' +
            '</div>';

        return listDiv;
    },

    active: function (element) {
        if (!element) {
            if (this.util.hasClass(this.context.horizontalRule.currentHR, 'on')) {
                this.controllersOff();
            }
        } else if (/HR/i.test(element.nodeName)) {
            this.context.horizontalRule.currentHR = element;
            if (!this.util.hasClass(element, 'on')) {
                this.util.addClass(element, 'on');
                this.controllersOn('hr', this.util.removeClass.bind(this.util, element, 'on'));
            }
            return true;
        }

        return false;
    },

    appendHr: function (hrTemp) {
        this.focus();
        return this.insertComponent(hrTemp.cloneNode(false), false, true, false);
    },

    horizontalRulePick: function (e) {
        e.preventDefault();
        e.stopPropagation();

        let target = e.target;
        let command = target.getAttribute('data-command');
        
        while (!command && !/UL/i.test(target.tagName)) {
            target = target.parentNode;
            command = target.getAttribute('data-command');
        }

        if (!command) return;

        const oNode = this.plugins.horizontalRule.appendHr.call(this, target.firstElementChild);
        if (oNode) {
            this.setRange(oNode, 0, oNode, 0);
            this.submenuOff();
        }
    }
};
