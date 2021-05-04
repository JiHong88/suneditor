/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

export default {
    name: 'list',
    display: 'submenu',
    add: function (core, targetElement) {
        const context = core.context;
        context.list = {
            targetButton: targetElement,
            _list: null,
            currentList: '',
            icons: {
                bullets: core.icons.list_bullets,
                number: core.icons.list_number
            }
        };

        /** set submenu */
        let listDiv = this.setSubmenu(core);
        let listUl = listDiv.querySelector('ul');

        /** add event listeners */
        listUl.addEventListener('click', this.pickup.bind(core));
        context.list._list = listUl.querySelectorAll('li button');

        /** append target button menu */
        core.initMenuTarget(this.name, targetElement, listDiv);

        /** empty memory */
        listDiv = null, listUl = null;
    },

    setSubmenu: function (core) {
        const lang = core.lang;
        const listDiv = core.util.createElement('DIV');

        listDiv.className = 'se-submenu se-list-layer';
        listDiv.innerHTML = '' +
            '<div class="se-list-inner">' +
                '<ul class="se-list-basic">' +
                    '<li><button type="button" class="se-btn-list se-tooltip" data-command="bullet" title="' + lang.toolbar.orderList + '">' +
                        core.icons.list_number +
                    '</button></li>' +
                    '<li><button type="button" class="se-btn-list se-tooltip" data-command="numbered" title="' + lang.toolbar.unorderList + '">' +
                        core.icons.list_bullets +
                    '</button></li>' +
                '</ul>' +
            '</div>';

        return listDiv;
    },

     /**
     * @Override core
     */
    active: function (element) {
        const button = this.context.list.targetButton;
        const icon = button.firstElementChild;
        const util = this.util;

        if (!element) {
            button.removeAttribute('data-focus');
            util.changeElement(icon, this.context.list.icons.number);
            util.removeClass(button, 'active');
        } else if (util.isList(element)) {
            const nodeName = element.nodeName;
            button.setAttribute('data-focus', nodeName);
            util.addClass(button, 'active');
            if (/UL/i.test(nodeName)) {
                util.changeElement(icon, this.context.list.icons.bullets);
            } else {
                util.changeElement(icon, this.context.list.icons.number);
            }
            
            return true;
        }

        return false;
    },

     /**
     * @Override submenu
     */
    on: function () {
        const listContext = this.context.list;
        const list = listContext._list;
        const currentList = listContext.targetButton.getAttribute('data-focus') || '';

        if (currentList !== listContext.currentList) {
            for (let i = 0, len = list.length; i < len; i++) {
                if (currentList === list[i].getAttribute('data-command')) {
                    this.util.addClass(list[i], 'active');
                } else {
                    this.util.removeClass(list[i], 'active');
                }
            }

            listContext.currentList = currentList;
        }
    },

    pickup: function (e) {
        e.preventDefault();
        e.stopPropagation();

        let target = e.target;
        let command = '';

        while (!command && !/^UL$/i.test(target.tagName)) {
            command = target.getAttribute('data-command');
            target = target.parentNode;
        }

        if (!command) return;

        const range = this.format.applyList(command, null, false);
        if (range) this.setRange(range.sc, range.so, range.ec, range.eo);

        this.submenuOff();

        // history stack
        this.history.push(false);
    }
};
