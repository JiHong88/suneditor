/**
 * @fileoverview Unit tests for ruleHelpers
 */

import { hardDelete, cleanRemovedTags, isUneditableNode, setDefaultLine } from '../../../../../src/core/event/effects/ruleHelpers';
import { dom } from '../../../../../src/helper';

describe('Rule Helpers', () => {
	let mockPorts;

	beforeEach(() => {
		mockPorts = {
			selection: {
				getRange: jest.fn(() => document.createRange())
			},
			format: {
				getBlock: jest.fn(),
				getLine: jest.fn()
			},
			component: {
				is: jest.fn()
			},
			editor: {
				_nativeFocus: jest.fn()
			},
			nodeTransform: {
				removeAllParents: jest.fn()
			},
			setDefaultLine: jest.fn()
		};
	});

	describe('hardDelete', () => {
		it('should return false when no special deletion needed', () => {
			const range = document.createRange();
			const textNode = document.createTextNode('text');
			range.setStart(textNode, 0);
			range.setEnd(textNode, 4);

			mockPorts.selection.getRange.mockReturnValue(range);
			mockPorts.format.getBlock.mockReturnValue(null);

			const result = hardDelete(mockPorts);
			expect(result).toBe(false);
		});

		it('should delete table when cells are at edges', () => {
			const range = document.createRange();
			const sCell = document.createElement('td');
			const eCell = document.createElement('td');
			const sRow = document.createElement('tr');
			const eRow = document.createElement('tr');
			const table = document.createElement('table');
			const tbody = document.createElement('tbody');

			// Setup: first cell of first row, last cell of last row
			sRow.appendChild(sCell);
			eRow.appendChild(eCell);
			tbody.appendChild(sRow);
			tbody.appendChild(eRow);
			table.appendChild(tbody);
			document.body.appendChild(table);

			range.setStart(sCell, 0);
			range.setEnd(eCell, 0);

			mockPorts.selection.getRange.mockReturnValue(range);
			mockPorts.format.getBlock.mockReturnValueOnce(sCell).mockReturnValueOnce(eCell);

			const result = hardDelete(mockPorts);

			// Should have called _nativeFocus
			expect(mockPorts.editor._nativeFocus).toHaveBeenCalled();
			expect(result).toBe(true);

			// Cleanup
			document.body.removeChild(table);
		});

		it('should remove component elements', () => {
			const range = document.createRange();
			const sComp = document.createElement('div');
			sComp.className = 'se-component';
			const eComp = document.createElement('div');
			eComp.className = 'se-component';

			document.body.appendChild(sComp);
			document.body.appendChild(eComp);

			range.setStart(sComp, 0);
			range.setEnd(eComp, 0);

			mockPorts.selection.getRange.mockReturnValue(range);
			mockPorts.format.getBlock.mockReturnValue(null);

			const result = hardDelete(mockPorts);

			expect(result).toBe(false);
			expect(document.body.contains(sComp)).toBe(false);
			expect(document.body.contains(eComp)).toBe(false);
		});
	});

	describe('cleanRemovedTags', () => {
		it('should return true and clean when node is outside formatEl', () => {
			const formatEl = document.createElement('p');
			const startCon = document.createTextNode('text');
			const parent = document.createElement('span');

			parent.appendChild(startCon);
			document.body.appendChild(formatEl);
			document.body.appendChild(parent);

			const result = cleanRemovedTags(mockPorts, startCon, formatEl);

			expect(result).toBe(true);
			expect(mockPorts.nodeTransform.removeAllParents).toHaveBeenCalled();

			// Cleanup
			document.body.removeChild(formatEl);
			document.body.removeChild(parent);
		});

		it('should add BR if no siblings exist', () => {
			const formatEl = document.createElement('p');
			const startCon = document.createTextNode('text');
			const parent = document.createElement('span');
			const container = document.createElement('div');

			parent.appendChild(startCon);
			container.appendChild(parent); // parent has no siblings now
			document.body.appendChild(formatEl);
			document.body.appendChild(container);

			cleanRemovedTags(mockPorts, startCon, formatEl);

			expect(formatEl.querySelector('br')).toBeTruthy();

			// Cleanup
			document.body.removeChild(formatEl);
			document.body.removeChild(container);
		});

		it('should return undefined when node is inside formatEl', () => {
			const formatEl = document.createElement('p');
			const startCon = document.createTextNode('text');
			const parent = document.createElement('span');
			const sibling = document.createElement('span'); // Add sibling to stop loop

			parent.appendChild(startCon);
			formatEl.appendChild(sibling); // Add sibling first
			formatEl.appendChild(parent);
			document.body.appendChild(formatEl);

			const result = cleanRemovedTags(mockPorts, startCon, formatEl);

			expect(result).toBeUndefined();

			// Cleanup
			document.body.removeChild(formatEl);
		});
	});

	describe('isUneditableNode', () => {
		it('should return null for editable element', () => {
			const range = document.createRange();
			const textNode = document.createTextNode('text');
			const p = document.createElement('p');

			p.appendChild(textNode);
			range.setStart(textNode, 0);

			mockPorts.format.getLine.mockReturnValue(null);

			const result = isUneditableNode(mockPorts, range, true);
			expect(result).toBeNull();
		});

		it('should return component node when at edge', () => {
			const range = document.createRange();
			const textNode = document.createTextNode('');
			const p = document.createElement('p');
			const componentDiv = document.createElement('div');
			componentDiv.className = 'se-component';

			p.appendChild(textNode);
			p.appendChild(componentDiv);
			document.body.appendChild(p);

			range.setStart(textNode, 0);

			mockPorts.format.getLine.mockReturnValue(null);
			mockPorts.component.is.mockReturnValue(true);

			// Mock dom.check methods
			const originalIsComponentContainer = dom.check.isComponentContainer;
			const originalIsNonEditable = dom.check.isNonEditable;
			const originalIsEdgePoint = dom.check.isEdgePoint;

			dom.check.isComponentContainer = jest.fn().mockReturnValue(true);
			dom.check.isNonEditable = jest.fn().mockReturnValue(false);
			dom.check.isEdgePoint = jest.fn().mockReturnValue(true);

			const result = isUneditableNode(mockPorts, range, false);

			expect(result).toBeTruthy();

			// Restore
			dom.check.isComponentContainer = originalIsComponentContainer;
			dom.check.isNonEditable = originalIsNonEditable;
			dom.check.isEdgePoint = originalIsEdgePoint;

			// Cleanup
			document.body.removeChild(p);
		});

		it('should check previousSibling when isFront is true', () => {
			const range = document.createRange();
			const textNode = document.createTextNode('text');
			const p = document.createElement('p');

			p.appendChild(textNode);
			range.setStart(textNode, 0);

			mockPorts.format.getLine.mockReturnValue(null);

			const result = isUneditableNode(mockPorts, range, true);
			expect(result).toBeNull();
		});

		it('should check nextSibling when isFront is false', () => {
			const range = document.createRange();
			const textNode = document.createTextNode('text');
			const p = document.createElement('p');

			p.appendChild(textNode);
			range.setStart(textNode, textNode.length);

			mockPorts.format.getLine.mockReturnValue(null);

			const result = isUneditableNode(mockPorts, range, false);
			expect(result).toBeNull();
		});

		it('should handle element container (nodeType === 1)', () => {
			const range = document.createRange();
			const div = document.createElement('div');
			const span = document.createElement('span');

			div.appendChild(span);
			range.setStart(div, 0);

			mockPorts.format.getLine.mockReturnValue(null);

			const result = isUneditableNode(mockPorts, range, true);
			expect(result).toBeNull();
		});

		it('should check chidren null', () => {
			const range = document.createRange();
			const div = document.createElement('div');

			range.setStart(div, 0);

			mockPorts.format.getLine.mockReturnValue(null);

			const result = isUneditableNode(mockPorts, range, true);
			expect(result).toBeNull();
		});
	});

	describe('setDefaultLine', () => {
		it('should call ports.setDefaultLine', () => {
			mockPorts.setDefaultLine.mockReturnValue(null);

			const result = setDefaultLine(mockPorts, 'P');

			expect(mockPorts.setDefaultLine).toHaveBeenCalledWith('P');
			expect(result).toBeNull();
		});

		it('should pass through return value', () => {
			const mockElement = document.createElement('p');
			mockPorts.setDefaultLine.mockReturnValue(mockElement);

			const result = setDefaultLine(mockPorts, 'DIV');

			expect(result).toBe(mockElement);
		});

		it('should handle different tag names', () => {
			setDefaultLine(mockPorts, 'H1');
			expect(mockPorts.setDefaultLine).toHaveBeenCalledWith('H1');

			setDefaultLine(mockPorts, 'DIV');
			expect(mockPorts.setDefaultLine).toHaveBeenCalledWith('DIV');
		});
	});

	describe('Edge cases', () => {
		it('hardDelete should handle null range containers', () => {
			const range = document.createRange();
			mockPorts.selection.getRange.mockReturnValue(range);
			mockPorts.format.getBlock.mockReturnValue(null);

			const result = hardDelete(mockPorts);
			expect(result).toBe(false);
		});

		it('isUneditableNode should handle missing siblings', () => {
			const range = document.createRange();
			const textNode = document.createTextNode('text');
			const p = document.createElement('p');

			p.appendChild(textNode);
			range.setStart(textNode, 0);

			mockPorts.format.getLine.mockReturnValue(null);

			const result = isUneditableNode(mockPorts, range, true);
			expect(result).toBeNull();
		});

		it('cleanRemovedTags should handle formatEl with existing next sibling', () => {
			const formatEl = document.createElement('p');
			const next = document.createElement('p');
			const startCon = document.createTextNode('text');
			const parent = document.createElement('span');

			parent.appendChild(startCon);
			document.body.appendChild(formatEl);
			document.body.appendChild(next);
			document.body.appendChild(parent);

			formatEl.appendChild(next);

			cleanRemovedTags(mockPorts, startCon, formatEl);

			// Should not add BR since next exists
			expect(parent.previousSibling).toBeTruthy();

			// Cleanup
			document.body.removeChild(formatEl);
			document.body.removeChild(parent);
		});
	});
});
