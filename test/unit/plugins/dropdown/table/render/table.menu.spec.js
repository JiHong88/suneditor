import { CreateSplitMenu, CreateColumnMenu, CreateRowMenu, CreateBorderMenu, CreateBorderFormatMenu } from '../../../../../../src/plugins/dropdown/table/render/table.menu';
import { BORDER_LIST, BORDER_FORMATS } from '../../../../../../src/plugins/dropdown/table/shared/table.constants';

jest.mock('../../../../../../src/modules/ui', () => ({
    _DragHandle: {}
}));

// jest.mock('../../../../../src/helper', () => ({
//     dom: {
//         utils: {
//             createElement: jest.fn((tag, attrs, html) => {
//                 const el = document.createElement(tag);
//                 if (html) el.innerHTML = html;
//                 return el;
//             })
//         }
//     }
// }));

describe('Table Menu Render', () => {
    let mockLang;
    let mockIcons;

    beforeEach(() => {
        mockLang = {
            verticalSplit: 'Vertical Split',
            horizontalSplit: 'Horizontal Split',
            insertColumnBefore: 'Insert Column Before',
            insertColumnAfter: 'Insert Column After',
            deleteColumn: 'Delete Column',
            insertRowAbove: 'Insert Row Above',
            insertRowBelow: 'Insert Row Below',
            deleteRow: 'Delete Row'
        };
        mockIcons = {
            insert_column_left: 'icon_left',
            insert_column_right: 'icon_right',
            delete_column: 'icon_delete_col',
            insert_row_above: 'icon_up',
            insert_row_below: 'icon_down',
            delete_row: 'icon_delete_row'
        };
    });

    describe('CreateSplitMenu', () => {
        it('should create split menu', () => {
            const result = CreateSplitMenu(mockLang);
            expect(result.items).toEqual(['vertical', 'horizontal']);
            expect(result.menus.length).toBe(2);
            expect(result.menus[0].title).toBe('Vertical Split');
        });
    });

    describe('CreateColumnMenu', () => {
        it('should create column menu', () => {
            const result = CreateColumnMenu(mockLang, mockIcons);
            expect(result.items).toEqual(['insert-left', 'insert-right', 'delete']);
            expect(result.menus.length).toBe(3);
            expect(result.menus[0].title).toBe('Insert Column Before');
        });
    });

    describe('CreateRowMenu', () => {
        it('should create row menu', () => {
            const result = CreateRowMenu(mockLang, mockIcons);
            expect(result.items).toEqual(['insert-above', 'insert-below', 'delete']);
            expect(result.menus.length).toBe(3);
            expect(result.menus[0].title).toBe('Insert Row Above');
        });
    });

    describe('CreateBorderMenu', () => {
        it('should create border menu', () => {
            const result = CreateBorderMenu();
            expect(result.items).toEqual(BORDER_LIST);
            expect(result.menus.length).toBe(BORDER_LIST.length);
        });
    });

    describe('CreateBorderFormatMenu', () => {
        it('should create border format menu', () => {
             // Mock lang for formats
             const formatLangs = {};
             // Simulate langs based on BORDER_FORMATS values
            Object.values(BORDER_FORMATS).forEach(val => formatLangs[val] = val);
            
            const result = CreateBorderFormatMenu(formatLangs, {}, []);
            expect(result.items.length).toBeGreaterThan(0);
            expect(result.menus.length).toBe(result.items.length);
        });

        it('should exclude ignored formats', () => {
            const formatLangs = {};
            const ignored = Object.keys(BORDER_FORMATS)[0];
            
            const result = CreateBorderFormatMenu(formatLangs, {}, [ignored]);
            expect(result.items).not.toContain(ignored);
        });
    });
});
