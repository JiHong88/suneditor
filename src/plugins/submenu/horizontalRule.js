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
    add: function (core, targetElement) {
        /** set submenu */
        let listDiv = eval(this.setSubmenu.call(core));

        /** add event listeners */
        listDiv.getElementsByTagName('UL')[0].addEventListener('click', this.horizontalRulePick.bind(core));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null;
    },

    setSubmenu: function () {
        const lang = this.lang;
        const listDiv = this.util.createElement('DIV');

        listDiv.className = 'sun-editor-submenu layer_editor';
        listDiv.style.display = 'none';
        listDiv.innerHTML = '' +
            '<div class="inner_layer layer_line">' +
            '   <ul class="list_editor">' +
            '       <li>' +
            '           <button type="button" class="btn_edit btn_line se-tooltip" data-command="horizontalRule" data-value="solid">' +
            '               <hr style="border-width: 1px 0 0; border-style: solid none none; border-color: black; border-image: initial; height: 1px;" />' +
            '               <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.toolbar.hr_solid + '</span></span>' +
            '           </button>' +
            '       </li>' +
            '       <li>' +
            '           <button type="button" class="btn_edit btn_line se-tooltip" data-command="horizontalRule" data-value="dotted">' +
            '               <hr style="border-width: 1px 0 0; border-style: dotted none none; border-color: black; border-image: initial; height: 1px;" />' +
            '               <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.toolbar.hr_dotted + '</span></span>' +
            '           </button>' +
            '       </li>' +
            '       <li>' +
            '           <button type="button" class="btn_edit btn_line se-tooltip" data-command="horizontalRule" data-value="dashed">' +
            '               <hr style="border-width: 1px 0 0; border-style: dashed none none; border-color: black; border-image: initial; height: 1px;" />' +
            '               <span class="se-tooltip-inner"><span class="se-tooltip-text">' + lang.toolbar.hr_dashed + '</span></span>' +
            '           </button>' +
            '       </li>' +
            '   </ul>' +
            '</div>';

        return listDiv;
    },

    appendHr: function (className) {
        const oHr = this.util.createElement('HR');
        oHr.className = className;
        this.focus();

        let sibling = this.util.getFormatElement(this.getSelectionNode());
        let li = null;

        if (this.util.isListCell(sibling)) {
            li = this.util.createElement('LI');
            this.insertNode(li, sibling);
            li.appendChild(oHr);
        } else {
            this.insertNode(oHr, this.util.getFormatElement(this.getSelectionNode()));
        }

        const oNode = this.appendFormatTag(oHr);
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

        this.plugins.horizontalRule.appendHr.call(this, value);

        this.submenuOff();
        this.focus();
    }
};
