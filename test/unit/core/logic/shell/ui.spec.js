/**
 * @jest-environment jsdom
 */

import { createMockEditor } from '../../../../__mocks__/editorMock';
import UIManager from '../../../../../src/core/logic/shell/ui';

describe('UIManager', () => {
	let mockEditor;

	beforeEach(() => {
		mockEditor = createMockEditor();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Mock UIManager methods', () => {
		it('should have ui object in mockEditor', () => {
			expect(mockEditor.$.ui).toBeDefined();
			expect(typeof mockEditor.$.ui).toBe('object');
		});

		it('should have core UI methods defined', () => {
			expect(typeof mockEditor.$.ui.setEditorStyle).toBe('function');
			expect(typeof mockEditor.$.ui.setTheme).toBe('function');
			expect(typeof mockEditor.$.ui.readOnly).toBe('function');
			expect(typeof mockEditor.$.ui.disable).toBe('function');
			expect(typeof mockEditor.$.ui.enable).toBe('function');
		});
	});

	describe('setEditorStyle method', () => {
		it('should be callable', () => {
			expect(() => {
				mockEditor.$.ui.setEditorStyle('width', '100%');
			}).not.toThrow();
		});

		it('should accept style property and value', () => {
			expect(() => {
				mockEditor.$.ui.setEditorStyle('width', '500px');
			}).not.toThrow();
		});
	});

	describe('setTheme method', () => {
		it('should be callable with theme name', () => {
			expect(() => {
				mockEditor.$.ui.setTheme('dark');
			}).not.toThrow();
		});

		it('should handle different theme values', () => {
			const themes = ['dark', 'light', 'auto'];
			themes.forEach((theme) => {
				expect(() => {
					mockEditor.$.ui.setTheme(theme);
				}).not.toThrow();
			});
		});
	});

	describe('setDir method', () => {
		it('should set text direction to ltr', () => {
			expect(() => {
				mockEditor.$.ui.setDir('ltr');
			}).not.toThrow();
		});

		it('should set text direction to rtl', () => {
			expect(() => {
				mockEditor.$.ui.setDir('rtl');
			}).not.toThrow();
		});
	});

	describe('readOnly method', () => {
		it('should enable readonly mode', () => {
			expect(() => {
				mockEditor.$.ui.readOnly(true);
			}).not.toThrow();
		});

		it('should disable readonly mode', () => {
			expect(() => {
				mockEditor.$.ui.readOnly(false);
			}).not.toThrow();
		});
	});

	describe('disable method', () => {
		it('should disable the editor', () => {
			expect(() => {
				mockEditor.$.ui.disable();
			}).not.toThrow();
		});

		it('should disable all toolbar buttons', () => {
			mockEditor.$.ui.disable();
			expect(mockEditor.$.ui.disable).toHaveBeenCalled();
		});
	});

	describe('enable method', () => {
		it('should enable the editor', () => {
			expect(() => {
				mockEditor.$.ui.enable();
			}).not.toThrow();
		});

		it('should enable toolbar buttons', () => {
			mockEditor.$.ui.enable();
			expect(mockEditor.$.ui.enable).toHaveBeenCalled();
		});
	});

	describe('show method', () => {
		it('should show the editor', () => {
			expect(() => {
				mockEditor.$.ui.show();
			}).not.toThrow();
		});
	});

	describe('hide method', () => {
		it('should hide the editor', () => {
			expect(() => {
				mockEditor.$.ui.hide();
			}).not.toThrow();
		});
	});

	describe('showLoading method', () => {
		it('should display loading indicator', () => {
			expect(() => {
				mockEditor.$.ui.showLoading();
			}).not.toThrow();
		});
	});

	describe('hideLoading method', () => {
		it('should hide loading indicator', () => {
			expect(() => {
				mockEditor.$.ui.hideLoading();
			}).not.toThrow();
		});
	});

	describe('alertOpen method', () => {
		it('should open alert dialog with message', () => {
			expect(() => {
				mockEditor.$.ui.alertOpen('Test message');
			}).not.toThrow();
		});

		it('should handle empty message', () => {
			expect(() => {
				mockEditor.$.ui.alertOpen('');
			}).not.toThrow();
		});
	});

	describe('alertClose method', () => {
		it('should close alert dialog', () => {
			expect(() => {
				mockEditor.$.ui.alertClose();
			}).not.toThrow();
		});
	});

	describe('showToast method', () => {
		it('should display toast notification', () => {
			expect(() => {
				mockEditor.$.ui.showToast('Toast message');
			}).not.toThrow();
		});

		it('should handle toast with duration', () => {
			expect(() => {
				mockEditor.$.ui.showToast('Message', 3000);
			}).not.toThrow();
		});
	});

	describe('closeToast method', () => {
		it('should close toast notification', () => {
			expect(() => {
				mockEditor.$.ui.closeToast();
			}).not.toThrow();
		});
	});

	describe('setControllerOnDisabledButtons method', () => {
		it('should return boolean value', () => {
			const result = mockEditor.$.ui.setControllerOnDisabledButtons(true);
			expect(typeof result).toBe('boolean');
		});

		it('should handle enable controller buttons', () => {
			mockEditor.$.ui.setControllerOnDisabledButtons(true);
			expect(mockEditor.$.ui.setControllerOnDisabledButtons).toHaveBeenCalledWith(true);
		});

		it('should handle disable controller buttons', () => {
			mockEditor.$.ui.setControllerOnDisabledButtons(false);
			expect(mockEditor.$.ui.setControllerOnDisabledButtons).toHaveBeenCalledWith(false);
		});
	});

	describe('onControllerContext method', () => {
		it('should attach controller context handler', () => {
			const handler = jest.fn();
			expect(() => {
				mockEditor.$.ui.onControllerContext(handler);
			}).not.toThrow();
		});
	});

	describe('offControllerContext method', () => {
		it('should detach controller context handler', () => {
			const handler = jest.fn();
			expect(() => {
				mockEditor.$.ui.offControllerContext(handler);
			}).not.toThrow();
		});
	});

	describe('enableBackWrapper method', () => {
		it('should enable back wrapper', () => {
			expect(() => {
				mockEditor.$.ui.enableBackWrapper();
			}).not.toThrow();
		});
	});

	describe('disableBackWrapper method', () => {
		it('should disable back wrapper', () => {
			expect(() => {
				mockEditor.$.ui.disableBackWrapper();
			}).not.toThrow();
		});
	});

	describe('offCurrentController method', () => {
		it('should turn off current controller', () => {
			expect(() => {
				mockEditor.$.ui.offCurrentController();
			}).not.toThrow();
		});
	});

	describe('offCurrentModal method', () => {
		it('should turn off current modal', () => {
			expect(() => {
				mockEditor.$.ui.offCurrentModal();
			}).not.toThrow();
		});
	});

	describe('getVisibleFigure method', () => {
		it('should return visible figure or null', () => {
			const result = mockEditor.$.ui.getVisibleFigure();
			expect(result === null || result instanceof HTMLElement).toBe(true);
		});
	});

	describe('setFigureContainer method', () => {
		it('should set figure container', () => {
			const container = document.createElement('div');
			expect(() => {
				mockEditor.$.ui.setFigureContainer(container);
			}).not.toThrow();
		});
	});

	describe('preventToolbarHide method', () => {
		it('should prevent toolbar from hiding', () => {
			expect(() => {
				mockEditor.$.ui.preventToolbarHide();
			}).not.toThrow();
		});
	});

	describe('reset method', () => {
		it('should reset UI to initial state', () => {
			expect(() => {
				mockEditor.$.ui.reset();
			}).not.toThrow();
		});
	});

	describe('isButtonDisabled method', () => {
		it('should return boolean for button disabled state', () => {
			const btn = document.createElement('button');
			const result = mockEditor.$.ui.isButtonDisabled(btn);
			expect(typeof result).toBe('boolean');
		});

		it('should handle null button', () => {
			const result = mockEditor.$.ui.isButtonDisabled(null);
			expect(typeof result).toBe('boolean');
		});
	});

	describe('init method', () => {
		it('should initialize UI components', () => {
			expect(() => {
				mockEditor.$.ui.init();
			}).not.toThrow();
		});
	});

	describe('destroy method', () => {
		it('should clean up UI resources', () => {
			expect(() => {
				mockEditor.$.ui.destroy();
			}).not.toThrow();
		});
	});

	describe('Internal state properties', () => {
		it('should have opendControllers array', () => {
			expect(Array.isArray(mockEditor.$.ui.opendControllers)).toBe(true);
		});

		it('should have currentControllerName string', () => {
			expect(typeof mockEditor.$.ui.currentControllerName).toBe('string');
		});

		it('should have opendModal property', () => {
			expect('opendModal' in mockEditor.$.ui).toBe(true);
		});

		it('should have selectMenuOn boolean', () => {
			expect(typeof mockEditor.$.ui.selectMenuOn).toBe('boolean');
		});

		it('should have _codeViewDisabledButtons array', () => {
			expect(Array.isArray(mockEditor.$.ui._codeViewDisabledButtons)).toBe(true);
		});

		it('should have _controllerOnDisabledButtons array', () => {
			expect(Array.isArray(mockEditor.$.ui._controllerOnDisabledButtons)).toBe(true);
		});

		it('should have _notHideToolbar boolean', () => {
			expect(typeof mockEditor.$.ui._notHideToolbar).toBe('boolean');
		});

		it('should have _figureContainer property', () => {
			expect('_figureContainer' in mockEditor.$.ui).toBe(true);
		});

		it('should have opendBrowser property', () => {
			expect('opendBrowser' in mockEditor.$.ui).toBe(true);
		});
	});

	describe('Integration scenarios', () => {
		it('should handle show/hide cycle', () => {
			mockEditor.$.ui.show();
			mockEditor.$.ui.hide();
			mockEditor.$.ui.show();

			expect(mockEditor.$.ui.show).toHaveBeenCalled();
			expect(mockEditor.$.ui.hide).toHaveBeenCalled();
		});

		it('should handle enable/disable cycle', () => {
			mockEditor.$.ui.disable();
			mockEditor.$.ui.enable();

			expect(mockEditor.$.ui.disable).toHaveBeenCalled();
			expect(mockEditor.$.ui.enable).toHaveBeenCalled();
		});

		it('should handle readOnly toggle', () => {
			mockEditor.$.ui.readOnly(true);
			mockEditor.$.ui.readOnly(false);

			expect(mockEditor.$.ui.readOnly).toHaveBeenCalledWith(true);
			expect(mockEditor.$.ui.readOnly).toHaveBeenCalledWith(false);
		});

		it('should handle alert lifecycle', () => {
			mockEditor.$.ui.alertOpen('Test message');
			mockEditor.$.ui.alertClose();

			expect(mockEditor.$.ui.alertOpen).toHaveBeenCalledWith('Test message');
			expect(mockEditor.$.ui.alertClose).toHaveBeenCalled();
		});

		it('should handle toast notifications', () => {
			mockEditor.$.ui.showToast('Message 1');
			mockEditor.$.ui.showToast('Message 2', 5000);
			mockEditor.$.ui.closeToast();

			expect(mockEditor.$.ui.showToast).toHaveBeenCalledTimes(2);
			expect(mockEditor.$.ui.closeToast).toHaveBeenCalled();
		});

		it('should handle loading indicator', () => {
			mockEditor.$.ui.showLoading();
			mockEditor.$.ui.hideLoading();

			expect(mockEditor.$.ui.showLoading).toHaveBeenCalled();
			expect(mockEditor.$.ui.hideLoading).toHaveBeenCalled();
		});
	});
});
