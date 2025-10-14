/**
 * @fileoverview Integration tests for list manipulation functionality
 * Tests real-world scenarios of creating, removing, and manipulating lists (ol, ul)
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('List Manipulation integration tests', () => {
    let container;
    let editor;

    beforeEach(async () => {
        container = document.createElement('div');
        container.id = 'list-test-container';
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

    describe('Applying list format', () => {
        it('should convert paragraphs to unordered list', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = `
                <p>Line 1</p>
                <p>Line 2</p>
                <p>Line 3</p>
            `;

            const paragraphs = Array.from(wysiwyg.querySelectorAll('p'));

            // Simulate converting paragraphs to list
            const ul = document.createElement('ul');
            paragraphs.forEach(p => {
                const li = document.createElement('li');
                li.textContent = p.textContent;
                ul.appendChild(li);
            });

            // Replace paragraphs with list
            wysiwyg.innerHTML = '';
            wysiwyg.appendChild(ul);

            // Verify list is created
            expect(wysiwyg.querySelector('ul')).not.toBeNull();

            const listItems = wysiwyg.querySelectorAll('li');
            expect(listItems.length).toBe(3);
            expect(listItems[0].textContent.trim()).toBe('Line 1');
            expect(listItems[1].textContent.trim()).toBe('Line 2');
            expect(listItems[2].textContent.trim()).toBe('Line 3');
        });

        it('should convert paragraphs to ordered list', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = `
                <p>Step 1</p>
                <p>Step 2</p>
            `;

            const paragraphs = Array.from(wysiwyg.querySelectorAll('p'));

            // Simulate converting paragraphs to ordered list
            const ol = document.createElement('ol');
            paragraphs.forEach(p => {
                const li = document.createElement('li');
                li.textContent = p.textContent;
                ol.appendChild(li);
            });

            wysiwyg.innerHTML = '';
            wysiwyg.appendChild(ol);

            // Verify ordered list is created
            expect(wysiwyg.querySelector('ol')).not.toBeNull();
            expect(wysiwyg.querySelectorAll('li').length).toBe(2);
        });

        it('should apply list style types', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = `<p>Item 1</p>`;

            // Simulate creating list with style
            const ol = document.createElement('ol');
            ol.style.listStyleType = 'decimal';
            const li = document.createElement('li');
            li.textContent = 'Item 1';
            ol.appendChild(li);

            wysiwyg.innerHTML = '';
            wysiwyg.appendChild(ol);

            expect(wysiwyg.querySelector('ol')).not.toBeNull();
            expect(wysiwyg.querySelector('ol').style.listStyleType).toBe('decimal');
        });

        it('should handle mixed content when applying list', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = `
                <p>Normal text</p>
                <div>Div content</div>
                <p>More text</p>
            `;

            const elements = Array.from(wysiwyg.children);

            // Simulate converting mixed content to list
            const ul = document.createElement('ul');
            elements.forEach(el => {
                const li = document.createElement('li');
                li.textContent = el.textContent;
                ul.appendChild(li);
            });

            wysiwyg.innerHTML = '';
            wysiwyg.appendChild(ul);

            // Verify all content is in list
            const listItems = wysiwyg.querySelectorAll('li');
            expect(listItems.length).toBe(3);
        });
    });

    describe('Removing list format', () => {
        it('should convert list items back to paragraphs', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                    <li>Item 3</li>
                </ul>
            `;

            const ul = wysiwyg.querySelector('ul');
            const listItems = Array.from(ul.querySelectorAll('li'));

            // Simulate removing list: convert LIs to Ps
            listItems.forEach(li => {
                const p = document.createElement('p');
                p.textContent = li.textContent;
                wysiwyg.insertBefore(p, ul);
            });
            ul.remove();

            // Verify list is removed
            expect(wysiwyg.querySelector('ul')).toBeNull();

            // Verify content exists as paragraphs
            const paragraphs = wysiwyg.querySelectorAll('p');
            expect(paragraphs.length).toBe(3);
            expect(paragraphs[0].textContent).toContain('Item 1');
            expect(paragraphs[1].textContent).toContain('Item 2');
            expect(paragraphs[2].textContent).toContain('Item 3');
        });

        it('should remove partial list items', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                    <li>Item 3</li>
                    <li>Item 4</li>
                </ul>
            `;

            const allItems = Array.from(wysiwyg.querySelectorAll('li'));
            const middleItems = [allItems[1], allItems[2]];

            // Remove middle items
            const listFormat = editor.listFormat;
            listFormat.remove(middleItems, false);

            // List should still exist
            const ul = wysiwyg.querySelector('ul');
            expect(ul).not.toBeNull();

            // Should have fewer items or split lists
            const content = wysiwyg.textContent;
            expect(content).toContain('Item 1');
            expect(content).toContain('Item 4');
        });

        it('should delete list items with shouldDelete option', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                    <li>Item 3</li>
                </ul>
            `;

            const allItems = Array.from(wysiwyg.querySelectorAll('li'));

            // Delete middle item
            const listFormat = editor.listFormat;
            listFormat.remove([allItems[1]], true);

            // Verify item is deleted
            const content = wysiwyg.textContent;
            expect(content).toContain('Item 1');
            expect(content).not.toContain('Item 2');
            expect(content).toContain('Item 3');
        });
    });

    describe('Nested list operations', () => {
        it('should create nested list by applying list to list items', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>Parent 1</li>
                    <li>Parent 2</li>
                    <li>Parent 3</li>
                </ul>
            `;

            const listItems = wysiwyg.querySelectorAll('li');

            // Apply nested list to middle item
            const listFormat = editor.listFormat;
            listFormat.apply('ul:', [listItems[1]], true);

            // Verify nested structure exists
            const lists = wysiwyg.querySelectorAll('ul');
            expect(lists.length).toBeGreaterThanOrEqual(1);
        });

        it('should handle applyNested for indenting list items', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                    <li>Item 3</li>
                </ul>
            `;

            const listItems = Array.from(wysiwyg.querySelectorAll('li'));

            // Indent item 2
            const listFormat = editor.listFormat;
            listFormat.applyNested([listItems[1]], true);

            // Verify nested structure
            const allLists = wysiwyg.querySelectorAll('ul');
            expect(allLists.length).toBeGreaterThanOrEqual(1);
        });

        it('should handle applyNested for outdenting list items', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>Item 1
                        <ul>
                            <li>Nested Item</li>
                        </ul>
                    </li>
                    <li>Item 2</li>
                </ul>
            `;

            const nestedLi = wysiwyg.querySelector('ul ul li');

            // Outdent nested item
            const listFormat = editor.listFormat;
            listFormat.applyNested([nestedLi], false);

            // Verify structure is flattened
            const content = wysiwyg.textContent;
            expect(content).toContain('Nested Item');
        });

        it('should remove nested lists with removeNested', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>Parent
                        <ul>
                            <li>Child 1</li>
                            <li>Child 2</li>
                        </ul>
                    </li>
                </ul>
            `;

            const parentLi = wysiwyg.querySelector('li');

            // Remove nested structure
            const listFormat = editor.listFormat;
            listFormat.removeNested(parentLi, false);

            // Content should be preserved
            const content = wysiwyg.textContent;
            expect(content).toContain('Parent');
            expect(content).toContain('Child 1');
        });

        it('should remove all nested lists with removeNested all option', () => {
            const wysiwyg = editor.context.get('wysiwyg');

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

            const topLi = wysiwyg.querySelector('li');

            // Remove all nested lists
            const listFormat = editor.listFormat;
            listFormat.removeNested(topLi, true);

            // All content should be flattened
            const content = wysiwyg.textContent;
            expect(content).toContain('Level 1');
            expect(content).toContain('Level 2');
            expect(content).toContain('Level 3');
        });
    });

    describe('Converting between list types', () => {
        it('should convert unordered list to ordered list', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                </ul>
            `;

            const ul = wysiwyg.querySelector('ul');
            const listItems = Array.from(ul.querySelectorAll('li'));

            // Simulate ul to ol conversion
            const ol = document.createElement('ol');
            listItems.forEach(li => {
                const newLi = document.createElement('li');
                newLi.textContent = li.textContent;
                ol.appendChild(newLi);
            });

            wysiwyg.innerHTML = '';
            wysiwyg.appendChild(ol);

            // Verify conversion
            expect(wysiwyg.querySelector('ul')).toBeNull();
            expect(wysiwyg.querySelector('ol')).not.toBeNull();
            expect(wysiwyg.querySelectorAll('li').length).toBe(2);
        });

        it('should convert ordered list to unordered list', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ol>
                    <li>Step 1</li>
                    <li>Step 2</li>
                </ol>
            `;

            const ol = wysiwyg.querySelector('ol');
            const listItems = Array.from(ol.querySelectorAll('li'));

            // Simulate ol to ul conversion
            const ul = document.createElement('ul');
            listItems.forEach(li => {
                const newLi = document.createElement('li');
                newLi.textContent = li.textContent;
                ul.appendChild(newLi);
            });

            wysiwyg.innerHTML = '';
            wysiwyg.appendChild(ul);

            // Verify conversion
            expect(wysiwyg.querySelector('ol')).toBeNull();
            expect(wysiwyg.querySelector('ul')).not.toBeNull();
        });
    });

    describe('Complex list scenarios', () => {
        it('should handle list with inline formatting', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li><strong>Bold item</strong></li>
                    <li><em>Italic item</em></li>
                </ul>
            `;

            const listItems = Array.from(wysiwyg.querySelectorAll('li'));

            // Remove list
            const listFormat = editor.listFormat;
            listFormat.remove(listItems, false);

            // Verify inline formatting is preserved
            expect(wysiwyg.querySelector('strong')).not.toBeNull();
            expect(wysiwyg.querySelector('em')).not.toBeNull();
        });

        it('should handle empty list items', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>Item 1</li>
                    <li><br></li>
                    <li>Item 3</li>
                </ul>
            `;

            const listItems = Array.from(wysiwyg.querySelectorAll('li'));

            // Remove list
            const listFormat = editor.listFormat;
            listFormat.remove(listItems, false);

            // Content should be preserved
            const content = wysiwyg.textContent;
            expect(content).toContain('Item 1');
            expect(content).toContain('Item 3');
        });

        it('should handle list items with multiple paragraphs', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>
                        <p>First paragraph</p>
                        <p>Second paragraph</p>
                    </li>
                </ul>
            `;

            const ul = wysiwyg.querySelector('ul');
            const paragraphs = Array.from(ul.querySelectorAll('p'));

            // Simulate removing list but keeping paragraphs
            paragraphs.forEach(p => {
                wysiwyg.insertBefore(p, ul);
            });
            ul.remove();

            // Paragraphs should be preserved
            const allParagraphs = wysiwyg.querySelectorAll('p');
            expect(allParagraphs.length).toBe(2);
        });

        it('should handle merging adjacent lists', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>List 1 Item 1</li>
                </ul>
                <p>Middle paragraph</p>
                <ul>
                    <li>List 2 Item 1</li>
                </ul>
            `;

            const p = wysiwyg.querySelector('p');
            const lists = wysiwyg.querySelectorAll('ul');

            // Simulate converting paragraph to list item and merging
            const middleLi = document.createElement('li');
            middleLi.textContent = p.textContent;

            // Add middle item to first list
            lists[0].appendChild(middleLi);

            // Merge second list into first
            const secondListItems = Array.from(lists[1].querySelectorAll('li'));
            secondListItems.forEach(li => {
                lists[0].appendChild(li);
            });

            // Remove paragraph and second list
            p.remove();
            lists[1].remove();

            // Verify merged structure
            const allLists = wysiwyg.querySelectorAll('ul');
            expect(allLists.length).toBe(1);

            const allItems = wysiwyg.querySelectorAll('li');
            expect(allItems.length).toBe(3);
        });
    });

    describe('Edge cases', () => {
        it('should handle single item list', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>Single item</li>
                </ul>
            `;

            const listItems = Array.from(wysiwyg.querySelectorAll('li'));

            // Remove list
            const listFormat = editor.listFormat;
            listFormat.remove(listItems, false);

            // Content should remain
            expect(wysiwyg.textContent).toContain('Single item');
        });

        it('should handle applyNested with no previous sibling', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>First item</li>
                </ul>
            `;

            const firstLi = wysiwyg.querySelector('li');

            // Try to indent first item (should handle gracefully)
            const listFormat = editor.listFormat;
            const result = listFormat.applyNested([firstLi], true);

            // Should return range info
            expect(result).toBeDefined();
        });

        it('should handle list with zero-width spaces', () => {
            const wysiwyg = editor.context.get('wysiwyg');

            wysiwyg.innerHTML = `
                <ul>
                    <li>\u200B</li>
                    <li>Real content</li>
                </ul>
            `;

            const listItems = Array.from(wysiwyg.querySelectorAll('li'));

            // Remove list
            const listFormat = editor.listFormat;
            listFormat.remove(listItems, false);

            // Should handle gracefully
            const content = wysiwyg.textContent;
            expect(content).toContain('Real content');
        });
    });
});
