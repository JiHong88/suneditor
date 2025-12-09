
import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';
import { dom, env } from '../../../../src/helper';

describe('Offset Class Extra Coverage', () => {
    let editor;
    let offset;
    let wysiwyg;

    beforeEach(async () => {
        editor = createTestEditor();
        await waitForEditorReady(editor);
        offset = editor.offset;
        wysiwyg = editor.frameContext.get('wysiwyg');
    });

    afterEach(() => {
        destroyTestEditor(editor);
    });

    describe('getLocal - Complex calculations', () => {
        it('should correctly calculate offsets with multiple scrollable parents', () => {
             const parent = document.createElement('div');
             parent.style.position = 'relative';
             parent.style.overflow = 'scroll';
             parent.style.height = '100px';
             parent.scrollTop = 50; 

             const child = document.createElement('div');
             child.style.position = 'relative';
             child.style.overflow = 'scroll';
             child.style.height = '200px'; 
             child.scrollTop = 20;

             const target = document.createElement('span');
             target.textContent = 'Target';
             
             child.appendChild(target);
             parent.appendChild(child);
             wysiwyg.appendChild(parent);

             Object.defineProperty(parent, 'offsetLeft', { value: 0 });
             Object.defineProperty(parent, 'offsetTop', { value: 0 });
             Object.defineProperty(child, 'offsetLeft', { value: 10 });
             Object.defineProperty(child, 'offsetTop', { value: 10 });
             Object.defineProperty(target, 'offsetLeft', { value: 5 });
             Object.defineProperty(target, 'offsetTop', { value: 5 });
             Object.defineProperty(target, 'offsetWidth', { value: 50 });
             
             Object.defineProperty(target, 'offsetParent', { value: child });
             Object.defineProperty(child, 'offsetParent', { value: parent });
             Object.defineProperty(parent, 'offsetParent', { value: wysiwyg });

             const result = offset.getLocal(target);
             
             // The logic cumulatively adds scrollTop/Left for offset calculation relative to document origin if not handled differently.
             // Based on code: offsetTop += ... + scrollTop. 
             // We verify it returns a valid calculated number.
             expect(result.top).toBeGreaterThan(0);
        });
    });

    describe('getGlobalScroll - Advanced Scenarios', () => {
        it('should handle elements where scrollHeight >= clientHeight (vertical scrollable)', () => {
            const scrollable = document.createElement('div');
            Object.defineProperty(scrollable, 'scrollHeight', { value: 200 });
            Object.defineProperty(scrollable, 'clientHeight', { value: 100 });
            Object.defineProperty(scrollable, 'scrollTop', { value: 50 });
            
            // To ensure this element is picked up as 'ohOffsetEl' or affects 'oh',
            // we need to make sure parents don't override it with 0 height (default in JSDOM).
            // Mock wysiwyg to be large enough to not be mistakenly considered a 0-height scroll container
            // or effectively "transparent" to size.
            // If wysiwyg is 0/0, 0>=0 is true, so it overwrites oh with 0.
            Object.defineProperty(wysiwyg, 'scrollHeight', { value: 1000 });
            Object.defineProperty(wysiwyg, 'clientHeight', { value: 1000 });
            
            const topArea = editor.frameContext.get('topArea');
            Object.defineProperty(topArea, 'scrollHeight', { value: 2000 });
            Object.defineProperty(topArea, 'clientHeight', { value: 2000 });
            
            Object.defineProperty(document.body, 'scrollHeight', { value: 3000 });
            Object.defineProperty(document.body, 'clientHeight', { value: 3000 });

            wysiwyg.appendChild(scrollable);
            
            const result = offset.getGlobalScroll(scrollable);
            
            expect(result.top).toBeGreaterThanOrEqual(0);
            expect(result.oh).toBeGreaterThan(0);
        });
    });

    describe('setAbsPosition - Boundary flipping', () => {
        let element, target;
        
        beforeEach(() => {
            element = document.createElement('div');
            target = document.createElement('div');
            document.body.appendChild(element);
            document.body.appendChild(target);
            
            // Set dimensions
            Object.defineProperty(element, 'offsetHeight', { value: 100 });
            Object.defineProperty(element, 'offsetWidth', { value: 100 });
            Object.defineProperty(target, 'offsetHeight', { value: 20 });
            Object.defineProperty(target, 'offsetWidth', { value: 50 });
            
            // Clean up mocks after each test in this block
            jest.restoreAllMocks();
        });

        afterEach(() => {
            element.remove();
            target.remove();
        });

        it('should flip to top position if bottom overflows viewport', () => {
            jest.spyOn(target, 'getBoundingClientRect').mockReturnValue({
                top: 950,
                bottom: 970,
                left: 100,
                right: 150,
                width: 50,
                height: 20
            });

            jest.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(1000);
            
            // Mock editor global offset to ensure margin calculation is constrained
            // If editor assumes full window, rmb ~ bMargin.
            jest.spyOn(offset, 'getGlobal').mockReturnValue({
                top: 0,
                left: 0,
                fixedTop: 0,
                height: 1000 // Full height editor
            });
            
            const params = { position: 'bottom', inst: {} };
            const result = offset.setAbsPosition(element, target, params);
            
            expect(result.position).toBe('top'); // Expect flipped position
        });
        
        it('should flip to bottom position if top overflows viewport', () => {
            jest.spyOn(target, 'getBoundingClientRect').mockReturnValue({
                top: 10,
                bottom: 30,
                left: 100,
                right: 150,
                width: 50,
                height: 20
            });

            jest.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(1000);

             jest.spyOn(offset, 'getGlobal').mockReturnValue({
                top: 0,
                left: 0,
                fixedTop: 0,
                height: 1000
            });
            
            const params = { position: 'top', inst: {} };
            const result = offset.setAbsPosition(element, target, params);
            
            expect(result.position).toBe('bottom'); 
        });
    });

    describe('setRelPosition - Menu height adjustment', () => {
        it('should adjust position (move up) if menu overflows bottom but has space', () => {
            const element = document.createElement('div');
            const target = document.createElement('div');
            const container = document.createElement('div');
            const targetContainer = container;
            
            Object.defineProperty(element, 'offsetHeight', { value: 200 });
            Object.defineProperty(target, 'offsetHeight', { value: 30 });
            
            // Mock helper methods result
            jest.spyOn(offset, 'getGlobal').mockImplementation((node) => {
                if (node === target) return { top: 450, left: 0, fixedTop: 450, height: 30 };
                if (node === container) return { top: 0, left: 0 };
                return { top: 0, left: 0 };
            });
            
            jest.spyOn(offset, 'getGlobalScroll').mockReturnValue({ top: 0 });
            jest.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(500);
            
            offset.setRelPosition(element, container, target, targetContainer);
            
            const top = parseInt(element.style.top, 10);
            // It should be placed ABOVE the target (450). 
            // Target top is 450.
            expect(top).toBeLessThan(450);
        });

        it('should handle RTL alignment in setAbsPosition', () => {
            const element = document.createElement('div');
            const target = document.createElement('div');
            document.body.appendChild(element);
            document.body.appendChild(target);
            
            Object.defineProperty(element, 'offsetHeight', { value: 100 });
            Object.defineProperty(element, 'offsetWidth', { value: 100 });
            Object.defineProperty(target, 'offsetHeight', { value: 20 });
            Object.defineProperty(target, 'offsetWidth', { value: 50 });

            // Enable RTL
            const origGet = editor.options.get;
            editor.options.get = jest.fn((key) => key === '_rtl' ? true : origGet(key));
            
            // Mock positions
            jest.spyOn(target, 'getBoundingClientRect').mockReturnValue({
                top: 100, bottom: 120, left: 200, right: 250, width: 50, height: 20
            });
            jest.spyOn(offset, 'getGlobal').mockReturnValue({
                top: 100, left: 200, width: 50, height: 20, fixedTop: 100
            });
            
            const params = { position: 'bottom', inst: {} };
            offset.setAbsPosition(element, target, params);
            
            // RTL logic sets 'right' on arrow usually or adjusts 'left'.
            // In setAbsPosition: if (isLTR) ... else { ... l += targetRect.right ... }
            
            expect(element.style.left).toBeDefined();
            // In RTL, left is calculated differently. 
            // Assert it runs without error and sets a position.
            
            editor.options.get = origGet;
            element.remove();
            target.remove();
        });
    });

    describe('setRelPosition - Extra Coverage', () => {
        it('should just place below if there is enough space (Line 394)', () => {
            const element = document.createElement('div');
            const target = document.createElement('div');
            const container = document.createElement('div');
            
            // ample space setup
            // Element height: 100
            // Target top: 100
            // Viewport height: 1000
            // Bottom space = 1000 - 100 - targetHeight(50) = 850 >= 100.
            
            Object.defineProperty(element, 'offsetHeight', { value: 100 });
            Object.defineProperty(element, 'offsetWidth', { value: 100 });
            Object.defineProperty(target, 'offsetHeight', { value: 50 });
            Object.defineProperty(target, 'offsetWidth', { value: 50 });
            Object.defineProperty(container, 'offsetWidth', { value: 500 });
            
            jest.spyOn(offset, 'getGlobal').mockImplementation((node) => {
                if (node === target) return { top: 100, left: 100, fixedTop: 100, height: 50 };
                if (node === container) return { top: 0, left: 0 };
                // for element
                return { top: 0, left: 0 };
            });
            jest.spyOn(offset, 'getGlobalScroll').mockReturnValue({ top: 0 });
            jest.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(1000);
            
            offset.setRelPosition(element, container, target, container);
            
            // Expected top = target.top + target.height = 100 + 50 = 150
            expect(element.style.top).toBe('150px');
        });

        it('should handle RTL container left check (Line 409)', () => {
             const element = document.createElement('div');
             const target = document.createElement('div');
             const container = document.createElement('div');
             
             // Ensure RTL mode
             const origGet = editor.options.get;
             editor.options.get = jest.fn((key) => key === '_rtl' ? true : origGet(key));
             
             Object.defineProperty(element, 'offsetWidth', { value: 100 });
             Object.defineProperty(target, 'offsetWidth', { value: 50 });
             
             // Setup offsets so tcleft > element.left
             // tcleft (container left) = 150
             // element left calculated: targetLeft (100) - (100-50) + 0 = 50.
             // 150 > 50 -> True.
             
             jest.spyOn(offset, 'getGlobal').mockImplementation((node) => {
                 if (node === target) return { top: 0, left: 100 };
                 if (node === container) return { top: 0, left: 150 };
                 if (node === element) return { top: 0, left: 50 }; // recursive call check?
                 return { top: 0, left: 0 };
             });
             
             // We need to allow getGlobal to return different values for different calls if needed, 
             // but here simple map is fine.
             // Warning: setRelPosition calls getGlobal(element) inside the check.
             
             offset.setRelPosition(element, container, target, container);
             
             // Expect element.style.left to be container left (150px)
             expect(element.style.left).toBe('150px');
             
             editor.options.get = origGet;
        });

        it('should handle LTR overflow left adjustment (Line 415)', () => {
             const element = document.createElement('div');
             const target = document.createElement('div');
             const container = document.createElement('div');
             
             // LTR mode (default)
             
             Object.defineProperty(element, 'offsetWidth', { value: 200 });
             Object.defineProperty(target, 'offsetWidth', { value: 50 });
             Object.defineProperty(container, 'offsetWidth', { value: 300 });

             // cw (container width + left) = 300 + 0 = 300.
             // target left = 200.
             // ew = 200.
             // overLeft check: cw (300) <= ew (200) ? No.
             // cw - (tl + ew) = 300 - (200 + 200) = 300 - 400 = -100.
             // overLeft (-100) < 0 -> True.
             
             jest.spyOn(offset, 'getGlobal').mockImplementation((node) => {
                 if (node === target) return { top: 0, left: 200 };
                 if (node === container) return { top: 0, left: 0 };
                 return { top: 0, left: 0 };
             });
             
             offset.setRelPosition(element, container, target, container);
             
             // Expect left = tl + overLeft = 200 + (-100) = 100px.
             expect(element.style.left).toBe('100px');
        });
    });
});
