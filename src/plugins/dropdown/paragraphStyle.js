/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 Yi JiHong.
 * MIT license.
 */
'use strict';

export default {
    name: 'paragraphStyle',
    type: 'dropdown',
    add: function (core, targetElement) {
        const context = core.context;
        context.paragraphStyle = {
            _classList: null
        };

        /** set dropdown */
        let listDiv = this.setDropdown(core);

        /** add event listeners */
        listDiv.querySelector('ul').addEventListener('click', this.pickUp.bind(core));

        context.paragraphStyle._classList = listDiv.querySelectorAll('li button');

        /** append target button menu */
        core.menu.initTarget(targetElement, listDiv);

        /** empty memory */
        listDiv = null;
    },

    setDropdown: function (core) {
        const option = core.options;
        const listDiv = core.util.createElement('DIV');
        listDiv.className = 'se-dropdown se-list-layer se-list-format';

        const menuLang = core.lang.menu;
        const defaultList = {
            spaced: {
                name: menuLang.spaced,
                class: '__se__p-spaced',
                _class: ''
            },
            bordered: {
                name: menuLang.bordered,
                class: '__se__p-bordered',
                _class: ''
            },
            neon: {
                name: menuLang.neon,
                class: '__se__p-neon',
                _class: ''
            }
        };
        const paragraphStyles = !option.paragraphStyles || option.paragraphStyles.length === 0 ? ['spaced', 'bordered', 'neon'] : option.paragraphStyles;

        let list = '<div class="se-list-inner"><ul class="se-list-basic">';
        for (let i = 0, len = paragraphStyles.length, p, name, attrs, _class; i < len; i++) {
            p = paragraphStyles[i];

            if (typeof p === 'string') {
                const editorCSSText = defaultList[p.toLowerCase()];
                if (!editorCSSText) continue;
                p = editorCSSText;
            }

            name = p.name;
            attrs = p.class ? ' class="' + p.class + '"' : '';
            _class = p._class;

            list += '<li>' +
                '<button type="button" class="se-btn-list' + (_class ? ' ' + _class: '') + '" data-value="' + p.class + '" title="' + name + '">' +
                    '<div' + attrs + '>' + name + '</div>' +
                '</button></li>';
        }
        list += '</ul></div>';

        listDiv.innerHTML = list;

        return listDiv;
    },

     /**
     * @Override dropdown
     */
    on: function () {
        const paragraphContext = this.context.paragraphStyle;
        const paragraphList = paragraphContext._classList;
        const currentFormat = this.format.getLine(this.selection.getNode());

        for (let i = 0, len = paragraphList.length; i < len; i++) {
            if (this.util.hasClass(currentFormat, paragraphList[i].getAttribute('data-value'))) {
                this.util.addClass(paragraphList[i], 'active');
            } else {
                this.util.removeClass(paragraphList[i], 'active');
            }
        }
    },

    pickUp: function (e) {
        e.preventDefault();
        e.stopPropagation();

        let target = e.target;
        let value = null;
        
        while (!/^UL$/i.test(target.tagName)) {
            value = target.getAttribute('data-value');
            if (value) break;
            target = target.parentNode;
        }

        if (!value) return;

        let selectedFormsts = this.selection.getLines();
        if (selectedFormsts.length === 0) {
            this.selection.getRangeAndAddLine(this.selection.getRange(), null);
            selectedFormsts = this.selection.getLines();
            if (selectedFormsts.length === 0) return;
        }

        // change format class
        const toggleClass = this.util.hasClass(target, 'active') ? this.util.removeClass.bind(this.util) : this.util.addClass.bind(this.util);
        for (let i = 0, len = selectedFormsts.length; i < len; i++) {
            toggleClass(selectedFormsts[i], value);
        }

        this.menu.dropdownOff();

        // history stack
        this.history.push(false);
    }
};
