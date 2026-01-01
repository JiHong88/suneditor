import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';

describe('Core - Char', () => {
    let editor;
    let char;

    beforeEach(async () => {
        editor = createTestEditor({
            charCounter: true,
            charCounter_max: 100,
            charCounter_type: 'char'
        });
        await waitForEditorReady(editor);
        char = editor.char;
    });

    afterEach(() => {
        destroyTestEditor(editor);
    });

    describe('Constructor', () => {
        it('should be initialized correctly', () => {
            expect(char).toBeDefined();
        });
    });

    describe('getLength method', () => {
        it('should get length of string content', () => {
            const length = char.getLength('hello world');
            expect(length).toBe(11);
        });

        it('should get length of current wysiwyg content', () => {
            const wysiwyg = editor.frameContext.get('wysiwyg');
            wysiwyg.innerHTML = '<p>test</p>';
            const length = char.getLength();
            expect(length).toBeGreaterThan(0);
        });

        it('should handle byte charCounter_type', () => {
            const origType = char.frameOptions.get('charCounter_type');
            char.frameOptions.set('charCounter_type', 'byte');

            const length = char.getLength('hello');
            expect(typeof length).toBe('number');

            char.frameOptions.set('charCounter_type', origType);
        });

        it('should handle byte-html charCounter_type', () => {
            const origType = char.frameOptions.get('charCounter_type');
            const wysiwyg = editor.frameContext.get('wysiwyg');
            wysiwyg.innerHTML = '<p>test</p>';
            char.frameOptions.set('charCounter_type', 'byte-html');

            const length = char.getLength();
            expect(typeof length).toBe('number');

            char.frameOptions.set('charCounter_type', origType);
        });
    });

    describe('getByteLength method', () => {
        beforeAll(() => {
            // Mock TextEncoder if not available
            if (typeof TextEncoder === 'undefined') {
                global.TextEncoder = class {
                    encode(str) {
                        return new Uint8Array(str.length);
                    }
                };
            }
        });

        it('should return 0 for empty string', () => {
            const length = char.getByteLength('');
            expect(length).toBe(0);
        });

        it('should return 0 for null', () => {
            const length = char.getByteLength(null);
            expect(length).toBe(0);
        });

        it('should get byte length of ASCII characters', () => {
            const length = char.getByteLength('hello');
            expect(length).toBeGreaterThan(0);
        });

        it('should get byte length with newlines', () => {
            const length = char.getByteLength('hello\nworld');
            expect(length).toBeGreaterThan(10);
        });

        it('should get byte length with carriage returns', () => {
            const length = char.getByteLength('hello\rworld');
            expect(length).toBeGreaterThan(10);
        });

        it('should get byte length with both newlines and carriage returns', () => {
            const length = char.getByteLength('hello\r\nworld');
            expect(length).toBeGreaterThan(10);
        });

        it('should handle unicode characters', () => {
            const length = char.getByteLength('test 안녕');
            expect(length).toBeGreaterThan(0);
        });

        it('should handle objects with toString method', () => {
            const obj = {
                toString: () => 'test'
            };
            const length = char.getByteLength(obj);
            expect(length).toBeGreaterThan(0);
        });

        it('should handle isEdge path', () => {
            // Mock isEdge
            const env = require('../../../../src/helper/env');
            const originalIsEdge = env.isEdge;

            try {
                Object.defineProperty(env, 'isEdge', {
                    value: true,
                    writable: true,
                    configurable: true
                });

                const length = char.getByteLength('test\nline');
                expect(length).toBeGreaterThan(0);
            } finally {
                Object.defineProperty(env, 'isEdge', {
                    value: originalIsEdge,
                    writable: true,
                    configurable: true
                });
            }
        });
    });

    describe('check method', () => {
        it('should return true when charCounter_max is not set', async () => {
            destroyTestEditor(editor);
            editor = createTestEditor({
                charCounter: true,
                charCounter_max: 0
            });
            await waitForEditorReady(editor);
            char = editor.char;

            const result = char.check('test content');
            expect(result).toBe(true);
        });

        it('should return true when content is within limit', () => {
            const result = char.check('short text');
            expect(result).toBe(true);
        });

        it('should return false when string content exceeds limit', () => {
            const longText = 'a'.repeat(200);
            const result = char.check(longText);
            expect(result).toBe(false);
        });

        it('should return false when node content exceeds limit', () => {
            const div = document.createElement('div');
            div.textContent = 'a'.repeat(200);
            const result = char.check(div);
            expect(result).toBe(false);
        });

        it('should handle byte-html type with Element node', async () => {
            destroyTestEditor(editor);
            editor = createTestEditor({
                charCounter: true,
                charCounter_max: 50,
                charCounter_type: 'byte-html'
            });
            await waitForEditorReady(editor);
            char = editor.char;

            const div = document.createElement('div');
            div.innerHTML = '<strong>test</strong>';
            const result = char.check(div);
            expect(typeof result).toBe('boolean');
        });

        it('should blink charWrapper when limit exceeded', () => {
            const charWrapper = editor.frameContext.get('charWrapper');
            if (charWrapper) {
                jest.useFakeTimers();
                const longText = 'a'.repeat(200);
                char.check(longText);

                expect(charWrapper.classList.contains('se-blink')).toBe(true);
                jest.runAllTimers();
                expect(charWrapper.classList.contains('se-blink')).toBe(false);
                jest.useRealTimers();
            }
        });
    });

    describe('display method', () => {
        it('should update charCounter textContent with setTimeout', (done) => {
            const charCounter = editor.frameContext.get('charCounter');
            if (charCounter) {
                const wysiwyg = editor.frameContext.get('wysiwyg');
                wysiwyg.innerHTML = '<p>test content</p>';

                // Spy on setTimeout
                jest.useFakeTimers();
                char.display();

                // Fast-forward time
                jest.runAllTimers();

                // Restore timers
                jest.useRealTimers();

                setTimeout(() => {
                    expect(charCounter.textContent).toBeTruthy();
                    done();
                }, 10);
            } else {
                done();
            }
        });

        it('should work with custom frame context', () => {
            expect(() => char.display(editor.frameContext)).not.toThrow();
        });

        it('should handle null charCounter gracefully', async () => {
            destroyTestEditor(editor);
            editor = createTestEditor({
                charCounter: false
            });
            await waitForEditorReady(editor);
            char = editor.char;

            expect(() => {
                char.display();
            }).not.toThrow();
        });
    });

    describe('test method', () => {
        beforeEach(async () => {
            destroyTestEditor(editor);
            editor = createTestEditor({
                charCounter: true,
                charCounter_max: 20,
                charCounter_type: 'char'
            });
            await waitForEditorReady(editor);
            char = editor.char;
        });

        it('should return true when input is within limit', () => {
            const wysiwyg = editor.frameContext.get('wysiwyg');
            wysiwyg.innerHTML = '<p>short</p>';

            const result = char.test('text');
            expect(result).toBe(true);
        });

        it('should return false when input would exceed limit', () => {
            const wysiwyg = editor.frameContext.get('wysiwyg');
            wysiwyg.innerHTML = '<p>' + 'a'.repeat(15) + '</p>';

            const result = char.test('long text input');
            expect(result).toBe(false);
        });

        it('should handle _fromInputEvent parameter', () => {
            const wysiwyg = editor.frameContext.get('wysiwyg');
            wysiwyg.innerHTML = '<p>test</p>';

            const result = char.test('', false);
            expect(typeof result).toBe('boolean');
        });

        it('should handle over limit without input text', () => {
            const wysiwyg = editor.frameContext.get('wysiwyg');
            wysiwyg.innerHTML = '<p>' + 'a'.repeat(30) + '</p>';

            const result = char.test('');
            expect(result).toBe(true);
        });

        it('should call display method', () => {
            const displaySpy = jest.spyOn(char, 'display');
            char.test('test');
            expect(displaySpy).toHaveBeenCalled();
        });

        it('should work when charCounter_max is 0', async () => {
            destroyTestEditor(editor);
            editor = createTestEditor({
                charCounter: true,
                charCounter_max: 0
            });
            await waitForEditorReady(editor);
            char = editor.char;

            const result = char.test('any text');
            expect(result).toBe(true);
        });

        it('should blink charWrapper when limit exceeded', (done) => {
            const wysiwyg = editor.frameContext.get('wysiwyg');
            wysiwyg.innerHTML = '<p>' + 'a'.repeat(15) + '</p>';

            const charWrapper = editor.frameContext.get('charWrapper');
            if (charWrapper) {
                jest.useFakeTimers();
                char.test('long text input');

                // Verify blink class is added
                expect(charWrapper.classList.contains('se-blink')).toBe(true);

                // Fast-forward time to remove blink class
                jest.advanceTimersByTime(700);

                jest.useRealTimers();
                done();
            } else {
                done();
            }
        });

        it('should handle input event overflow scenario', () => {
            const wysiwyg = editor.frameContext.get('wysiwyg');
            const p = document.createElement('p');
            const textNode = document.createTextNode('a'.repeat(25));
            p.appendChild(textNode);
            wysiwyg.innerHTML = '';
            wysiwyg.appendChild(p);

            // Create a range at the end
            const range = document.createRange();
            range.setStart(textNode, 25);
            range.setEnd(textNode, 25);

            // Mock selection methods
            editor.selection.init = jest.fn();
            editor.selection.getRange = jest.fn().mockReturnValue({
                endOffset: 25,
                endContainer: textNode
            });
            editor.selection.getNode = jest.fn().mockReturnValue(textNode);
            editor.selection.setRange = jest.fn();

            const result = char.test('x', true);
            expect(typeof result).toBe('boolean');
        });
    });

    describe('_destroy method', () => {
        it('should not throw when called', () => {
            expect(() => {
                char._destroy();
            }).not.toThrow();
        });

        it('should be callable multiple times', () => {
            expect(() => {
                char._destroy();
                char._destroy();
            }).not.toThrow();
        });
    });

    describe('edge cases', () => {
        it('should handle undefined input in getByteLength', () => {
            const length = char.getByteLength(undefined);
            expect(length).toBe(0);
        });

        it('should handle empty object in getByteLength', () => {
            const obj = {};
            const length = char.getByteLength(obj);
            expect(length).toBeGreaterThan(0); // "[object Object]"
        });

        it('should handle number input in getByteLength', () => {
            const length = char.getByteLength(12345);
            expect(length).toBe(5); // "12345"
        });

        it('should handle array input in getByteLength', () => {
            const length = char.getByteLength([1, 2, 3]);
            expect(length).toBeGreaterThan(0); // "1,2,3"
        });
    });

    describe('check with various node types', () => {
        it('should handle text node', () => {
            const textNode = document.createTextNode('hello world');
            const result = char.check(textNode);
            expect(typeof result).toBe('boolean');
        });

        it('should handle comment node', () => {
            const commentNode = document.createComment('comment');
            const result = char.check(commentNode);
            expect(typeof result).toBe('boolean');
        });

        it('should handle document fragment', () => {
            const fragment = document.createDocumentFragment();
            fragment.appendChild(document.createTextNode('test'));
            const result = char.check(fragment);
            expect(typeof result).toBe('boolean');
        });
    });

    describe('display with different frame contexts', () => {
        it('should handle display with undefined frame context', () => {
            expect(() => {
                char.display(undefined);
            }).not.toThrow();
        });

        it('should handle display when charCounter is null', () => {
            const fc = new Map();
            fc.get = jest.fn().mockReturnValue(null);

            expect(() => {
                char.display(fc);
            }).not.toThrow();
        });
    });

    describe('test with complex scenarios', () => {
        it('should handle test with empty wysiwyg', async () => {
            const wysiwyg = editor.frameContext.get('wysiwyg');
            wysiwyg.innerHTML = '';

            const result = char.test('test');
            expect(typeof result).toBe('boolean');
        });

        it('should handle test with only whitespace content', async () => {
            const wysiwyg = editor.frameContext.get('wysiwyg');
            wysiwyg.innerHTML = '<p>   </p>';

            const result = char.test('test');
            expect(typeof result).toBe('boolean');
        });
    });
});
