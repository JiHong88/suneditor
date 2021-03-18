/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2018 JiHong Lee.
 * MIT license.
 */
'use strict';

export default {
    name: 'selectMenu',
    add: function (core) {
        core.context.selectMenu = {
            caller: {},
            callerContext: null
        };
    },

    setForm: function () {
        return '<div class="se-select-list"></div>';
    },

    createList: function (listContext, items, html) {
        listContext.form.innerHTML = '<ul>' + html + '</ul>';
        listContext.items = items;
        listContext.menus = listContext.form.querySelectorAll('li');
    },

    initEvent: function (pluginName, forms) {
        const form = forms.querySelector('.se-select-list');
        const context = this.context.selectMenu.caller[pluginName] = {
            form: form,
            items: [],
            menus: [],
            index: -1,
            item: null,
            clickMethod: null,
            callerName: pluginName
        };

        form.addEventListener('mousedown', this.plugins.selectMenu.onMousedown_list);
        form.addEventListener('mousemove', this.plugins.selectMenu.onMouseMove_list.bind(this, context));
        form.addEventListener('click', this.plugins.selectMenu.onClick_list.bind(this, context));
    },

    onMousedown_list: function (e) {
        e.preventDefault();
        e.stopPropagation();
    },

    onMouseMove_list: function (context, e) {
        this.util.addClass(context.form, '__se_select-menu-mouse-move');
        const index = e.target.getAttribute('data-index');
        if (!index) return;
        context.index = index * 1;
    },

    onClick_list: function (context, e) {
        const index = e.target.getAttribute('data-index');
        if (!index) return;
        context.clickMethod.call(this, context.items[index]);
    },

    moveItem: function (listContext, num) {
        this.util.removeClass(listContext.form, '__se_select-menu-mouse-move');
        num = listContext.index + num;
        const menus = listContext.menus;
        const len = menus.length;
        const selectIndex = listContext.index = num >= len ? 0 : num < 0 ? len - 1 : num;
        
        for (let i = 0; i < len; i++) {
            if (i === selectIndex) {
                this.util.addClass(menus[i], 'active');
            } else {
                this.util.removeClass(menus[i], 'active');
            }
        }

        listContext.item = listContext.items[selectIndex];
    },

    getItem: function (listContext, index) {
        index = (!index || index < 0) ? listContext.index : index;
        return listContext.items[index];
    },

    on: function (callerName, clickMethod) {
        const listContext = this.context.selectMenu.caller[callerName];
        this.context.selectMenu.callerContext = listContext;
        listContext.clickMethod = clickMethod;
        listContext.callerName = callerName;
    },

    open: function (listContext, positionHandler) {
        const form = listContext.form;
        form.style.visibility = 'hidden';
        form.style.display = 'block';
        positionHandler(form);
        form.style.visibility = '';
    },

    close: function (listContext) {
        listContext.form.style.display = 'none';
        listContext.items = [];
        listContext.menus = [];
        listContext.index = -1;
        listContext.item = null;
    },

    init: function (listContext) {
        if (!listContext) return;
        listContext.items = [];
        listContext.menus = [];
        listContext.index = -1;
        listContext.item = null;
        listContext.callerName = '';
        this.context.selectMenu.callerContext = null;
    }
};