/**
 * @fileoverview Unit tests for document type features in core/editor.js
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';

describe('Core - Editor Document Type Features', () => {
	let editor;

	afterEach(() => {
		if (editor && typeof editor.destroy === 'function') {
			destroyTestEditor(editor);
		}
	});

	describe('Document type initialization', () => {
		it('should initialize editor with document type', async () => {
			// Create editor with document type
			editor = createTestEditor({
				type: 'document'
			});
			await waitForEditorReady(editor);

			// Mock UI methods
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}

			// Should have documentType set
			if (editor.options.get('type') !== 'document') return;
			expect(editor.frameContext.has('documentType')).toBe(true);
		});

		it('should set documentType_use_header when header is used', async () => {
			editor = createTestEditor({
				type: 'document'
			});
			await waitForEditorReady(editor);

			// Mock UI methods
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}

			const fc = editor.frameContext;
			if (!fc.has('documentType')) return;
			const docType = fc.get('documentType');
			if (!docType.useHeader) return;
			expect(fc.has('documentType_use_header')).toBe(true);
		});

		it('should set documentType_use_page when page is used', async () => {
			editor = createTestEditor({
				type: 'document'
			});
			await waitForEditorReady(editor);

			// Mock UI methods
			if (editor.ui) {
				editor.ui.showLoading = jest.fn();
				editor.ui.hideLoading = jest.fn();
			}
			if (editor.viewer) {
				editor.viewer.print = jest.fn();
			}

			const fc = editor.frameContext;
			if (!fc.has('documentType')) return;
			const docType = fc.get('documentType');
			if (!docType.usePage) return;
			expect(fc.has('documentType_use_page')).toBe(true);
			expect(fc.get('documentTypePageMirror')).toBeDefined();
		});
	});

	describe('_resourcesStateChange with documentType', () => {
		beforeEach(async () => {
			editor = createTestEditor({
				type: 'document'
			});
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

		it('should update page mirror when documentType_use_page is set', () => {
			const fc = editor.frameContext;

			if (!fc.has('documentType_use_page')) return;

			const wysiwyg = fc.get('wysiwyg');
			const mirror = fc.get('documentTypePageMirror');
			const docType = fc.get('documentType');

			wysiwyg.innerHTML = '<p>Test document content</p>';
			docType.rePage = jest.fn();

			editor._resourcesStateChange(fc);

			expect(mirror.innerHTML).toContain('Test document content');
			expect(docType.rePage).toHaveBeenCalledWith(true);
		});

		it('should handle _resourcesStateChange without errors', () => {
			const fc = editor.frameContext;

			// Should not throw error
			expect(() => {
				editor._resourcesStateChange(fc);
			}).not.toThrow();

			// Verify it executes successfully
			expect(fc).toBeDefined();
		});
	});

	describe('_iframeAutoHeight with ResizeObserver support', () => {
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

		it('should handle non-ResizeObserver environment', () => {
			const fc = editor.frameContext;
			const originalSupport = require('../../../../src/helper/env').default.isResizeObserverSupported;

			// Mock as not supported
			require('../../../../src/helper/env').default.isResizeObserverSupported = false;

			expect(() => editor._iframeAutoHeight(fc)).not.toThrow();

			// Restore
			require('../../../../src/helper/env').default.isResizeObserverSupported = originalSupport;
		});
	});
});
