/**
 * @fileoverview Unit tests for modules/_DragHandle.js
 */

import { _DragHandle } from '../../../src/modules/ui/_DragHandle.js';

describe('Modules - _DragHandle', () => {
    describe('_DragHandle Map', () => {
        it('should have all expected keys with null initial values', () => {
            const expectedKeys = [
                '__figureInst',
                '__dragInst',
                '__dragHandler',
                '__dragContainer',
                '__dragCover',
                '__dragMove',
                '__overInfo'
            ];

            expectedKeys.forEach(key => {
                expect(_DragHandle.has(key)).toBe(true);
                expect(_DragHandle.get(key)).toBeNull();
            });
        });

        it('should allow setting and getting values', () => {
            const testValue = { test: 'data' };

            _DragHandle.set('__figureInst', testValue);
            expect(_DragHandle.get('__figureInst')).toBe(testValue);

            // Reset to null
            _DragHandle.set('__figureInst', null);
        });

        it('should allow clearing all values', () => {
            // Set some test values
            _DragHandle.set('__dragInst', 'test1');
            _DragHandle.set('__dragHandler', 'test2');

            // Clear and verify
            _DragHandle.clear();
            expect(_DragHandle.size).toBe(0);

            // Restore original state
            _DragHandle.set('__figureInst', null);
            _DragHandle.set('__dragInst', null);
            _DragHandle.set('__dragHandler', null);
            _DragHandle.set('__dragContainer', null);
            _DragHandle.set('__dragCover', null);
            _DragHandle.set('__dragMove', null);
            _DragHandle.set('__overInfo', null);
        });

        it('should support iteration', () => {
            const keys = Array.from(_DragHandle.keys());
            const values = Array.from(_DragHandle.values());

            expect(keys).toHaveLength(7);
            expect(values.every(value => value === null)).toBe(true);
        });
    });

    describe('State management', () => {
        beforeEach(() => {
            // Ensure clean state before each test
            _DragHandle.set('__figureInst', null);
            _DragHandle.set('__dragInst', null);
            _DragHandle.set('__dragHandler', null);
            _DragHandle.set('__dragContainer', null);
            _DragHandle.set('__dragCover', null);
            _DragHandle.set('__dragMove', null);
            _DragHandle.set('__overInfo', null);
        });

        it('should maintain state across operations', () => {
            const figureInstance = { type: 'figure' };
            const dragInstance = { type: 'drag' };

            _DragHandle.set('__figureInst', figureInstance);
            _DragHandle.set('__dragInst', dragInstance);

            expect(_DragHandle.get('__figureInst')).toBe(figureInstance);
            expect(_DragHandle.get('__dragInst')).toBe(dragInstance);
            expect(_DragHandle.get('__dragHandler')).toBeNull();
        });

        it('should allow deletion of specific keys', () => {
            _DragHandle.set('__overInfo', { data: 'test' });
            expect(_DragHandle.has('__overInfo')).toBe(true);

            _DragHandle.delete('__overInfo');
            expect(_DragHandle.has('__overInfo')).toBe(false);

            // Restore for other tests
            _DragHandle.set('__overInfo', null);
        });
    });
});