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
} from "../../helpers";

function align(editor, targetElement) {
    EditorInterface.call(this, editor);
    this.name = "align";
    this.display = "submenu";
    this.targetElement = targetElement;

    // create HTML
    let listDiv = createHTML(editor, !editor.options.rtl);
    let listUl = listDiv.querySelector('ul');

    // append target button menu
    editor.initMenuTarget(this.name, targetElement, listDiv);

    // members
    this.currentAlign = "";
    this.defaultDir = editor.options.rtl ? "right" : "left";
    this.icons = {
        justify: editor.icons.align_justify,
        left: editor.icons.align_left,
        right: editor.icons.align_right,
        center: editor.icons.align_center
    };
    this._alignList = listUl.querySelectorAll('li button');

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
     * @Override submenu
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

    this.editor.submenuOff();
    this.editor.focus();

    // history stack
    this.history.push(false);
}

function createHTML(editor, leftDir) {
    const lang = editor.lang;
    const icons = editor.icons;

    const leftMenu = '<li>' +
        '<button type="button" class="se-btn-list se-btn-align" data-command="justifyleft" data-value="left" title="' + lang.toolbar.alignLeft + '">' +
        '<span class="se-list-icon">' + icons.align_left + '</span>' + lang.toolbar.alignLeft +
        '</button>' +
        '</li>';

    const rightMenu = '<li>' +
        '<button type="button" class="se-btn-list se-btn-align" data-command="justifyright" data-value="right" title="' + lang.toolbar.alignRight + '">' +
        '<span class="se-list-icon">' + icons.align_right + '</span>' + lang.toolbar.alignRight +
        '</button>' +
        '</li>';

    const html = '' +
        '<div class="se-list-inner">' +
        '<ul class="se-list-basic">' +
        (leftDir ? leftMenu : rightMenu) +
        '<li>' +
        '<button type="button" class="se-btn-list se-btn-align" data-command="justifycenter" data-value="center" title="' + lang.toolbar.alignCenter + '">' +
        '<span class="se-list-icon">' + icons.align_center + '</span>' + lang.toolbar.alignCenter +
        '</button>' +
        '</li>' +
        (leftDir ? rightMenu : leftMenu) +
        '<li>' +
        '<button type="button" class="se-btn-list se-btn-align" data-command="justifyfull" data-value="justify" title="' + lang.toolbar.alignJustify + '">' +
        '<span class="se-list-icon">' + icons.align_justify + '</span>' + lang.toolbar.alignJustify +
        '</button>' +
        '</li>' +
        '</ul>' +
        '</div>';

    return domUtils.createElement("div", {
        class: "se-submenu se-list-layer se-list-align"
    }, html);
}

export default align;