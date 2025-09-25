/**
 * @fileoverview Simple unit tests for core/section/documentType.js (config-style approach)
 */

import DocumentType from '../../../../src/core/section/documentType';

describe('Core Section - DocumentType (Simple)', () => {
    describe('DocumentType class', () => {
        it('should be a function (constructor)', () => {
            expect(typeof DocumentType).toBe('function');
        });

        it('should have a constructor that requires proper arguments', () => {
            // DocumentType constructor expects specific frameContext structure
            // Testing without proper mocks will throw, which is expected behavior
            expect(() => {
                new DocumentType();
            }).toThrow();

            expect(() => {
                new DocumentType({}, new Map());
            }).toThrow();
        });

        it('should have expected methods on prototype', () => {
            const expectedMethods = [
                'reHeader',
                'rePage',
                'resizePage',
                'scrollPage',
                'getCurrentPageNumber',
                'pageUp',
                'pageDown',
                'pageGo',
                'on',
                'onChangeText'
            ];

            expectedMethods.forEach(methodName => {
                expect(typeof DocumentType.prototype[methodName]).toBe('function');
            });
        });
    });
});