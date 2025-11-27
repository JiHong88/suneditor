/**
 * @jest-environment jsdom
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';

describe('UI', () => {
	let editor;
	let ui;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
		ui = editor.ui;
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('Constructor', () => {
		it('should initialize UI with default properties', () => {
			expect(ui._controllerOnBtnDisabled).toBe(false);
			expect(ui.alertModal).toBeDefined();
			expect(ui.alertMessage).toBeDefined();
			expect(ui.toastPopup).toBeDefined();
			expect(ui.toastContainer).toBeDefined();
			expect(ui.toastMessage).toBeDefined();
		});

		it('should have required methods', () => {
			expect(typeof ui.setEditorStyle).toBe('function');
			expect(typeof ui.setTheme).toBe('function');
			expect(typeof ui.readOnly).toBe('function');
			expect(typeof ui.disable).toBe('function');
			expect(typeof ui.enable).toBe('function');
			expect(typeof ui.show).toBe('function');
			expect(typeof ui.hide).toBe('function');
			expect(typeof ui.showLoading).toBe('function');
			expect(typeof ui.hideLoading).toBe('function');
		});
	});

	describe('setEditorStyle', () => {
		it('should set editor style without error', () => {
			expect(() => {
				ui.setEditorStyle('background-color: #fff;');
			}).not.toThrow();
		});

		it('should handle empty style', () => {
			expect(() => {
				ui.setEditorStyle('');
			}).not.toThrow();
		});
	});

	describe('setTheme', () => {
		it('should set theme', () => {
			ui.setTheme('dark');
			expect(editor.options.get('theme')).toBe('dark');
		});

		it('should handle empty theme', () => {
			ui.setTheme('');
			expect(editor.options.get('theme')).toBe('');
		});

		it('should handle non-string theme', () => {
			expect(() => {
				ui.setTheme(null);
			}).not.toThrow();
		});
	});

	describe('readOnly', () => {
		it('should enable readonly mode', () => {
			ui.readOnly(true);
			expect(editor.frameContext.get('isReadOnly')).toBe(true);
		});

		it('should disable readonly mode', () => {
			ui.readOnly(true);
			ui.readOnly(false);
			expect(editor.frameContext.get('isReadOnly')).toBe(false);
		});
	});

	describe('disable and enable', () => {
		it('should disable editor', () => {
			ui.disable();
			expect(editor.frameContext.get('isDisabled')).toBe(true);
		});

		it('should enable editor', () => {
			ui.disable();
			ui.enable();
			expect(editor.frameContext.get('isDisabled')).toBe(false);
		});
	});

	describe('show and hide', () => {
		it('should hide editor', () => {
			ui.hide();
			expect(editor.frameContext.get('topArea').style.display).toBe('none');
		});

		it('should show editor', () => {
			ui.hide();
			ui.show();
			expect(editor.frameContext.get('topArea').style.display).toBe('block');
		});
	});

	describe('showLoading and hideLoading', () => {
		it('should show loading', () => {
			expect(() => {
				ui.showLoading();
			}).not.toThrow();
		});

		it('should hide loading', () => {
			expect(() => {
				ui.hideLoading();
			}).not.toThrow();
		});
	});

	describe('setControllerOnDisabledButtons', () => {
		it('should handle activation', () => {
			expect(() => {
				ui.setControllerOnDisabledButtons(true);
			}).not.toThrow();
			expect(ui._controllerOnBtnDisabled).toBe(true);
		});

		it('should handle deactivation', () => {
			ui.setControllerOnDisabledButtons(true);
			ui.setControllerOnDisabledButtons(false);
			expect(ui._controllerOnBtnDisabled).toBe(false);
		});
	});

	describe('enableBackWrapper and disableBackWrapper', () => {
		it('should enable back wrapper', () => {
			expect(() => {
				ui.enableBackWrapper('pointer');
			}).not.toThrow();
		});

		it('should disable back wrapper', () => {
			expect(() => {
				ui.disableBackWrapper();
			}).not.toThrow();
		});
	});

	describe('alert methods', () => {
		it('should have alertOpen method', () => {
			expect(typeof ui.alertOpen).toBe('function');
		});

		it('should have alertClose method', () => {
			expect(typeof ui.alertClose).toBe('function');
		});

		it('should call alertOpen without error', () => {
			expect(() => {
				ui.alertOpen('Test message');
			}).not.toThrow();
		});

		it('should call alertClose without error', () => {
			expect(() => {
				ui.alertClose();
			}).not.toThrow();
		});
	});

	describe('toast methods', () => {
		it('should have showToast method', () => {
			expect(typeof ui.showToast).toBe('function');
		});

		it('should have closeToast method', () => {
			expect(typeof ui.closeToast).toBe('function');
		});

		it('should call showToast without error', () => {
			expect(() => {
				ui.showToast('Test toast');
			}).not.toThrow();
		});

		it('should handle showToast with duration', () => {
			expect(() => {
				ui.showToast('Test toast', 1000);
			}).not.toThrow();
		});

		it('should call closeToast without error', () => {
			expect(() => {
				ui.closeToast();
			}).not.toThrow();
		});
	});

	describe('_offCurrentController', () => {
		it('should have _offCurrentController method', () => {
			expect(typeof ui._offCurrentController).toBe('function');
		});

		it('should call without error', () => {
			expect(() => {
				ui._offCurrentController();
			}).not.toThrow();
		});
	});

	describe('_offCurrentModal', () => {
		it('should have _offCurrentModal method', () => {
			expect(typeof ui._offCurrentModal).toBe('function');
		});

		it('should call without error', () => {
			expect(() => {
				ui._offCurrentModal();
			}).not.toThrow();
		});
	});

	describe('Edge cases', () => {
		it('should handle multiple readOnly toggles', () => {
			ui.readOnly(true);
			ui.readOnly(true);
			ui.readOnly(false);
			ui.readOnly(false);
			expect(editor.frameContext.get('isReadOnly')).toBe(false);
		});

		it('should handle multiple disable/enable toggles', () => {
			ui.disable();
			ui.disable();
			ui.enable();
			ui.enable();
			expect(editor.frameContext.get('isDisabled')).toBe(false);
		});

		it('should handle multiple show/hide toggles', () => {
			ui.hide();
			ui.hide();
			ui.show();
			ui.show();
			expect(editor.frameContext.get('topArea').style.display).toBe('block');
		});
	});
});
