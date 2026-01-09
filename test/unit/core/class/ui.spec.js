/**
 * @jest-environment jsdom
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';

describe('UIManager', () => {
	let editor;
	let uiManager;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
		uiManager = editor.uiManager;
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('setEditorStyle', () => {
		it('should set editor style without error', () => {
			expect(() => {
				uiManager.setEditorStyle('background-color: #fff;');
			}).not.toThrow();
		});

		it('should handle empty style', () => {
			expect(() => {
				uiManager.setEditorStyle('');
			}).not.toThrow();
		});
	});

	describe('setTheme', () => {
		it('should set theme', () => {
			uiManager.setTheme('dark');
			expect(editor.options.get('theme')).toBe('dark');
		});

		it('should handle empty theme', () => {
			uiManager.setTheme('');
			expect(editor.options.get('theme')).toBe('');
		});

		it('should handle non-string theme', () => {
			expect(() => {
				uiManager.setTheme(null);
			}).not.toThrow();
		});
	});

	describe('readOnly', () => {
		it('should enable readonly mode', () => {
			uiManager.readOnly(true);
			expect(editor.frameContext.get('isReadOnly')).toBe(true);
		});

		it('should disable readonly mode', () => {
			uiManager.readOnly(true);
			uiManager.readOnly(false);
			expect(editor.frameContext.get('isReadOnly')).toBe(false);
		});
	});

	describe('disable and enable', () => {
		it('should disable editor', () => {
			uiManager.disable();
			expect(editor.frameContext.get('isDisabled')).toBe(true);
		});

		it('should enable editor', () => {
			uiManager.disable();
			uiManager.enable();
			expect(editor.frameContext.get('isDisabled')).toBe(false);
		});
	});

	describe('show and hide', () => {
		it('should hide editor', () => {
			uiManager.hide();
			expect(editor.frameContext.get('topArea').style.display).toBe('none');
		});

		it('should show editor', () => {
			uiManager.hide();
			uiManager.show();
			expect(editor.frameContext.get('topArea').style.display).toBe('block');
		});
	});

	describe('showLoading and hideLoading', () => {
		it('should show loading', () => {
			expect(() => {
				uiManager.showLoading();
			}).not.toThrow();
		});

		it('should hide loading', () => {
			expect(() => {
				uiManager.hideLoading();
			}).not.toThrow();
		});
	});

	describe('setControllerOnDisabledButtons', () => {
		let result;
		it('should handle activation', () => {
			expect(() => {
				result = uiManager.setControllerOnDisabledButtons(true);
			}).not.toThrow();
			expect(result).toBe(true);
		});

		it('should handle deactivation', () => {
			result = uiManager.setControllerOnDisabledButtons(false);
			expect(result).toBe(false);
		});
	});

	describe('enableBackWrapper and disableBackWrapper', () => {
		it('should enable back wrapper', () => {
			expect(() => {
				uiManager.enableBackWrapper('pointer');
			}).not.toThrow();
		});

		it('should disable back wrapper', () => {
			expect(() => {
				uiManager.disableBackWrapper();
			}).not.toThrow();
		});
	});

	describe('setDir', () => {
		it('should set direction to rtl', () => {
			// Ensure initial state is ltr
			if (editor.options.get('_rtl') === true) {
				uiManager.setDir('ltr');
			}
			uiManager.setDir('rtl');
			expect(editor.options.get('_rtl')).toBe(true);
		});

		it('should set direction to ltr', () => {
			uiManager.setDir('rtl');
			uiManager.setDir('ltr');
			expect(editor.options.get('_rtl')).toBe(false);
		});

		it('should not change if already set to same direction', () => {
			const initialRtl = editor.options.get('_rtl');
			uiManager.setDir(initialRtl ? 'rtl' : 'ltr');
			expect(editor.options.get('_rtl')).toBe(initialRtl);
		});

		it('should add se-rtl class when set to rtl', () => {
			// Ensure initial state is ltr
			if (editor.options.get('_rtl') === true) {
				uiManager.setDir('ltr');
			}
			uiManager.setDir('rtl');
			expect(editor.frameContext.get('topArea').classList.contains('se-rtl')).toBe(true);
		});

		it('should remove se-rtl class when set to ltr', () => {
			// Set to rtl first, then ltr
			if (editor.options.get('_rtl') === false) {
				uiManager.setDir('rtl');
			}
			uiManager.setDir('ltr');
			expect(editor.frameContext.get('topArea').classList.contains('se-rtl')).toBe(false);
		});

		it('should toggle direction buttons active state', () => {
			const dirLtrBtn = editor.commandDispatcher.targets.get('dir_ltr');
			const dirRtlBtn = editor.commandDispatcher.targets.get('dir_rtl');

			// Only run assertions if dir buttons exist
			if (dirLtrBtn && dirRtlBtn) {
				uiManager.setDir('rtl');
				expect(dirRtlBtn.classList.contains('active')).toBe(true);
				expect(dirLtrBtn.classList.contains('active')).toBe(false);

				uiManager.setDir('ltr');
				expect(dirLtrBtn.classList.contains('active')).toBe(true);
				expect(dirRtlBtn.classList.contains('active')).toBe(false);
			}
		});
	});

	describe('Edge cases', () => {
		it('should handle multiple readOnly toggles', () => {
			uiManager.readOnly(true);
			uiManager.readOnly(true);
			uiManager.readOnly(false);
			uiManager.readOnly(false);
			expect(editor.frameContext.get('isReadOnly')).toBe(false);
		});

		it('should handle multiple disable/enable toggles', () => {
			uiManager.disable();
			uiManager.disable();
			uiManager.enable();
			uiManager.enable();
			expect(editor.frameContext.get('isDisabled')).toBe(false);
		});

		it('should handle multiple show/hide toggles', () => {
			uiManager.hide();
			uiManager.hide();
			uiManager.show();
			uiManager.show();
			expect(editor.frameContext.get('topArea').style.display).toBe('block');
		});
	});
});
