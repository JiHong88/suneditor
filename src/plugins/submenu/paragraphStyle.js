/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

export default {
    name: 'paragraphStyle',
    add: function (core, targetElement) {
        const context = core.context;
        context.paragraphStyle = {
            _classList: null
        };

        /** set submenu */
        let listDiv = this.setSubmenu.call(core);

        /** add event listeners */
        listDiv.querySelector('ul').addEventListener('click', this.pickUp.bind(core));

        context.paragraphStyle._classList = listDiv.querySelectorAll('li button');

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null;
    },

    setSubmenu: function () {
        const option = this.context.option;
        const listDiv = this.util.createElement('DIV');
        listDiv.className = 'se-submenu se-list-layer';

        const defaultList = {
            spaced: {
                name: 'Spaced',
                class: '__se__p-spaced'
            },
            bordered: {
                name: 'Bordered',
                class: '__se__p-bordered'
            },
            invert: {
                name: 'Invert',
                class: '__se__p-invert'
            },
            neon: {
                name: 'Neon',
                class: '__se__p-neon'
            }
        };
        const paragraphStyles = !option.paragraphStyles || option.paragraphStyles.length === 0 ? ['spaced', 'bordered', 'invert', 'neon'] : option.paragraphStyles;

        let list = '<div class="se-list-inner"><ul class="se-list-basic se-list-format">';
        for (let i = 0, len = paragraphStyles.length, p, name, attrs; i < len; i++) {
            p = paragraphStyles[i];

            if (typeof p === 'string') {
                const defaultStyle = defaultList[p.toLowerCase()];
                if (!defaultStyle) continue;
                p = defaultStyle;
            }

            name = p.name;
            attrs = p.class ? ' class="' + p.class + '"' : '';

            list += '<li>' +
                '<button type="button" class="se-btn-list' + (name === 'Invert' ? ' se-invert': '') + '" data-value="' + p.class + '" title="' + name + '">' +
                    '<div' + attrs + '>' + name + '</div>' +
                '</button></li>';
        }
        list += '</ul></div>';

        listDiv.innerHTML = list;

        return listDiv;
    },

    on: function () {
        const paragraphContext = this.context.paragraphStyle;
        const paragraphList = paragraphContext._classList;
        const currentFormat = this.util.getFormatElement(this.getSelectionNode());

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
        
        while (!value && !/^UL$/i.test(target.tagName)) {
            value = target.getAttribute('data-value');
            target = target.parentNode;
        }

        if (!value) return;

        let selectedFormsts = this.getSelectedElementsAndComponents();
        if (selectedFormsts.length === 0) return;

        // change format class
        selectedFormsts = this.getSelectedElementsAndComponents();
        for (let i = 0, len = selectedFormsts.length; i < len; i++) {
            this.util.toggleClass(selectedFormsts[i], value);
        }

        // history stack
        this.history.push();

        this.submenuOff();
    }
};