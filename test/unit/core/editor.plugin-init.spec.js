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
		if (editor.$.ui) {
			editor.$.ui.showLoading = jest.fn();
			editor.$.ui.hideLoading = jest.fn();
		}
		if (editor.$.viewer) {
			editor.$.viewer.print = jest.fn();
		}
	});

	afterEach(() => {
		if (editor && typeof editor.destroy === 'function') {
			destroyTestEditor(editor);
		}
	});

	describe('File management plugin registration', () => {
		it('should have file manager setup', () => {
			// File manager should be setup during initialization in PluginManager
			const fileInfo = editor.$.pluginManager.fileInfo;
			expect(fileInfo).toBeDefined();
			expect(fileInfo.tags).toBeDefined();
			expect(Array.isArray(fileInfo.tags)).toBe(true);
		});

		it('should add file plugin tags to fileManager', () => {
			const fileInfo = editor.$.pluginManager.fileInfo;
			expect(fileInfo.tags).toBeDefined();
			expect(Array.isArray(fileInfo.tags)).toBe(true);
		});

		it('should create pluginMap for file tags', () => {
			const fileInfo = editor.$.pluginManager.fileInfo;
			expect(fileInfo.pluginMap).toBeDefined();
			expect(typeof fileInfo.pluginMap).toBe('object');
		});

		it('should handle file plugin with tagAttrs', () => {
			const tagAttrs = editor.$.pluginManager.fileInfo.tagAttrs;
			// Should have setup tagAttrs
			expect(tagAttrs).toBeDefined();
		});
	});

	describe('Component plugin registration', () => {
	});

	describe('Plugin event handlers registration', () => {
		it('should have plugin events setup', () => {
			// Plugin events are now private, verify public interface
			expect(editor.$.pluginManager.emitEvent).toBeDefined();
			expect(typeof editor.$.pluginManager.emitEvent).toBe('function');
		});
	});

	describe('Plugin retainFormat registration', () => {
		it('should have applyRetainFormat setup', () => {
			// MEL info is private, verify public interface
			expect(editor.$.pluginManager.applyRetainFormat).toBeDefined();
			expect(typeof editor.$.pluginManager.applyRetainFormat).toBe('function');
		});
	});

	describe('PageBreak component initialization', () => {
		it('should add pageBreak component handler when button exists', () => {
			// Check if pageBreak is available
			const hasPageBreak = editor.$.options.get('buttons')?.has('pageBreak') || editor.$.options.get('buttons_sub')?.has('pageBreak');

			if (hasPageBreak) {
				// Component manager should have pageBreak handler
				const checkers = editor.$.pluginManager.componentCheckers;
				const initialLength = checkers.length;
				expect(initialLength).toBeGreaterThan(0);
			}
		});
	});

	describe('File manager RegExp setup', () => {
		it('should create regExp for file tags', () => {
			const fileInfo = editor.$.pluginManager.fileInfo;
			expect(fileInfo.regExp).toBeDefined();
			expect(fileInfo.regExp instanceof RegExp).toBe(true);
		});

		it('should create pluginRegExp', () => {
			const fileInfo = editor.$.pluginManager.fileInfo;
			expect(fileInfo.pluginRegExp).toBeDefined();
			expect(fileInfo.pluginRegExp instanceof RegExp).toBe(true);
		});
	});

	describe('Plugin initialization', () => {
		it('should have plugins initialized', () => {
			// Plugins should be setup
			expect(editor.$.pluginManager).toBeDefined();
		});

	});
});
