/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
SUNEDITOR.plugin.table = {
    add: function (_this, targetElement) {
        const context = _this.context;

        /** set submenu */
        let listDiv = eval(this.setSubmenu());
        let tablePicker = listDiv.getElementsByClassName('sun-editor-id-table-picker')[0];

        context.submenu.tableHighlight = listDiv.getElementsByClassName('sun-editor-id-table-highlighted')[0];
        context.submenu.tableUnHighlight = listDiv.getElementsByClassName('sun-editor-id-table-unhighlighted')[0];
        context.submenu.tableDisplay = listDiv.getElementsByClassName('sun-editor-table-display')[0];
        context.submenu._tableXY = [];

        /** add event listeners */
        tablePicker.addEventListener('mousemove', this.onMouseMove_tablePicker.bind(_this));
        tablePicker.addEventListener('click', this.appendTable.bind(_this));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        /** empty memory */
        listDiv = null, tablePicker = null;
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

    appendTable: function () {
        const oTable = document.createElement('TABLE');

        let x = this.context.submenu._tableXY[0];
        let y = this.context.submenu._tableXY[1];
        let tableHTML = '<tbody>';

        while (y > 0) {
            tableHTML += '<tr>';
            let tdCnt = x;
            while (tdCnt > 0) {
                tableHTML += '<td><p>&#65279</p></td>';
                --tdCnt;
            }
            tableHTML += '</tr>';
            --y;
        }
        tableHTML += '</tbody>';

        oTable.innerHTML = tableHTML;

        this.insertNode(oTable, this.dom.getFormatElement(this.getSelectionNode()));
        this.appendP(oTable);

        SUNEDITOR.plugin.table.reset_table_picker.call(this);
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

        this.dom.changeTxt(this.context.submenu.tableDisplay, x + ' x ' + y);
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

        this.dom.changeTxt(this.context.submenu.tableDisplay, '1 x 1');
        this.submenuOff();
    }
};