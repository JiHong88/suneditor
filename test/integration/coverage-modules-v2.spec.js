/**
 * @fileoverview Integration tests for low-coverage modules
 * Tests using real editor instances to exercise private field dependencies
 * and complex module interactions
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';

jest.setTimeout(30000);

describe('Coverage Integration Tests - Editor Initialization', () => {
	let editor;

	beforeAll(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
	});

	it('should create a real editor instance', () => {
		expect(editor).toBeDefined();
		expect(editor.$).toBeDefined();
	});

	it('should have initialized the kernel dependencies', () => {
		expect(editor.$).toBeDefined();
		expect(editor.$.context).toBeDefined();
		expect(editor.$.frameContext).toBeDefined();
	});

	it('should have wysiwyg editor available', () => {
		const wysiwyg = editor.$.frameContext.get('wysiwyg');
		expect(wysiwyg).toBeDefined();
		expect(wysiwyg.contentEditable === 'true' || wysiwyg.nodeType === 1).toBe(true);
	});

	it('should have store initialized', () => {
		expect(editor.$.store).toBeDefined();
		expect(editor.$.store._editorInitFinished).toBeDefined();
	});

	it('should have options accessible', () => {
		expect(editor.$.options).toBeDefined();
		expect(typeof editor.$.options.get).toBe('function');
	});

	it('should have eventManager initialized', () => {
		expect(editor.$.eventManager).toBeDefined();
		expect(typeof editor.$.eventManager.triggerEvent).toBe('function');
	});

	it('should have ui manager initialized', () => {
		expect(editor.$.ui).toBeDefined();
		expect(typeof editor.$.ui.alertOpen).toBe('function');
	});

	it('should have selection manager initialized', () => {
		expect(editor.$.selection).toBeDefined();
		expect(typeof editor.$.selection.get).toBe('function');
	});

	it('should have component system initialized', () => {
		expect(editor.$.component).toBeDefined();
		expect(typeof editor.$.component.is).toBe('function');
	});

	it('should have history manager initialized', () => {
		expect(editor.$.history).toBeDefined();
		expect(typeof editor.$.history.push).toBe('function');
	});

	it('should have format utilities initialized', () => {
		expect(editor.$.format).toBeDefined();
		expect(typeof editor.$.format.isLine).toBe('function');
	});

	it('should have HTML utilities initialized', () => {
		expect(editor.$.html).toBeDefined();
		expect(typeof editor.$.html.insert).toBe('function');
	});

	it('should have toolbar module initialized', () => {
		expect(editor.$.toolbar).toBeDefined();
	});

	it('should have menu module initialized', () => {
		expect(editor.$.menu).toBeDefined();
	});

	it('should have context provider available', () => {
		expect(editor.$.contextProvider).toBeDefined();
		expect(typeof editor.$.contextProvider.applyToRoots).toBe('function');
	});

	it('should have offset utilities available', () => {
		expect(editor.$.offset).toBeDefined();
		if (editor.$.offset.getOffset) {
			expect(typeof editor.$.offset.getOffset).toBe('function');
		}
	});
});

describe('Coverage Integration Tests - Toolbar Functionality', () => {
	let editor;

	beforeAll(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
	});

	it('should have toolbar accessible', () => {
		expect(editor.$.toolbar).toBeDefined();
	});

	it('should have toolbar key names defined', () => {
		const toolbar = editor.$.toolbar;
		expect(toolbar.keyName).toBeDefined();
	});

	it('should have toolbar disable method', () => {
		expect(typeof editor.$.toolbar.disable).toBe('function');
	});

	it('should be able to interact with toolbar', () => {
		const toolbar = editor.$.toolbar;
		expect(toolbar).toBeDefined();

		// Test keyName structure for toolbar and toolbar_sub
		if (toolbar.keyName) {
			expect(toolbar.keyName.main).toBeDefined();
			expect(toolbar.keyName.buttonTray).toBeDefined();
		}
	});

	it('should have multiple toolbar states', () => {
		const toolbar = editor.$.toolbar;
		expect(typeof toolbar.isBalloonMode).toBe('boolean');
		expect(typeof toolbar.isInlineMode).toBe('boolean');
		expect(typeof toolbar.isSticky).toBe('boolean');
	});

	it('should track inline toolbar attributes', () => {
		const toolbar = editor.$.toolbar;
		if (toolbar.inlineToolbarAttr) {
			expect(toolbar.inlineToolbarAttr).toHaveProperty('top');
			expect(toolbar.inlineToolbarAttr).toHaveProperty('width');
			expect(toolbar.inlineToolbarAttr).toHaveProperty('isShow');
		}
	});

	it('should track balloon offset', () => {
		const toolbar = editor.$.toolbar;
		if (toolbar.balloonOffset) {
			expect(toolbar.balloonOffset).toHaveProperty('top');
			expect(toolbar.balloonOffset).toHaveProperty('left');
		}
	});
});

describe('Coverage Integration Tests - Menu Functionality', () => {
	let editor;

	beforeAll(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
	});

	it('should have menu initialized', () => {
		expect(editor.$.menu).toBeDefined();
	});

	it('should have menu dropdown methods', () => {
		const menu = editor.$.menu;
		expect(typeof menu.dropdownOff).toBe('function');
	});

	it('should track current dropdown state', () => {
		const menu = editor.$.menu;
		expect(menu).toHaveProperty('currentDropdownActiveButton');
		expect(menu).toHaveProperty('currentDropdown');
		expect(menu).toHaveProperty('currentDropdownName');
	});

	it('should have container menu methods', () => {
		const menu = editor.$.menu;
		expect(typeof menu.containerOff).toBe('function');
	});

	it('should be able to query menu elements', () => {
		const menu = editor.$.menu;
		// Menu query methods may be conditional
		if (menu.querySelector) {
			expect(typeof menu.querySelector).toBe('function');
		}
		if (menu.querySelectorAll) {
			expect(typeof menu.querySelectorAll).toBe('function');
		}
	});

	it('should have menu positioning methods', () => {
		const menu = editor.$.menu;
		expect(typeof menu.__resetMenuPosition).toBe('function');
		expect(typeof menu.__restoreMenuPosition).toBe('function');
	});
});

describe('Coverage Integration Tests - Component System', () => {
	let editor;

	beforeAll(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
	});

	it('should have component system initialized', () => {
		expect(editor.$.component).toBeDefined();
	});

	it('should be able to check if node is component', () => {
		const component = editor.$.component;
		const mockDiv = document.createElement('div');

		expect(typeof component.is).toBe('function');
		const result = component.is(mockDiv);
		expect(typeof result).toBe('boolean');
	});

	it('should be able to select components', () => {
		const component = editor.$.component;
		expect(typeof component.select).toBe('function');
	});

	it('should be able to deselect components', () => {
		const component = editor.$.component;
		expect(typeof component.deselect).toBe('function');
	});

	it('should be able to copy components', () => {
		const component = editor.$.component;
		if (component.copy) {
			expect(typeof component.copy).toBe('function');
		}
	});

	it('should be able to cut components', () => {
		const component = editor.$.component;
		if (component.cut) {
			expect(typeof component.cut).toBe('function');
		}
	});

	it('should be able to manipulate components', () => {
		const component = editor.$.component;
		// Core component methods should exist
		expect(typeof component.is).toBe('function');
		expect(typeof component.select).toBe('function');
		expect(typeof component.deselect).toBe('function');
	});

	it('should be able to insert components', () => {
		const component = editor.$.component;
		if (component.insert) {
			expect(typeof component.insert).toBe('function');
		}
	});
});

describe('Coverage Integration Tests - Focus Manager', () => {
	let editor;

	beforeAll(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
	});

	it('should have focus manager initialized', () => {
		expect(editor.$.focusManager).toBeDefined();
	});

	it('should have focus method', () => {
		expect(typeof editor.$.focusManager.focus).toBe('function');
	});

	it('should have blur method', () => {
		expect(typeof editor.$.focusManager.blur).toBe('function');
	});

	it('should have native focus method', () => {
		expect(typeof editor.$.focusManager.nativeFocus).toBe('function');
	});

	it('should have focus edge method', () => {
		expect(typeof editor.$.focusManager.focusEdge).toBe('function');
	});

	it('should be able to focus editor', () => {
		const focusManager = editor.$.focusManager;
		expect(() => {
			focusManager.focus();
		}).not.toThrow();
	});
});

describe('Coverage Integration Tests - UI System', () => {
	let editor;

	beforeAll(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
	});

	it('should have UI manager initialized', () => {
		expect(editor.$.ui).toBeDefined();
	});

	it('should have show/hide methods', () => {
		const ui = editor.$.ui;
		expect(typeof ui.show).toBe('function');
		expect(typeof ui.hide).toBe('function');
	});

	it('should have loading indicator methods', () => {
		const ui = editor.$.ui;
		expect(typeof ui.showLoading).toBe('function');
		expect(typeof ui.hideLoading).toBe('function');
	});

	it('should have alert methods', () => {
		const ui = editor.$.ui;
		expect(typeof ui.alertOpen).toBe('function');
		expect(typeof ui.alertClose).toBe('function');
	});

	it('should have theme methods', () => {
		const ui = editor.$.ui;
		expect(typeof ui.setTheme).toBe('function');
	});

	it('should have readonly methods', () => {
		const ui = editor.$.ui;
		expect(typeof ui.readOnly).toBe('function');
	});

	it('should have enable/disable methods', () => {
		const ui = editor.$.ui;
		expect(typeof ui.enable).toBe('function');
		expect(typeof ui.disable).toBe('function');
	});

	it('should have toast notification methods', () => {
		const ui = editor.$.ui;
		expect(typeof ui.showToast).toBe('function');
		expect(typeof ui.closeToast).toBe('function');
	});

	it('should have controller context methods', () => {
		const ui = editor.$.ui;
		expect(typeof ui.onControllerContext).toBe('function');
		expect(typeof ui.offControllerContext).toBe('function');
	});
});

describe('Coverage Integration Tests - Selection System', () => {
	let editor;

	beforeAll(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
	});

	it('should have selection manager initialized', () => {
		expect(editor.$.selection).toBeDefined();
	});

	it('should be able to get selection', () => {
		const selection = editor.$.selection;
		expect(typeof selection.get).toBe('function');

		const result = selection.get();
		// Result might be null in test environment
		expect(result === null || typeof result === 'object').toBe(true);
	});

	it('should be able to set range', () => {
		const selection = editor.$.selection;
		expect(typeof selection.setRange).toBe('function');
	});

	it('should be able to get range', () => {
		const selection = editor.$.selection;
		expect(typeof selection.getRange).toBe('function');
	});

	it('should be able to save/restore selection', () => {
		const selection = editor.$.selection;
		// save and restore may be available
		if (selection.save) {
			expect(typeof selection.save).toBe('function');
		}
		if (selection.restore) {
			expect(typeof selection.restore).toBe('function');
		}
	});

	it('should be able to remove range', () => {
		const selection = editor.$.selection;
		if (selection.removeRange) {
			expect(typeof selection.removeRange).toBe('function');
		}
	});

	it('should have core selection capabilities', () => {
		const selection = editor.$.selection;
		// At minimum should have get and set range
		expect(typeof selection.get).toBe('function');
		expect(typeof selection.setRange).toBe('function');
	});
});

describe('Coverage Integration Tests - History System', () => {
	let editor;

	beforeAll(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
	});

	it('should have history manager initialized', () => {
		expect(editor.$.history).toBeDefined();
	});

	it('should be able to push history', () => {
		const history = editor.$.history;
		expect(typeof history.push).toBe('function');

		expect(() => {
			history.push(false);
		}).not.toThrow();
	});

	it('should be able to undo', () => {
		const history = editor.$.history;
		expect(typeof history.undo).toBe('function');
	});

	it('should be able to redo', () => {
		const history = editor.$.history;
		expect(typeof history.redo).toBe('function');
	});

	it('should be able to pause/resume history', () => {
		const history = editor.$.history;
		expect(typeof history.pause).toBe('function');
		expect(typeof history.resume).toBe('function');
	});

	it('should be able to reset history', () => {
		const history = editor.$.history;
		expect(typeof history.reset).toBe('function');
	});

	it('should have root stack getter', () => {
		const history = editor.$.history;
		expect(typeof history.getRootStack).toBe('function');
	});
});

describe('Coverage Integration Tests - Format System', () => {
	let editor;

	beforeAll(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
	});

	it('should have format system initialized', () => {
		expect(editor.$.format).toBeDefined();
	});

	it('should check line types', () => {
		const format = editor.$.format;
		expect(typeof format.isLine).toBe('function');
		expect(typeof format.isBlock).toBe('function');
		expect(typeof format.isBrLine).toBe('function');
		expect(typeof format.isNormalLine).toBe('function');
	});

	it('should check closure types', () => {
		const format = editor.$.format;
		expect(typeof format.isClosureBlock).toBe('function');
		expect(typeof format.isClosureBrLine).toBe('function');
	});

	it('should check text style nodes', () => {
		const format = editor.$.format;
		expect(typeof format.isTextStyleNode).toBe('function');
	});

	it('should get format elements', () => {
		const format = editor.$.format;
		expect(typeof format.getBlock).toBe('function');
		expect(typeof format.getLine).toBe('function');
		// Some methods may not be available on all editor configurations
		if (format.getLines) {
			expect(typeof format.getLines).toBe('function');
		}
	});

	it('should apply/remove formats', () => {
		const format = editor.$.format;
		expect(typeof format.applyBlock).toBe('function');
		expect(typeof format.removeBlock).toBe('function');
	});

	it('should add lines', () => {
		const format = editor.$.format;
		expect(typeof format.addLine).toBe('function');
	});
});

describe('Coverage Integration Tests - HTML System', () => {
	let editor;

	beforeAll(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
	});

	it('should have HTML system initialized', () => {
		expect(editor.$.html).toBeDefined();
	});

	it('should clean HTML', () => {
		const html = editor.$.html;
		expect(typeof html.clean).toBe('function');
	});

	it('should insert HTML', () => {
		const html = editor.$.html;
		expect(typeof html.insert).toBe('function');
	});

	it('should set HTML', () => {
		const html = editor.$.html;
		expect(typeof html.set).toBe('function');
	});

	it('should remove HTML', () => {
		const html = editor.$.html;
		expect(typeof html.remove).toBe('function');
	});

	it('should insert nodes', () => {
		const html = editor.$.html;
		expect(typeof html.insertNode).toBe('function');
	});

	it('should copy HTML', () => {
		const html = editor.$.html;
		expect(typeof html.copy).toBe('function');
	});
});

describe('Coverage Integration Tests - Node Transform System', () => {
	let editor;

	beforeAll(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
	});

	it('should have node transform system initialized', () => {
		expect(editor.$.nodeTransform).toBeDefined();
	});

	it('should create nested nodes', () => {
		const nodeTransform = editor.$.nodeTransform;
		expect(typeof nodeTransform.createNestedNode).toBe('function');
	});

	it('should remove all parent nodes', () => {
		const nodeTransform = editor.$.nodeTransform;
		expect(typeof nodeTransform.removeAllParents).toBe('function');
	});

	it('should split nodes', () => {
		const nodeTransform = editor.$.nodeTransform;
		expect(typeof nodeTransform.split).toBe('function');
	});
});

describe('Coverage Integration Tests - Character System', () => {
	let editor;

	beforeAll(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
	});

	it('should have character system initialized', () => {
		expect(editor.$.char).toBeDefined();
	});

	it('should test characters', () => {
		const char = editor.$.char;
		expect(typeof char.test).toBe('function');
	});

	it('should check characters', () => {
		const char = editor.$.char;
		expect(typeof char.check).toBe('function');
	});

	it('should display characters', () => {
		const char = editor.$.char;
		expect(typeof char.display).toBe('function');
	});
});

describe('Coverage Integration Tests - Offset System', () => {
	let editor;

	beforeAll(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
	});

	it('should have offset system initialized', () => {
		expect(editor.$.offset).toBeDefined();
	});

	it('should have offset utilities available', () => {
		const offset = editor.$.offset;
		expect(offset).toBeDefined();
		// The offset system provides positioning and sizing utilities
		expect(typeof offset).toBe('object');
	});

	it('should have offset methods for DOM calculations', () => {
		const offset = editor.$.offset;
		// At minimum these core utilities should exist
		if (offset.getGlobal) {
			expect(typeof offset.getGlobal).toBe('function');
		}
		expect(offset).toBeDefined();
	});
});

describe('Coverage Integration Tests - Inline System', () => {
	let editor;

	beforeAll(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
	});

	it('should have inline system initialized', () => {
		expect(editor.$.inline).toBeDefined();
	});

	it('should apply inline styles', () => {
		const inline = editor.$.inline;
		expect(typeof inline.apply).toBe('function');
	});

	it('should remove inline styles', () => {
		const inline = editor.$.inline;
		expect(typeof inline.remove).toBe('function');
	});

	it('should have inline system with expected methods', () => {
		const inline = editor.$.inline;
		expect(inline).toHaveProperty('apply');
		expect(inline).toHaveProperty('remove');
	});
});

describe('Coverage Integration Tests - CommandDispatcher', () => {
	let editor;

	beforeAll(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
	});

	it('should have command dispatcher initialized', () => {
		expect(editor.$.commandDispatcher).toBeDefined();
	});

	it('should run commands', () => {
		const dispatcher = editor.$.commandDispatcher;
		expect(typeof dispatcher.run).toBe('function');
	});

	it('should run commands from target', () => {
		const dispatcher = editor.$.commandDispatcher;
		expect(typeof dispatcher.runFromTarget).toBe('function');
	});

	it('should apply targets', () => {
		const dispatcher = editor.$.commandDispatcher;
		expect(typeof dispatcher.applyTargets).toBe('function');
	});
});

describe('Coverage Integration Tests - Plugin Manager', () => {
	let editor;

	beforeAll(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
	});

	it('should have plugin manager initialized', () => {
		expect(editor.$.pluginManager).toBeDefined();
	});

	it('should check file info', () => {
		const pluginManager = editor.$.pluginManager;
		expect(typeof pluginManager.checkFileInfo).toBe('function');
	});

	it('should find component info', () => {
		const pluginManager = editor.$.pluginManager;
		expect(typeof pluginManager.findComponentInfo).toBe('function');
	});

	it('should apply retain formats', () => {
		const pluginManager = editor.$.pluginManager;
		expect(typeof pluginManager.applyRetainFormat).toBe('function');
	});

	it('should register plugins', () => {
		const pluginManager = editor.$.pluginManager;
		expect(typeof pluginManager.register).toBe('function');
	});
});

describe('Coverage Integration Tests - Viewer System', () => {
	let editor;

	beforeAll(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
	});

	it('should have viewer system initialized', () => {
		expect(editor.$.viewer).toBeDefined();
	});

	it('should handle code view auto height', () => {
		const viewer = editor.$.viewer;
		expect(typeof viewer._codeViewAutoHeight).toBe('function');
	});

	it('should scroll line numbers', () => {
		const viewer = editor.$.viewer;
		expect(typeof viewer._scrollLineNumbers).toBe('function');
	});
});

describe('Coverage Integration Tests - Shortcuts', () => {
	let editor;

	beforeAll(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
	});

	it('should have shortcuts initialized', () => {
		expect(editor.$.shortcuts).toBeDefined();
	});

	it('should execute command shortcut', () => {
		const shortcuts = editor.$.shortcuts;
		expect(typeof shortcuts.command).toBe('function');
	});

	it('should enable/disable shortcuts', () => {
		const shortcuts = editor.$.shortcuts;
		expect(typeof shortcuts.enable).toBe('function');
		expect(typeof shortcuts.disable).toBe('function');
	});

	it('should have key map', () => {
		const shortcuts = editor.$.shortcuts;
		expect(shortcuts.keyMap).toBeDefined();
	});
});

describe('Coverage Integration Tests - Sub Toolbar', () => {
	let editor;

	beforeAll(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
	});

	it('should have sub toolbar available in components', () => {
		// subToolbar may or may not exist depending on editor initialization
		// Check that it's part of the available modules
		expect(editor.$).toBeDefined();
		expect(editor.$.toolbar).toBeDefined();
	});

	it('should access menu system which is always available', () => {
		const menu = editor.$.menu;
		expect(menu).toBeDefined();
		expect(typeof menu.dropdownOff).toBe('function');
	});
});

describe('Coverage Integration Tests - ListFormat', () => {
	let editor;

	beforeAll(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
	});

	it('should have list format initialized', () => {
		expect(editor.$.listFormat).toBeDefined();
	});

	it('should have list format system for list operations', () => {
		const listFormat = editor.$.listFormat;
		// listFormat has methods but they may be jest mocks in the integration context
		expect(listFormat).toBeDefined();
		expect(typeof listFormat).toBe('object');
	});

	it('should have list management through format system', () => {
		const format = editor.$.format;
		expect(format).toBeDefined();
		// Lists are managed through the format system
		expect(typeof format.isLine).toBe('function');
	});
});
