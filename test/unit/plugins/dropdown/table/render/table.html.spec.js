import { CreateHTML, CreateHTML_controller_table, CreateHTML_controller_cell, CreateHTML_controller_properties } from '../../../../../../src/plugins/dropdown/table/render/table.html';
import { BORDER_FORMATS } from '../../../../../../src/plugins/dropdown/table/shared/table.constants';

jest.mock('../../../../../../src/modules/ui', () => ({
    _DragHandle: {}
}));

describe('Table HTML Render', () => {
    let mockLang;
    let mockIcons;
    let mockOptions;

    beforeEach(() => {
        mockLang = {
            tableProperties: 'Table Properties',
            fixedColumnWidth: 'Fixed Column Width',
            tableHeader: 'Table Header',
            caption: 'Caption',
            minSize: 'Min Size',
            copy: 'Copy',
            remove: 'Remove',
            cellProperties: 'Cell Properties',
            column: 'Column',
            row: 'Row',
            mergeCells: 'Merge Cells',
            splitCells: 'Split Cells',
            unmergeCells: 'Unmerge Cells',
            border: 'Border',
            color: 'Color',
            colorPicker: 'Color Picker',
            width: 'Width',
            fontColor: 'Font Color',
            backgroundColor: 'Background Color',
            font: 'Font',
            bold: 'Bold',
            underline: 'Underline',
            italic: 'Italic',
            strike: 'Strike',
            align: 'Align',
            table: 'Table',
            submitButton: 'Submit',
            revert: 'Revert',
            close: 'Close',
            alignLeft: 'Align Left',
            alignCenter: 'Align Center',
            alignRight: 'Align Right',
            alignJustify: 'Align Justify',
            alignTop: 'Align Top',
            alignMiddle: 'Align Middle',
            alignBottom: 'Align Bottom'
        };
        mockIcons = {
            table_properties: 'prop',
            fixed_column_width: 'fixed',
            table_header: 'header',
            caption: 'caption',
            reduction: 'reduction',
            copy: 'copy',
            delete: 'delete',
            cell_properties: 'cell_prop',
            table_column: 'col',
            table_row: 'row',
            merge_cell: 'merge',
            split_cell: 'split',
            unmerge_cell: 'unmerge',
            cancel: 'cancel',
            arrow_down: 'down',
            color_palette: 'palette',
            font_color: 'font_color',
            background_color: 'bg_color',
            bold: 'bold',
            underline: 'underline',
            italic: 'italic',
            strike: 'strike',
            checked: 'check',
            revert: 'revert',
            align_left: 'left',
            align_center: 'center',
            align_right: 'right',
            align_justify: 'justify',
            align_top: 'top',
            align_middle: 'middle',
            align_bottom: 'bottom'
        };
        mockOptions = {
            get: jest.fn((key) => key === '_rtl' ? false : null)
        };
    });

    describe('CreateHTML', () => {
        it('should create initial HTML structure', () => {
             const result = CreateHTML();
             expect(result.classList.contains('se-selector-table')).toBe(true);
             expect(result.querySelector('.se-table-size-display')).not.toBeNull();
        });
    });

    describe('CreateHTML_controller_table', () => {
        it('should create table controller', () => {
            const result = CreateHTML_controller_table({ lang: mockLang, icons: mockIcons });
            expect(result.classList.contains('se-controller-table')).toBe(true);
            expect(result.querySelector('[data-command="openTableProperties"]')).not.toBeNull();
        });
    });

    describe('CreateHTML_controller_cell', () => {
        it('should create cell controller with arrow down', () => {
             const result = CreateHTML_controller_cell({ lang: mockLang, icons: mockIcons }, true);
             expect(result.html.querySelector('.se-arrow-down')).not.toBeNull();
             expect(result.html.querySelector('.se-visible-hidden')).not.toBeNull();
        });

        it('should create cell controller with arrow up', () => {
             const result = CreateHTML_controller_cell({ lang: mockLang, icons: mockIcons }, false);
             expect(result.html.querySelector('.se-arrow-up')).not.toBeNull();
             expect(result.html.querySelector('.se-arrow-down')).toBeNull();
        });
    });

    describe('CreateHTML_controller_properties', () => {
        it('should create properties controller', () => {
             // Mock options with RTL false
             mockOptions.get.mockReturnValue(false);
             const result = CreateHTML_controller_properties({ lang: mockLang, icons: mockIcons, options: mockOptions });
             
             expect(result.html.classList.contains('se-table-props')).toBe(true);
             expect(result.controller_props_title.textContent).toBe('Table Properties');
             expect(result.borderButton).not.toBeNull();
        });

        it('should handle RTL alignment options', () => {
             // Mock options with RTL true
             mockOptions.get.mockReturnValue(true);
             const result = CreateHTML_controller_properties({ lang: mockLang, icons: mockIcons, options: mockOptions });
             
             // Check order of align buttons? 
             // Just verifying it runs without error and returns structure is mostly sufficient unless checking innerHTML.
             // We can check data-value of first button
             const firstAlign = result.cell_alignment.querySelector('button');
             expect(firstAlign.getAttribute('data-value')).toBe('right');
        });
    });
});
