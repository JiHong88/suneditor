
    describe('Merging and Splitting', () => {
        beforeEach(() => {
            table = document.createElement('table');
            tbody = document.createElement('tbody');
            tr1 = document.createElement('tr');
            td1 = document.createElement('td'); // Cell 1
            td2 = document.createElement('td'); // Cell 2
            tr2 = document.createElement('tr');
            td3 = document.createElement('td');
            td4 = document.createElement('td');

            tr1.appendChild(td1);
            tr1.appendChild(td2);
            tr2.appendChild(td3);
            tr2.appendChild(td4);
            tbody.appendChild(tr1);
            tbody.appendChild(tr2);
            table.appendChild(tbody);
            
            // Set basic content to avoid textContent errors if any
            td1.innerHTML = '<div>Cell 1</div>';
            td2.innerHTML = '<div>Cell 2</div>';

            tablePlugin.setCellInfo(td1, true);
        });

        it('should merge selected cells', () => {
            // Mock selectedCells
            const selectedCells = [td1, td2];
            
            // Execute merge
            tablePlugin.mergeCells(selectedCells);

            // Verify
            expect(td1.colSpan).toBe(2);
            expect(td2.parentNode).toBeNull(); // td2 should be removed from DOM
        });

        it('should split cell vertically', () => {
            // Merge first to get a colspan > 1
            td1.colSpan = 2;
            td2.remove(); // manually remove td2 for setup
            
            tablePlugin.setCellInfo(td1, true); // Re-set info for merged cell

            // Execute split
            // _OnSplitCells is internal but accessible for testing
            tablePlugin._OnSplitCells('vertical');

            // Verify
            expect(td1.colSpan).toBe(1);
            expect(tr1.cells.length).toBe(2); // Should have 2 cells again
        });

        it('should split cell horizontally', () => {
             // Setup rowspan
             td1.rowSpan = 2;
             td3.remove(); // Remove cell below to make space for rowspan
             
             tablePlugin.setCellInfo(td1, true);

             // Execute split
             tablePlugin._OnSplitCells('horizontal');

             // Verify
             expect(td1.rowSpan).toBe(1);
             // Should have inserted a new cell below or split property
             // Logic: newCell.rowSpan = 1. currentCell.rowSpan = 1.
             // It might create a new TR or insert into existing TR depending on logic.
             // If td3 was removed, tr2 has only td4.
             // Split horizontal should basically restore a cell in tr2?
             // Logic in _OnSplitCells: "rows[nextRowIndex].insertBefore(newCell...)"
             
             // Check if tr2 has 2 cells now (td4 and new one)
             expect(tr2.cells.length).toBe(2); 
        });
    });
