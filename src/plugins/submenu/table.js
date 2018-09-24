/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

export default {
    name: 'table',
    add: function (core, targetElement) {
        const context = core.context;
        context.table = {
            _element: null,
            _tdElement: null,
            _trElement: null,
            _trElements: null,
            _tdIndex: 0,
            _trIndex: 0,
            _tdCnt: 0,
            _trCnt: 0
        };

        /** set submenu */
        let listDiv = eval(this.setSubmenu());
        let tablePicker = listDiv.getElementsByClassName('sun-editor-id-table-picker')[0];

        context.submenu.tableHighlight = listDiv.getElementsByClassName('sun-editor-id-table-highlighted')[0];
        context.submenu.tableUnHighlight = listDiv.getElementsByClassName('sun-editor-id-table-unhighlighted')[0];
        context.submenu.tableDisplay = listDiv.getElementsByClassName('sun-editor-table-display')[0];
        context.submenu._tableXY = [];

        /** set resizing */
        let resizeDiv = eval(this.setController_tableResize(core.lang));
        let resizeBar = this.setController_tableResizeBar();

        context.table.resizeDiv = resizeDiv;
        context.table.resizeBar = resizeBar;
        
        /** add event listeners */
        tablePicker.addEventListener('mousemove', this.onMouseMove_tablePicker.bind(core));
        tablePicker.addEventListener('click', this.appendTable.bind(core));
        resizeDiv.addEventListener('click', this.onClick_resizeDiv.bind(core));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);
        context.element.relative.appendChild(resizeDiv);
        context.element.relative.appendChild(resizeBar);

        /** empty memory */
        listDiv = null, tablePicker = null, resizeDiv = null, resizeBar = null;
    },

    setSubmenu: function () {
        const listDiv = document.createElement('DIV');
        listDiv.className = 'table-content';
        listDiv.style.display = 'none';

        listDiv.innerHTML = '' +
            '<div class="table-data-form">' +
            '   <div class="table-picker sun-editor-id-table-picker"></div>' +
            '   <div class="table-highlighted sun-editor-id-table-highlighted"></div>' +
            '   <div class="table-unhighlighted sun-editor-id-table-unhighlighted"></div>' +
            '</div>' +
            '<div class="table-display sun-editor-table-display">1 x 1</div>';

        return listDiv;
    },

    setController_tableResize: function (lang) {
        const tableResize = document.createElement('DIV');

        tableResize.className = 'sun-editor-id-table-resize';
        tableResize.style.display = 'none';
        tableResize.innerHTML = '' +
            '<div class="arrow"></div>' +
            '<div>' +
            '   <div class="btn-group">' +
            '     <button type="button" data-command="insert" data-value="row" data-option="up" title="' + lang.controller.insertRowAbove + '"><div class="icon-insert-row-above"></div></button>' +
            '     <button type="button" data-command="insert" data-value="row" data-option="down" title="' + lang.controller.insertRowBelow + '"><div class="icon-insert-row-below"></div></button>' +
            '     <button type="button" data-command="delete" data-value="row" title="' + lang.controller.deleteRow + '"><div class="icon-delete-row"></div></button>' +
            '   </div>' +
            '   <div class="btn-group">' +
            '     <button type="button" data-command="insert" data-value="cell" data-option="left" title="' + lang.controller.insertColumnBefore + '"><div class="icon-insert-column-left"></div></button>' +
            '     <button type="button" data-command="insert" data-value="cell" data-option="right" title="' + lang.controller.insertColumnAfter + '"><div class="icon-insert-column-right"></div></button>' +
            '     <button type="button" data-command="delete" data-value="cell" title="' + lang.controller.deleteColumn + '"><div class="icon-delete-column"></div></button>' +
            '   </div>' +
            '   <div class="btn-group">' +
            '     <button type="button" data-command="remove" title="' + lang.controller.remove + '"><div class="icon-cancel"></div></button>' +
            '   </div>' +
            '</div>';

        return tableResize;
    },

    setController_tableResizeBar: function () {
        const resizeDiv = document.createElement('DIV');
        resizeDiv.style.display = 'none';
        resizeDiv.className = 'sun-editor-id-table-resize-bar';
        return resizeDiv;
    },

    appendTable: function () {
        const oTable = document.createElement('TABLE');

        let x = this.context.submenu._tableXY[0];
        let y = this.context.submenu._tableXY[1];
        let tableHTML = '<tbody>';

        while (y > 0) {
            tableHTML += '<tr>';
            let tdCnt = x;
            while (tdCnt > 0) {
                tableHTML += '<td><div>&#65279</div></td>';
                --tdCnt;
            }
            tableHTML += '</tr>';
            --y;
        }
        tableHTML += '</tbody>';

        oTable.innerHTML = tableHTML;

        this.insertNode(oTable, this.util.getFormatElement(this.getSelectionNode()));
        this.appendP(oTable);

        // oTable.addEventListener('mouseover', this.plugins.table.onMouseover_table);
        this.plugins.table.reset_table_picker.call(this);
    },

    onMouseMove_tablePicker: function (e) {
        e.stopPropagation();

        let x = Math.ceil(e.offsetX / 18);
        let y = Math.ceil(e.offsetY / 18);
        x = x < 1 ? 1 : x;
        y = y < 1 ? 1 : y;
        this.context.submenu.tableHighlight.style.width = x + 'em';
        this.context.submenu.tableHighlight.style.height = y + 'em';

        let x_u = x < 5 ? 5 : (x > 9 ? 10 : x + 1);
        let y_u = y < 5 ? 5 : (y > 9 ? 10 : y + 1);
        this.context.submenu.tableUnHighlight.style.width = x_u + 'em';
        this.context.submenu.tableUnHighlight.style.height = y_u + 'em';

        this.util.changeTxt(this.context.submenu.tableDisplay, x + ' x ' + y);
        this.context.submenu._tableXY = [x, y];
    },

    reset_table_picker: function () {
        if (!this.context.submenu.tableHighlight) return;

        const highlight = this.context.submenu.tableHighlight.style;
        const unHighlight = this.context.submenu.tableUnHighlight.style;

        highlight.width = '1em';
        highlight.height = '1em';
        unHighlight.width = '5em';
        unHighlight.height = '5em';

        this.util.changeTxt(this.context.submenu.tableDisplay, '1 x 1');
        this.submenuOff();
    },

    init: function () {
        const contextTable = this.context.table;
        
        if (contextTable._tdElement) this.util.removeClass(contextTable._tdElement, 'sun-editor-selected-cell');

        contextTable._element = null;
        contextTable._tdElement = null;
        contextTable._trElement = null;
        contextTable._trElements = 0;
        contextTable._tdIndex = 0;
        contextTable._trIndex = 0;
        contextTable._trCnt = 0;
        contextTable._tdCnt = 0;
    },

    /** table resizing */
    call_controller_tableResize: function (tdElement) {
        const contextTable = this.context.table;
        const resizeDiv = contextTable.resizeDiv;
        
        this.plugins.table.setPositionResizeDiv.call(this, tdElement, false);
        resizeDiv.style.display = 'block';

        this.controllerArray = [resizeDiv];
        this.controllerFunction = [this.plugins.table.init.bind(this)];
    },

    setPositionResizeDiv: function (tdElement, reset) {
        const contextTable = this.context.table;
        const resizeDiv = contextTable.resizeDiv;
        let table = contextTable._element;

        if (!table) {
            table = tdElement;
            while (!/^TABLE$/i.test(table.nodeName)) {
                table = table.parentNode;
            }
            contextTable._element = table;
        }

        if (contextTable._tdElement !== tdElement) {
            if (contextTable._tdElement) this.util.removeClass(contextTable._tdElement, 'sun-editor-selected-cell');
            this.util.addClass(tdElement, 'sun-editor-selected-cell');
            contextTable._tdElement = tdElement;
            contextTable._trElement = tdElement.parentNode;
        }

        if (reset || contextTable._trCnt === 0) {
            contextTable._trElements = table.rows;
            contextTable._tdIndex = tdElement.cellIndex;
            contextTable._trIndex = contextTable._trElement.rowIndex;
            contextTable._trCnt = table.rows.length;
            contextTable._tdCnt = contextTable._trElement.cells.length;
        }

        resizeDiv.style.left = (tdElement.offsetLeft + table.offsetLeft) + 'px';
        resizeDiv.style.top = (tdElement.offsetTop + tdElement.offsetHeight + table.offsetTop - this.context.element.wysiwyg.scrollTop + 10) + 'px';
    },

    insertRowCell: function (type, option) {
        const contextTable = this.context.table;

        if (type === 'row') {
            const rowIndex = option === 'up' ? contextTable._trIndex : contextTable._trIndex + 1;
            let cells = '';

            for (let i = 0, len = contextTable._tdCnt; i < len; i++) {
                cells += '<td><div>&#65279</div></td>';
            }

            const newRow = contextTable._element.insertRow(rowIndex);
            newRow.innerHTML = cells;
        }
        // cell
        else {
            const trArray = contextTable._trElements;
            const cellIndex = option === 'left' ? contextTable._tdIndex : contextTable._tdIndex + 1;
            let cell = null;
            
            for (let i = 0, len = contextTable._trCnt; i < len; i++) {
                cell = trArray[i].insertCell(cellIndex);
                cell.innerHTML = '<div>&#65279</div>';
            }
        }

        this.plugins.table.setPositionResizeDiv.call(this, contextTable._tdElement, true);
    },

    deleteRowCell: function (type) {
        const contextTable = this.context.table;

        if (type === 'row') {
            contextTable._element.deleteRow(contextTable._trIndex);
        }
        // cell
        else {
            const trArray = contextTable._trElements;
            const cellIndex = contextTable._tdIndex;
            
            for (let i = 0, len = contextTable._trCnt; i < len; i++) {
                trArray[i].deleteCell(cellIndex);
            }
        }

        this.controllersOff();
    },

    onClick_resizeDiv: function (e) {
        e.stopPropagation();
        const target = e.target;

        const command = target.getAttribute('data-command') || target.parentNode.getAttribute('data-command');
        const value = target.getAttribute('data-value') || target.parentNode.getAttribute('data-value');
        const option = target.getAttribute('data-option') || target.parentNode.getAttribute('data-option');
        
        if (!command) return;

        e.preventDefault();
        const contextTable = this.context.table;

        switch (command) {
            case 'insert':
                this.plugins.table.insertRowCell.call(this, value, option);
                break;
            case 'delete':
                this.plugins.table.deleteRowCell.call(this, value);
                break;
            case 'remove':
            this.util.removeItem(contextTable._element);
            this.controllersOff();
            this.focus();
        }

    }
};
