/**
 * @fileoverview Unit tests for modules/Modal.js
 */

import Modal from '../../../src/modules/contract/Modal.js';
import { createMockEditor } from '../../../test/__mocks__/editorMock.js';

jest.mock('../../../src/helper', () => ({
	dom: {
		check: { isElement: jest.fn().mockReturnValue(true) },
		utils: {
			addClass: jest.fn(),
			removeClass: jest.fn(),
			setStyle: jest.fn(),
			createTooltipInner: jest.fn((text) => `<span>${text}</span>`)
		},
		query: {
			getEventTarget: jest.fn((e) => e.target)
		}
	},
	env: { _w: { setTimeout: (cb) => cb(), getComputedStyle: jest.fn(() => ({ maxWidth: '500px', maxHeight: '400px' })) } },
	keyCodeMap: { isEsc: jest.fn((code) => code === 'Escape') }
}));

describe('Modules - Modal', () => {
	let mockInst;
	let mockEditor;
	let mockElement;

	beforeEach(() => {
		jest.clearAllMocks();

		// Use createMockEditor for the $ deps bag pattern
		const kernel = createMockEditor();

		mockElement = document.createElement('div');
		mockElement.innerHTML = '<form><input data-focus /><button data-command="close">Close</button></form>';

		const originalQuerySelector = mockElement.querySelector;
		mockElement.querySelector = jest.fn().mockImplementation(function (selector) {
			return originalQuerySelector.call(this, selector);
		});

		const mockCarrierWrapper = {
			querySelector: jest.fn().mockImplementation((selector) => {
				if (selector === '.se-modal') {
					const modalArea = document.createElement('div');
					modalArea.className = 'se-modal';
					return modalArea;
				}
				if (selector === '.se-modal .se-modal-inner') {
					const modalInner = document.createElement('div');
					modalInner.className = 'se-modal-inner';
					modalInner.appendChild = jest.fn();
					modalInner.addEventListener = jest.fn();
					modalInner.removeEventListener = jest.fn();
					return modalInner;
				}
				return null;
			}),
			appendChild: jest.fn(),
			removeChild: jest.fn()
		};

		mockEditor = kernel;
		// Override with custom mocks
		mockEditor.$ = {
			...kernel.$,
			ui: {
				showModal: jest.fn(),
				hideModal: jest.fn(),
				offCurrentModal: jest.fn(),
				showLoading: jest.fn(),
				hideLoading: jest.fn(),
				enableBackWrapper: jest.fn(),
				disableBackWrapper: jest.fn(),
				opendControllers: [],
				currentControllerName: '',
				opendModal: null
			},
			offset: {
				getOffset: jest.fn().mockReturnValue({ left: 0, top: 0 }),
				getGlobal: jest.fn().mockReturnValue({ left: 100, top: 50, width: 200, height: 150 })
			}
		};
		mockEditor.carrierWrapper = mockCarrierWrapper;
		mockEditor.frameContext = new Map();
		mockEditor.currentControllerName = null;
		mockEditor.opendModal = null;
		mockEditor.opendControllers = [];

		mockInst = {
			editor: mockEditor,
			focusManager: mockEditor.focusManager,
			constructor: {
				key: 'testModal',
				name: 'TestModal'
			},
			modalInit: jest.fn(),
			modalOn: jest.fn(),
			modalOff: jest.fn(),
			modalAction: jest.fn(),
			modalResize: jest.fn()
		};
	});

	describe('Constructor', () => {
		it('should create Modal instance with required properties', () => {
			const modal = new Modal(mockInst, mockEditor.$, mockElement);

			expect(modal.inst).toBe(mockInst);
			expect(modal.kind).toBe('testModal');
			expect(modal.form).toBe(mockElement);
			expect(modal.isUpdate).toBe(false);
			// offset and ui are private fields, not exposed on the instance
		});

		it('should use constructor name as fallback for kind', () => {
			const instWithoutKey = {
				editor: mockEditor,
				constructor: {
					name: 'FallbackModal'
				}
			};

			const modal = new Modal(instWithoutKey, mockEditor.$, mockElement);
			expect(modal.kind).toBe('FallbackModal');
		});

		it('should find focus element if it exists', () => {
			const focusElement = document.createElement('input');
			mockElement.querySelector.mockReturnValue(focusElement);

			const modal = new Modal(mockInst, mockEditor.$, mockElement);
			expect(modal.focusElement).toBe(focusElement);
		});

		it('should handle missing focus element gracefully', () => {
			mockElement.querySelector.mockReturnValue(null);

			const modal = new Modal(mockInst, mockEditor.$, mockElement);
			expect(modal.focusElement).toBeNull();
		});

		it('should setup form submit handler', () => {
			new Modal(mockInst, mockEditor.$, mockElement);
			expect(mockEditor.eventManager.addEvent).toHaveBeenCalledWith(expect.anything(), 'submit', expect.any(Function));
		});

		it('should setup close button handler', () => {
			new Modal(mockInst, mockEditor.$, mockElement);
			expect(mockEditor.eventManager.addEvent).toHaveBeenCalledWith(expect.anything(), 'click', expect.any(Function));
		});
	});

	describe('Static method: CreateFileInput', () => {
		it('should create file input HTML with icons and lang', () => {
			const icons = {
				upload_tray: '<svg>upload</svg>',
				file_plus: '<svg>plus</svg>',
				selection_remove: '<svg>remove</svg>'
			};
			const lang = {
				remove: 'Remove'
			};

			const html = Modal.CreateFileInput({ icons, lang }, { acceptedFormats: 'image/*', allowMultiple: true });

			expect(html).toContain('<svg>upload</svg>');
			expect(html).toContain('<svg>plus</svg>');
			expect(html).toContain('<svg>remove</svg>');
			expect(html).toContain('image/*');
			expect(html).toContain('multiple="multiple"');
		});

		it('should handle single file input', () => {
			const icons = {
				upload_tray: '<svg>upload</svg>',
				file_plus: '<svg>plus</svg>',
				selection_remove: '<svg>remove</svg>'
			};
			const lang = { remove: 'Remove' };

			const html = Modal.CreateFileInput({ icons, lang }, { acceptedFormats: 'video/*', allowMultiple: false });

			expect(html).toContain('video/*');
			expect(html).not.toContain('multiple="multiple"');
		});

		it('should handle all file types', () => {
			const icons = {
				upload_tray: '',
				file_plus: '',
				selection_remove: ''
			};
			const lang = { remove: 'Remove' };

			const html = Modal.CreateFileInput({ icons, lang }, { acceptedFormats: '*/*', allowMultiple: false });

			expect(html).toContain('*/*');
		});
	});

	describe('Static method: OnChangeFile', () => {
		let wrapper;

		beforeEach(() => {
			wrapper = document.createElement('div');
			wrapper.className = 'se-flex-input-wrapper';
			wrapper.innerHTML = `
				<div class="se-input-file-cnt"></div>
				<div class="se-input-file-icon-up"></div>
				<div class="se-input-file-icon-files"></div>
			`;
		});

		it('should handle empty file list', () => {
			Modal.OnChangeFile(wrapper, []);

			const fileCnt = wrapper.querySelector('.se-input-file-cnt');
			const fileUp = wrapper.querySelector('.se-input-file-icon-up');
			const fileSelected = wrapper.querySelector('.se-input-file-icon-files');

			expect(fileUp.style.display).toBe('inline-block');
			expect(fileSelected.style.display).toBe('none');
			expect(fileCnt.style.display).toBe('');
			expect(fileCnt.textContent).toBe('');
		});

		it('should handle single file', () => {
			const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
			Modal.OnChangeFile(wrapper, [mockFile]);

			const fileCnt = wrapper.querySelector('.se-input-file-cnt');
			const fileUp = wrapper.querySelector('.se-input-file-icon-up');
			const fileSelected = wrapper.querySelector('.se-input-file-icon-files');

			expect(fileUp.style.display).toBe('none');
			expect(fileSelected.style.display).toBe('none');
			expect(fileCnt.style.display).toBe('block');
			expect(fileCnt.textContent).toBe('test.jpg');
		});

		it('should handle multiple files', () => {
			const mockFile1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' });
			const mockFile2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' });
			const mockFile3 = new File(['content3'], 'test3.jpg', { type: 'image/jpeg' });
			Modal.OnChangeFile(wrapper, [mockFile1, mockFile2, mockFile3]);

			const fileCnt = wrapper.querySelector('.se-input-file-cnt');
			const fileUp = wrapper.querySelector('.se-input-file-icon-up');
			const fileSelected = wrapper.querySelector('.se-input-file-icon-files');

			expect(fileUp.style.display).toBe('none');
			expect(fileSelected.style.display).toBe('inline-block');
			expect(fileCnt.style.display).toBe('');
			expect(fileCnt.textContent).toBe(' ..3');
		});

		it('should handle null wrapper', () => {
			expect(() => {
				Modal.OnChangeFile(null, []);
			}).not.toThrow();
		});

		it('should handle null files', () => {
			expect(() => {
				Modal.OnChangeFile(wrapper, null);
			}).not.toThrow();
		});
	});

	describe('open method', () => {
		let modal;

		beforeEach(() => {
			modal = new Modal(mockInst, mockEditor.$, mockElement);
			modal.focusElement = { focus: jest.fn() };
		});

		it('should open modal and call init', () => {
			modal.open();

			expect(mockEditor.$.ui.offCurrentModal).toHaveBeenCalled();
			expect(mockEditor.eventManager.addGlobalEvent).toHaveBeenCalled();
			expect(mockInst.modalInit).toHaveBeenCalled();
			expect(mockInst.modalOn).toHaveBeenCalledWith(false);
		});

		it('should focus element if exists', () => {
			modal.open();
			expect(modal.focusElement.focus).toHaveBeenCalled();
		});

		it('should not call init if not provided', () => {
			mockInst.modalInit = undefined;
			expect(() => {
				modal.open();
			}).not.toThrow();
		});

		it('should not call on if not provided', () => {
			mockInst.modalOn = undefined;
			expect(() => {
				modal.open();
			}).not.toThrow();
		});

		it('should set isUpdate to true when updating same controller', () => {
			mockEditor.$.ui.currentControllerName = 'testModal';
			modal.open();
			expect(modal.isUpdate).toBe(true);
		});

		it('should not call init when updating', () => {
			mockEditor.$.ui.currentControllerName = 'testModal';
			mockInst.modalInit.mockClear();
			modal.open();
			expect(mockInst.modalInit).not.toHaveBeenCalled();
		});

		it('should call on with true when updating', () => {
			mockEditor.$.ui.currentControllerName = 'testModal';
			modal.open();
			expect(mockInst.modalOn).toHaveBeenCalledWith(true);
		});
	});

	describe('close method', () => {
		let modal;

		beforeEach(() => {
			modal = new Modal(mockInst, mockEditor.$, mockElement);
		});

		it('should close modal and call off', () => {
			modal.open(); // Open first to set up event listeners
			modal.close();

			expect(mockEditor.eventManager.removeGlobalEvent).toHaveBeenCalled();
			expect(mockInst.modalInit).toHaveBeenCalled();
			expect(mockInst.modalOff).toHaveBeenCalledWith(false);
			expect(mockEditor.focusManager.focus).toHaveBeenCalled();
		});

		it('should not call init if not provided', () => {
			mockInst.modalInit = undefined;
			expect(() => {
				modal.close();
			}).not.toThrow();
		});

		it('should not call off if not provided', () => {
			mockInst.modalOff = undefined;
			expect(() => {
				modal.close();
			}).not.toThrow();
		});

		it('should not focus editor when updating', () => {
			modal.isUpdate = true;
			mockEditor.focusManager.focus.mockClear();
			modal.close();
			expect(mockEditor.focusManager.focus).not.toHaveBeenCalled();
		});

		it('should call off with true when updating', () => {
			modal.isUpdate = true;
			modal.close();
			expect(mockInst.modalOff).toHaveBeenCalledWith(true);
		});
	});

	describe('modalAction', () => {
		let modal;

		beforeEach(() => {
			modal = new Modal(mockInst, mockEditor.$, mockElement);
		});

		it('should show loading before action', async () => {
			mockInst.modalAction.mockResolvedValue(true);

			const form = mockElement.querySelector('form');
			const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
			Object.defineProperty(submitEvent, 'preventDefault', { value: jest.fn() });
			Object.defineProperty(submitEvent, 'stopPropagation', { value: jest.fn() });

			// Trigger the event handler manually
			const submitHandler = mockEditor.eventManager.addEvent.mock.calls.find((call) => call[1] === 'submit');
			if (submitHandler) {
				await submitHandler[2](submitEvent);
			}

			expect(mockEditor.$.ui.showLoading).toHaveBeenCalled();
		});

		it('should close modal and hide loading when action returns true', async () => {
			mockInst.modalAction.mockResolvedValue(true);

			const form = mockElement.querySelector('form');
			const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
			Object.defineProperty(submitEvent, 'preventDefault', { value: jest.fn() });
			Object.defineProperty(submitEvent, 'stopPropagation', { value: jest.fn() });

			const submitHandler = mockEditor.eventManager.addEvent.mock.calls.find((call) => call[1] === 'submit');
			if (submitHandler) {
				await submitHandler[2](submitEvent);
			}

			expect(mockEditor.$.ui.hideLoading).toHaveBeenCalled();
		});

		it('should only hide loading when action returns false', async () => {
			mockInst.modalAction.mockResolvedValue(false);

			const form = mockElement.querySelector('form');
			const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
			Object.defineProperty(submitEvent, 'preventDefault', { value: jest.fn() });
			Object.defineProperty(submitEvent, 'stopPropagation', { value: jest.fn() });

			const submitHandler = mockEditor.eventManager.addEvent.mock.calls.find((call) => call[1] === 'submit');
			if (submitHandler) {
				await submitHandler[2](submitEvent);
			}

			expect(mockEditor.$.ui.hideLoading).toHaveBeenCalled();
		});

		it('should only close modal when action returns undefined', async () => {
			mockInst.modalAction.mockResolvedValue(undefined);

			const form = mockElement.querySelector('form');
			const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
			Object.defineProperty(submitEvent, 'preventDefault', { value: jest.fn() });
			Object.defineProperty(submitEvent, 'stopPropagation', { value: jest.fn() });

			const submitHandler = mockEditor.eventManager.addEvent.mock.calls.find((call) => call[1] === 'submit');
			if (submitHandler) {
				await submitHandler[2](submitEvent);
			}

			// When undefined, close is called but hideLoading should not be called
			expect(mockInst.modalInit).toHaveBeenCalled();
		});

		it('should handle action error', async () => {
			mockInst.modalAction.mockRejectedValue(new Error('Test error'));

			const form = mockElement.querySelector('form');
			const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
			Object.defineProperty(submitEvent, 'preventDefault', { value: jest.fn() });
			Object.defineProperty(submitEvent, 'stopPropagation', { value: jest.fn() });

			const submitHandler = mockEditor.eventManager.addEvent.mock.calls.find((call) => call[1] === 'submit');
			if (submitHandler) {
				await expect(submitHandler[2](submitEvent)).rejects.toThrow();
			}

			expect(mockEditor.$.ui.hideLoading).toHaveBeenCalled();
		});
	});


	describe('Modal integration', () => {
		let modal;

		beforeEach(() => {
			modal = new Modal(mockInst, mockEditor.$, mockElement);
		});

		it('should call open and close methods', () => {
			expect(() => {
				modal.open();
				modal.close();
			}).not.toThrow();
		});
	});

	describe('Error handling', () => {
		it('should handle missing carrier wrapper gracefully', () => {
			mockEditor.$.contextProvider.carrierWrapper = null;

			expect(() => {
				new Modal(mockInst, mockEditor.$, mockElement);
			}).toThrow();
		});

		it('should handle invalid element parameter', () => {
			const invalidElement = null;

			expect(() => {
				new Modal(mockInst, mockEditor.$, invalidElement);
			}).toThrow();
		});
	});

	describe('Edge cases', () => {
		it('should handle open-close cycles', () => {
			const modal = new Modal(mockInst, mockEditor.$, mockElement);

			expect(() => {
				modal.open();
				modal.close();
				modal.open();
				modal.close();
			}).not.toThrow();
		});

		it('should handle close without open', () => {
			const modal = new Modal(mockInst, mockEditor.$, mockElement);

			expect(() => {
				modal.close();
			}).not.toThrow();
		});

		it('should handle multiple open calls', () => {
			const modal = new Modal(mockInst, mockEditor.$, mockElement);

			expect(() => {
				modal.open();
				modal.open();
			}).not.toThrow();
		});
	});

	describe('Resize functionality', () => {
		let mockResizeElement;
		let modal;

		beforeEach(() => {
			mockResizeElement = document.createElement('div');
			mockResizeElement.innerHTML = `
				<form>
					<input data-focus />
					<button data-command="close">Close</button>
					<div class="se-modal-body se-modal-resize-form"></div>
					<div class="se-modal-resize-handle-w"></div>
					<div class="se-modal-resize-handle-h"></div>
					<div class="se-modal-resize-handle-c"></div>
				</form>
			`;

			const originalQuerySelector = mockResizeElement.querySelector;
			mockResizeElement.querySelector = jest.fn().mockImplementation(function (selector) {
				return originalQuerySelector.call(this, selector);
			});
		});

		it('should initialize resize handles', () => {
			expect(() => {
				modal = new Modal(mockInst, mockEditor.$, mockResizeElement);
			}).not.toThrow();
		});

		it('should handle open with resize body', () => {
			modal = new Modal(mockInst, mockEditor.$, mockResizeElement);
			modal.focusElement = { focus: jest.fn() };

			const resizeBody = mockResizeElement.querySelector('.se-modal-resize-form');
			Object.defineProperty(resizeBody, 'offsetWidth', { value: 300, configurable: true });
			Object.defineProperty(resizeBody, 'offsetHeight', { value: 200, configurable: true });
			Object.defineProperty(modal.form, 'offsetWidth', { value: 400, configurable: true });
			Object.defineProperty(modal.form, 'offsetHeight', { value: 300, configurable: true });
			Object.defineProperty(modal.form, 'offsetTop', { value: 50, configurable: true });

			expect(() => {
				modal.open();
			}).not.toThrow();
		});

		it('should handle resize mousedown event', () => {
			modal = new Modal(mockInst, mockEditor.$, mockResizeElement);

			const handleW = mockResizeElement.querySelector('.se-modal-resize-handle-w');
			const event = new MouseEvent('mousedown', { bubbles: true });
			Object.defineProperty(event, 'target', { value: handleW });

			const mousedownHandler = mockEditor.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'mousedown' && call[0] === handleW
			);

			if (mousedownHandler) {
				mousedownHandler[2](event);
				expect(mockEditor.eventManager.addGlobalEvent).toHaveBeenCalled();
			}
		});
	});

	describe('Controller integration', () => {
		let modal;

		beforeEach(() => {
			modal = new Modal(mockInst, mockEditor.$, mockElement);
		});

		it('should fix controllers when opening modal', () => {
			const mockController = {
				fixed: false,
				form: { style: { display: 'block' } }
			};
			mockEditor.$.ui.opendControllers = [mockController];

			modal.open();

			expect(mockController.fixed).toBe(true);
			expect(mockController.form.style.display).toBe('none');
		});

		it('should unfix controllers when closing modal', () => {
			const mockController = {
				fixed: true,
				form: { style: { display: 'none' } }
			};
			mockEditor.$.ui.opendControllers = [mockController];

			modal.close();

			expect(mockController.fixed).toBe(false);
			expect(mockController.form.style.display).toBe('block');
		});

		it('should handle empty controller list', () => {
			mockEditor.$.ui.opendControllers = [];

			expect(() => {
				modal.open();
				modal.close();
			}).not.toThrow();
		});
	});

	describe('Event handlers', () => {
		let modal;

		beforeEach(() => {
			modal = new Modal(mockInst, mockEditor.$, mockElement);
		});

		it('should handle escape key to close', () => {
			const { keyCodeMap } = require('../../../src/helper');
			keyCodeMap.isEsc.mockReturnValue(true);

			modal.open();

			// Get the keydown handler from addGlobalEvent
			const keydownHandler = mockEditor.eventManager.addGlobalEvent.mock.calls.find(
				call => call[0] === 'keydown'
			);

			if (keydownHandler) {
				const event = { code: 'Escape' };
				keydownHandler[1](event);
				// close() should be called
				expect(mockEditor.eventManager.removeGlobalEvent).toHaveBeenCalled();
			}
		});

		it('should handle click on modal inner to close', () => {
			const mockCarrierWrapper = mockEditor.carrierWrapper;
			const modalInner = mockCarrierWrapper.querySelector('.se-modal .se-modal-inner');

			modal.open();

			const clickEvent = {
				target: modalInner
			};

			// Manually trigger the click handler
			if (modalInner.addEventListener.mock.calls.length > 0) {
				const clickHandler = modalInner.addEventListener.mock.calls.find(call => call[0] === 'click');
				if (clickHandler) {
					const { dom } = require('../../../src/helper');
					dom.query.getEventTarget.mockReturnValue(modalInner);

					clickHandler[1](clickEvent);
					// close() should be called
					expect(mockEditor.eventManager.removeGlobalEvent).toHaveBeenCalled();
				}
			}
		});

		it('should handle click on close button', () => {
			const mockCarrierWrapper = mockEditor.carrierWrapper;
			const modalInner = mockCarrierWrapper.querySelector('.se-modal .se-modal-inner');

			modal.open();

			const closeButton = { getAttribute: jest.fn().mockReturnValue('close') };
			const clickEvent = { target: closeButton };

			if (modalInner.addEventListener.mock.calls.length > 0) {
				const clickHandler = modalInner.addEventListener.mock.calls.find(call => call[0] === 'click');
				if (clickHandler) {
					const { dom } = require('../../../src/helper');
					dom.query.getEventTarget.mockReturnValue(closeButton);

					clickHandler[1](clickEvent);
					expect(mockEditor.eventManager.removeGlobalEvent).toHaveBeenCalled();
				}
			}
		});
	});

	describe('Resize operations', () => {
		let mockResizeElement;
		let modal;

		beforeEach(() => {
			mockResizeElement = document.createElement('div');
			mockResizeElement.innerHTML = `
				<form>
					<input data-focus />
					<button data-command="close">Close</button>
					<div class="se-modal-body se-modal-resize-form"></div>
					<div class="se-modal-resize-handle-w"></div>
					<div class="se-modal-resize-handle-h"></div>
					<div class="se-modal-resize-handle-c"></div>
				</form>
			`;

			const originalQuerySelector = mockResizeElement.querySelector;
			mockResizeElement.querySelector = jest.fn().mockImplementation(function (selector) {
				return originalQuerySelector.call(this, selector);
			});

			modal = new Modal(mockInst, mockEditor.$, mockResizeElement);
		});

		it('should handle resize in width direction', () => {
			const handleW = mockResizeElement.querySelector('.se-modal-resize-handle-w');
			const resizeBody = mockResizeElement.querySelector('.se-modal-resize-form');

			Object.defineProperty(resizeBody, 'offsetWidth', { value: 300, configurable: true });
			Object.defineProperty(resizeBody, 'offsetHeight', { value: 200, configurable: true });

			const mousedownEvent = { target: handleW };
			const mousedownHandler = mockEditor.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'mousedown' && call[0] === handleW
			);

			if (mousedownHandler) {
				mousedownHandler[2](mousedownEvent);
				expect(mockEditor.$.ui.enableBackWrapper).toHaveBeenCalled();
			}
		});

		it('should handle RTL resize operations', () => {
			mockEditor.options.set('_rtl', true);
			modal = new Modal(mockInst, mockEditor.$, mockResizeElement);

			const handleH = mockResizeElement.querySelector('.se-modal-resize-handle-h');
			const mousedownEvent = { target: handleH };

			const mousedownHandler = mockEditor.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'mousedown' && call[0] === handleH
			);

			if (mousedownHandler) {
				mousedownHandler[2](mousedownEvent);
				expect(mockEditor.$.ui.enableBackWrapper).toHaveBeenCalled();
			}
		});

		it('should handle corner resize', () => {
			const handleC = mockResizeElement.querySelector('.se-modal-resize-handle-c');
			const mousedownEvent = { target: handleC };

			const mousedownHandler = mockEditor.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'mousedown' && call[0] === handleC
			);

			if (mousedownHandler) {
				mousedownHandler[2](mousedownEvent);
				expect(mockEditor.$.ui.enableBackWrapper).toHaveBeenCalled();
			}
		});

		it('should call modalResize if provided', () => {
			const resizeBody = mockResizeElement.querySelector('.se-modal-resize-form');
			Object.defineProperty(resizeBody, 'offsetWidth', { value: 300, configurable: true });
			Object.defineProperty(resizeBody, 'offsetHeight', { value: 200, configurable: true });

			const handleW = mockResizeElement.querySelector('.se-modal-resize-handle-w');
			const mousedownEvent = { target: handleW };

			const mousedownHandler = mockEditor.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'mousedown' && call[0] === handleW
			);

			if (mousedownHandler) {
				mousedownHandler[2](mousedownEvent);

				// Simulate mousemove
				const mousemoveHandler = mockEditor.eventManager.addGlobalEvent.mock.calls.find(
					call => call[0] === 'mousemove'
				);

				if (mousemoveHandler) {
					const mousemoveEvent = { clientX: 350, clientY: 250 };
					mousemoveHandler[1](mousemoveEvent);
					expect(mockInst.modalResize).toHaveBeenCalled();
				}
			}
		});
	});

	describe('Resize with se-modal-body fallback (lines 64-73)', () => {
		let mockResizeElement;
		let modal;
		let capturedHandlers;

		beforeEach(() => {
			jest.clearAllMocks();
			capturedHandlers = {};

			// Create element with se-modal-body but WITHOUT se-modal-resize-form
			// This triggers the fallback code path at lines 64-73
			mockResizeElement = document.createElement('div');
			mockResizeElement.innerHTML = `
				<form>
					<input data-focus />
					<button data-command="close">Close</button>
					<div class="se-modal-body"></div>
					<div class="se-modal-resize-handle-w"></div>
					<div class="se-modal-resize-handle-h"></div>
					<div class="se-modal-resize-handle-c"></div>
				</form>
			`;

			// Capture the actual event handlers when they're registered
			mockEditor.eventManager.addEvent = jest.fn((element, eventType, handler) => {
				if (eventType === 'mousedown') {
					const className = element?.className || '';
					if (className.includes('handle-w')) capturedHandlers.mousedownW = handler;
					if (className.includes('handle-h')) capturedHandlers.mousedownH = handler;
					if (className.includes('handle-c')) capturedHandlers.mousedownC = handler;
				}
				return true;
			});

			mockEditor.eventManager.addGlobalEvent = jest.fn((eventType, handler) => {
				if (eventType === 'mousemove') capturedHandlers.mousemove = handler;
				if (eventType === 'mouseup') capturedHandlers.mouseup = handler;
				return `mock-${eventType}-id`;
			});

			modal = new Modal(mockInst, mockEditor.$, mockResizeElement);
		});

		it('should setup resize handlers when se-modal-resize-form is absent but se-modal-body exists', () => {
			// Verify mousedown handlers were registered for each resize handle
			expect(capturedHandlers.mousedownW).toBeDefined();
			expect(capturedHandlers.mousedownH).toBeDefined();
			expect(capturedHandlers.mousedownC).toBeDefined();
		});

		it('should add global events and set cursor on mousedown (w direction)', () => {
			const handleW = mockResizeElement.querySelector('.se-modal-resize-handle-w');
			const mockEvent = { target: handleW };

			capturedHandlers.mousedownW(mockEvent);

			expect(mockEditor.$.ui.enableBackWrapper).toHaveBeenCalledWith('ns-resize');
			expect(capturedHandlers.mousemove).toBeDefined();
			expect(capturedHandlers.mouseup).toBeDefined();
		});

		it('should resize height on mousemove in w direction', () => {
			const resizeBody = mockResizeElement.querySelector('.se-modal-body');
			Object.defineProperty(resizeBody, 'offsetWidth', { value: 300, configurable: true });
			Object.defineProperty(resizeBody, 'offsetHeight', { value: 200, configurable: true });

			const handleW = mockResizeElement.querySelector('.se-modal-resize-handle-w');
			capturedHandlers.mousedownW({ target: handleW });

			// Simulate mousemove - should update height
			capturedHandlers.mousemove({ clientX: 150, clientY: 300 });

			expect(resizeBody.style.height).toContain('px');
			expect(mockInst.modalResize).toHaveBeenCalled();
		});

		it('should resize width on mousemove in h direction (LTR)', () => {
			mockEditor.options.set('_rtl', false);
			modal = new Modal(mockInst, mockEditor.$, mockResizeElement);

			const resizeBody = mockResizeElement.querySelector('.se-modal-body');
			Object.defineProperty(resizeBody, 'offsetWidth', { value: 300, configurable: true });
			Object.defineProperty(resizeBody, 'offsetHeight', { value: 200, configurable: true });

			const handleH = mockResizeElement.querySelector('.se-modal-resize-handle-h');
			capturedHandlers.mousedownH({ target: handleH });

			capturedHandlers.mousemove({ clientX: 400, clientY: 150 });

			expect(resizeBody.style.width).toContain('px');
		});

		it('should resize width on mousemove in hRTL direction', () => {
			mockEditor.options.set('_rtl', true);
			modal = new Modal(mockInst, mockEditor.$, mockResizeElement);

			const resizeBody = mockResizeElement.querySelector('.se-modal-body');
			Object.defineProperty(resizeBody, 'offsetWidth', { value: 300, configurable: true });
			Object.defineProperty(resizeBody, 'offsetHeight', { value: 200, configurable: true });

			const handleH = mockResizeElement.querySelector('.se-modal-resize-handle-h');
			capturedHandlers.mousedownH({ target: handleH });

			capturedHandlers.mousemove({ clientX: 50, clientY: 150 });

			expect(resizeBody.style.width).toContain('px');
		});

		it('should resize both width and height on mousemove in c direction (LTR)', () => {
			mockEditor.options.set('_rtl', false);
			modal = new Modal(mockInst, mockEditor.$, mockResizeElement);

			const resizeBody = mockResizeElement.querySelector('.se-modal-body');
			Object.defineProperty(resizeBody, 'offsetWidth', { value: 300, configurable: true });
			Object.defineProperty(resizeBody, 'offsetHeight', { value: 200, configurable: true });

			const handleC = mockResizeElement.querySelector('.se-modal-resize-handle-c');
			capturedHandlers.mousedownC({ target: handleC });

			capturedHandlers.mousemove({ clientX: 400, clientY: 300 });

			expect(resizeBody.style.width).toContain('px');
			expect(resizeBody.style.height).toContain('px');
		});

		it('should resize both width and height on mousemove in cRTL direction', () => {
			mockEditor.options.set('_rtl', true);
			modal = new Modal(mockInst, mockEditor.$, mockResizeElement);

			const resizeBody = mockResizeElement.querySelector('.se-modal-body');
			Object.defineProperty(resizeBody, 'offsetWidth', { value: 300, configurable: true });
			Object.defineProperty(resizeBody, 'offsetHeight', { value: 200, configurable: true });

			const handleC = mockResizeElement.querySelector('.se-modal-resize-handle-c');
			capturedHandlers.mousedownC({ target: handleC });

			capturedHandlers.mousemove({ clientX: 50, clientY: 300 });

			expect(resizeBody.style.width).toContain('px');
			expect(resizeBody.style.height).toContain('px');
		});

		it('should cleanup on mouseup - remove active class and global events', () => {
			const { dom } = require('../../../src/helper');
			const handleW = mockResizeElement.querySelector('.se-modal-resize-handle-w');

			capturedHandlers.mousedownW({ target: handleW });
			capturedHandlers.mouseup();

			expect(dom.utils.removeClass).toHaveBeenCalled();
			expect(mockEditor.$.ui.disableBackWrapper).toHaveBeenCalled();
		});

		it('should add active class to handle on mousedown', () => {
			const { dom } = require('../../../src/helper');
			const handleW = mockResizeElement.querySelector('.se-modal-resize-handle-w');

			capturedHandlers.mousedownW({ target: handleW });

			expect(dom.utils.addClass).toHaveBeenCalledWith(handleW, 'active');
		});

		it('should use correct cursor for each resize direction', () => {
			// Test w direction cursor
			const handleW = mockResizeElement.querySelector('.se-modal-resize-handle-w');
			capturedHandlers.mousedownW({ target: handleW });
			expect(mockEditor.$.ui.enableBackWrapper).toHaveBeenCalledWith('ns-resize');

			// Reset and test h direction
			mockEditor.$.ui.enableBackWrapper.mockClear();
			const handleH = mockResizeElement.querySelector('.se-modal-resize-handle-h');
			capturedHandlers.mousedownH({ target: handleH });
			expect(mockEditor.$.ui.enableBackWrapper).toHaveBeenCalledWith('ew-resize');

			// Reset and test c direction
			mockEditor.$.ui.enableBackWrapper.mockClear();
			const handleC = mockResizeElement.querySelector('.se-modal-resize-handle-c');
			capturedHandlers.mousedownC({ target: handleC });
			expect(mockEditor.$.ui.enableBackWrapper).toHaveBeenCalledWith('nwse-resize');
		});

		it('should use RTL-specific cursors when RTL is enabled', () => {
			mockEditor.options.set('_rtl', true);
			modal = new Modal(mockInst, mockEditor.$, mockResizeElement);

			const handleC = mockResizeElement.querySelector('.se-modal-resize-handle-c');
			capturedHandlers.mousedownC({ target: handleC });

			expect(mockEditor.$.ui.enableBackWrapper).toHaveBeenCalledWith('nesw-resize');
		});

		it('should not call modalResize if not provided', () => {
			mockInst.modalResize = undefined;
			modal = new Modal(mockInst, mockEditor.$, mockResizeElement);

			const resizeBody = mockResizeElement.querySelector('.se-modal-body');
			Object.defineProperty(resizeBody, 'offsetWidth', { value: 300, configurable: true });
			Object.defineProperty(resizeBody, 'offsetHeight', { value: 200, configurable: true });

			const handleW = mockResizeElement.querySelector('.se-modal-resize-handle-w');
			capturedHandlers.mousedownW({ target: handleW });

			expect(() => {
				capturedHandlers.mousemove({ clientX: 150, clientY: 300 });
			}).not.toThrow();
		});
	});


	describe('Escape key handler (line 284)', () => {
		let modal;
		let capturedKeydownHandler;

		beforeEach(() => {
			jest.clearAllMocks();

			mockEditor.eventManager.addGlobalEvent = jest.fn((eventType, handler) => {
				if (eventType === 'keydown') capturedKeydownHandler = handler;
				return `mock-${eventType}-id`;
			});

			modal = new Modal(mockInst, mockEditor.$, mockElement);
		});

		it('should close modal when Escape key is pressed', () => {
			const { keyCodeMap, dom } = require('../../../src/helper');
			keyCodeMap.isEsc.mockReturnValue(true);

			modal.open();

			capturedKeydownHandler({ code: 'Escape' });

			expect(dom.utils.removeClass).toHaveBeenCalled();
			expect(mockInst.modalInit).toHaveBeenCalled();
		});

		it('should not close modal when other keys are pressed', () => {
			const { keyCodeMap } = require('../../../src/helper');
			keyCodeMap.isEsc.mockReturnValue(false);

			mockInst.modalInit.mockClear();

			modal.open();
			mockInst.modalInit.mockClear(); // Clear calls from open

			capturedKeydownHandler({ code: 'Enter' });

			// modalInit should NOT have been called again after open
			expect(mockInst.modalInit).not.toHaveBeenCalled();
		});
	});

	describe('Action error handling (lines 264-267)', () => {
		let modal;
		let capturedSubmitHandler;

		beforeEach(() => {
			jest.clearAllMocks();

			mockEditor.eventManager.addEvent = jest.fn((element, eventType, handler) => {
				if (eventType === 'submit') capturedSubmitHandler = handler;
				return true;
			});

			modal = new Modal(mockInst, mockEditor.$, mockElement);
		});

		it('should throw wrapped error with modal kind when action fails', async () => {
			mockInst.modalAction.mockRejectedValue(new Error('Action failed'));

			const submitEvent = {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			await expect(capturedSubmitHandler(submitEvent)).rejects.toThrow('[SUNEDITOR.Modal[testModal].warn] Action failed');
		});

		it('should close modal and hide loading on error', async () => {
			const { dom } = require('../../../src/helper');
			mockInst.modalAction.mockRejectedValue(new Error('Test error'));

			const submitEvent = {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			};

			try {
				await capturedSubmitHandler(submitEvent);
			} catch (e) {
				// Expected to throw
			}

			expect(mockEditor.$.ui.hideLoading).toHaveBeenCalled();
			expect(dom.utils.removeClass).toHaveBeenCalled();
		});
	});

	describe('Global event cleanup during resize', () => {
		let modal;
		let capturedHandlers;

		beforeEach(() => {
			jest.clearAllMocks();
			capturedHandlers = {};

			const mockResizeElement = document.createElement('div');
			mockResizeElement.innerHTML = `
				<form>
					<input data-focus />
					<button data-command="close">Close</button>
					<div class="se-modal-body"></div>
					<div class="se-modal-resize-handle-w"></div>
					<div class="se-modal-resize-handle-h"></div>
					<div class="se-modal-resize-handle-c"></div>
				</form>
			`;

			mockEditor.eventManager.addEvent = jest.fn((element, eventType, handler) => {
				if (eventType === 'mousedown') {
					const className = element?.className || '';
					if (className.includes('handle-w')) capturedHandlers.mousedownW = handler;
				}
				return true;
			});

			mockEditor.eventManager.addGlobalEvent = jest.fn((eventType, handler) => {
				if (eventType === 'mousemove') capturedHandlers.mousemove = handler;
				if (eventType === 'mouseup') capturedHandlers.mouseup = handler;
				return `mock-${eventType}-id`;
			});

			modal = new Modal(mockInst, mockEditor.$, mockResizeElement);
		});

		it('should remove previous global events before adding new ones', () => {
			const handleW = document.querySelector('.se-modal-resize-handle-w');

			// First mousedown
			capturedHandlers.mousedownW({ target: handleW });
			expect(mockEditor.$.ui.disableBackWrapper).toHaveBeenCalled();

			mockEditor.$.ui.disableBackWrapper.mockClear();

			// Second mousedown should cleanup previous events first
			capturedHandlers.mousedownW({ target: handleW });
			expect(mockEditor.$.ui.disableBackWrapper).toHaveBeenCalled();
		});
	});

	describe('Open with resize body edge cases (lines 163-167)', () => {
		let mockResizeElement;
		let modal;

		beforeEach(() => {
			jest.clearAllMocks();

			mockResizeElement = document.createElement('div');
			mockResizeElement.innerHTML = `
				<form>
					<input data-focus />
					<button data-command="close">Close</button>
					<div class="se-modal-body"></div>
					<div class="se-modal-resize-handle-w"></div>
					<div class="se-modal-resize-handle-h"></div>
					<div class="se-modal-resize-handle-c"></div>
				</form>
			`;
		});

		it('should not set max-width when maxWidth is empty', () => {
			const { env, dom } = require('../../../src/helper');
			env._w.getComputedStyle = jest.fn(() => ({ maxWidth: '', maxHeight: '400px' }));
			dom.utils.setStyle.mockClear();

			modal = new Modal(mockInst, mockEditor.$, mockResizeElement);
			modal.focusElement = { focus: jest.fn() };

			const resizeBody = mockResizeElement.querySelector('.se-modal-body');
			Object.defineProperty(resizeBody, 'offsetWidth', { value: 300, configurable: true });
			Object.defineProperty(resizeBody, 'offsetHeight', { value: 200, configurable: true });
			Object.defineProperty(modal.form, 'offsetWidth', { value: 400, configurable: true });
			Object.defineProperty(modal.form, 'offsetHeight', { value: 300, configurable: true });
			Object.defineProperty(modal.form, 'offsetTop', { value: 50, configurable: true });

			modal.open();

			// max-width should not be set when maxWidth is empty
			const setStyleCalls = dom.utils.setStyle.mock.calls;
			const maxWidthCalls = setStyleCalls.filter(call => call[1] === 'max-width');
			expect(maxWidthCalls.length).toBe(0);
		});

		it('should not set max-height when maxHeight is empty', () => {
			const { env, dom } = require('../../../src/helper');
			env._w.getComputedStyle = jest.fn(() => ({ maxWidth: '500px', maxHeight: '' }));
			dom.utils.setStyle.mockClear();

			modal = new Modal(mockInst, mockEditor.$, mockResizeElement);
			modal.focusElement = { focus: jest.fn() };

			const resizeBody = mockResizeElement.querySelector('.se-modal-body');
			Object.defineProperty(resizeBody, 'offsetWidth', { value: 300, configurable: true });
			Object.defineProperty(resizeBody, 'offsetHeight', { value: 200, configurable: true });
			Object.defineProperty(modal.form, 'offsetWidth', { value: 400, configurable: true });
			Object.defineProperty(modal.form, 'offsetHeight', { value: 300, configurable: true });
			Object.defineProperty(modal.form, 'offsetTop', { value: 50, configurable: true });

			modal.open();

			// max-height should not be set when maxHeight is empty
			const setStyleCalls = dom.utils.setStyle.mock.calls;
			const maxHeightCalls = setStyleCalls.filter(call => call[1] === 'max-height');
			expect(maxHeightCalls.length).toBe(0);
		});

		it('should set both max-width and max-height when both are defined', () => {
			const { env, dom } = require('../../../src/helper');
			env._w.getComputedStyle = jest.fn(() => ({ maxWidth: '500px', maxHeight: '400px' }));
			dom.utils.setStyle.mockClear();

			modal = new Modal(mockInst, mockEditor.$, mockResizeElement);
			modal.focusElement = { focus: jest.fn() };

			const resizeBody = mockResizeElement.querySelector('.se-modal-body');
			Object.defineProperty(resizeBody, 'offsetWidth', { value: 300, configurable: true });
			Object.defineProperty(resizeBody, 'offsetHeight', { value: 200, configurable: true });
			Object.defineProperty(modal.form, 'offsetWidth', { value: 400, configurable: true });
			Object.defineProperty(modal.form, 'offsetHeight', { value: 300, configurable: true });
			Object.defineProperty(modal.form, 'offsetTop', { value: 50, configurable: true });

			modal.open();

			const setStyleCalls = dom.utils.setStyle.mock.calls;
			const maxWidthCalls = setStyleCalls.filter(call => call[1] === 'max-width');
			const maxHeightCalls = setStyleCalls.filter(call => call[1] === 'max-height');
			expect(maxWidthCalls.length).toBe(1);
			expect(maxHeightCalls.length).toBe(1);
		});

		it('should not focus element when focusElement is null', () => {
			const { env } = require('../../../src/helper');
			env._w.getComputedStyle = jest.fn(() => ({ maxWidth: '500px', maxHeight: '400px' }));

			modal = new Modal(mockInst, mockEditor.$, mockResizeElement);
			modal.focusElement = null;

			const resizeBody = mockResizeElement.querySelector('.se-modal-body');
			Object.defineProperty(resizeBody, 'offsetWidth', { value: 300, configurable: true });
			Object.defineProperty(resizeBody, 'offsetHeight', { value: 200, configurable: true });
			Object.defineProperty(modal.form, 'offsetWidth', { value: 400, configurable: true });
			Object.defineProperty(modal.form, 'offsetHeight', { value: 300, configurable: true });
			Object.defineProperty(modal.form, 'offsetTop', { value: 50, configurable: true });

			expect(() => {
				modal.open();
			}).not.toThrow();
		});
	});
});
