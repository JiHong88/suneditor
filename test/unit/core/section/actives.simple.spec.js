/**
 * @fileoverview Simple meaningful tests for core/base/actives.js
 */

import { ACTIVE_EVENT_COMMANDS, BASIC_COMMANDS, SAVE, COPY_FORMAT, FONT_STYLE, PAGE_BREAK, DIR_BTN_ACTIVE } from '../../../../src/core/base/actives';

describe('Core Section - Actives (Simple)', () => {
	let mockEditor;

	beforeEach(() => {
		mockEditor = {
			frameContext: {
				get: jest.fn(),
				set: jest.fn()
			},
			triggerEvent: jest.fn(),
			html: { get: jest.fn() },
			history: { getRootStack: jest.fn(), push: jest.fn() },
			status: { rootKey: 0, currentNodesMap: [] },
			applyCommandTargets: jest.fn(),
			options: { get: jest.fn() },
			eventManager: {
				__cacheStyleNodes: [],
				addGlobalEvent: jest.fn(),
				removeGlobalEvent: jest.fn()
			},
			commandTargets: new Map(),
			reverseKeys: [],
			icons: {},
			lang: {},
			inline: { apply: jest.fn() },
			focus: jest.fn(),
			component: { insert: jest.fn() },
			selection: { setRange: jest.fn() },
			format: { addLine: jest.fn() }
		};
	});

	describe('Constants', () => {
		it('should export ACTIVE_EVENT_COMMANDS array', () => {
			expect(Array.isArray(ACTIVE_EVENT_COMMANDS)).toBe(true);
			expect(ACTIVE_EVENT_COMMANDS.length).toBeGreaterThan(0);
		});

		it('should export BASIC_COMMANDS array', () => {
			expect(Array.isArray(BASIC_COMMANDS)).toBe(true);
			expect(BASIC_COMMANDS.length).toBeGreaterThan(ACTIVE_EVENT_COMMANDS.length);
		});
	});

	describe('SAVE function', () => {
		it('should return early when content is not changed', async () => {
			mockEditor.frameContext.get.mockReturnValue(false);

			await SAVE(mockEditor);

			expect(mockEditor.html.get).not.toHaveBeenCalled();
		});

		it('should save content when changed', async () => {
			mockEditor.frameContext.get.mockImplementation((key) => {
				if (key === 'isChanged') return true;
				if (key === 'originElement') {
					const textarea = document.createElement('textarea');
					return textarea;
				}
				return null;
			});
			mockEditor.html.get.mockReturnValue('<p>content</p>');
			mockEditor.triggerEvent.mockResolvedValue('NO_EVENT');
			mockEditor.history.getRootStack.mockReturnValue({ 0: { index: 1 } });

			await SAVE(mockEditor);

			expect(mockEditor.html.get).toHaveBeenCalled();
			expect(mockEditor.frameContext.set).toHaveBeenCalledWith('isChanged', false);
		});
	});

	describe('COPY_FORMAT function', () => {
		it('should initialize copy format when not active', () => {
			const button = document.createElement('button');

			COPY_FORMAT(mockEditor, button);

			expect(Array.isArray(mockEditor._onCopyFormatInfo)).toBe(true);
			expect(typeof mockEditor._onCopyFormatInitMethod).toBe('function');
		});

		it('should call existing init method when already active', () => {
			const initMethod = jest.fn();
			mockEditor._onCopyFormatInitMethod = initMethod;

			COPY_FORMAT(mockEditor, document.createElement('button'));

			expect(initMethod).toHaveBeenCalled();
		});
	});

	describe('FONT_STYLE function', () => {
		it('should apply inline styling', () => {
			mockEditor.options.get.mockReturnValue({});

			FONT_STYLE(mockEditor, 'bold');

			expect(mockEditor.inline.apply).toHaveBeenCalled();
			expect(mockEditor.focus).toHaveBeenCalled();
		});
	});

	describe('PAGE_BREAK function', () => {
		it('should insert page break component', () => {
			const mockLine = document.createElement('p');
			mockEditor.format.addLine.mockReturnValue(mockLine);

			PAGE_BREAK(mockEditor);

			expect(mockEditor.component.insert).toHaveBeenCalled();
			expect(mockEditor.history.push).toHaveBeenCalledWith(false);
		});
	});

	describe('DIR_BTN_ACTIVE function', () => {
		it('should update direction button state', () => {
			mockEditor.commandTargets = new Map([
				['dir_rtl', document.createElement('button')],
				['dir_ltr', document.createElement('button')]
			]);
			mockEditor.reverseKeys = [];
			mockEditor.shortcutsKeyMap = new Map();
			mockEditor.icons = {};
			mockEditor.lang = {};

			expect(() => {
				DIR_BTN_ACTIVE(mockEditor, true);
			}).not.toThrow();
		});
	});
});
