/**
 * @fileoverview Integration tests for component lifecycle (component.js)
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';
import { image } from '../../src/plugins';
import Controller from '../../src/modules/contract/Controller';

describe('Component Lifecycle', () => {
	let editor;

	beforeEach(async () => {
		editor = createTestEditor({
			plugins: { image },
			buttonList: [['image']],
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('is()', () => {
		it('should return true for FIGURE elements', () => {
			const figure = document.createElement('figure');
			expect(editor.$.component.is(figure)).toBe(true);
		});

		it('should return false for null', () => {
			expect(editor.$.component.is(null)).toBe(false);
		});

		it('should return false for regular elements', () => {
			const p = document.createElement('p');
			expect(editor.$.component.is(p)).toBe(false);
		});

		it('should return true for component containers', () => {
			const div = document.createElement('div');
			div.className = 'se-component';
			expect(editor.$.component.is(div)).toBe(true);
		});
	});

	describe('isInline()', () => {
		it('should return false for null', () => {
			expect(editor.$.component.isInline(null)).toBe(false);
		});

		it('should return true for inline component containers', () => {
			const div = document.createElement('div');
			div.className = 'se-inline-component';
			expect(editor.$.component.isInline(div)).toBe(true);
		});

		it('should return false for regular elements', () => {
			const p = document.createElement('p');
			expect(editor.$.component.isInline(p)).toBe(false);
		});
	});

	describe('isBasic()', () => {
		it('should return true for non-inline components', () => {
			const div = document.createElement('div');
			div.className = 'se-component';
			expect(editor.$.component.isBasic(div)).toBe(true);
		});

		it('should return false for inline components', () => {
			const div = document.createElement('div');
			div.className = 'se-component se-inline-component';
			expect(editor.$.component.isInline(div)).toBe(true);
		});
	});

	describe('get()', () => {
		it('should return null for null element', () => {
			expect(editor.$.component.get(null)).toBeNull();
		});

		it('should return null for non-component element', () => {
			const p = document.createElement('p');
			expect(editor.$.component.get(p)).toBeNull();
		});
	});

	describe('insert()', () => {
		it('should return null in read-only mode', () => {
			editor.$.frameContext.set('isReadOnly', true);
			const element = document.createElement('div');

			const result = editor.$.component.insert(element);

			expect(result).toBeNull();
			editor.$.frameContext.set('isReadOnly', false);
		});

		it('should return null when char check fails', () => {
			jest.spyOn(editor.$.char, 'check').mockReturnValue(false);
			const element = document.createElement('div');

			const result = editor.$.component.insert(element);

			expect(result).toBeNull();
			editor.$.char.check.mockRestore();
		});

		it.each([
			['line', '<ol><li>a</li><li>bc</li></ol>', 'bc', 1],
			['line', '<ol><li>a</li><li>bc</li></ol>', 'bc', 2],
			['line', '<ol><li>bc<ol><li>x</li></ol></li></ol>', 'bc', 2],
			['line', '<ol><li>b<strong>c</strong></li></ol>', 'b', 1],
			['auto', '<ol><li>a</li><li>bc</li></ol>', 'bc', 1],
		])('keeps a component inserted in a list cell in that cell (%s): %s', (behavior, html, text, offset) => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			editor.$.html.set(html);
			const walker = document.createTreeWalker(wysiwyg, NodeFilter.SHOW_TEXT);
			let node;
			while ((node = walker.nextNode()) && node.nodeValue !== text);
			const cell = node.parentNode.closest('li');
			editor.$.selection.setRange(node, offset, node, offset);

			const hr = document.createElement('hr');
			editor.$.component.insert(hr, { insertBehavior: behavior });

			expect(hr.parentNode).toBe(cell);
			expect(wysiwyg.querySelector('li > li')).toBeNull();
			expect(cell.contains(editor.$.selection.getRange().startContainer)).toBe(true);
		});
	});

	describe('deselect()', () => {
		it('should reset selection state', () => {
			editor.$.component.isSelected = true;
			editor.$.component.currentTarget = document.createElement('div');
			editor.$.component.currentPlugin = {};
			editor.$.component.currentPluginName = 'test';

			editor.$.component.__deselect();

			expect(editor.$.component.isSelected).toBe(false);
			expect(editor.$.component.currentTarget).toBeNull();
			expect(editor.$.component.currentPlugin).toBeNull();
			expect(editor.$.component.currentPluginName).toBe('');
		});

		it('should close an open selection UI controller through its own close()', async () => {
			const host = { controllerClose: jest.fn() };
			const form = document.createElement('div');
			form.innerHTML = '<div class="se-arrow"></div>';
			const controller = new Controller(host, editor.$, form, { selection: true }, 'testSelectionUI');
			const target = document.createElement('div');
			editor.$.frameContext.get('wysiwyg').appendChild(target);

			controller.open(target);
			await Promise.resolve();
			expect(controller.isOpen).toBe(true);

			editor.$.component.isSelected = true;
			editor.$.component.deselect();

			expect(controller.isOpen).toBe(false);
			expect(host.controllerClose).toHaveBeenCalledTimes(1);
			expect(editor.$.ui.opendControllers.some((c) => c.inst === controller)).toBe(false);

			// let the deferred `controlActive` resets run before the editor is destroyed
			await new Promise((r) => setTimeout(r, 0));
		});
	});

	describe('select() / deselect() state lifecycle', () => {
		it('should have initial isSelected as false', () => {
			expect(editor.$.component.isSelected).toBe(false);
		});

		it('should have initial currentTarget as null', () => {
			expect(editor.$.component.currentTarget).toBeNull();
		});
	});
});
