/**
 * @fileoverview Unit tests for plugins/command/blockquote.js
 */

import Blockquote from '../../../../src/plugins/command/blockquote.js';

// Mock helper
jest.mock('../../../../src/helper', () => ({
    dom: {
        utils: {
            createElement: jest.fn().mockReturnValue({
                cloneNode: jest.fn().mockReturnValue({ tagName: 'BLOCKQUOTE' })
            }),
            addClass: jest.fn(),
            removeClass: jest.fn()
        },
        query: {
            getParentElement: jest.fn()
        }
    }
}));

// Mock EditorInjector
jest.mock('../../../../src/editorInjector/_core.js', () => {
    return jest.fn().mockImplementation(function(editor) {
        this.editor = editor;
        this.lang = editor.lang;
        this.selection = editor.selection;
        this.format = editor.format;
        this.frameContext = editor.frameContext;
        this.focusManager = editor.focusManager;
		this.triggerEvent = editor.triggerEvent || jest.fn();
    });
});

describe('Plugins - Command - Blockquote', () => {
    let mockEditor;
    let blockquote;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEditor = {
            lang: {
                tag_blockquote: 'Blockquote'
            },
            selection: {
                getNode: jest.fn()
            },
            format: {
                removeBlock: jest.fn(),
                applyBlock: jest.fn()
            },
            frameContext: new Map(),
            triggerEvent: jest.fn()
        };

        blockquote = new Blockquote(mockEditor);
    });

    describe('Constructor', () => {
        it('should create Blockquote instance with required properties', () => {
            expect(blockquote).toBeInstanceOf(Blockquote);
            expect(blockquote.title).toBe('Blockquote');
            expect(blockquote.icon).toBe('blockquote');
            expect(blockquote.quoteTag).toBeDefined();
        });

        it('should create BLOCKQUOTE element', () => {
            const { dom } = require('../../../../src/helper');
            expect(dom.utils.createElement).toHaveBeenCalledWith('BLOCKQUOTE');
        });
    });

    describe('active method', () => {
        let mockTarget;

        beforeEach(() => {
            mockTarget = document.createElement('button');
        });

        it('should return true and add active class for blockquote element', () => {
            const mockElement = {
                nodeName: 'BLOCKQUOTE'
            };

            const result = blockquote.active(mockElement, mockTarget);

            expect(result).toBe(true);

            const { dom } = require('../../../../src/helper');
            expect(dom.utils.addClass).toHaveBeenCalledWith(mockTarget, 'active');
            expect(dom.utils.removeClass).not.toHaveBeenCalled();
        });

        it('should return true for nested blockquote elements (case insensitive)', () => {
            const mockElement = {
                nodeName: 'blockquote'
            };

            const result = blockquote.active(mockElement, mockTarget);

            expect(result).toBe(true);

            const { dom } = require('../../../../src/helper');
            expect(dom.utils.addClass).toHaveBeenCalledWith(mockTarget, 'active');
        });

        it('should return false and remove active class for non-blockquote element', () => {
            const mockElement = {
                nodeName: 'P'
            };

            const result = blockquote.active(mockElement, mockTarget);

            expect(result).toBe(false);

            const { dom } = require('../../../../src/helper');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(mockTarget, 'active');
            expect(dom.utils.addClass).not.toHaveBeenCalled();
        });

        it('should handle null element', () => {
            const result = blockquote.active(null, mockTarget);

            expect(result).toBe(false);

            const { dom } = require('../../../../src/helper');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(mockTarget, 'active');
        });

        it('should handle undefined element', () => {
            const result = blockquote.active(undefined, mockTarget);

            expect(result).toBe(false);

            const { dom } = require('../../../../src/helper');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(mockTarget, 'active');
        });

        it('should handle element without nodeName', () => {
            const mockElement = {};

            const result = blockquote.active(mockElement, mockTarget);

            expect(result).toBe(false);

            const { dom } = require('../../../../src/helper');
            expect(dom.utils.removeClass).toHaveBeenCalledWith(mockTarget, 'active');
        });
    });

    describe('action method', () => {
        beforeEach(() => {
            mockEditor.selection.getNode.mockReturnValue(document.createElement('p'));
        });

        it('should remove blockquote when currently inside blockquote', () => {
            const mockBlockquote = document.createElement('blockquote');

            const { dom } = require('../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(mockBlockquote);

            blockquote.action();

            expect(dom.query.getParentElement).toHaveBeenCalledWith(
                mockEditor.selection.getNode(),
                'blockquote'
            );
            expect(mockEditor.format.removeBlock).toHaveBeenCalledWith(
                mockBlockquote,
                {
                    selectedFormats: null,
                    newBlockElement: null,
                    shouldDelete: false,
                    skipHistory: false
                }
            );
            expect(mockEditor.format.applyBlock).not.toHaveBeenCalled();
        });

        it('should apply blockquote when not currently inside blockquote', () => {
            const { dom } = require('../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(null);

            blockquote.action();

            expect(dom.query.getParentElement).toHaveBeenCalledWith(
                mockEditor.selection.getNode(),
                'blockquote'
            );
            expect(mockEditor.format.removeBlock).not.toHaveBeenCalled();
            expect(mockEditor.format.applyBlock).toHaveBeenCalled();

            // Check that cloned blockquote element is used
            const appliedElement = mockEditor.format.applyBlock.mock.calls[0][0];
            expect(appliedElement).toBeDefined();
        });

        it('should use cloned blockquote element', () => {
            const { dom } = require('../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(null);

            const mockClonedElement = { tagName: 'BLOCKQUOTE' };
            blockquote.quoteTag.cloneNode.mockReturnValue(mockClonedElement);

            blockquote.action();

            expect(blockquote.quoteTag.cloneNode).toHaveBeenCalledWith(false);
            expect(mockEditor.format.applyBlock).toHaveBeenCalledWith(mockClonedElement);
        });
    });

    describe('Integration', () => {
        it('should work with editor selection and format modules', () => {
            const mockNode = document.createElement('p');
            mockEditor.selection.getNode.mockReturnValue(mockNode);

            const { dom } = require('../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(null);

            expect(() => {
                blockquote.action();
            }).not.toThrow();

            expect(mockEditor.selection.getNode).toHaveBeenCalled();
            expect(dom.query.getParentElement).toHaveBeenCalledWith(mockNode, 'blockquote');
            expect(mockEditor.format.applyBlock).toHaveBeenCalled();
        });
    });

    describe('Error handling', () => {
        it('should handle missing selection gracefully', () => {
            mockEditor.selection.getNode.mockReturnValue(null);

            const { dom } = require('../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(null);

            expect(() => {
                blockquote.action();
            }).not.toThrow();
        });

        it('should handle missing editor dependencies', () => {
            mockEditor.format = undefined;
            mockEditor.selection = undefined;

            // The actual implementation doesn't validate dependencies, so this won't throw
            // This test verifies the current behavior rather than enforcing strict validation
            expect(() => {
                new Blockquote(mockEditor);
            }).not.toThrow();
        });
    });
});