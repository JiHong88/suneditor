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
    type: 'dropdown',
    add: function (core, targetElement) {
        const context = core.context;
        context.template = {
            selectedIndex: -1
        };

        /** set dropdown */
        let templateDiv = this.setDropdown(core);

        /** add event listeners */
        templateDiv.querySelector('ul').addEventListener('click', this.pickup.bind(core));

        /** append target button menu */
        core.menu.initTarget(targetElement, templateDiv);

        /** empty memory */
        templateDiv = null;
    },

    setDropdown: function (core) {
        const templateList = core.options.templates;
        if (!templateList || templateList.length === 0) {
            throw Error('[SUNEDITOR.plugins.template.fail] To use the "template" plugin, please define the "templates" option.');
        }

        const listDiv = core.util.createElement('DIV');
        listDiv.className = 'se-list-layer';

        let list = '<div class="se-dropdown se-list-inner">' +
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

        this.context.template.selectedIndex = e.target.getAttribute('data-value') * 1;
        const temp = this.options.templates[this.context.template.selectedIndex];

        if (temp.html) {
            this.setContent(temp.html);
        } else {
            this.dropdownOff();
            throw Error('[SUNEDITOR.template.fail] cause : "templates[i].html not found"');
        }
        
        this.dropdownOff();
    }
};