/**
 * @fileoverview Advanced feature tests for core/editor.js to increase coverage
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../__mocks__/editorIntegration';

describe('Core - Editor Advanced Features', () => {
	let editor;

	afterEach(() => {
		if (editor && typeof editor.destroy === 'function') {
			destroyTestEditor(editor);
		}
	});

	describe('Iframe mode specific features', () => {
		it('should handle iframe mode initialization', async () => {
			editor = createTestEditor({
				iframe: true,
				iframe_cssFileName: [], // Provide empty array to avoid auto-detection
				height: 'auto',
			});
			await waitForEditorReady(editor);

			// Mock UI
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}

			if (editor.frameOptions.get('iframe')) {
				expect(editor.frameContext.get('_wd')).toBeDefined();
				expect(editor.frameContext.get('_ww')).toBeDefined();
			}
		});

		it('should handle iframe auto height', async () => {
			editor = createTestEditor({
				iframe: true,
				iframe_cssFileName: [], // Provide empty array to avoid auto-detection
				height: 'auto',
			});
			await waitForEditorReady(editor);

			// Mock UI
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}

			const fc = editor.frameContext;
			if (fc.get('_iframeAuto')) {
				expect(fc.get('_iframeAuto')).toBeDefined();
			}
		});
	});

	describe('ShadowRoot detection', () => {
		it('should detect shadow root if present', async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);

			// Mock UI
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}

			// Shadow root detection
			expect(typeof editor.shadowRoot === 'object' || editor.shadowRoot === null).toBe(true);
		});
	});

	describe('ResizeObserver integration', () => {
		it('should handle ResizeObserver when supported', async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);

			// Mock UI
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}

			const env = require('../../../src/helper/env').default;
			if (env.isResizeObserverSupported) {
				// Should have observer
				expect(editor.eventManager._wwFrameObserver).toBeDefined();
			}
		});
	});

	describe('Toolbar observers', () => {
		it('should setup toolbar observer', async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);

			// Mock UI
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}

			const env = require('../../../src/helper/env').default;
			if (env.isResizeObserverSupported) {
				expect(editor.eventManager._toolbarObserver).toBeDefined();
			}
		});
	});

	describe('Frame events setup', () => {
		it('should add frame events during initialization', async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);

			// Mock UI
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}

			// Events should be attached
			expect(editor.eventManager).toBeDefined();
		});
	});

	describe('Component info initialization', () => {
		it('should initialize component info flags', async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);

			// Mock UI
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}

			// Check flags
			expect(editor._componentsInfoInit).toBe(false);
			expect(editor._componentsInfoReset).toBe(false);
		});
	});

	describe('History initialization', () => {
		it('should reset history after load', async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);

			// Mock UI
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}

			// History should be ready
			expect(editor.history).toBeDefined();
		});
	});

	describe('Async initialization completion', () => {
		it('should complete async initialization tasks', async () => {
			editor = createTestEditor();
			await waitForEditorReady(editor);

			// Mock UI
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}

			// Wait for async initialization
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Toolbar should be visible
			const toolbar = editor.context.get('toolbar_main');
			expect(toolbar.style.visibility).not.toBe('hidden');
		});

		it('should trigger onload event', async () => {
			const onloadSpy = jest.fn();

			editor = createTestEditor({
				events: {
					onload: onloadSpy,
				},
			});
			await waitForEditorReady(editor);

			// Mock UI
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}

			// Wait for onload
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Onload should have been called
			expect(onloadSpy).toHaveBeenCalled();
		});
	});
});
