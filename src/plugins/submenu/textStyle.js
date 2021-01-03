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
    display: 'submenu',
    add: function (core, targetElement) {
        const context = core.context;
        context.textStyle = {
            _styleList: null
        };

        /** set submenu */
        let listDiv = this.setSubmenu(core);
        let listUl = listDiv.querySelector('ul');

        /** add event listeners */
        listUl.addEventListener('click', this.pickup.bind(core));

        context.textStyle._styleList = listDiv.querySelectorAll('li button');

        /** append target button menu */
        core.initMenuTarget(this.name, targetElement, listDiv);

        /** empty memory */
        listDiv = null, listUl = null;
    },

    setSubmenu: function (core) {
        const option = core.options;
        const listDiv = core.util.createElement('DIV');
        listDiv.className = 'se-submenu se-list-layer se-list-format';

        const defaultList = {
            code: {
                name: core.lang.menu.code,
                class: '__se__t-code',
                tag: 'code',
            },
            translucent: {
                name: core.lang.menu.translucent,
                style: 'opacity: 0.5;',
                tag: 'span',
            },
            shadow: {
                name: core.lang.menu.shadow,
                class: '__se__t-shadow',
                tag: 'span',
            }
        };
        const styleList = !option.textStyles ? core._w.Object.keys(defaultList) : option.textStyles;

        let list = '<div class="se-list-inner"><ul class="se-list-basic">';
        for (let i = 0, len = styleList.length, t, tag, name, attrs, command, value, _class; i < len; i++) {
            t = styleList[i];
            attrs = '', value = '', command = [];

            if (typeof t === 'string') {
                const defaultStyle = defaultList[t.toLowerCase()];
                if (!defaultStyle) continue;
                t = defaultStyle;
            }

            name = t.name;
            tag = t.tag || 'span';
            _class = t._class;

            if (t.style) {
                attrs += ' style="' + t.style + '"';
                value += t.style.replace(/:[^;]+(;|$)\s*/g, ',');
                command.push('style');
            }
            if (t.class) {
                attrs += ' class="' + t.class + '"';
                value += '.' + t.class.trim().replace(/\s+/g, ',.');
                command.push('class');
            }

            value = value.replace(/,$/, '');

            list += '<li>' +
                '<button type="button" class="se-btn-list' + (_class ? ' ' + _class: '') + '" data-command="' + tag + '" data-value="' + value + '" title="' + name + '">' +
                    '<' + tag + attrs + '>' + name +  '</' + tag + '>' +
                '</button></li>';
        }
        list += '</ul></div>';

        listDiv.innerHTML = list;

        return listDiv;
    },

     /**
     * @Override submenu
     */
    on: function () {
        const util = this.util;
        const textStyleContext = this.context.textStyle;
        const styleButtonList = textStyleContext._styleList;
        const selectionNode = this.getSelectionNode();

        for (let i = 0, len = styleButtonList.length, btn, data, active; i < len; i++) {
            btn = styleButtonList[i];
            data = btn.getAttribute('data-value').split(',');
            
            for (let v = 0, node, value; v < data.length; v++) {
                node = selectionNode;
                active = false;
                
                while (node && !util.isFormatElement(node) && !util.isComponent(node)) {
                    if (node.nodeName.toLowerCase() === btn.getAttribute('data-command').toLowerCase()) {
                        value = data[v];
                        if (/^\./.test(value) ? util.hasClass(node, value.replace(/^\./, '')) : !!node.style[value]) {
                            active = true;
                            break;
                        }
                    }
                    node = node.parentNode;
                }

                if (!active) break;
            }

            active ? util.addClass(btn, 'active') : util.removeClass(btn, 'active');
        }

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

        const checkStyles = tag.style.cssText.replace(/:.+(;|$)/g, ',').split(',');
        checkStyles.pop();

        const classes = tag.classList;
        for (let i = 0, len = classes.length; i < len; i++) {
            checkStyles.push('.' + classes[i]);
        }

        const newNode = this.util.hasClass(target, 'active') ? null : tag.cloneNode(false);
        const removeNodes = newNode ? null : [tag.nodeName];
        this.nodeChange(newNode, checkStyles, removeNodes, true);

        this.submenuOff();
    }
};
