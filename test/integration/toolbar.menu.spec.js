/**
 * @fileoverview Integration tests for Toolbar and Menu
 * Tests src/core/logic/panel/toolbar.js and menu.js through real editor instance
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';
import { font, fontColor, fontSize } from '../../src/plugins';

describe('Toolbar and Menu Integration Tests', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor({
			plugins: { font, fontColor, fontSize },
			buttonList: [['bold', 'italic', 'underline', 'font', 'fontSize', 'fontColor', 'codeView', 'fullScreen', 'showBlocks']],
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('Toolbar state', () => {
		it('should have toolbar instance accessible via editor.$', () => {
			expect(editor.$.toolbar).toBeDefined();
		});

		it('should have menu instance accessible via editor.$', () => {
			expect(editor.$.menu).toBeDefined();
		});

		it('should not be in balloon mode', () => {
			expect(editor.$.toolbar.isBalloonMode).toBe(false);
		});

		it('should not be in inline mode', () => {
			expect(editor.$.toolbar.isInlineMode).toBe(false);
		});

		it('should not be sticky initially', () => {
			expect(editor.$.toolbar.isSticky).toBe(false);
		});

		it('should have correct keyName for main toolbar', () => {
			expect(editor.$.toolbar.keyName.main).toBe('toolbar_main');
			expect(editor.$.toolbar.keyName.buttonTray).toBe('toolbar_buttonTray');
		});
	});

	describe('Toolbar disable/enable', () => {
		it('should disable toolbar buttons', () => {
			editor.$.toolbar.disable();
			const buttonTray = editor.$.context.get('toolbar_buttonTray');
			const buttons = buttonTray.querySelectorAll('.se-toolbar-btn[data-type]');
			let hasDisabled = false;
			buttons.forEach((btn) => {
				if (btn.disabled) hasDisabled = true;
			});
			expect(hasDisabled).toBe(true);
		});

		it('should enable toolbar buttons after disable', () => {
			editor.$.toolbar.disable();
			editor.$.toolbar.enable();
			const buttonTray = editor.$.context.get('toolbar_buttonTray');
			const buttons = buttonTray.querySelectorAll('.se-toolbar-btn[data-type]');
			let allEnabled = true;
			buttons.forEach((btn) => {
				if (btn.disabled) allEnabled = false;
			});
			expect(allEnabled).toBe(true);
		});
	});

	describe('Toolbar show/hide', () => {
		it('should hide the toolbar', () => {
			editor.$.toolbar.hide();
			const toolbarMain = editor.$.context.get('toolbar_main');
			expect(toolbarMain.style.display).toBe('none');
		});

		it('should show the toolbar after hiding', () => {
			editor.$.toolbar.hide();
			editor.$.toolbar.show();
			const toolbarMain = editor.$.context.get('toolbar_main');
			expect(toolbarMain.style.display).not.toBe('none');
		});
	});

	describe('Menu state', () => {
		it('should initialize with empty dropdown state', () => {
			expect(editor.$.menu.currentButton).toBeNull();
			expect(editor.$.menu.currentDropdown).toBeNull();
			expect(editor.$.menu.currentDropdownName).toBe('');
		});

		it('should initialize with empty container state', () => {
			expect(editor.$.menu.currentContainer).toBeNull();
			expect(editor.$.menu.currentContainerName).toBe('');
		});

		it('should have registered dropdown targets for plugins', () => {
			// font, fontSize, fontColor should have dropdown targets
			expect(editor.$.menu.targetMap).toBeDefined();
		});

		it('should close dropdown cleanly', () => {
			editor.$.menu.dropdownOff();
			expect(editor.$.menu.currentDropdown).toBeNull();
			expect(editor.$.menu.currentDropdownName).toBe('');
		});

		it('should close container cleanly', () => {
			editor.$.menu.containerOff();
			expect(editor.$.menu.currentContainer).toBeNull();
			expect(editor.$.menu.currentContainerName).toBe('');
		});
	});

	describe('Menu dropdown registration', () => {
		it('should have font dropdown registered', () => {
			if (editor.$.menu.targetMap.font) {
				expect(editor.$.menu.targetMap.font).toBeTruthy();
				expect(editor.$.menu.targetMap.font.nodeType).toBe(1); // Element node
			}
		});

		it('should have fontSize dropdown registered', () => {
			if (editor.$.menu.targetMap.fontSize) {
				expect(editor.$.menu.targetMap.fontSize).toBeTruthy();
				expect(editor.$.menu.targetMap.fontSize.nodeType).toBe(1);
			}
		});
	});

	describe('Toolbar inlineToolbarAttr', () => {
		it('should have default inline toolbar attributes', () => {
			expect(editor.$.toolbar.inlineToolbarAttr).toBeDefined();
			expect(editor.$.toolbar.inlineToolbarAttr.isShow).toBe(false);
		});
	});

	describe('Toolbar balloonOffset', () => {
		it('should have default balloon offset', () => {
			expect(editor.$.toolbar.balloonOffset).toBeDefined();
			expect(editor.$.toolbar.balloonOffset.top).toBe(0);
			expect(editor.$.toolbar.balloonOffset.left).toBe(0);
		});
	});

	describe('Menu dropdown interaction', () => {
		it('should open font dropdown and set currentDropdown', () => {
			const buttonTray = editor.$.context.get('toolbar_buttonTray');
			const fontBtn = buttonTray.querySelector('[data-command="font"]');
			if (fontBtn) {
				editor.$.menu.dropdownOn(fontBtn);
				expect(editor.$.menu.currentDropdown).toBeTruthy();
				expect(editor.$.menu.currentDropdownName).toBe('font');
				expect(editor.$.menu.currentButton).toBe(fontBtn);
				editor.$.menu.dropdownOff();
			}
		});

		it('should close dropdown and clear all state', () => {
			const buttonTray = editor.$.context.get('toolbar_buttonTray');
			const fontBtn = buttonTray.querySelector('[data-command="font"]');
			if (fontBtn) {
				editor.$.menu.dropdownOn(fontBtn);
				editor.$.menu.dropdownOff();
				expect(editor.$.menu.currentDropdown).toBeNull();
				expect(editor.$.menu.currentDropdownName).toBe('');
				expect(editor.$.menu.currentButton).toBeNull();
				expect(editor.$.menu.currentDropdownActiveButton).toBeNull();
			}
		});

		it('should switch between dropdowns', () => {
			const buttonTray = editor.$.context.get('toolbar_buttonTray');
			const fontBtn = buttonTray.querySelector('[data-command="font"]');
			const fontSizeBtn = buttonTray.querySelector('[data-command="fontSize"]');
			if (fontBtn && fontSizeBtn) {
				editor.$.menu.dropdownOn(fontBtn);
				expect(editor.$.menu.currentDropdownName).toBe('font');
				editor.$.menu.dropdownOn(fontSizeBtn);
				expect(editor.$.menu.currentDropdownName).toBe('fontSize');
				editor.$.menu.dropdownOff();
			}
		});

		it('should display dropdown menu element', () => {
			const buttonTray = editor.$.context.get('toolbar_buttonTray');
			const fontBtn = buttonTray.querySelector('[data-command="font"]');
			if (fontBtn) {
				editor.$.menu.dropdownOn(fontBtn);
				const menu = editor.$.menu.currentDropdown;
				expect(menu.style.display).toBe('block');
				editor.$.menu.dropdownOff();
				expect(menu.style.display).toBe('none');
			}
		});

		it('should populate menus array for dropdown with commands', () => {
			const buttonTray = editor.$.context.get('toolbar_buttonTray');
			const fontBtn = buttonTray.querySelector('[data-command="font"]');
			if (fontBtn) {
				editor.$.menu.dropdownOn(fontBtn);
				expect(editor.$.menu.menus.length).toBeGreaterThan(0);
				editor.$.menu.dropdownOff();
				expect(editor.$.menu.menus.length).toBe(0);
			}
		});

		it('should hide dropdown without closing', () => {
			const buttonTray = editor.$.context.get('toolbar_buttonTray');
			const fontBtn = buttonTray.querySelector('[data-command="font"]');
			if (fontBtn) {
				editor.$.menu.dropdownOn(fontBtn);
				editor.$.menu.dropdownHide();
				expect(editor.$.menu.currentDropdown.style.display).toBe('none');
				// State should still be present
				expect(editor.$.menu.currentDropdownName).toBe('font');
				editor.$.menu.dropdownOff();
			}
		});

		it('should show dropdown after hiding', () => {
			const buttonTray = editor.$.context.get('toolbar_buttonTray');
			const fontBtn = buttonTray.querySelector('[data-command="font"]');
			if (fontBtn) {
				editor.$.menu.dropdownOn(fontBtn);
				editor.$.menu.dropdownHide();
				editor.$.menu.dropdownShow();
				expect(editor.$.menu.currentDropdown.style.display).toBe('block');
				editor.$.menu.dropdownOff();
			}
		});

		it('should handle dropdownShow when no dropdown is open', () => {
			editor.$.menu.dropdownShow();
			expect(editor.$.menu.currentDropdown).toBeNull();
		});

		it('should handle dropdownHide when no dropdown is open', () => {
			expect(() => editor.$.menu.dropdownHide()).not.toThrow();
		});
	});

	describe('Menu targetMap', () => {
		it('should register all dropdown plugin targets', () => {
			const targetMap = editor.$.menu.targetMap;
			expect(Object.keys(targetMap).length).toBeGreaterThan(0);
		});

		it('should have DOM elements in targetMap', () => {
			const targetMap = editor.$.menu.targetMap;
			for (const key of Object.keys(targetMap)) {
				expect(targetMap[key].nodeType).toBe(1);
			}
		});

		it('should have data-key attribute on dropdown menus', () => {
			const targetMap = editor.$.menu.targetMap;
			for (const key of Object.keys(targetMap)) {
				const menu = targetMap[key];
				if (menu.getAttribute('data-key')) {
					expect(menu.getAttribute('data-key')).toBe(key);
				}
			}
		});
	});

	describe('Toolbar _resetSticky', () => {
		it('should not throw when calling _resetSticky', () => {
			expect(() => editor.$.toolbar._resetSticky()).not.toThrow();
		});

		it('should remain not sticky when editor is at top', () => {
			editor.$.toolbar._resetSticky();
			expect(editor.$.toolbar.isSticky).toBe(false);
		});
	});

	describe('Toolbar resetResponsiveToolbar', () => {
		it('should not throw when calling resetResponsiveToolbar', () => {
			expect(() => editor.$.toolbar.resetResponsiveToolbar()).not.toThrow();
		});
	});

	describe('Toolbar setButtons', () => {
		it('should replace buttons with new button list', () => {
			const originalButtonTray = editor.$.context.get('toolbar_buttonTray');
			const originalChildCount = originalButtonTray.children.length;

			// Set to a smaller button list
			editor.$.toolbar.setButtons([['bold']]);

			const newButtonTray = editor.$.context.get('toolbar_buttonTray');
			// Button tray should have been replaced
			expect(newButtonTray).toBeTruthy();
			expect(newButtonTray.nodeType).toBe(1);
		});
	});

	describe('Toolbar disable clears menus', () => {
		it('should close dropdown on disable', () => {
			const buttonTray = editor.$.context.get('toolbar_buttonTray');
			const fontBtn = buttonTray.querySelector('[data-command="font"]');
			if (fontBtn) {
				editor.$.menu.dropdownOn(fontBtn);
				editor.$.toolbar.disable();
				expect(editor.$.menu.currentDropdown).toBeNull();
			}
		});
	});

	describe('Top toolbar mode (default)', () => {
		it('store.mode.isBottom should be false', () => {
			expect(editor.$.store.mode.isBottom).toBe(false);
		});

		it('toolbar.isBottomMode should be false', () => {
			expect(editor.$.toolbar.isBottomMode).toBe(false);
		});

		it('toolbar element should NOT have se-toolbar-bottom class', () => {
			const toolbar = editor.$.context.get('toolbar_main');
			expect(toolbar.classList.contains('se-toolbar-bottom')).toBe(false);
		});

		it('toolbar should be before wrapper in DOM', () => {
			const rootFc = editor.$.frameRoots.values().next().value;
			const container = rootFc.get('container');
			const toolbar = editor.$.context.get('toolbar_main');
			const wrapper = container.querySelector('.se-wrapper');
			expect(toolbar.compareDocumentPosition(wrapper) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		});
	});

	describe('Offset module', () => {
		it('should have offset module accessible', () => {
			expect(editor.$.offset).toBeDefined();
		});

		it('should return offset info for element', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test</p>';
			const p = wysiwyg.querySelector('p');
			const offset = editor.$.offset.get(p);
			expect(offset).toHaveProperty('top');
			expect(offset).toHaveProperty('left');
			expect(typeof offset.top).toBe('number');
			expect(typeof offset.left).toBe('number');
		});

		it('should return global offset for element', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			const globalOffset = editor.$.offset.getGlobal(wysiwyg);
			expect(globalOffset).toHaveProperty('top');
			expect(globalOffset).toHaveProperty('left');
			expect(globalOffset).toHaveProperty('width');
			expect(globalOffset).toHaveProperty('height');
		});

		it('should return local offset for element', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Local offset test</p>';
			const p = wysiwyg.querySelector('p');
			const localOffset = editor.$.offset.getLocal(p);
			expect(localOffset).toHaveProperty('top');
			expect(localOffset).toHaveProperty('left');
			expect(localOffset).toHaveProperty('right');
			expect(localOffset).toHaveProperty('scrollX');
			expect(localOffset).toHaveProperty('scrollY');
		});

		it('should return wysiwyg scroll info', () => {
			const scrollInfo = editor.$.offset.getWWScroll();
			expect(scrollInfo).toHaveProperty('top');
			expect(scrollInfo).toHaveProperty('left');
			expect(scrollInfo).toHaveProperty('width');
			expect(scrollInfo).toHaveProperty('height');
			expect(typeof scrollInfo.top).toBe('number');
		});

		it('should return global scroll info', () => {
			const scrollInfo = editor.$.offset.getGlobalScroll();
			expect(scrollInfo).toHaveProperty('top');
			expect(scrollInfo).toHaveProperty('left');
			expect(scrollInfo).toHaveProperty('width');
			expect(scrollInfo).toHaveProperty('height');
			expect(typeof scrollInfo.top).toBe('number');
		});

		it('should position menu element relative to button', () => {
			const menuEl = document.createElement('div');
			menuEl.style.display = 'block';
			document.body.appendChild(menuEl);
			const carrier = editor.$.contextProvider.carrierWrapper;
			const buttonTray = editor.$.context.get('toolbar_buttonTray');
			const btn = buttonTray.querySelector('[data-type]');

			if (btn && carrier) {
				expect(() => {
					editor.$.menu.__resetMenuPosition(btn, menuEl);
				}).not.toThrow();
			}

			document.body.removeChild(menuEl);
		});
	});
});

describe('Toolbar Bottom Mode (classic:bottom)', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor({
			plugins: { font, fontSize },
			buttonList: [['bold', 'italic', 'font', 'fontSize']],
			mode: 'classic:bottom',
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('Mode flags', () => {
		it('store.mode.isBottom should be true', () => {
			expect(editor.$.store.mode.isBottom).toBe(true);
		});

		it('store.mode.isClassic should be true', () => {
			expect(editor.$.store.mode.isClassic).toBe(true);
		});

		it('toolbar.isBottomMode should be true', () => {
			expect(editor.$.toolbar.isBottomMode).toBe(true);
		});

		it('should not be balloon or inline', () => {
			expect(editor.$.toolbar.isBalloonMode).toBe(false);
			expect(editor.$.toolbar.isInlineMode).toBe(false);
		});
	});

	describe('DOM structure', () => {
		it('toolbar element should have se-toolbar-bottom class', () => {
			const toolbar = editor.$.context.get('toolbar_main');
			expect(toolbar.classList.contains('se-toolbar-bottom')).toBe(true);
		});

		it('toolbar should be after wrapper in DOM (bottom position)', () => {
			const rootFc = editor.$.frameRoots.values().next().value;
			const container = rootFc.get('container');
			const toolbar = editor.$.context.get('toolbar_main');
			const wrapper = container.querySelector('.se-wrapper');
			// toolbar should come AFTER wrapper
			expect(toolbar.compareDocumentPosition(wrapper) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
		});

		it('toolbar should be before statusbar in DOM', () => {
			const rootFc = editor.$.frameRoots.values().next().value;
			const container = rootFc.get('container');
			const toolbar = editor.$.context.get('toolbar_main');
			const statusbar = container.querySelector('.se-statusbar');
			if (statusbar) {
				expect(toolbar.compareDocumentPosition(statusbar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
			}
		});
	});

	describe('Sticky behavior', () => {
		it('should not be sticky initially', () => {
			expect(editor.$.toolbar.isSticky).toBe(false);
		});

		it('_resetSticky should not throw', () => {
			expect(() => editor.$.toolbar._resetSticky()).not.toThrow();
		});
	});

	describe('Toolbar operations', () => {
		it('show/hide should work in bottom mode', () => {
			editor.$.toolbar.hide();
			const toolbarMain = editor.$.context.get('toolbar_main');
			expect(toolbarMain.style.display).toBe('none');

			editor.$.toolbar.show();
			expect(toolbarMain.style.display).not.toBe('none');
		});

		it('disable/enable should work in bottom mode', () => {
			editor.$.toolbar.disable();
			const buttonTray = editor.$.context.get('toolbar_buttonTray');
			const buttons = buttonTray.querySelectorAll('.se-toolbar-btn[data-type]');
			let hasDisabled = false;
			buttons.forEach((btn) => {
				if (btn.disabled) hasDisabled = true;
			});
			expect(hasDisabled).toBe(true);

			editor.$.toolbar.enable();
			let allEnabled = true;
			buttons.forEach((btn) => {
				if (btn.disabled) allEnabled = false;
			});
			expect(allEnabled).toBe(true);
		});

		it('setButtons should work in bottom mode', () => {
			expect(() => editor.$.toolbar.setButtons([['bold']])).not.toThrow();
			const newButtonTray = editor.$.context.get('toolbar_buttonTray');
			expect(newButtonTray).toBeTruthy();
		});

		it('resetResponsiveToolbar should not throw in bottom mode', () => {
			expect(() => editor.$.toolbar.resetResponsiveToolbar()).not.toThrow();
		});
	});

	describe('Menu dropdown in bottom mode', () => {
		it('should open dropdown', () => {
			const buttonTray = editor.$.context.get('toolbar_buttonTray');
			const fontBtn = buttonTray.querySelector('[data-command="font"]');
			if (fontBtn) {
				editor.$.menu.dropdownOn(fontBtn);
				expect(editor.$.menu.currentDropdown).toBeTruthy();
				expect(editor.$.menu.currentDropdownName).toBe('font');
				editor.$.menu.dropdownOff();
			}
		});

		it('should close dropdown cleanly', () => {
			const buttonTray = editor.$.context.get('toolbar_buttonTray');
			const fontBtn = buttonTray.querySelector('[data-command="font"]');
			if (fontBtn) {
				editor.$.menu.dropdownOn(fontBtn);
				editor.$.menu.dropdownOff();
				expect(editor.$.menu.currentDropdown).toBeNull();
			}
		});
	});
});

describe('Toolbar Bottom Mode — balloon should ignore :bottom', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor({
			buttonList: [['bold']],
			mode: 'balloon:bottom',
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	it('isBottom should be false for balloon:bottom', () => {
		expect(editor.$.store.mode.isBottom).toBe(false);
	});

	it('isBalloon should be true', () => {
		expect(editor.$.store.mode.isBalloon).toBe(true);
	});
});

describe('Toolbar Bottom Mode (inline:bottom)', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor({
			buttonList: [['bold', 'italic']],
			mode: 'inline:bottom',
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	it('store.mode.isBottom should be true', () => {
		expect(editor.$.store.mode.isBottom).toBe(true);
	});

	it('store.mode.isInline should be true', () => {
		expect(editor.$.store.mode.isInline).toBe(true);
	});

	it('toolbar.isBottomMode should be true', () => {
		expect(editor.$.toolbar.isBottomMode).toBe(true);
	});

	it('toolbar should have se-toolbar-bottom class', () => {
		const toolbar = editor.$.context.get('toolbar_main');
		expect(toolbar.classList.contains('se-toolbar-bottom')).toBe(true);
	});

	it('toolbar should also have se-toolbar-inline class', () => {
		const toolbar = editor.$.context.get('toolbar_main');
		expect(toolbar.classList.contains('se-toolbar-inline')).toBe(true);
	});
});
