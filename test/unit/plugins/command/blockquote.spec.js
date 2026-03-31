/**
 * @fileoverview Unit tests for plugins/command/blockquote.js
 */

import Blockquote from '../../../../src/plugins/command/blockquote.js';
import { createMockEditor } from '../../../../test/__mocks__/editorMock.js';

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

describe('Plugins - Command - Blockquote', () => {
    let kernel;
    let blockquote;

    beforeEach(() => {
        jest.clearAllMocks();

        kernel = createMockEditor();
        kernel.$.lang.tag_blockquote = 'Blockquote';

        blockquote = new Blockquote(kernel);
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
            kernel.$.selection.getNode.mockReturnValue(document.createElement('p'));
        });

        it('should remove blockquote when currently inside blockquote', () => {
            const mockBlockquote = document.createElement('blockquote');

            const { dom } = require('../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(mockBlockquote);

            blockquote.action();

            expect(dom.query.getParentElement).toHaveBeenCalledWith(
                kernel.$.selection.getNode(),
                'blockquote'
            );
            expect(kernel.$.format.removeBlock).toHaveBeenCalledWith(
                mockBlockquote,
                {
                    selectedFormats: null,
                    newBlockElement: null,
                    shouldDelete: false,
                    skipHistory: false
                }
            );
            expect(kernel.$.format.applyBlock).not.toHaveBeenCalled();
        });

        it('should apply blockquote when not currently inside blockquote', () => {
            const { dom } = require('../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(null);

            blockquote.action();

            expect(dom.query.getParentElement).toHaveBeenCalledWith(
                kernel.$.selection.getNode(),
                'blockquote'
            );
            expect(kernel.$.format.removeBlock).not.toHaveBeenCalled();
            expect(kernel.$.format.applyBlock).toHaveBeenCalled();

            // Check that cloned blockquote element is used
            const appliedElement = kernel.$.format.applyBlock.mock.calls[0][0];
            expect(appliedElement).toBeDefined();
        });

        it('should use cloned blockquote element', () => {
            const { dom } = require('../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(null);

            const mockClonedElement = { tagName: 'BLOCKQUOTE' };
            blockquote.quoteTag.cloneNode.mockReturnValue(mockClonedElement);

            blockquote.action();

            expect(blockquote.quoteTag.cloneNode).toHaveBeenCalledWith(false);
            expect(kernel.$.format.applyBlock).toHaveBeenCalledWith(mockClonedElement);
        });
    });

    describe('Integration', () => {
        it('should work with editor selection and format modules', () => {
            const mockNode = document.createElement('p');
            kernel.$.selection.getNode.mockReturnValue(mockNode);

            const { dom } = require('../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(null);

            expect(() => {
                blockquote.action();
            }).not.toThrow();

            expect(kernel.$.selection.getNode).toHaveBeenCalled();
            expect(dom.query.getParentElement).toHaveBeenCalledWith(mockNode, 'blockquote');
            expect(kernel.$.format.applyBlock).toHaveBeenCalled();
        });
    });

    describe('Error handling', () => {
        it('should handle missing selection gracefully', () => {
            kernel.$.selection.getNode.mockReturnValue(null);

            const { dom } = require('../../../../src/helper');
            dom.query.getParentElement.mockReturnValue(null);

            expect(() => {
                blockquote.action();
            }).not.toThrow();
        });

        it('should handle missing editor dependencies', () => {
            kernel.$.format = undefined;
            kernel.$.selection = undefined;

            // The actual implementation doesn't validate dependencies, so this won't throw
            // This test verifies the current behavior rather than enforcing strict validation
            expect(() => {
                new Blockquote(kernel);
            }).not.toThrow();
        });
    });
});