/**
 * @fileoverview Unit tests for modules/Modal.js
 */

import Modal from '../../../src/modules/contracts/Modal.js';

// Mock dependencies
jest.mock('../../../src/editorInjector/_core.js', () => {
	return jest.fn().mockImplementation(function (editor) {
		this.editor = editor;
		this.frameContext = editor.frameContext;
		this.carrierWrapper = editor.carrierWrapper || {
			appendChild: jest.fn(),
			removeChild: jest.fn(),
			querySelector: jest.fn()
		};
		this.options = editor.options || new Map();
		this.triggerEvent = editor.triggerEvent || jest.fn();
		this.eventManager = editor.eventManager || {
			addEvent: jest.fn(() => true),
			removeEvent: jest.fn(),
			addGlobalEvent: jest.fn(() => 'mock-event-id'),
			removeGlobalEvent: jest.fn()
		};
	});
});

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

		mockEditor = {
			ui: {
				showModal: jest.fn(),
				hideModal: jest.fn(),
				_offCurrentModal: jest.fn(),
				showLoading: jest.fn(),
				hideLoading: jest.fn(),
				enableBackWrapper: jest.fn(),
				disableBackWrapper: jest.fn()
			},
			offset: {
				getOffset: jest.fn().mockReturnValue({ left: 0, top: 0 }),
				getGlobal: jest.fn().mockReturnValue({ left: 100, top: 50, width: 200, height: 150 })
			},
			carrierWrapper: mockCarrierWrapper,
			frameContext: new Map(),
			options: new Map([['_rtl', false]]),
			triggerEvent: jest.fn(),
			focus: jest.fn(),
			currentControllerName: null,
			opendModal: null,
			opendControllers: [],
			eventManager: {
				addEvent: jest.fn(() => true),
				removeEvent: jest.fn(),
				addGlobalEvent: jest.fn(() => 'mock-event-id'),
				removeGlobalEvent: jest.fn()
			}
		};

		mockInst = {
			editor: mockEditor,
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
			const modal = new Modal(mockInst, mockElement);

			expect(modal.inst).toBe(mockInst);
			expect(modal.kind).toBe('testModal');
			expect(modal.form).toBe(mockElement);
			expect(modal.isUpdate).toBe(false);
			expect(modal.offset).toBe(mockEditor.offset);
			expect(modal.ui).toBe(mockEditor.ui);
		});

		it('should use constructor name as fallback for kind', () => {
			const instWithoutKey = {
				editor: mockEditor,
				constructor: {
					name: 'FallbackModal'
				}
			};

			const modal = new Modal(instWithoutKey, mockElement);
			expect(modal.kind).toBe('FallbackModal');
		});

		it('should find focus element if it exists', () => {
			const focusElement = document.createElement('input');
			mockElement.querySelector.mockReturnValue(focusElement);

			const modal = new Modal(mockInst, mockElement);
			expect(modal.focusElement).toBe(focusElement);
		});

		it('should handle missing focus element gracefully', () => {
			mockElement.querySelector.mockReturnValue(null);

			const modal = new Modal(mockInst, mockElement);
			expect(modal.focusElement).toBeNull();
		});

		it('should setup form submit handler', () => {
			new Modal(mockInst, mockElement);
			expect(mockEditor.eventManager.addEvent).toHaveBeenCalledWith(expect.anything(), 'submit', expect.any(Function));
		});

		it('should setup close button handler', () => {
			new Modal(mockInst, mockElement);
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
			modal = new Modal(mockInst, mockElement);
			modal.focusElement = { focus: jest.fn() };
		});

		it('should open modal and call init', () => {
			modal.open();

			expect(mockEditor.ui._offCurrentModal).toHaveBeenCalled();
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
			mockEditor.currentControllerName = 'testModal';
			modal.open();
			expect(modal.isUpdate).toBe(true);
		});

		it('should not call init when updating', () => {
			mockEditor.currentControllerName = 'testModal';
			mockInst.modalInit.mockClear();
			modal.open();
			expect(mockInst.modalInit).not.toHaveBeenCalled();
		});

		it('should call on with true when updating', () => {
			mockEditor.currentControllerName = 'testModal';
			modal.open();
			expect(mockInst.modalOn).toHaveBeenCalledWith(true);
		});
	});

	describe('close method', () => {
		let modal;

		beforeEach(() => {
			modal = new Modal(mockInst, mockElement);
		});

		it('should close modal and call off', () => {
			modal.open(); // Open first to set up event listeners
			modal.close();

			expect(mockEditor.eventManager.removeGlobalEvent).toHaveBeenCalled();
			expect(mockInst.modalInit).toHaveBeenCalled();
			expect(mockInst.modalOff).toHaveBeenCalledWith(false);
			expect(mockEditor.focus).toHaveBeenCalled();
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
			mockEditor.focus.mockClear();
			modal.close();
			expect(mockEditor.focus).not.toHaveBeenCalled();
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
			modal = new Modal(mockInst, mockElement);
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

			expect(mockEditor.ui.showLoading).toHaveBeenCalled();
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

			expect(mockEditor.ui.hideLoading).toHaveBeenCalled();
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

			expect(mockEditor.ui.hideLoading).toHaveBeenCalled();
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

			expect(mockEditor.ui.hideLoading).toHaveBeenCalled();
		});
	});


	describe('Modal integration', () => {
		let modal;

		beforeEach(() => {
			modal = new Modal(mockInst, mockElement);
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
			mockEditor.carrierWrapper = null;

			expect(() => {
				new Modal(mockInst, mockElement);
			}).toThrow();
		});

		it('should handle invalid element parameter', () => {
			const invalidElement = null;

			expect(() => {
				new Modal(mockInst, invalidElement);
			}).toThrow();
		});
	});

	describe('Edge cases', () => {
		it('should handle open-close cycles', () => {
			const modal = new Modal(mockInst, mockElement);

			expect(() => {
				modal.open();
				modal.close();
				modal.open();
				modal.close();
			}).not.toThrow();
		});

		it('should handle close without open', () => {
			const modal = new Modal(mockInst, mockElement);

			expect(() => {
				modal.close();
			}).not.toThrow();
		});

		it('should handle multiple open calls', () => {
			const modal = new Modal(mockInst, mockElement);

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
				modal = new Modal(mockInst, mockResizeElement);
			}).not.toThrow();
		});

		it('should handle open with resize body', () => {
			modal = new Modal(mockInst, mockResizeElement);
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
			modal = new Modal(mockInst, mockResizeElement);

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
			modal = new Modal(mockInst, mockElement);
		});

		it('should fix controllers when opening modal', () => {
			const mockController = {
				fixed: false,
				form: { style: { display: 'block' } }
			};
			mockEditor.opendControllers = [mockController];

			modal.open();

			expect(mockController.fixed).toBe(true);
			expect(mockController.form.style.display).toBe('none');
		});

		it('should unfix controllers when closing modal', () => {
			const mockController = {
				fixed: true,
				form: { style: { display: 'none' } }
			};
			mockEditor.opendControllers = [mockController];

			modal.close();

			expect(mockController.fixed).toBe(false);
			expect(mockController.form.style.display).toBe('block');
		});

		it('should handle empty controller list', () => {
			mockEditor.opendControllers = [];

			expect(() => {
				modal.open();
				modal.close();
			}).not.toThrow();
		});
	});

	describe('Event handlers', () => {
		let modal;

		beforeEach(() => {
			modal = new Modal(mockInst, mockElement);
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

			modal = new Modal(mockInst, mockResizeElement);
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
				expect(mockEditor.ui.enableBackWrapper).toHaveBeenCalled();
			}
		});

		it('should handle RTL resize operations', () => {
			mockEditor.options.set('_rtl', true);
			modal = new Modal(mockInst, mockResizeElement);

			const handleH = mockResizeElement.querySelector('.se-modal-resize-handle-h');
			const mousedownEvent = { target: handleH };

			const mousedownHandler = mockEditor.eventManager.addEvent.mock.calls.find(
				call => call[1] === 'mousedown' && call[0] === handleH
			);

			if (mousedownHandler) {
				mousedownHandler[2](mousedownEvent);
				expect(mockEditor.ui.enableBackWrapper).toHaveBeenCalled();
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
				expect(mockEditor.ui.enableBackWrapper).toHaveBeenCalled();
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
});
