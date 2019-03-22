/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

import util from '../../lib/util';

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
            _trCnt: 0,
            _tableXY: []
        };

        /** set submenu */
        let listDiv = eval(this.setSubmenu());
        let tablePicker = listDiv.getElementsByClassName('sun-editor-id-table-picker')[0];

        context.table.tableHighlight = listDiv.getElementsByClassName('sun-editor-id-table-highlighted')[0];
        context.table.tableUnHighlight = listDiv.getElementsByClassName('sun-editor-id-table-unhighlighted')[0];
        context.table.tableDisplay = listDiv.getElementsByClassName('sun-editor-table-display')[0];

        /** set resizing */
        let resizeDiv = eval(this.setController_tableEditor(core.lang));
        context.table.resizeDiv = resizeDiv;
        resizeDiv.addEventListener('mousedown', function (e) { e.stopPropagation(); }, false);
        
        /** add event listeners */
        tablePicker.addEventListener('mousemove', this.onMouseMove_tablePicker.bind(core));
        tablePicker.addEventListener('click', this.appendTable.bind(core));
        resizeDiv.addEventListener('click', this.onClick_resizeDiv.bind(core));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);
        context.element.relative.appendChild(resizeDiv);

        /** empty memory */
        listDiv = null, tablePicker = null, resizeDiv = null;
    },

    setSubmenu: function () {
        const listDiv = util.createElement('DIV');
        listDiv.className = 'sun-editor-submenu table-content';
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

    setController_tableEditor: function (lang) {
        const tableResize = util.createElement('DIV');

        tableResize.className = 'sun-editor-id-table-edit';
        tableResize.style.display = 'none';
        tableResize.innerHTML = '' +
            '<div class="arrow arrow-up"></div>' +
            '<div>' +
            '   <div class="btn-group">' +
            '     <button type="button" data-command="insert" data-value="row" data-option="up" title="' + lang.controller.insertRowAbove + '"><div class="icon-insert-row-above"></div></button>' +
            '     <button type="button" data-command="insert" data-value="row" data-option="down" title="' + lang.controller.insertRowBelow + '"><div class="icon-insert-row-below"></div></button>' +
            '     <button type="button" data-command="delete" data-value="row" title="' + lang.controller.deleteRow + '"><div class="icon-delete-row"></div></button>' +
            '   </div>' +
            '</div>' +
            '<div>' +
            '   <div class="btn-group">' +
            '     <button type="button" data-command="insert" data-value="cell" data-option="left" title="' + lang.controller.insertColumnBefore + '"><div class="icon-insert-column-left"></div></button>' +
            '     <button type="button" data-command="insert" data-value="cell" data-option="right" title="' + lang.controller.insertColumnAfter + '"><div class="icon-insert-column-right"></div></button>' +
            '     <button type="button" data-command="delete" data-value="cell" title="' + lang.controller.deleteColumn + '"><div class="icon-delete-column"></div></button>' +
            '     <button type="button" data-command="remove" title="' + lang.controller.remove + '"><div class="icon-delete"></div></button>' +
            '   </div>' +
            '</div>';

        return tableResize;
    },

    appendTable: function () {
        const oTable = util.createElement('TABLE');

        let x = this.context.table._tableXY[0];
        let y = this.context.table._tableXY[1];
        let tableHTML = '<tbody>';

        while (y > 0) {
            tableHTML += '<tr>';
            let tdCnt = x;
            while (tdCnt > 0) {
                tableHTML += '<td><div>' + util.zeroWidthSpace + '</div></td>';
                --tdCnt;
            }
            tableHTML += '</tr>';
            --y;
        }
        tableHTML += '</tbody>';

        oTable.innerHTML = tableHTML;

        const formatEl = util.getFormatElement(this.getSelectionNode());

        this.insertNode(oTable, /^LI$/i.test(formatEl.nodeName) ? util.getRangeFormatElement(formatEl) : formatEl);
        this.appendFormatTag(oTable);
        this.focus();

        this.plugins.table.reset_table_picker.call(this);
    },

    onMouseMove_tablePicker: function (e) {
        e.stopPropagation();

        let x = Math.ceil(e.offsetX / 18);
        let y = Math.ceil(e.offsetY / 18);
        x = x < 1 ? 1 : x;
        y = y < 1 ? 1 : y;
        this.context.table.tableHighlight.style.width = x + 'em';
        this.context.table.tableHighlight.style.height = y + 'em';

        let x_u = x < 5 ? 5 : (x > 9 ? 10 : x + 1);
        let y_u = y < 5 ? 5 : (y > 9 ? 10 : y + 1);
        this.context.table.tableUnHighlight.style.width = x_u + 'em';
        this.context.table.tableUnHighlight.style.height = y_u + 'em';

        util.changeTxt(this.context.table.tableDisplay, x + ' x ' + y);
        this.context.table._tableXY = [x, y];
    },

    reset_table_picker: function () {
        if (!this.context.table.tableHighlight) return;

        const highlight = this.context.table.tableHighlight.style;
        const unHighlight = this.context.table.tableUnHighlight.style;

        highlight.width = '1em';
        highlight.height = '1em';
        unHighlight.width = '5em';
        unHighlight.height = '5em';

        util.changeTxt(this.context.table.tableDisplay, '1 x 1');
        this.submenuOff();
    },

    init: function () {
        const contextTable = this.context.table;
        contextTable._element = null;
        contextTable._tdElement = null;
        contextTable._trElement = null;
        contextTable._trElements = 0;
        contextTable._tdIndex = 0;
        contextTable._trIndex = 0;
        contextTable._trCnt = 0;
        contextTable._tdCnt = 0;
        contextTable._tableXY = [];
    },

    /** table edit controller */
    call_controller_tableEdit: function (tdElement) {
        this.plugins.table.init.call(this);
        const contextTable = this.context.table;
        const resizeDiv = contextTable.resizeDiv;
        
        this.plugins.table.setPositionControllerDiv.call(this, tdElement, false);
        resizeDiv.style.display = 'block';

        this.controllersOn(resizeDiv);
    },

    setPositionControllerDiv: function (tdElement, reset) {
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

        const offset = util.getOffset(tdElement);
        resizeDiv.style.left = (offset.left - this.context.element.wysiwyg.scrollLeft) + 'px';
        resizeDiv.style.top = (offset.top + tdElement.offsetHeight + 12) + 'px';
    },

    insertRowCell: function (type, option) {
        const contextTable = this.context.table;

        if (type === 'row') {
            const rowIndex = option === 'up' ? contextTable._trIndex : contextTable._trIndex + 1;
            let cells = '';

            for (let i = 0, len = contextTable._tdCnt; i < len; i++) {
                cells += '<td><div>' + util.zeroWidthSpace + '</div></td>';
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
                cell.innerHTML = '<div>' + util.zeroWidthSpace + '</div>';
            }
        }

        this.plugins.table.setPositionControllerDiv.call(this, contextTable._tdElement, true);
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
            util.removeItem(contextTable._element);
            this.controllersOff();
            this.focus();
        }

    }
};
