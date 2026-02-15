import Link from '../../../../src/plugins/modal/link';
import { createMockEditor } from '../../../../test/__mocks__/editorMock.js';

// Mock dependencies

jest.mock('../../../../src/modules/contract', () => ({
	Modal: jest.fn().mockImplementation(() => ({
		open: jest.fn(),
		close: jest.fn()
	})),
	Controller: jest.fn().mockImplementation(() => ({
		open: jest.fn(),
		close: jest.fn(),
		currentTarget: null,
		form: {
			querySelector: jest.fn().mockReturnValue({
				href: '',
				textContent: '',
				title: '',
				target: ''
			})
		}
	}))
}));

jest.mock('../../../../src/modules/ui', () => ({
	ModalAnchorEditor: jest.fn().mockImplementation(() => ({
		on: jest.fn(),
		set: jest.fn(),
		init: jest.fn(),
		create: jest.fn().mockReturnValue({
			tagName: 'A',
			href: 'http://test.com',
			textContent: 'Test Link',
			childNodes: [{ textContent: 'Test Link' }]
		})
	}))
}));

jest.mock('../../../../src/helper', () => ({
	dom: {
		check: {
			isAnchor: jest.fn().mockReturnValue(false)
		},
		utils: {
			createElement: jest.fn().mockImplementation((tag, attrs, html) => {
				const el = {
					tagName: tag,
					className: attrs?.class || '',
					innerHTML: html || '',
					querySelector: jest.fn().mockReturnValue({
						href: '',
						textContent: '',
						title: '',
						target: ''
					})
				};
				return el;
			}),
			addClass: jest.fn(),
			removeClass: jest.fn(),
			removeItem: jest.fn()
		},
		query: {
			getEdgeChild: jest.fn().mockReturnValue({ textContent: 'link text' })
		}
	},
	numbers: {
		get: jest.fn((val, def) => val || def)
	},
	env: {
		isTouchDevice: false,
		_w: global.window || {},
		ON_OVER_COMPONENT: 'data-se-on-over-component'
	}
}));

describe('Link Plugin', () => {
	let kernel;
	let link;

	beforeEach(() => {
		jest.clearAllMocks();

		kernel = createMockEditor();

		link = new Link(kernel, {});
	});


	describe('Constructor', () => {

		it('should initialize with upload options', async () => {
			const linkWithUpload = new Link(kernel, {
				uploadUrl: 'http://example.com/upload',
				uploadHeaders: { 'X-Custom': 'header' },
				uploadSizeLimit: 5000000,
				uploadSingleSizeLimit: 1000000,
				acceptedFormats: '.pdf,.doc'
			});

			expect(linkWithUpload.pluginOptions.uploadUrl).toBe('http://example.com/upload');
			expect(linkWithUpload.pluginOptions.enableFileUpload).toBe(true);
			expect(linkWithUpload.pluginOptions.uploadHeaders).toEqual({ 'X-Custom': 'header' });
		});

		it('should handle missing upload options', async () => {
			const linkNoUpload = new Link(kernel, {});
			expect(linkNoUpload.pluginOptions.uploadUrl).toBeNull();
			expect(linkNoUpload.pluginOptions.enableFileUpload).toBe(false);
		});

		it('should initialize modules', async () => {
			expect(link.modal).toBeDefined();
			expect(link.controller).toBeDefined();
			expect(link.anchor).toBeDefined();
		});
	});

	describe('active method', () => {
		it('should return false for non-anchor elements', async () => {
			const { dom } = require('../../../../src/helper');
			dom.check.isAnchor.mockReturnValue(false);

			const mockElement = document.createElement('p');
			const result = link.active(mockElement);

			expect(result).toBe(false);
			expect(link.controller.close).toHaveBeenCalled();
		});

		it('should return false for anchor with data-se-non-link attribute', async () => {
			const { dom } = require('../../../../src/helper');
			dom.check.isAnchor.mockReturnValue(true);

			const mockElement = {
				tagName: 'A',
				hasAttribute: jest.fn().mockReturnValue(true),
				getAttribute: jest.fn().mockReturnValue('data-se-non-link')
			};

			const result = link.active(mockElement);

			expect(result).toBe(false);
		});

		it('should activate controller for valid link', async () => {
			const { dom } = require('../../../../src/helper');
			dom.check.isAnchor.mockReturnValue(true);

			const mockElement = {
				tagName: 'A',
				hasAttribute: jest.fn().mockImplementation(attr => attr !== 'data-se-non-link'),
				getAttribute: jest.fn().mockReturnValue('http://test.com'),
				textContent: 'Test Link',
				target: '_blank'
			};

			const result = link.active(mockElement);

			expect(result).toBe(true);
			expect(dom.utils.addClass).toHaveBeenCalledWith(mockElement, 'on');
			expect(link.anchor.set).toHaveBeenCalledWith(mockElement);
			expect(link.controller.open).toHaveBeenCalled();
			expect(link.target).toBe(mockElement);
		});

		it('should handle anchor link with hash', async () => {
			const { dom } = require('../../../../src/helper');
			dom.check.isAnchor.mockReturnValue(true);

			const mockElement = {
				tagName: 'A',
				hasAttribute: jest.fn().mockImplementation(attr => attr !== 'data-se-non-link'),
				getAttribute: jest.fn().mockReturnValue('#section-1'),
				textContent: 'Section 1',
				target: ''
			};

			link.active(mockElement);

			// Should keep original target for hash links
			expect(link.target).toBe(mockElement);
		});
	});

	describe('open method', () => {
		it('should open modal', async () => {
			link.open();

			expect(link.modal.open).toHaveBeenCalled();
		});
	});

	describe('on method', () => {
		it('should set update state and call anchor.on', async () => {
			link.modalOn(true);

			expect(link.isUpdateState).toBe(true);
			expect(link.anchor.on).toHaveBeenCalledWith(true);
		});

		it('should handle non-update state', async () => {
			link.modalOn(false);

			expect(link.isUpdateState).toBe(false);
			expect(link.anchor.on).toHaveBeenCalledWith(false);
		});
	});

	describe('modalAction method', () => {
		it('should return false if anchor creation fails', async () => {
			link.anchor.create = jest.fn().mockReturnValue(null);

			const result = await await link.modalAction();

			expect(result).toBe(false);
		});

		it('should insert new link for non-update state', async () => {
			link.isUpdateState = false;
			const mockAnchor = {
				tagName: 'A',
				href: 'http://test.com',
				textContent: 'Test',
				childNodes: [{ textContent: 'Test' }]
			};
			link.anchor.create = jest.fn().mockReturnValue(mockAnchor);
			kernel.$.html.insertNode.mockReturnValue(true);
			kernel.$.format.getLines.mockReturnValue([{ nodeName: 'P' }]);

			const result = await await link.modalAction();

			expect(result).toBe(true);
			expect(kernel.$.html.insertNode).toHaveBeenCalled();
			expect(kernel.$.selection.setRange).toHaveBeenCalled();
			expect(kernel.$.history.push).toHaveBeenCalledWith(false);
		});

		it('should handle multiple selected lines', async () => {
			link.isUpdateState = false;
			kernel.$.format.getLines.mockReturnValue([
				{ nodeName: 'P' },
				{ nodeName: 'P' }
			]);

			const mockAnchor = {
				tagName: 'A',
				textContent: 'Test',
				childNodes: [{ textContent: 'Test' }]
			};
			link.anchor.create = jest.fn().mockReturnValue(mockAnchor);

			await link.modalAction();

			expect(kernel.$.html.insertNode).toHaveBeenCalled();
		});

		it('should update existing link', async () => {
			link.isUpdateState = true;
			link.controller.currentTarget = {
				childNodes: [{ textContent: 'Old Link' }]
			};

			const mockAnchor = {
				tagName: 'A',
				textContent: 'New Link',
				childNodes: [{ textContent: 'New Link' }]
			};
			link.anchor.create = jest.fn().mockReturnValue(mockAnchor);

			const result = await await link.modalAction();

			expect(result).toBe(true);
			expect(kernel.$.selection.setRange).toHaveBeenCalled();
			expect(kernel.$.history.push).toHaveBeenCalledWith(false);
		});

		it('should return true if insertNode fails', async () => {
			link.isUpdateState = false;
			kernel.$.html.insertNode.mockReturnValue(false);

			const mockAnchor = {
				tagName: 'A',
				textContent: 'Test',
				childNodes: [{ textContent: 'Test' }]
			};
			link.anchor.create = jest.fn().mockReturnValue(mockAnchor);

			const result = await await link.modalAction();

			expect(result).toBe(true);
		});
	});

	describe('init method', () => {
		it('should close controller and init anchor', async () => {
			link.modalInit();

			expect(link.controller.close).toHaveBeenCalled();
			expect(link.anchor.init).toHaveBeenCalled();
		});
	});

	describe('controllerAction method', () => {
		let mockTarget;

		beforeEach(() => {
			mockTarget = {
				getAttribute: jest.fn()
			};
			link.target = document.createElement('a');
			link.controller.currentTarget = document.createElement('a');
		});

		it('should copy link', async () => {
			mockTarget.getAttribute.mockReturnValue('copy');

			link.controllerAction(mockTarget);

			expect(kernel.$.html.copy).toHaveBeenCalledWith(link.target);
		});

		it('should open modal for update', async () => {
			mockTarget.getAttribute.mockReturnValue('update');

			link.controllerAction(mockTarget);

			expect(link.modal.open).toHaveBeenCalled();
		});

		it('should unlink the link', async () => {
			mockTarget.getAttribute.mockReturnValue('unlink');

			link.controllerAction(mockTarget);

			expect(kernel.$.selection.setRange).toHaveBeenCalled();
			expect(kernel.$.inline.apply).toHaveBeenCalledWith(
				null,
				{ stylesToModify: null, nodesToRemove: ['A'], strictRemove: false }
			);
		});

		it('should delete the link', async () => {
			mockTarget.getAttribute.mockReturnValue('delete');
			const { dom } = require('../../../../src/helper');

			// Capture the currentTarget before it gets set to null
			const targetBeforeDeletion = link.controller.currentTarget;

			link.controllerAction(mockTarget);

			expect(dom.utils.removeItem).toHaveBeenCalledWith(targetBeforeDeletion);
			expect(link.controller.currentTarget).toBeNull();
			expect(kernel.$.focusManager.focus).toHaveBeenCalled();
			expect(kernel.$.history.push).toHaveBeenCalledWith(false);
		});
	});


	describe('Integration scenarios', () => {
		it('should handle complete link creation flow', async () => {
			// Open modal
			link.open();
			expect(link.modal.open).toHaveBeenCalled();

			// Set non-update state
			link.modalOn(false);
			expect(link.isUpdateState).toBe(false);

			// Setup mocks for modalAction
			const mockAnchor = {
				tagName: 'A',
				href: 'http://test.com',
				textContent: 'Test',
				childNodes: [{ textContent: 'Test' }]
			};
			link.anchor.create = jest.fn().mockReturnValue(mockAnchor);
			kernel.$.html.insertNode.mockReturnValue(true);
			kernel.$.format.getLines.mockReturnValue([{ nodeName: 'P' }]);

			// Submit modal
			const result = await await link.modalAction();
			expect(result).toBe(true);
			expect(kernel.$.history.push).toHaveBeenCalled();

			// Close/init
			link.modalInit();
			expect(link.controller.close).toHaveBeenCalled();
		});

		it('should handle complete link update flow', async () => {
			const { dom } = require('../../../../src/helper');
			dom.check.isAnchor.mockReturnValue(true);

			// Activate existing link
			const mockElement = {
				tagName: 'A',
				hasAttribute: jest.fn().mockImplementation(attr => attr !== 'data-se-non-link'),
				getAttribute: jest.fn().mockReturnValue('http://old.com'),
				textContent: 'Old Link',
				target: '_blank'
			};

			link.active(mockElement);
			expect(link.target).toBe(mockElement);

			// Open for edit
			link.modalOn(true);
			expect(link.isUpdateState).toBe(true);

			// Update
			link.controller.currentTarget = {
				childNodes: [{ textContent: 'Old Link' }]
			};
			await link.modalAction();
			expect(kernel.$.history.push).toHaveBeenCalled();
		});
	});
});
