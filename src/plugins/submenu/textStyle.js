/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

export default {
    name: 'textStyle',
    add: function (core, targetElement) {
        const context = core.context;
        context.textStyle = {
            _styleList: null
        };

        /** set submenu */
        let listDiv = this.setSubmenu.call(core);
        let listUl = listDiv.querySelector('ul');

        /** add event listeners */
        listUl.addEventListener('click', this.pickup.bind(core));

        context.textStyle._styleList = listUl.querySelectorAll('li button');

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null, listUl = null;
    },

    setSubmenu: function () {
        const option = this.context.option;
        const listDiv = this.util.createElement('DIV');

        listDiv.className = 'se-submenu se-list-layer';

        const styleList = !option.textStyles ? [
            {
                name: 'Translucent',
                style: 'opacity: 0.5;',
                tag: 'span',
            },
            {
                name: 'Emphasis',
                style: '-webkit-text-emphasis: filled;',
                tag: 'span',
            }
        ] : option.textStyles;

        let list = '<div class="se-list-inner"><ul class="se-list-basic">';
        for (let i = 0, len = styleList.length, t, tag, name, attrs; i < len; i++) {
            t = styleList[i];
            name = t.name;
            tag = t.tag || 'span';
            attrs = t.style ? ' style="' + t.style + '"' : '';

            list += '<li>' +
                '<button type="button" class="se-btn-list" data-command="textStyle" title="' + name + '">' +
                    '<' + tag + attrs + '>' + name +  '</' + tag + '>' +
                '</button></li>';
        }
        list += '</ul></div>';

        listDiv.innerHTML = list;

        return listDiv;
    },

    pickup: function (e) {
        e.preventDefault();
        e.stopPropagation();

        let target = e.target;
        let command = null, tag = null;
        
        while (!command && !/UL/i.test(target.tagName)) {
            command = target.getAttribute('data-command');
            if (command) {
                tag = target.firstChild;
                break;
            }
            target = target.parentNode;
        }

        if (!command) return;

        const styles = tag.style;
        const checkStyles = [];
        for (let i = 0, len = styles.length; i < len; i++) {
            checkStyles.push(styles[i]);
        }

        const newNode = tag.cloneNode(false);
        this.nodeChange(newNode, checkStyles, null);

        this.submenuOff();
    }
};
