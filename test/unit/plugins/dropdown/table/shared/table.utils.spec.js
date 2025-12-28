import {
    IsResizeEls,
    CheckCellEdge,
    CheckRowEdge,
    CreateCellsString,
    CreateCellsHTML,
    GetMaxColumns,
    InvalidateMaxColumnsCache,
    GetLogicalCellIndex,
    InvalidateCellIndexCache,
    InvalidateTableCache,
    CloneTable
} from '../../../../../../src/plugins/dropdown/table/shared/table.utils';
import * as Constants from '../../../../../../src/plugins/dropdown/table/shared/table.constants';

// Remove helper mock to avoid Babel crash, relying on real helper or JSDOM environment
// jest.mock('../../../../../../src/helper', ...);

jest.mock('../../../../../../src/modules/ui', () => ({
    _DragHandle: jest.fn()
}));

describe('TableUtils', () => {
    describe('IsResizeEls', () => {
        it('should return true for TD, TH, TR', () => {
            expect(IsResizeEls(document.createElement('td'))).toBe(true);
            expect(IsResizeEls(document.createElement('th'))).toBe(true);
            expect(IsResizeEls(document.createElement('tr'))).toBe(true);
        });

        it('should return false for other elements', () => {
            expect(IsResizeEls(document.createElement('div'))).toBe(false);
            expect(IsResizeEls(null)).toBe(false);
        });
    });

    describe('CheckCellEdge', () => {
        it('should detect left edge', () => {
            const cell = document.createElement('td');
            // Assuming real helper.env works or we mock window.getComputedStyle
            // Real env uses window.
            const win = window;
            jest.spyOn(win, 'getComputedStyle').mockReturnValue({ width: '100px' });
            
            // Mock getBoundingClientRect
            cell.getBoundingClientRect = jest.fn(() => ({
                left: 100,
                right: 200,
                width: 100
            }));
            
            const event = { clientX: 105 }; // 5px from left
            
            const result = CheckCellEdge(event, cell);
            expect(result.isLeft).toBe(true);
            expect(result.is).toBe(true);
        });

        it('should detect right edge', () => {
            const cell = document.createElement('td');
            const win = window;
            jest.spyOn(win, 'getComputedStyle').mockReturnValue({ width: '100px' });
            
            cell.getBoundingClientRect = jest.fn(() => ({
                left: 100,
                right: 200,
                width: 100
            }));
            
            const event = { clientX: 195 }; // 5px from right (width - offset <= margin)
            
            const result = CheckCellEdge(event, cell);
            expect(result.isLeft).toBe(false);
            expect(result.is).toBe(true);
        });
    });

    describe('CreateCellsString', () => {
        it('should create cell strings', () => {
            const str = CreateCellsString('TD', 2);
            expect(str).toBe('<td><div><br></div></td><td><div><br></div></td>');
        });
    });

    describe('CreateCellsHTML', () => {
        it('should create cell elements', () => {
            const el = CreateCellsHTML('TD');
            expect(el.nodeName).toBe('TD');
            expect(el.innerHTML).toBe('<div><br></div>');
        });
    });

    describe('GetMaxColumns', () => {
        it('should calculate max columns correctly', () => {
             const table = document.createElement('table');
             const tbody = document.createElement('tbody');
             const tr1 = document.createElement('tr');
             
             // 3 cells
             tr1.appendChild(document.createElement('td')); 
             tr1.appendChild(document.createElement('td')); 
             tr1.appendChild(document.createElement('td'));
             // Set colSpan (default 1, but JSDOM might need explicit setting if we rely on it)
             // table.utils code uses cells[j].colSpan
             
             tbody.appendChild(tr1);
             table.appendChild(tbody);
             
             expect(GetMaxColumns(table)).toBe(3);
             
             // Test caching
             // Mutate table but don't invalidate
             tr1.appendChild(document.createElement('td'));
             expect(GetMaxColumns(table)).toBe(3); // Should still be 3 from cache
             
             InvalidateMaxColumnsCache(table);
             expect(GetMaxColumns(table)).toBe(4);
        });
    });

    describe('GetLogicalCellIndex', () => {
        it('should calculate logical cell index correctly with rowspans', () => {
             // 2x2 table
             // [0,0] [0,1 rowspan=2]
             // [1,0]
             
             const table = document.createElement('table');
             const tbody = document.createElement('tbody');
             const r0 = document.createElement('tr');
             const c00 = document.createElement('td');
             const c01 = document.createElement('td');
             c01.rowSpan = 2;
             r0.append(c00, c01);
             
             const r1 = document.createElement('tr');
             const c10 = document.createElement('td');
             r1.append(c10);
             
             tbody.append(r0, r1);
             table.appendChild(tbody);
             
             // (0, 0) -> 0
             expect(GetLogicalCellIndex(table, c00, 0, 0)).toBe(0);
             // (0, 1) -> 1
             expect(GetLogicalCellIndex(table, c01, 0, 1)).toBe(1);
             // (1, 0) -> 0 (physically 0) but logically?
             // Row 1: col 0 is free? No.
             // Row 0 has c00 (col 0), c01 (col 1).
             // Row 1 has c10. c01 spans to Row 1 Col 1.
             // So c10 should be at col 0.
             expect(GetLogicalCellIndex(table, c10, 1, 0)).toBe(0);
        });
        
        it('should handle colspan in logical index', () => {
             // [0,0 colspan=2] [0,1]
             const table = document.createElement('table');
             const tbody = document.createElement('tbody');
             const r0 = document.createElement('tr');
             const c00 = document.createElement('td');
             c00.colSpan = 2;
             const c01 = document.createElement('td');
             r0.append(c00, c01);
             tbody.append(r0);
             table.appendChild(tbody);
             
             expect(GetLogicalCellIndex(table, c00, 0, 0)).toBe(0);
             expect(GetLogicalCellIndex(table, c01, 0, 1)).toBe(2); // 0+2 = 2
        });
    });

    describe('CloneTable', () => {
        it('should clone table and map selected cells', () => {
            const table = document.createElement('table');
            const tr = document.createElement('tr');
            const td1 = document.createElement('td');
            const td2 = document.createElement('td');
            tr.append(td1, td2);
            table.appendChild(tr);
            
            const selectedCells = [td2];
            
            const result = CloneTable(table, selectedCells);
            
            expect(result.clonedTable).not.toBe(table);
            expect(result.clonedTable.querySelectorAll('td').length).toBe(2);
            expect(result.clonedSelectedCells.length).toBe(1);
            // It should be the second cell in the cloned table
            const clonedTd2 = result.clonedTable.rows[0].cells[1];
            expect(result.clonedSelectedCells[0]).toBe(clonedTd2);
        });
    });
    
    describe('InvalidateTableCache', () => {
        it('should clear all caches', () => {
            const table = document.createElement('table');
            GetMaxColumns(table); // populate cache
            
            InvalidateTableCache(table);
            
            // Verify implicitly via GetMaxColumns recalculation check or mocked map?
            // Since we can't easily access WeakMap internals without exporting them or mocking WeakMap itself (which is hard),
            // we rely on behavior:
            
            // Populate cache
            const tbody = document.createElement('tbody');
            const tr = document.createElement('tr');
            tr.appendChild(document.createElement('td'));
            tbody.appendChild(tr);
            table.appendChild(tbody);
            
            expect(GetMaxColumns(table)).toBe(1);
            
            // Mutate
            tr.appendChild(document.createElement('td'));
            // Without invalidate, should be 1
            expect(GetMaxColumns(table)).toBe(1);
            
            InvalidateTableCache(table);
            // After invalidate, should be 2
            expect(GetMaxColumns(table)).toBe(2);
        });
    });
});
