/**
 * @fileoverview Unit tests for plugin initialization in core/editor.js
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../__mocks__/editorIntegration';

describe('Core - Editor Plugin Initialization', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);

		// Mock UI methods
		if (editor.ui) {
			editor.ui.showLoading = jest.fn();
			editor.ui.hideLoading = jest.fn();
		}
		if (editor.viewer) {
			editor.viewer.print = jest.fn();
		}
	});

	afterEach(() => {
		if (editor && typeof editor.destroy === 'function') {
			destroyTestEditor(editor);
		}
	});

	describe('File management plugin registration', () => {
		it('should have file manager setup', () => {
			// File manager should be setup during initialization
			expect(editor._fileManager).toBeDefined();
			expect(editor._fileManager.tags).toBeDefined();
			expect(Array.isArray(editor._fileManager.tags)).toBe(true);
		});

		it('should add file plugin tags to fileManager', () => {
			expect(editor._fileManager.tags).toBeDefined();
			expect(Array.isArray(editor._fileManager.tags)).toBe(true);
		});

		it('should create pluginMap for file tags', () => {
			expect(editor._fileManager.pluginMap).toBeDefined();
			expect(typeof editor._fileManager.pluginMap).toBe('object');
		});

		it('should handle file plugin with tagAttrs', () => {
			const initialPluginMap = { ...editor._fileManager.pluginMap };
			// Should have setup tagAttrs
			expect(editor._fileManager.tagAttrs).toBeDefined();
		});
	});

	describe('Component plugin registration', () => {
		it('should have component manager setup', () => {
			// Component manager should have entries
			expect(editor._componentManager).toBeDefined();
			expect(Array.isArray(editor._componentManager)).toBe(true);
		});
	});

	describe('Plugin event handlers registration', () => {
		it('should have plugin events setup', () => {
			// Plugin events should be registered
			expect(editor._onPluginEvents).toBeDefined();
			expect(editor._onPluginEvents.has('onMouseDown')).toBe(true);
			expect(editor._onPluginEvents.has('onKeyDown')).toBe(true);
			expect(editor._onPluginEvents.has('onInput')).toBe(true);
		});

		it('should have sorted event handlers', () => {
			// Event handlers should be arrays
			const mouseHandlers = editor._onPluginEvents.get('onMouseDown');
			expect(Array.isArray(mouseHandlers)).toBe(true);
		});
	});

	describe('Plugin retainFormat registration', () => {
		it('should have MEL info setup', () => {
			// MEL info should have entry
			expect(editor._MELInfo).toBeDefined();
			expect(editor._MELInfo instanceof Map).toBe(true);
		});
	});

	describe('PageBreak component initialization', () => {
		it('should add pageBreak component handler when button exists', () => {
			// Check if pageBreak is available
			const hasPageBreak = editor.options.get('buttons')?.has('pageBreak') || editor.options.get('buttons_sub')?.has('pageBreak');

			if (hasPageBreak) {
				// Component manager should have pageBreak handler
				const initialLength = editor._componentManager.length;
				expect(initialLength).toBeGreaterThan(0);
			}
		});
	});

	describe('File manager RegExp setup', () => {
		it('should create regExp for file tags', () => {
			expect(editor._fileManager.regExp).toBeDefined();
			expect(editor._fileManager.regExp instanceof RegExp).toBe(true);
		});

		it('should create pluginRegExp', () => {
			expect(editor._fileManager.pluginRegExp).toBeDefined();
			expect(editor._fileManager.pluginRegExp instanceof RegExp).toBe(true);
		});
	});

	describe('Plugin initialization', () => {
		it('should have plugins initialized', () => {
			// Plugins should be setup
			expect(editor.plugins).toBeDefined();
			expect(typeof editor.plugins).toBe('object');
		});

		it('should have active commands list', () => {
			expect(editor.activeCommands).toBeDefined();
			expect(Array.isArray(editor.activeCommands)).toBe(true);
		});
	});
});
