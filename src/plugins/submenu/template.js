/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

export default {
    name: 'template',
    add: function (core, targetElement) {
        const context = core.context;
        context.template = {};

        /** set submenu */
        let templateDiv = this.setSubmenu.call(core);

        /** add event listeners */
        templateDiv.querySelector('ul').addEventListener('click', this.pickup.bind(core));

        /** append html */
        targetElement.parentNode.appendChild(templateDiv);

        /** empty memory */
        templateDiv = null;
    },

    setSubmenu: function () {
        const templateList = this.context.option.templates;
        const listDiv = this.util.createElement('DIV');

        listDiv.className = 'se-list-layer';

        let list = '<div class="se-submenu se-list-inner">' +
                '<ul class="se-list-basic">';
        for (let i = 0, len = templateList.length, t; i < len; i++) {
            t = templateList[i];
            list += '<li><button type="button" class="se-btn-list" data-value="' + i + '" title="' + t.name + '">' + t.name + '</button></li>';
        }
        list += '</ul></div>';

        listDiv.innerHTML = list;

        return listDiv;
    },

    pickup: function (e) {
        if (!/^BUTTON$/i.test(e.target.tagName)) return false;

        e.preventDefault();
        e.stopPropagation();

        const temp = this.context.option.templates[e.target.getAttribute('data-value')];

        if (temp.html) {
            this.setContents(temp.html);
        } else {
            this.submenuOff();
            throw Error('[SUNEDITOR.template.fail] cause : "templates[i].html not found"');
        }
        
        this.submenuOff();
    }
};