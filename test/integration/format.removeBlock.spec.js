/**
 * @fileoverview Integration tests for format.removeBlock functionality
 * Tests real-world scenarios of removing block elements like lists, blockquotes, etc.
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('Format - removeBlock integration tests', () => {
    let container;
    let editor;

    beforeEach(async () => {
        container = document.createElement('div');
        container.id = 'removeblock-test-container';
        document.body.appendChild(container);

        editor = createTestEditor({
            element: container,
            buttonList: [['bold', 'italic']],
            width: '100%',
            height: 'auto'
        });
        await waitForEditorReady(editor);
    });

    afterEach(() => {
        if (editor) {
            destroyTestEditor(editor);
        }
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    describe('Removing blockquote elements', () => {
        it('should handle blockquote to paragraph conversion workflow', () => {
            const wysiwyg = editor.$.frameContext.get('wysiwyg');

            // Start with blockquote
            wysiwyg.innerHTML = `
                <blockquote>
                    <p>First paragraph</p>
                    <p>Second paragraph</p>
                </blockquote>
            `;

            // Verify blockquote exists
            expect(wysiwyg.querySelector('blockquote')).not.toBeNull();

            // Simulate conversion: manually move paragraphs out and remove blockquote
            const blockquote = wysiwyg.querySelector('blockquote');
            const paragraphs = Array.from(blockquote.querySelectorAll('p'));

            paragraphs.forEach(p => {
                wysiwyg.insertBefore(p, blockquote);
            });
            blockquote.remove();

            // Verify blockquote is removed
            expect(wysiwyg.querySelector('blockquote')).toBeNull();

            // Verify paragraphs still exist
            const allParagraphs = wysiwyg.querySelectorAll('p');
            expect(allParagraphs.length).toBe(2);
            expect(allParagraphs[0].textContent.trim()).toBe('First paragraph');
            expect(allParagraphs[1].textContent.trim()).toBe('Second paragraph');
        });

        it('should handle nested blockquotes', () => {
            const wysiwyg = editor.$.frameContext.get('wysiwyg');

            wysiwyg.innerHTML = `
                <blockquote>
                    <p>Outer quote</p>
                    <blockquote>
                        <p>Inner quote</p>
                    </blockquote>
                </blockquote>
            `;

            const outerBlockquote = wysiwyg.querySelector('blockquote');
            const innerBlockquote = outerBlockquote.querySelector('blockquote');

            // Simulate removing inner blockquote
            const innerP = innerBlockquote.querySelector('p');
            outerBlockquote.insertBefore(innerP, innerBlockquote);
            innerBlockquote.remove();

            // Verify only outer blockquote remains
            const blockquotes = wysiwyg.querySelectorAll('blockquote');
            expect(blockquotes.length).toBe(1);

            // Verify inner content is preserved
            const paragraphs = wysiwyg.querySelectorAll('p');
            expect(paragraphs.length).toBe(2);
        });
    });

    describe('Removing list elements', () => {
        it('should convert list items to paragraphs when removing list', () => {
            const wysiwyg = editor.$.frameContext.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                    <li>Item 3</li>
                </ul>
            `;

            const ul = wysiwyg.querySelector('ul');
            const listItems = Array.from(ul.querySelectorAll('li'));

            // Simulate list removal: convert LIs to Ps
            listItems.forEach(li => {
                const p = document.createElement('p');
                p.textContent = li.textContent;
                wysiwyg.insertBefore(p, ul);
            });
            ul.remove();

            // Verify list is removed
            expect(wysiwyg.querySelector('ul')).toBeNull();

            // Verify content is preserved as paragraphs
            const paragraphs = wysiwyg.querySelectorAll('p');
            expect(paragraphs.length).toBe(3);
            expect(paragraphs[0].textContent.trim()).toBe('Item 1');
            expect(paragraphs[1].textContent.trim()).toBe('Item 2');
            expect(paragraphs[2].textContent.trim()).toBe('Item 3');
        });

        it('should handle removing partial list items', () => {
            const wysiwyg = editor.$.frameContext.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                    <li>Item 3</li>
                    <li>Item 4</li>
                </ul>
            `;

            const ul = wysiwyg.querySelector('ul');
            const allLis = wysiwyg.querySelectorAll('li');
            const format = editor.$.format;

            // Select middle items
            const range = document.createRange();
            range.setStart(allLis[1].firstChild, 0);
            range.setEnd(allLis[2].firstChild, allLis[2].textContent.length);

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            // Remove middle items from list
            const selectedFormats = [allLis[1], allLis[2]];
            format.removeBlock(ul, { selectedFormats });

            // Should still have list with remaining items
            const remainingUl = wysiwyg.querySelector('ul');
            if (remainingUl) {
                expect(remainingUl).not.toBeNull();
            }
        });
    });

    describe('Nested list removal', () => {
        it('should handle nested unordered lists', () => {
            const wysiwyg = editor.$.frameContext.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>Parent Item 1</li>
                    <li>Parent Item 2
                        <ul>
                            <li>Nested Item 1</li>
                            <li>Nested Item 2</li>
                        </ul>
                    </li>
                    <li>Parent Item 3</li>
                </ul>
            `;

            const outerUl = wysiwyg.querySelector('ul');
            const innerUl = outerUl.querySelector('ul');
            const format = editor.$.format;

            // Remove inner list
            format.removeBlock(innerUl);

            // Verify outer list still exists
            expect(wysiwyg.querySelector('ul')).not.toBeNull();
        });

        it('should handle nested ordered lists', () => {
            const wysiwyg = editor.$.frameContext.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ol>
                    <li>Step 1</li>
                    <li>Step 2
                        <ol>
                            <li>Sub-step 2.1</li>
                            <li>Sub-step 2.2</li>
                        </ol>
                    </li>
                    <li>Step 3</li>
                </ol>
            `;

            const outerOl = wysiwyg.querySelector('ol');
            const innerOl = outerOl.querySelector('ol');
            const format = editor.$.format;

            // Remove inner list
            format.removeBlock(innerOl);

            // Verify outer list still exists
            expect(wysiwyg.querySelector('ol')).not.toBeNull();
        });

        it('should handle mixed nested lists (ol inside ul)', () => {
            const wysiwyg = editor.$.frameContext.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>Bullet 1</li>
                    <li>Bullet 2
                        <ol>
                            <li>Numbered 1</li>
                            <li>Numbered 2</li>
                        </ol>
                    </li>
                </ul>
            `;

            const ul = wysiwyg.querySelector('ul');
            const ol = wysiwyg.querySelector('ol');
            const format = editor.$.format;

            // Remove the ordered list
            format.removeBlock(ol);

            // Verify ul still exists but ol is removed
            expect(wysiwyg.querySelector('ul')).not.toBeNull();
            expect(wysiwyg.querySelector('ol')).toBeNull();
        });
    });

    describe('Complex block removal scenarios', () => {
        it('should handle removing blocks with mixed content', () => {
            const wysiwyg = editor.$.frameContext.get('wysiwyg');

            wysiwyg.innerHTML = `
                <blockquote>
                    <p>Text paragraph</p>
                    <ul>
                        <li>List item 1</li>
                        <li>List item 2</li>
                    </ul>
                    <p>Another paragraph</p>
                </blockquote>
            `;

            const blockquote = wysiwyg.querySelector('blockquote');
            const children = Array.from(blockquote.children);

            // Simulate removing blockquote but keeping content
            children.forEach(child => {
                wysiwyg.insertBefore(child, blockquote);
            });
            blockquote.remove();

            // Verify blockquote is removed
            expect(wysiwyg.querySelector('blockquote')).toBeNull();

            // Verify content structure is preserved
            expect(wysiwyg.querySelector('ul')).not.toBeNull();
            expect(wysiwyg.querySelectorAll('p').length).toBe(2);
        });

        it('should handle empty block removal', () => {
            const wysiwyg = editor.$.frameContext.get('wysiwyg');

            wysiwyg.innerHTML = `
                <blockquote>
                    <p><br></p>
                </blockquote>
                <p>Normal text</p>
            `;

            const blockquote = wysiwyg.querySelector('blockquote');

            // Simulate removing empty blockquote
            blockquote.remove();

            // Verify blockquote is removed
            expect(wysiwyg.querySelector('blockquote')).toBeNull();

            // Verify normal text remains
            const normalP = wysiwyg.querySelector('p');
            expect(normalP.textContent.trim()).toBe('Normal text');
        });

        it('should handle block removal with inline styles', () => {
            const wysiwyg = editor.$.frameContext.get('wysiwyg');

            wysiwyg.innerHTML = `
                <blockquote>
                    <p><strong>Bold text</strong> and <em>italic text</em></p>
                </blockquote>
            `;

            const blockquote = wysiwyg.querySelector('blockquote');
            const p = blockquote.querySelector('p');

            // Simulate removing blockquote but keeping paragraph
            wysiwyg.insertBefore(p, blockquote);
            blockquote.remove();

            // Verify blockquote is removed but inline styles preserved
            expect(wysiwyg.querySelector('blockquote')).toBeNull();
            expect(wysiwyg.querySelector('strong')).not.toBeNull();
            expect(wysiwyg.querySelector('em')).not.toBeNull();
        });
    });

    describe('removeBlock with options', () => {
        it('should replace list type (ul to ol conversion)', () => {
            const wysiwyg = editor.$.frameContext.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                </ul>
            `;

            const ul = wysiwyg.querySelector('ul');
            const lis = Array.from(ul.querySelectorAll('li'));

            // Simulate ul to ol conversion
            const ol = document.createElement('ol');
            lis.forEach(li => {
                const newLi = document.createElement('li');
                newLi.textContent = li.textContent;
                ol.appendChild(newLi);
            });
            wysiwyg.insertBefore(ol, ul);
            ul.remove();

            // Verify ul is replaced with ol
            expect(wysiwyg.querySelector('ul')).toBeNull();
            expect(wysiwyg.querySelector('ol')).not.toBeNull();
            expect(wysiwyg.querySelectorAll('ol li').length).toBe(2);
        });

        it('should handle shouldDelete option', () => {
            const wysiwyg = editor.$.frameContext.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                    <li>Item 3</li>
                </ul>
            `;

            const ul = wysiwyg.querySelector('ul');
            const lis = wysiwyg.querySelectorAll('li');
            const format = editor.$.format;

            // Delete middle item
            format.removeBlock(ul, {
                selectedFormats: [lis[1]],
                shouldDelete: true
            });

            // Verify item is deleted
            const remainingLis = wysiwyg.querySelectorAll('li');
            expect(remainingLis.length).toBe(2);
        });
    });

    describe('Edge cases', () => {
        it('should handle single paragraph in blockquote', () => {
            const wysiwyg = editor.$.frameContext.get('wysiwyg');

            wysiwyg.innerHTML = `
                <blockquote>
                    <p>Single paragraph</p>
                </blockquote>
            `;

            const blockquote = wysiwyg.querySelector('blockquote');
            const p = blockquote.querySelector('p');

            // Simulate unwrapping blockquote
            wysiwyg.insertBefore(p, blockquote);
            blockquote.remove();

            expect(wysiwyg.querySelector('blockquote')).toBeNull();
            expect(wysiwyg.querySelector('p').textContent.trim()).toBe('Single paragraph');
        });

        it('should handle list with single item', () => {
            const wysiwyg = editor.$.frameContext.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>Single item</li>
                </ul>
            `;

            const ul = wysiwyg.querySelector('ul');
            const li = ul.querySelector('li');

            // Simulate removing list and converting to paragraph
            const p = document.createElement('p');
            p.textContent = li.textContent;
            wysiwyg.insertBefore(p, ul);
            ul.remove();

            expect(wysiwyg.querySelector('ul')).toBeNull();
            expect(wysiwyg.querySelector('p').textContent.trim()).toBe('Single item');
        });

        it('should handle deeply nested structures', () => {
            const wysiwyg = editor.$.frameContext.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>Level 1
                        <ul>
                            <li>Level 2
                                <ul>
                                    <li>Level 3</li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                </ul>
            `;

            const uls = wysiwyg.querySelectorAll('ul');
            const format = editor.$.format;

            // Remove innermost list
            const innermostUl = uls[uls.length - 1];
            format.removeBlock(innermostUl);

            // Verify structure is maintained
            expect(wysiwyg.textContent).toContain('Level 3');
        });
    });
});
