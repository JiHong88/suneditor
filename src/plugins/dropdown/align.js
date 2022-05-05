/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

import EditorInterface from "../../interface/editor";
import {
    domUtils
} from "../../helper";

const align = function (editor, targetElement) {
    EditorInterface.call(this, editor);
    this.targetElement = targetElement;

    // create HTML
    let listDiv = createHTML(editor, !editor.options.rtl);
    let listUl = this._itemMenu = listDiv.querySelector('ul');

    // members
    this.currentAlign = "";
    this.defaultDir = editor.options.rtl ? "right" : "left";
    this._itemMenu = null;
    this.icons = {
        justify: editor.icons.align_justify,
        left: editor.icons.align_left,
        right: editor.icons.align_right,
        center: editor.icons.align_center
    };
    this._alignList = listUl.querySelectorAll('li button');

    // append target button menu
    editor.menu.initTarget(targetElement, listDiv);

    // event registration 
    listUl.addEventListener('click', action.bind(this));
    listDiv = null, listUl = null;
}

align.prototype = {
    /**
     * @Override core
     */
    active: function (element) {
        const targetButton = this.targetElement;
        const target = targetButton.firstElementChild;

        if (!element) {
            domUtils.changeElement(target, this.icons[this.defaultDir]);
            targetButton.removeAttribute('data-focus');
        } else if (this.format.isLine(element)) {
            const textAlign = element.style.textAlign;
            if (textAlign) {
                domUtils.changeElement(target, this.icons[textAlign] || this.icons[this.defaultDir]);
                targetButton.setAttribute('data-focus', textAlign);
                return true;
            }
        }

        return false;
    },

    /**
     * @Override dropdown
     */
    on: function () {
        const alignList = this._alignList;
        const currentAlign = this.targetElement.getAttribute('data-focus') || this.defaultDir;

        if (currentAlign !== this.currentAlign) {
            for (let i = 0, len = alignList.length; i < len; i++) {
                if (currentAlign === alignList[i].getAttribute('data-value')) {
                    domUtils.addClass(alignList[i], 'active');
                } else {
                    domUtils.removeClass(alignList[i], 'active');
                }
            }

            this.currentAlign = currentAlign;
        }
    },

    exchangeDir: function () {
        const dir = this.options.rtl ? 'right' : 'left';
        if (this.defaultDir === dir) return;

        this.defaultDir = dir;
        let menu = this._itemMenu;
        let leftBtn = menu.querySelector('[data-value="left"]');
        let rightBtn = menu.querySelector('[data-value="right"]');
        if (leftBtn && rightBtn) {
            const lp = leftBtn.parentElement;
            const rp = rightBtn.parentElement;
            lp.appendChild(rightBtn);
            rp.appendChild(leftBtn);
        }
    },

    constructor: align
}

function action(e) {
    e.preventDefault();
    e.stopPropagation();

    let target = e.target;
    let value = null;

    while (!value && !/UL/i.test(target.tagName)) {
        value = target.getAttribute('data-value');
        target = target.parentNode;
    }

    if (!value) return;

    const defaultDir = this.defaultDir;
    const selectedFormsts = this.selection.getLines();
    for (let i = 0, len = selectedFormsts.length; i < len; i++) {
        domUtils.setStyle(selectedFormsts[i], 'textAlign', (value === defaultDir ? '' : value));
    }

    this.core.dropdownOff();
    this.core.focus();

    // history stack
    this.history.push(false);
}

function createHTML(core) {
    const lang = core.lang;
    const icons = core.icons;
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

    return domUtils.createElement("div", {
        class: "se-dropdown se-list-layer se-list-align"
    }, '<div class="se-list-inner">' + '<ul class="se-list-basic">' + html + '</ul>' + '</div>');
}

export default align;