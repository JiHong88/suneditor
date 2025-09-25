/**
 * @fileoverview Simple unit tests for core/section/actives.js (config-style approach)
 */

import {
    ACTIVE_EVENT_COMMANDS,
    BASIC_COMMANDS,
    SELECT_ALL,
    DIR_BTN_ACTIVE,
    SAVE,
    COPY_FORMAT,
    FONT_STYLE,
    PAGE_BREAK
} from '../../../../src/core/section/actives';

describe('Core Section - Actives (Simple)', () => {
    describe('Constants', () => {
        it('should export ACTIVE_EVENT_COMMANDS as array', () => {
            expect(Array.isArray(ACTIVE_EVENT_COMMANDS)).toBe(true);
            expect(ACTIVE_EVENT_COMMANDS.length).toBeGreaterThan(0);
        });

        it('should export BASIC_COMMANDS as array', () => {
            expect(Array.isArray(BASIC_COMMANDS)).toBe(true);
            expect(BASIC_COMMANDS.length).toBeGreaterThan(0);
        });
    });

    describe('Functions', () => {
        it('should export SELECT_ALL as function', () => {
            expect(typeof SELECT_ALL).toBe('function');
        });

        it('should export DIR_BTN_ACTIVE as function', () => {
            expect(typeof DIR_BTN_ACTIVE).toBe('function');
        });

        it('should export SAVE as function', () => {
            expect(typeof SAVE).toBe('function');
        });

        it('should export COPY_FORMAT as function', () => {
            expect(typeof COPY_FORMAT).toBe('function');
        });

        it('should export FONT_STYLE as function', () => {
            expect(typeof FONT_STYLE).toBe('function');
        });

        it('should export PAGE_BREAK as function', () => {
            expect(typeof PAGE_BREAK).toBe('function');
        });
    });
});