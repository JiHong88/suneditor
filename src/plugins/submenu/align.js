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
    display: 'submenu',
    add: function (core, targetElement) {
        const icons = core.icons;
        const context = core.context;
        context.align = {
            targetButton: targetElement,
            _itemMenu: null,
            _alignList: null,
            currentAlign: '',
            defaultDir: core.options.rtl ? 'right' : 'left',
            icons: {
                justify: icons.align_justify,
                left: icons.align_left,
                right: icons.align_right,
                center: icons.align_center
            }
        };

        /** set submenu */
        let listDiv = this.setSubmenu(core);
        let listUl = context.align._itemMenu = listDiv.querySelector('ul');

        /** add event listeners */
        listUl.addEventListener('click', this.pickup.bind(core));
        context.align._alignList = listUl.querySelectorAll('li button');

        /** append target button menu */
        core.initMenuTarget(this.name, targetElement, listDiv);

        /** empty memory */
        listDiv = null, listUl = null;
    },

    setSubmenu: function (core) {
        const lang = core.lang;
        const icons = core.icons;
        const listDiv = core.util.createElement('DIV');
        const alignItems = core.options.alignItems;

        let html = '';
        for (let i = 0, item, text; i < alignItems.length; i++) {
            item = alignItems[i];
            text = lang.toolbar['align' + item.charAt(0).toUpperCase() + item.slice(1)];
            html += '<li>' +
                '<button type="button" class="se-btn-list se-btn-align" data-value="' + item + '" title="' + text + '">' +
                    '<span class="se-list-icon">' + icons['align_' + item] + '</span>' + text +
                '</button>' +
            '</li>';
        }

        listDiv.className = 'se-submenu se-list-layer se-list-align';
        listDiv.innerHTML = '' +
            '<div class="se-list-inner">' +
                '<ul class="se-list-basic">' +
                    html +
                '</ul>' +
            '</div>';

        return listDiv;
    },

    /**
     * @Override core
     */
    active: function (element) {
        const alignContext = this.context.align;
        const targetButton = alignContext.targetButton;
        const target = targetButton.firstElementChild;

        if (!element) {
            this.util.changeElement(target, alignContext.icons[alignContext.defaultDir]);
            targetButton.removeAttribute('data-focus');
        } else if (this.util.isFormatElement(element)) {
            const textAlign = element.style.textAlign;
            if (textAlign) {
                this.util.changeElement(target, alignContext.icons[textAlign] || alignContext.icons[alignContext.defaultDir]);
                targetButton.setAttribute('data-focus', textAlign);
                return true;
            }
        }

        return false;
    },

    /**
     * @Override submenu
     */
    on: function () {
        const alignContext = this.context.align;
        const alignList = alignContext._alignList;
        const currentAlign = alignContext.targetButton.getAttribute('data-focus') || alignContext.defaultDir;

        if (currentAlign !== alignContext.currentAlign) {
            for (let i = 0, len = alignList.length; i < len; i++) {
                if (currentAlign === alignList[i].getAttribute('data-value')) {
                    this.util.addClass(alignList[i], 'active');
                } else {
                    this.util.removeClass(alignList[i], 'active');
                }
            }

            alignContext.currentAlign = currentAlign;
        }
    },

    exchangeDir: function () {
        const dir = this.options.rtl ? 'right' : 'left';
        if (!this.context.align || this.context.align.defaultDir === dir) return;

        this.context.align.defaultDir = dir;
        let menu = this.context.align._itemMenu;
        let leftBtn = menu.querySelector('[data-value="left"]');
        let rightBtn = menu.querySelector('[data-value="right"]');
        if (leftBtn && rightBtn) {
            const lp = leftBtn.parentElement;
            const rp = rightBtn.parentElement;
            lp.appendChild(rightBtn);
            rp.appendChild(leftBtn);
        }
    },

    pickup: function (e) {
        e.preventDefault();
        e.stopPropagation();

        let target = e.target;
        let value = null;

        while (!value && !/UL/i.test(target.tagName)) {
            value = target.getAttribute('data-value');
            target = target.parentNode;
        }

        if (!value) return;

        const defaultDir = this.context.align.defaultDir;
        const selectedFormsts = this.getSelectedElements();
        for (let i = 0, len = selectedFormsts.length; i < len; i++) {
            this.util.setStyle(selectedFormsts[i], 'textAlign', (value === defaultDir ? '' : value));
        }

        this.effectNode = null;
        this.submenuOff();
        this.focus();
        
        // history stack
        this.history.push(false);
    }
};
