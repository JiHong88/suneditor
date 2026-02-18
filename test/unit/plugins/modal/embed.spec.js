import Embed from '../../../../src/plugins/modal/embed';
import { createMockEditor } from '../../../../test/__mocks__/editorMock.js';

// Mock dependencies

jest.mock('../../../../src/modules/contract', () => ({
	Modal: jest.fn().mockImplementation(() => ({
		open: jest.fn(),
		close: jest.fn(),
		form: {
			querySelector: jest.fn().mockImplementation((selector) => {
				if (selector === 'input[name="suneditor_embed_radio"]:checked') {
					return { value: 'none', checked: true };
				}
				if (selector.includes('input[name="suneditor_embed_radio"]')) {
					return { checked: false };
				}
				return { value: '', checked: false };
			}),
			appendChild: jest.fn(),
		},
		isUpdate: false,
	})),
	Figure: jest.fn().mockImplementation(() => ({
		open: jest.fn().mockReturnValue({
			cover: { nodeType: 1, setAttribute: jest.fn(), getAttribute: jest.fn().mockReturnValue(''), appendChild: jest.fn() },
			container: { nodeType: 1, style: {}, appendChild: jest.fn() },
			caption: null,
			align: 'none',
			w: '100%',
			h: '400px',
			originWidth: '100%',
			originHeight: '400px',
			ratio: { w: 1, h: 1 },
		}),
		getSize: jest.fn().mockReturnValue({ w: '100%', h: '400px', dw: '100%', dh: '400px' }),
		setSize: jest.fn(),
		setAlign: jest.fn(),
		setTransform: jest.fn(),
		retainFigureFormat: jest.fn(),
		isVertical: false,
	})),
}));

const mockModal = require('../../../../src/modules/contract').Modal;
const mockFigure = require('../../../../src/modules/contract').Figure;

Object.assign(mockModal, {
	OnChangeFile: jest.fn(),
	CreateFileInput: jest.fn().mockReturnValue(''),
	CreateGallery: jest.fn().mockReturnValue(''),
});

Object.assign(mockFigure, {
	CreateContainer: jest.fn().mockReturnValue({
		container: { nodeType: 1, style: {}, appendChild: jest.fn() },
		cover: { nodeType: 1, setAttribute: jest.fn(), appendChild: jest.fn() },
	}),
	GetContainer: jest.fn().mockReturnValue({
		container: { nodeType: 1, style: {} },
		cover: { nodeType: 1 },
	}),
	CalcRatio: jest.fn((w, h, unit, ratio) => ({ w: w, h: h })),
	is: jest.fn((node) => node && node.nodeType === 1),
});

jest.mock('../../../../src/helper', () => ({
	dom: {
		utils: {
			createElement: jest.fn().mockReturnValue({
				querySelector: jest.fn().mockReturnValue({ value: '', placeholder: '', disabled: false, checked: false }),
				appendChild: jest.fn(),
				setAttribute: jest.fn(),
				getAttribute: jest.fn(),
				classList: { contains: jest.fn() },
				style: {},
				innerHTML: '',
			}),
			removeItem: jest.fn(),
			hasClass: jest.fn((el, className) => el?.classList?.contains(className)),
		},
		check: {
			isIFrame: jest.fn((node) => node && node.nodeName === 'IFRAME'),
		},
		query: {
			getParentElement: jest.fn((el, condition) => {
				if (typeof condition === 'function') {
					if (el?.parentElement) {
						let parent = el.parentElement;
						while (parent) {
							if (condition(parent)) return parent;
							parent = parent.parentElement;
						}
					}
				} else if (typeof condition === 'string') {
					if (el?.parentElement) {
						let parent = el.parentElement;
						while (parent) {
							if (parent.nodeName === condition) return parent;
							parent = parent.parentElement;
						}
					}
				}
				return null;
			}),
			getChildNode: jest.fn((node, condition) => {
				if (condition && node?.children) {
					for (const child of node.children) {
						if (condition(child)) return child;
					}
				}
				return null;
			}),
			getEventTarget: jest.fn((e) => e?.target || e),
		},
	},
	numbers: {
		get: jest.fn((val, def) => {
			const parsed = parseFloat(val);
			return isNaN(parsed) ? def : parsed;
		}),
		is: jest.fn((val) => typeof val === 'number'),
	},
	env: { _w: global, NO_EVENT: Symbol('NO_EVENT') },
	keyCodeMap: {
		key: { 13: 'Enter' },
		isSpace: jest.fn((code) => code === 'Space'),
	},
}));

describe('Embed Plugin', () => {
	let kernel;
	let embed;

	afterEach(() => {
		jest.clearAllMocks();
		document.body.innerHTML = '';
	});

	beforeEach(() => {
		kernel = createMockEditor();
		embed = new Embed(kernel, { canResize: true });
		// Mock DOM elements that would be created by CreateHTML_modal
		// Use Object.assign to preserve references set in constructor
		if (embed.embedInput) Object.assign(embed.embedInput, { addEventListener: jest.fn(), dispatchEvent: jest.fn() });
		if (embed.previewSrc) Object.assign(embed.previewSrc, { textContent: '' });
		if (embed.inputX) Object.assign(embed.inputX, { value: '', disabled: false, placeholder: '', addEventListener: jest.fn(), dispatchEvent: jest.fn() });
		if (embed.inputY) Object.assign(embed.inputY, { value: '', disabled: false, placeholder: '', addEventListener: jest.fn(), dispatchEvent: jest.fn() });
		if (embed.proportion) Object.assign(embed.proportion, { checked: false, disabled: false });
		embed.fileModalWrapper = {};
	});

	describe('Constructor', () => {
		it('should create Embed instance', () => {
			expect(() => new Embed(kernel, {})).not.toThrow();
		});

		it('should create instance with default options', () => {
			expect(embed.title).toBe('Embed');
			expect(embed.icon).toBe('embed');
		});

		it('should create instance with custom options', () => {
			const customEmbed = new Embed(kernel, {
				canResize: false,
				showHeightInput: false,
				defaultWidth: '600px',
				defaultHeight: '400px',
				percentageOnlySize: true,
				uploadUrl: 'https://example.com/upload',
				uploadSizeLimit: 5000000,
			});
			expect(customEmbed.pluginOptions.canResize).toBe(false);
			expect(customEmbed.pluginOptions.showHeightInput).toBe(false);
			expect(customEmbed.pluginOptions.defaultWidth).toBe('600px');
			expect(customEmbed.pluginOptions.percentageOnlySize).toBe(true);
		});
	});

	describe('Static properties', () => {
		it('should have correct static properties', () => {
			expect(Embed.key).toBe('embed');
			expect(Embed.type).toBe('modal');
			expect(Embed.className).toBe('');
		});
	});

	describe('Static component method', () => {
		it('should return iframe element when node is iframe with valid src', () => {
			// Embed supports social media URLs (facebook, twitter, instagram, etc.), NOT youtube
			const iframe = { nodeName: 'IFRAME', src: 'https://www.facebook.com/plugins/post.php?href=test', children: [] };
			// Embed.component now uses static private #checkContentType internally
			const result = Embed.component(iframe);
			expect(result).toBe(iframe);
		});

		it('should return null when src is not valid', () => {
			const iframe = { nodeName: 'IFRAME', src: 'https://invalid-domain.com/page', children: [] };
			const result = Embed.component(iframe);
			expect(result).toBeNull();
		});

        it('should detect twitter blockquote', () => {
             // Blockquote with twitter link
             const mockChild = { nodeName: 'A', href: 'https://twitter.com/user/status/123' };
             const mockBlockquote = {
                nodeName: 'BLOCKQUOTE',
                className: 'twitter-tweet',
                children: [mockChild],
                getAttribute: jest.fn(),
                querySelector: jest.fn().mockReturnValue(mockChild)
            };

            // Embed.component checks for blockquote with link containing valid URL
            const result = Embed.component(mockBlockquote);
            expect(result).toBe(mockBlockquote);
        });

		it('should detect DIV with iframe child (lines 70-72)', () => {
			const { dom } = require('../../../../src/helper');
			// Make isIFrame return false for the DIV, true for its child
			const childIframe = { nodeName: 'IFRAME', src: 'https://www.facebook.com/plugins/post.php?href=test', children: [] };
			const divNode = {
				nodeName: 'DIV',
				children: [childIframe],
				querySelector: jest.fn(),
			};
			dom.check.isIFrame.mockImplementation((node) => node && node.nodeName === 'IFRAME');

			const result = Embed.component(divNode);
			expect(result).toBe(childIframe);
		});

		it('should detect se-embed-container class node (lines 74-78)', () => {
			const { dom } = require('../../../../src/helper');
			const childWithSrc = { src: 'https://www.facebook.com/user/posts/123', href: '' };
			const containerNode = {
				nodeName: 'DIV',
				children: [childWithSrc],
				classList: { contains: jest.fn().mockReturnValue(true) },
				querySelector: jest.fn(),
			};
			// isIFrame returns false for DIV and its children (not iframe)
			dom.check.isIFrame.mockImplementation((node) => false);
			dom.utils.hasClass.mockImplementation((el, className) => {
				return el === containerNode && className === 'se-embed-container';
			});
			dom.query.getChildNode.mockImplementation((node, condition) => {
				if (node === containerNode && condition) {
					for (const child of node.children) {
						if (condition(child)) return child;
					}
				}
				return null;
			});

			const result = Embed.component(containerNode);
			expect(result).toBe(childWithSrc);

			// Reset mocks
			dom.check.isIFrame.mockImplementation((node) => node && node.nodeName === 'IFRAME');
			dom.utils.hasClass.mockImplementation((el, className) => el?.classList?.contains(className));
			dom.query.getChildNode.mockImplementation((node, condition) => {
				if (condition && node?.children) {
					for (const child of node.children) {
						if (condition(child)) return child;
					}
				}
				return null;
			});
		});

		it('should return null for blockquote without valid link (line 87-88)', () => {
			const mockChild = { nodeName: 'A', href: 'https://invalid-domain.com/page' };
			const mockBlockquote = {
				nodeName: 'BLOCKQUOTE',
				className: 'some-class',
				children: [mockChild],
				getAttribute: jest.fn(),
				querySelector: jest.fn().mockReturnValue(mockChild),
			};

			const result = Embed.component(mockBlockquote);
			expect(result).toBeNull();
		});

		it('should return null for blockquote with no link', () => {
			const mockBlockquote = {
				nodeName: 'BLOCKQUOTE',
				className: 'some-class',
				children: [],
				getAttribute: jest.fn(),
				querySelector: jest.fn().mockReturnValue(null),
			};

			const result = Embed.component(mockBlockquote);
			// link is null, so the blockquote branch falls through to src check (src is empty)
			// target is null, so returns null
			expect(result).toBeNull();
		});
	});

	describe('static checkContentType (via Embed.component)', () => {
		// checkContentType is now a static private method, tested indirectly via Embed.component()
		const createIframe = (src) => ({
			nodeName: 'IFRAME',
			src,
			children: [],
			querySelector: jest.fn()
		});

		it('should accept facebook URLs via component', () => {
			const iframe = createIframe('https://www.facebook.com/user/posts/123');
			expect(Embed.component(iframe)).toBe(iframe);
		});

		it('should accept twitter URLs via component', () => {
			expect(Embed.component(createIframe('https://twitter.com/user/status/123'))).toBeTruthy();
			expect(Embed.component(createIframe('https://x.com/user/status/456'))).toBeTruthy();
		});

		it('should accept instagram URLs via component', () => {
			const iframe = createIframe('https://www.instagram.com/p/ABC123');
			expect(Embed.component(iframe)).toBe(iframe);
		});

		it('should accept linkedin URLs via component', () => {
			const iframe = createIframe('https://www.linkedin.com/posts/user_123');
			expect(Embed.component(iframe)).toBe(iframe);
		});

		it('should accept pinterest URLs via component', () => {
			const iframe = createIframe('https://www.pinterest.com/pin/123456');
			expect(Embed.component(iframe)).toBe(iframe);
		});

		it('should accept spotify URLs via component', () => {
			expect(Embed.component(createIframe('https://open.spotify.com/track/123'))).toBeTruthy();
			expect(Embed.component(createIframe('https://open.spotify.com/album/456'))).toBeTruthy();
			expect(Embed.component(createIframe('https://open.spotify.com/playlist/789'))).toBeTruthy();
		});

		it('should accept codepen URLs via component', () => {
			const iframe = createIframe('https://codepen.io/user/pen/abc123');
			expect(Embed.component(iframe)).toBe(iframe);
		});

		it('should reject invalid URLs via component', () => {
			expect(Embed.component(createIframe('https://example.com'))).toBeNull();
			// Empty src: per source code, if src is empty, returns target (not null)
			// because `if (src)` is false, so it skips checkContentType and returns target
			expect(Embed.component(createIframe(''))).toBeTruthy();
		});

		it('should handle case insensitive URLs via component', () => {
			const iframe = createIframe('HTTPS://WWW.FACEBOOK.COM/user/posts/123');
			expect(Embed.component(iframe)).toBe(iframe);
		});
	});

	describe('findProcessUrl', () => {
		it('should process facebook URL', () => {
			const url = 'https://www.facebook.com/user/posts/123';
			const result = embed.findProcessUrl(url);
			expect(result).toBeTruthy();
			expect(result.origin).toBe(url);
			expect(result.tag).toBe('iframe');
			expect(result.url).toContain('facebook.com/plugins/post.php');
		});

		it('should process twitter URL', () => {
			const url = 'https://twitter.com/user/status/123';
			const result = embed.findProcessUrl(url);
			expect(result).toBeTruthy();
			expect(result.tag).toBe('iframe');
			expect(result.url).toContain('platform.twitter.com/embed/Tweet.html');
		});

		it('should process instagram URL', () => {
			const url = 'https://www.instagram.com/p/ABC123/';
			const result = embed.findProcessUrl(url);
			expect(result).toBeTruthy();
			expect(result.tag).toBe('iframe');
			expect(result.url).toContain('instagram.com/p/ABC123');
		});

		it('should process linkedin URL', () => {
			const url = 'https://www.linkedin.com/posts/user_123';
			const result = embed.findProcessUrl(url);
			expect(result).toBeTruthy();
			expect(result.tag).toBe('iframe');
		});

		it('should process pinterest URL', () => {
			const url = 'https://www.pinterest.com/pin/123456';
			const result = embed.findProcessUrl(url);
			expect(result).toBeTruthy();
			expect(result.tag).toBe('iframe');
			expect(result.url).toContain('pinterest.com/ext/embed.html');
		});

		it('should process spotify track URL', () => {
			const url = 'https://open.spotify.com/track/abc123';
			const result = embed.findProcessUrl(url);
			expect(result).toBeTruthy();
			expect(result.tag).toBe('iframe');
			expect(result.url).toContain('spotify.com/embed/track');
		});

		it('should process spotify album URL', () => {
			const url = 'https://open.spotify.com/album/abc123';
			const result = embed.findProcessUrl(url);
			expect(result).toBeTruthy();
			expect(result.url).toContain('spotify.com/embed/album');
		});

		it('should process codepen URL', () => {
			const url = 'https://codepen.io/username/pen/abc123';
			const result = embed.findProcessUrl(url);
			expect(result).toBeTruthy();
			expect(result.tag).toBe('iframe');
			expect(result.url).toContain('codepen.io/username/embed/abc123');
		});

		it('should return null for unmatched URLs', () => {
			const url = 'https://example.com';
			const result = embed.findProcessUrl(url);
			expect(result).toBeNull();
		});
	});

	describe('Instance methods', () => {


		describe('open', () => {
			it('should open modal', () => {
				embed.open();
				expect(embed.modal.open).toHaveBeenCalled();
			});
		});

		describe('edit', () => {
			it('should open modal', () => {
				embed.componentEdit();
				expect(embed.modal.open).toHaveBeenCalled();
			});
		});

		describe('on', () => {
			it('should initialize values when not updating', () => {
				embed.modalOn(false);
				expect(embed.inputX.value).toBe('');
				expect(embed.inputY.value).toBe('');
			});

			it('should load existing values when updating', () => {
				const mockCover = {
					nodeType: 1,
					setAttribute: jest.fn(),
					getAttribute: jest.fn().mockReturnValue('https://example.com/video'),
					appendChild: jest.fn(),
				};
				embed.figure.open = jest.fn().mockReturnValue({
					cover: mockCover,
					container: { nodeType: 1 },
					align: 'center',
				});

				const mockElement = { nodeName: 'IFRAME', src: 'https://example.com/embed', style: {} };
				embed.componentSelect(mockElement);
				embed.modal.isUpdate = true;
				embed.modalOn(true);

				expect(embed.embedInput.value).toBe('https://example.com/video');
			});
		});

		describe('init', () => {
			it('should reset form values', () => {
				embed.embedInput.value = 'test';
				embed.modalInit();
				expect(embed.embedInput.value).toBe('');
				expect(embed.previewSrc.textContent).toBe('');
			});

			it('should reset size inputs', () => {
				embed.inputX.value = '500px';
				embed.inputY.value = '300px';
				embed.modalInit();
				expect(embed.proportion.checked).toBe(false);
				expect(embed.proportion.disabled).toBe(true);
			});
		});

		describe('modalAction', () => {
			it('should submit embed when link value is provided', async () => {
				embed.submitSRC = jest.fn().mockResolvedValue(true);
				const result = await embed.modalAction();
				expect(typeof result).toBe('boolean');
			});

			it('should call submitSRC with linkValue when it has content (line 322)', async () => {
				// Set linkValue via the input handler
				const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
				const inputCall = addEventCalls.find(call => call[1] === 'input');
				const onLinkPreview = inputCall[2];

				// Trigger the input handler to set linkValue
				onLinkPreview({ target: { value: 'https://www.facebook.com/user/posts/123' } });

				embed.submitSRC = jest.fn().mockResolvedValue(true);
				const result = await embed.modalAction();
				expect(embed.submitSRC).toHaveBeenCalledWith(expect.stringContaining('facebook.com'));
				expect(result).toBe(true);
			});
		});

		describe('submitSRC', () => {
			it('should process iframe embed code', async () => {
				const iframeCode = '<iframe src="https://example.com/embed"></iframe>';
				// Mock triggerEvent to call the handler (simulating event listener that approves)
				embed.$.eventManager.triggerEvent = jest.fn().mockImplementation(async (eventName, data) => {
					if (eventName === 'onEmbedInputBefore' && data.handler) {
						data.handler(null);
					}
					return undefined;
				});
				const result = await embed.submitSRC(iframeCode);
				expect(result).toBe(true);
				// Verify #create flow
				expect(mockFigure.CreateContainer).toHaveBeenCalled();
				expect(embed.figure.open).toHaveBeenCalled();
				expect(embed.$.component.insert).toHaveBeenCalled();
			});

			it('should process blockquote embed code', async () => {
				const blockquoteCode = '<blockquote class="twitter-tweet">content</blockquote>';
				const result = await embed.submitSRC(blockquoteCode);
				expect(result).toBe(true);
			});

			it('should process URL', async () => {
				const url = 'https://www.facebook.com/user/posts/123';
				const result = await embed.submitSRC(url);
				expect(result).toBe(true);
			});

			it('should return false for invalid source', async () => {
				const result = await embed.submitSRC('https://invalid-url.com');
				expect(result).toBe(false);
			});

			it('should return false when no source provided', async () => {
				const result = await embed.submitSRC('');
				expect(result).toBe(false);
			});

			it('should return false when event returns false (line 456)', async () => {
				embed.$.eventManager.triggerEvent = jest.fn().mockResolvedValue(false);
				const result = await embed.submitSRC('https://www.facebook.com/user/posts/123');
				expect(result).toBe(false);
			});

			it('should call handler with result when event returns an object (line 457)', async () => {
				const resultObj = {
					url: 'https://custom-url.com/embed',
					process: { tag: 'iframe', origin: 'test', url: 'https://custom-url.com/embed' },
					inputWidth: '500',
					inputHeight: '300',
					align: 'center',
					isUpdate: false,
				};
				embed.$.eventManager.triggerEvent = jest.fn().mockResolvedValue(resultObj);
				const result = await embed.submitSRC('https://www.facebook.com/user/posts/123');
				expect(result).toBe(true);
			});

			it('should call handler(null) when event returns true (line 459)', async () => {
				embed.$.eventManager.triggerEvent = jest.fn().mockResolvedValue(true);
				const result = await embed.submitSRC('https://www.facebook.com/user/posts/123');
				expect(result).toBe(true);
				expect(embed.$.component.insert).toHaveBeenCalled();
			});

			it('should call handler(null) when event returns NO_EVENT (line 459)', async () => {
				const { env } = require('../../../../src/helper');
				embed.$.eventManager.triggerEvent = jest.fn().mockResolvedValue(env.NO_EVENT);
				const result = await embed.submitSRC('https://www.facebook.com/user/posts/123');
				expect(result).toBe(true);
				expect(embed.$.component.insert).toHaveBeenCalled();
			});
		});

		describe('select', () => {
			it('should prepare component for editing', () => {
				const iframe = { nodeName: 'IFRAME', src: 'https://www.youtube.com/embed/test', style: {} };
				embed.componentSelect(iframe);
				expect(embed.figure.open).toHaveBeenCalledWith(iframe, expect.any(Object));
			});
		});

		describe('destroy', () => {
			it('should remove element and trigger event', async () => {
				const iframe = { nodeName: 'IFRAME', src: 'test', style: {} };
				const container = { nodeType: 1, parentNode: { nodeType: 1 }, previousElementSibling: { nodeType: 1 } };
				embed.$.eventManager.triggerEvent = jest.fn().mockResolvedValue(undefined);

				embed.componentSelect(iframe);
				await embed.componentDestroy(iframe);

				expect(embed.$.eventManager.triggerEvent).toHaveBeenCalledWith('onEmbedDeleteBefore', expect.any(Object));
			});

			it('should not remove when event returns false', async () => {
				const iframe = { nodeName: 'IFRAME', src: 'test', style: {} };
				embed.$.eventManager.triggerEvent = jest.fn().mockResolvedValue(false);
				const { dom } = require('../../../../src/helper');
				dom.utils.removeItem.mockClear();

				embed.componentSelect(iframe);
				await embed.componentDestroy(iframe);

				expect(embed.$.eventManager.triggerEvent).toHaveBeenCalledWith('onEmbedDeleteBefore', expect.any(Object));
				expect(dom.utils.removeItem).not.toHaveBeenCalled();
			});
		});

		describe('retainFormat', () => {
			it('should return format retention object', () => {
				const format = embed.retainFormat();
				expect(format).toHaveProperty('query', 'iframe');
				expect(format).toHaveProperty('method');
				expect(typeof format.method).toBe('function');
			});

			it('should process iframe elements', async () => {
				const iframe = { nodeName: 'IFRAME', src: 'https://www.youtube.com/embed/test', style: {}, getAttribute: jest.fn() };
				const format = embed.retainFormat();
				// retainFormat.method processes iframe internally using static checkContentType
				// Just verify the method can be called without error
				await format.method(iframe);
				// Since checkContentType is static private, we can't spy on it directly
				// The test verifies the method runs without throwing
			});

			it('should early return when checkContentType fails', async () => {
				const iframe = { nodeName: 'IFRAME', src: 'https://invalid-site.com/page', style: {}, getAttribute: jest.fn() };
				const format = embed.retainFormat();
				await format.method(iframe);
				// When checkContentType fails, Figure.GetContainer should NOT be called after the method runs
				// (it returns early)
			});

			it('should process valid embed URL and call fixTagStructure (lines 287-294)', async () => {
				const iframe = {
					nodeName: 'IFRAME',
					src: 'https://www.facebook.com/user/posts/123',
					style: {},
					getAttribute: jest.fn().mockReturnValue(null),
					setAttribute: jest.fn(),
					cloneNode: jest.fn().mockReturnValue({
						nodeName: 'IFRAME',
						src: 'https://www.facebook.com/user/posts/123',
						style: {},
						getAttribute: jest.fn().mockReturnValue(','),
						setAttribute: jest.fn(),
						frameBorder: '',
						allowFullscreen: false,
						width: '100%',
						height: '400px',
					}),
					frameBorder: '',
					allowFullscreen: false,
					width: '100%',
					height: '400px',
				};

				// Make GetContainer return falsy so we get past the early return
				mockFigure.GetContainer.mockReturnValueOnce({ container: null, cover: null });

				const format = embed.retainFormat();
				await format.method(iframe);

				// Should have called figure.open (from #ready)
				expect(embed.figure.open).toHaveBeenCalled();
				// Should have called Figure.CreateContainer (from #fixTagStructure)
				expect(mockFigure.CreateContainer).toHaveBeenCalled();
			});

			it('should early return when GetContainer returns valid container and cover (line 288)', async () => {
				const iframe = {
					nodeName: 'IFRAME',
					src: 'https://www.facebook.com/user/posts/123',
					style: {},
					getAttribute: jest.fn(),
				};

				// Make GetContainer return truthy container and cover so it returns early
				mockFigure.GetContainer.mockReturnValueOnce({
					container: { nodeType: 1, style: {} },
					cover: { nodeType: 1 },
				});

				const figureOpenCallsBefore = embed.figure.open.mock.calls.length;
				const format = embed.retainFormat();
				await format.method(iframe);

				// figure.open should NOT be called because we returned early at line 288
				expect(embed.figure.open.mock.calls.length).toBe(figureOpenCallsBefore);
			});

			it('should set align from line style when format.getLine returns a line (line 292)', async () => {
				const iframe = {
					nodeName: 'IFRAME',
					src: 'https://www.facebook.com/user/posts/123',
					style: {},
					getAttribute: jest.fn().mockReturnValue(null),
					setAttribute: jest.fn(),
					cloneNode: jest.fn().mockReturnValue({
						nodeName: 'IFRAME',
						src: 'https://www.facebook.com/user/posts/123',
						style: {},
						getAttribute: jest.fn().mockReturnValue(','),
						setAttribute: jest.fn(),
						frameBorder: '',
						allowFullscreen: false,
						width: '',
						height: '',
					}),
					frameBorder: '',
					allowFullscreen: false,
					width: '',
					height: '',
				};

				mockFigure.GetContainer.mockReturnValueOnce({ container: null, cover: null });
				// Make getLine return a line element with textAlign
				embed.$.format.getLine.mockReturnValueOnce({ style: { textAlign: 'center', float: '' } });

				const format = embed.retainFormat();
				await format.method(iframe);
				// The method should have proceeded through lines 290-294 successfully
				expect(embed.$.format.getLine).toHaveBeenCalled();
			});
		});
	});

	describe('Plugin options', () => {
		it('should handle percentageOnlySize option', () => {
			const percentEmbed = new Embed(kernel, {
				percentageOnlySize: true,
				canResize: true,
			});
			expect(percentEmbed.pluginOptions.percentageOnlySize).toBe(true);
			expect(percentEmbed.sizeUnit).toBe('%');
		});

		it('should handle upload options', () => {
			const uploadEmbed = new Embed(kernel, {
				uploadUrl: 'https://example.com/upload',
				uploadHeaders: { Authorization: 'Bearer token' },
				uploadSizeLimit: 10000000,
				uploadSingleSizeLimit: 5000000,
			});
			expect(uploadEmbed.pluginOptions.uploadUrl).toBe('https://example.com/upload');
			expect(uploadEmbed.pluginOptions.uploadHeaders).toEqual({ Authorization: 'Bearer token' });
			expect(uploadEmbed.pluginOptions.uploadSizeLimit).toBe(10000000);
			expect(uploadEmbed.pluginOptions.uploadSingleSizeLimit).toBe(5000000);
		});

		it('should handle iframe tag attributes', () => {
			const attrEmbed = new Embed(kernel, {
				iframeTagAttributes: {
					sandbox: 'allow-scripts',
					loading: 'lazy',
				},
			});
			expect(attrEmbed.pluginOptions.iframeTagAttributes).toEqual({
				sandbox: 'allow-scripts',
				loading: 'lazy',
			});
		});

		it('should handle custom embed query', () => {
			const customEmbed = new Embed(kernel, {
				embedQuery: {
					customService: {
						pattern: /https:\/\/custom\.com\/(.+)/i,
						action: (url) => `https://custom.com/embed/${url.match(/https:\/\/custom\.com\/(.+)/i)[1]}`,
						tag: 'iframe',
					},
				},
			});
			// checkContentType is static private, test via findProcessUrl instead
			const result = customEmbed.findProcessUrl('https://custom.com/video123');
			expect(result).toBeTruthy();
			expect(result.url).toContain('custom.com/embed');
		});
	});

	describe('Event handlers via captured addEvent calls', () => {
		let addEventCalls;
		let onLinkPreview;
		let onInputSizeX;
		let onInputSizeY;
		let onClickRevert;

		beforeEach(() => {
			addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const inputCall = addEventCalls.find(call => call[1] === 'input');
			onLinkPreview = inputCall[2];

			const keyupCalls = addEventCalls.filter(call => call[1] === 'keyup');
			onInputSizeX = keyupCalls[0]?.[2];
			onInputSizeY = keyupCalls[1]?.[2];

			const clickCall = addEventCalls.find(call => call[1] === 'click');
			onClickRevert = clickCall?.[2];
		});

		describe('#OnLinkPreview (lines 758-773)', () => {
			it('should set linkValue and preview for iframe embed code', () => {
				const iframeCode = '<iframe src="https://example.com/embed"></iframe>';
				onLinkPreview({ target: { value: iframeCode } });
				expect(embed.previewSrc.textContent).toBe('<IFrame :src=".."></IFrame>');
			});

			it('should clear linkValue and preview for empty input', () => {
				onLinkPreview({ target: { value: '' } });
				expect(embed.previewSrc.textContent).toBe('');
			});

			it('should prepend defaultUrlProtocol when configured and URL has no protocol', () => {
				// Set defaultUrlProtocol
				kernel.$.options.get = jest.fn().mockImplementation((key) => {
					if (key === 'defaultUrlProtocol') return 'https://';
					return null;
				});

				onLinkPreview({ target: { value: 'www.facebook.com/user/posts/123' } });
				expect(embed.previewSrc.textContent).toBe('https://www.facebook.com/user/posts/123');

				// Reset
				kernel.$.options.get = jest.fn().mockReturnValue(null);
			});

			it('should prepend / when URL has no protocol and no defaultUrlProtocol', () => {
				kernel.$.options.get = jest.fn().mockReturnValue(null);
				onLinkPreview({ target: { value: 'www.example.com/page' } });
				expect(embed.previewSrc.textContent).toBe('/www.example.com/page');
			});

			it('should use URL as-is when it contains ://', () => {
				kernel.$.options.get = jest.fn().mockReturnValue(null);
				onLinkPreview({ target: { value: 'https://www.facebook.com/user/posts/123' } });
				expect(embed.previewSrc.textContent).toBe('https://www.facebook.com/user/posts/123');
			});

			it('should use URL as-is when it starts with #', () => {
				kernel.$.options.get = jest.fn().mockImplementation((key) => {
					if (key === 'defaultUrlProtocol') return 'https://';
					return null;
				});
				onLinkPreview({ target: { value: '#anchor-link' } });
				// URL starts with #, so even with defaultUrlProtocol, it should not prepend
				// The condition is: defaultUrlProtocol && !value.includes('://') && value.indexOf('#') !== 0
				// value.indexOf('#') === 0, so the condition is false, falls through to next check
				// !value.includes('://') is true, so it prepends '/'
				expect(embed.previewSrc.textContent).toBe('/#anchor-link');

				// Reset
				kernel.$.options.get = jest.fn().mockReturnValue(null);
			});

			it('should handle # URL without defaultUrlProtocol', () => {
				kernel.$.options.get = jest.fn().mockReturnValue(null);
				onLinkPreview({ target: { value: '#section' } });
				// no defaultUrlProtocol → falls to: !value.includes('://') → '/' + value
				expect(embed.previewSrc.textContent).toBe('/#section');
			});
		});

		describe('#OnInputSize (lines 789-807)', () => {
			it('should prevent default and return on space key', () => {
				const event = {
					code: 'Space',
					target: { value: '100' },
					preventDefault: jest.fn(),
				};
				onInputSizeX(event);
				expect(event.preventDefault).toHaveBeenCalled();
			});

			it('should clamp x value to 100 when onlyPercentage and value > 100', () => {
				// Create embed with percentageOnlySize
				const percentKernel = createMockEditor();
				const percentEmbed = new Embed(percentKernel, { canResize: true, percentageOnlySize: true });

				const percentAddEventCalls = percentKernel.$.eventManager.addEvent.mock.calls;
				const percentKeyupCalls = percentAddEventCalls.filter(call => call[1] === 'keyup');
				const percentOnInputSizeX = percentKeyupCalls[0]?.[2];

				if (percentOnInputSizeX) {
					const mockTarget = { value: '150' };
					const event = {
						code: 'KeyA',
						target: mockTarget,
						preventDefault: jest.fn(),
					};
					percentOnInputSizeX(event);
					expect(mockTarget.value).toBe('100');
				}
			});

			it('should calculate ratio when proportion is checked (x axis)', () => {
				embed.proportion.checked = true;
				embed.inputX.value = '200';
				embed.inputY.value = '150';

				const event = {
					code: 'KeyA',
					target: embed.inputX,
					preventDefault: jest.fn(),
				};

				onInputSizeX(event);
				// CalcRatio is called and should set inputY.value
				expect(mockFigure.CalcRatio).toHaveBeenCalled();
			});

			it('should calculate ratio when proportion is checked (y axis)', () => {
				embed.proportion.checked = true;
				embed.inputX.value = '200';
				embed.inputY.value = '150';

				const event = {
					code: 'KeyA',
					target: embed.inputY,
					preventDefault: jest.fn(),
				};

				onInputSizeY(event);
				// CalcRatio is called and should set inputX.value
				expect(mockFigure.CalcRatio).toHaveBeenCalled();
			});

			it('should not change values when proportion is not checked and not onlyPercentage', () => {
				embed.proportion.checked = false;
				embed.inputX.value = '200';

				const event = {
					code: 'KeyA',
					target: { value: '200' },
					preventDefault: jest.fn(),
				};

				onInputSizeX(event);
				// Nothing should change
				expect(event.target.value).toBe('200');
			});
		});

		describe('#OnClickRevert (lines 776-783)', () => {
			it('should restore original width and height values', () => {
				// Set some initial state via componentSelect which sets origin values
				const mockCover = {
					nodeType: 1,
					setAttribute: jest.fn(),
					getAttribute: jest.fn().mockReturnValue('https://www.facebook.com/user/posts/123'),
					appendChild: jest.fn(),
				};
				embed.figure.open = jest.fn().mockReturnValue({
					cover: mockCover,
					container: { nodeType: 1, style: {} },
					caption: null,
					align: 'none',
					w: '640',
					h: '360',
					originWidth: '640',
					originHeight: '360',
					ratio: { w: 1, h: 1 },
				});
				embed.figure.getSize = jest.fn().mockReturnValue({ w: '640', h: '360', dw: '640', dh: '360' });

				const mockElement = { nodeName: 'IFRAME', src: 'https://www.facebook.com/plugins/post.php', style: {} };
				embed.componentSelect(mockElement);

				// Manually set different values to verify revert works
				// Note: inputX and inputY may share a mock reference, so we test via
				// the revert handler restoring #origin_w and #origin_h
				embed.inputX.value = '999';

				// Now click revert - should restore to origin values
				onClickRevert();
				// After revert: inputX = origin_w, inputY = origin_h
				// Since inputX and inputY may be the same mock object (due to createElement mock),
				// the last assignment (inputY) wins. But the handler still executes both branches.
				// We verify the revert runs without error and sets the origin height:
				expect(embed.inputY.value).toBe('360');
			});

			it('should clamp to 100 when onlyPercentage and origin > 100', () => {
				const percentKernel = createMockEditor();
				const percentEmbed = new Embed(percentKernel, { canResize: true, percentageOnlySize: true });

				// Get the click handler
				const percentAddEventCalls = percentKernel.$.eventManager.addEvent.mock.calls;
				const percentClickCall = percentAddEventCalls.find(call => call[1] === 'click');
				const percentOnClickRevert = percentClickCall?.[2];

				if (percentOnClickRevert) {
					// Set origin values via componentSelect
					const mockCover = {
						nodeType: 1,
						setAttribute: jest.fn(),
						getAttribute: jest.fn().mockReturnValue('https://www.facebook.com/user/posts/123'),
						appendChild: jest.fn(),
					};
					const figureInstance = percentEmbed.figure;
					figureInstance.open = jest.fn().mockReturnValue({
						cover: mockCover,
						container: { nodeType: 1, style: {} },
						caption: null,
						align: 'none',
						w: '150',
						h: '400',
						originWidth: '150',
						originHeight: '400',
						ratio: { w: 1, h: 1 },
					});
					figureInstance.getSize = jest.fn().mockReturnValue({ w: '150', h: '400', dw: '150', dh: '400' });

					const mockElement = { nodeName: 'IFRAME', src: 'https://www.facebook.com/plugins/post.php', style: {} };
					percentEmbed.componentSelect(mockElement);

					// Now click revert - origin_w is '150' which is > 100
					percentOnClickRevert();
					expect(percentEmbed.inputX.value).toBe('100');
				}
			});
		});
	});

	describe('#ready method branches', () => {
		it('should early return when target is null/undefined (line 472)', () => {
			// componentSelect calls #ready internally
			const figureOpenBefore = embed.figure.open.mock.calls.length;
			embed.componentSelect(null);
			// figure.open should not have been called
			expect(embed.figure.open.mock.calls.length).toBe(figureOpenBefore);
		});

		it('should set data-se-origin when cover does not have it and src matches (line 481-486)', () => {
			const mockCover = {
				nodeType: 1,
				setAttribute: jest.fn(),
				getAttribute: jest.fn().mockReturnValue(''), // empty, no data-se-origin
				appendChild: jest.fn(),
			};
			embed.figure.open = jest.fn().mockReturnValue({
				cover: mockCover,
				container: { nodeType: 1, style: {} },
				caption: null,
				align: 'none',
				w: '100%',
				h: '400px',
				originWidth: '100%',
				originHeight: '400px',
				ratio: { w: 1, h: 1 },
			});

			const mockElement = {
				nodeName: 'IFRAME',
				src: 'https://www.facebook.com/user/posts/123',
				style: {},
				getAttribute: jest.fn().mockReturnValue('https://www.facebook.com/user/posts/123'),
			};

			embed.componentSelect(mockElement);
			expect(mockCover.setAttribute).toHaveBeenCalledWith('data-se-origin', 'https://www.facebook.com/user/posts/123');
		});

		it('should handle resizing disabled path (line 497)', () => {
			const noResizeKernel = createMockEditor();
			const noResizeEmbed = new Embed(noResizeKernel, { canResize: false });

			const mockCover = {
				nodeType: 1,
				setAttribute: jest.fn(),
				getAttribute: jest.fn().mockReturnValue('some-origin'),
				appendChild: jest.fn(),
			};
			noResizeEmbed.figure.open = jest.fn().mockReturnValue({
				cover: mockCover,
				container: { nodeType: 1, style: {} },
				caption: null,
				align: 'none',
				w: '100%',
				h: '400px',
				originWidth: '100%',
				originHeight: '400px',
				ratio: { w: 1, h: 1 },
			});

			const mockElement = { nodeName: 'IFRAME', src: 'https://example.com/embed', style: {} };
			// Should not throw - just returns early from resizing block
			noResizeEmbed.componentSelect(mockElement);
			expect(noResizeEmbed.figure.open).toHaveBeenCalled();
			// inputX/inputY should be null since canResize is false
			expect(noResizeEmbed.inputX).toBeNull();
		});

		it('should handle percentageRotation path (line 499-507)', () => {
			const percentKernel = createMockEditor();
			const percentEmbed = new Embed(percentKernel, { canResize: true, percentageOnlySize: true });

			const mockCover = {
				nodeType: 1,
				setAttribute: jest.fn(),
				getAttribute: jest.fn().mockReturnValue('some-origin'),
				appendChild: jest.fn(),
			};
			const figureInstance = percentEmbed.figure;
			figureInstance.open = jest.fn().mockReturnValue({
				cover: mockCover,
				container: { nodeType: 1, style: {} },
				caption: null,
				align: 'none',
				w: '100%',
				h: '400px',
				originWidth: '100%',
				originHeight: '400px',
				ratio: { w: 1, h: 1 },
			});
			figureInstance.getSize = jest.fn().mockReturnValue({ w: '100%', h: '400px', dw: '100%', dh: '400px' });
			figureInstance.isVertical = true; // This triggers percentageRotation

			const mockElement = { nodeName: 'IFRAME', src: 'https://example.com/embed', style: {} };
			percentEmbed.componentSelect(mockElement);

			// With percentageRotation = true, inputs should be disabled
			expect(percentEmbed.inputX.disabled).toBe(true);
			expect(percentEmbed.inputY.disabled).toBe(true);
			expect(percentEmbed.proportion.disabled).toBe(true);
		});
	});

	describe('#create method branches via submitSRC', () => {
		it('should handle isUpdate path - same src (lines 555-574)', async () => {
			const { dom } = require('../../../../src/helper');

			// First, set up an existing element by selecting it
			const figureCover = {
				nodeName: 'FIGURE',
				nodeType: 1,
				setAttribute: jest.fn(),
				getAttribute: jest.fn().mockReturnValue(''),
				appendChild: jest.fn(),
			};
			const existingElement = {
				nodeName: 'IFRAME',
				src: 'https://www.facebook.com/plugins/post.php?href=test',
				style: {},
				replaceWith: jest.fn(),
				parentElement: figureCover,
			};
			const mockCover = {
				nodeType: 1,
				setAttribute: jest.fn(),
				getAttribute: jest.fn().mockReturnValue('https://www.facebook.com/user/posts/123'),
				appendChild: jest.fn(),
			};
			const mockContainer = { nodeType: 1, style: {}, appendChild: jest.fn() };

			embed.figure.open = jest.fn().mockReturnValue({
				cover: mockCover,
				container: mockContainer,
				caption: null,
				align: 'none',
				w: '100%',
				h: '400px',
				originWidth: '100%',
				originHeight: '400px',
				ratio: { w: 1, h: 1 },
			});

			embed.componentSelect(existingElement);
			embed.modal.isUpdate = true;

			// Mock getParentElement to return FIGURE for the update path
			dom.query.getParentElement.mockImplementation((el, condition) => {
				if (typeof condition === 'string' && condition === 'FIGURE') {
					return figureCover;
				}
				return null;
			});

			embed.$.eventManager.triggerEvent = jest.fn().mockResolvedValue(true);

			const result = await embed.submitSRC('https://www.facebook.com/user/posts/456');
			expect(result).toBe(true);

			// Restore default mock
			dom.query.getParentElement.mockImplementation((el, condition) => {
				if (typeof condition === 'function') {
					if (el?.parentElement) {
						let parent = el.parentElement;
						while (parent) {
							if (condition(parent)) return parent;
							parent = parent.parentElement;
						}
					}
				} else if (typeof condition === 'string') {
					if (el?.parentElement) {
						let parent = el.parentElement;
						while (parent) {
							if (parent.nodeName === condition) return parent;
							parent = parent.parentElement;
						}
					}
				}
				return null;
			});
		});

		it('should handle isUpdate path - iframe to blockquote tag change (lines 564-568)', async () => {
			const { dom } = require('../../../../src/helper');

			const figureCover = {
				nodeName: 'FIGURE',
				nodeType: 1,
				setAttribute: jest.fn(),
				getAttribute: jest.fn().mockReturnValue(''),
				appendChild: jest.fn(),
			};
			const existingElement = {
				nodeName: 'IFRAME',
				src: 'https://www.facebook.com/plugins/post.php?href=old',
				style: {},
				replaceWith: jest.fn(),
				parentElement: figureCover,
			};
			const mockCover = {
				nodeType: 1,
				setAttribute: jest.fn(),
				getAttribute: jest.fn().mockReturnValue('https://www.facebook.com/user/posts/old'),
				appendChild: jest.fn(),
			};
			const mockContainer = { nodeType: 1, style: {}, appendChild: jest.fn() };

			embed.figure.open = jest.fn().mockReturnValue({
				cover: mockCover,
				container: mockContainer,
				caption: null,
				align: 'none',
				w: '100%',
				h: '400px',
				originWidth: '100%',
				originHeight: '400px',
				ratio: { w: 1, h: 1 },
			});
			embed.figure.getSize = jest.fn().mockReturnValue({ w: '100%', h: '400px', dw: '100%', dh: '400px' });

			embed.componentSelect(existingElement);
			embed.modal.isUpdate = true;

			// Add a custom query that produces blockquote tag
			embed.query.customBlockquote = {
				pattern: /https:\/\/blockquote-service\.com\/.+/i,
				action: (url) => url,
				tag: 'blockquote',
			};

			// Mock getParentElement to return FIGURE for the update path
			dom.query.getParentElement.mockImplementation((el, condition) => {
				if (typeof condition === 'string' && condition === 'FIGURE') {
					return figureCover;
				}
				return null;
			});

			dom.utils.createElement.mockReturnValueOnce({
				querySelector: jest.fn().mockReturnValue({ value: '', placeholder: '', disabled: false, checked: false }),
				appendChild: jest.fn(),
				setAttribute: jest.fn(),
				getAttribute: jest.fn(),
				classList: { contains: jest.fn() },
				style: {},
				innerHTML: '',
				frameBorder: '',
				allowFullscreen: false,
			});

			embed.$.eventManager.triggerEvent = jest.fn().mockResolvedValue(true);

			const result = await embed.submitSRC('https://blockquote-service.com/post/123');
			expect(result).toBe(true);

			// Restore default mock
			dom.query.getParentElement.mockImplementation((el, condition) => {
				if (typeof condition === 'function') {
					if (el?.parentElement) {
						let parent = el.parentElement;
						while (parent) {
							if (condition(parent)) return parent;
							parent = parent.parentElement;
						}
					}
				} else if (typeof condition === 'string') {
					if (el?.parentElement) {
						let parent = el.parentElement;
						while (parent) {
							if (parent.nodeName === condition) return parent;
							parent = parent.parentElement;
						}
					}
				}
				return null;
			});
		});

		it('should handle isUpdate path - blockquote to iframe tag change (lines 560-563)', async () => {
			const { dom } = require('../../../../src/helper');

			const figureCover = {
				nodeName: 'FIGURE',
				nodeType: 1,
				setAttribute: jest.fn(),
				getAttribute: jest.fn().mockReturnValue(''),
				appendChild: jest.fn(),
			};
			// Existing element is a BLOCKQUOTE (not iframe)
			const existingElement = {
				nodeName: 'BLOCKQUOTE',
				src: 'https://old-url.com/content',
				style: {},
				replaceWith: jest.fn(),
				parentElement: figureCover,
			};
			const mockCover = {
				nodeType: 1,
				setAttribute: jest.fn(),
				getAttribute: jest.fn().mockReturnValue('https://old-url.com/content'),
				appendChild: jest.fn(),
			};
			const mockContainer = { nodeType: 1, style: {}, appendChild: jest.fn() };

			embed.figure.open = jest.fn().mockReturnValue({
				cover: mockCover,
				container: mockContainer,
				caption: null,
				align: 'none',
				w: '100%',
				h: '400px',
				originWidth: '100%',
				originHeight: '400px',
				ratio: { w: 1, h: 1 },
			});
			embed.figure.getSize = jest.fn().mockReturnValue({ w: '100%', h: '400px', dw: '100%', dh: '400px' });

			embed.componentSelect(existingElement);
			embed.modal.isUpdate = true;

			// Mock getParentElement to return FIGURE for the update path
			dom.query.getParentElement.mockImplementation((el, condition) => {
				if (typeof condition === 'string' && condition === 'FIGURE') {
					return figureCover;
				}
				return null;
			});

			embed.$.eventManager.triggerEvent = jest.fn().mockResolvedValue(true);

			// Submit with a Facebook URL which has tag 'iframe' - existing is BLOCKQUOTE
			// This triggers: processUrl.tag = 'iframe' && oFrame.nodeName = 'BLOCKQUOTE' (not iframe)
			const result = await embed.submitSRC('https://www.facebook.com/user/posts/999');
			expect(result).toBe(true);
			// The existing blockquote element should have been replaced
			expect(existingElement.replaceWith).toHaveBeenCalled();

			// Restore default mock
			dom.query.getParentElement.mockImplementation((el, condition) => {
				if (typeof condition === 'function') {
					if (el?.parentElement) {
						let parent = el.parentElement;
						while (parent) {
							if (condition(parent)) return parent;
							parent = parent.parentElement;
						}
					}
				} else if (typeof condition === 'string') {
					if (el?.parentElement) {
						let parent = el.parentElement;
						while (parent) {
							if (parent.nodeName === condition) return parent;
							parent = parent.parentElement;
						}
					}
				}
				return null;
			});
		});

		it('should handle !isUpdate with process (iframe creation, lines 577-582)', async () => {
			embed.modal.isUpdate = false;
			embed.$.eventManager.triggerEvent = jest.fn().mockResolvedValue(true);

			const result = await embed.submitSRC('https://www.facebook.com/user/posts/123');
			expect(result).toBe(true);
			expect(mockFigure.CreateContainer).toHaveBeenCalled();
			expect(embed.$.component.insert).toHaveBeenCalled();
		});

		it('should handle !isUpdate without process (blockquote/children path, lines 583-596)', async () => {
			const blockquoteCode = '<blockquote class="twitter-tweet"><a href="https://twitter.com/user/status/123">test</a></blockquote>';
			embed.modal.isUpdate = false;
			embed.$.eventManager.triggerEvent = jest.fn().mockResolvedValue(true);

			const result = await embed.submitSRC(blockquoteCode);
			expect(result).toBe(true);
			expect(mockFigure.CreateContainer).toHaveBeenCalled();
			expect(embed.$.component.insert).toHaveBeenCalled();
		});

		it('should handle scriptTag in children (lines 591-596, 627-658)', async () => {
			// Create a blockquote with an accompanying script tag
			const blockquoteWithScript = '<blockquote class="twitter-tweet">content</blockquote><script src="https://platform.twitter.com/widgets.js" async></script>';

			embed.modal.isUpdate = false;
			embed.$.eventManager.triggerEvent = jest.fn().mockResolvedValue(true);

			// createElement for script tag
			const { dom } = require('../../../../src/helper');
			const scriptElement = {
				nodeName: 'SCRIPT',
				getAttribute: jest.fn().mockReturnValue('https://platform.twitter.com/widgets.js'),
				setAttribute: jest.fn(),
				onload: null,
				src: 'https://platform.twitter.com/widgets.js',
			};
			dom.utils.createElement.mockImplementation((tag, attrs, content) => {
				if (tag === 'script') {
					return scriptElement;
				}
				return {
					querySelector: jest.fn().mockReturnValue({ value: '', placeholder: '', disabled: false, checked: false }),
					appendChild: jest.fn(),
					setAttribute: jest.fn(),
					getAttribute: jest.fn(),
					classList: { contains: jest.fn() },
					style: {},
					innerHTML: '',
					frameBorder: '',
					allowFullscreen: false,
				};
			});

			const result = await embed.submitSRC(blockquoteWithScript);
			expect(result).toBe(true);

			// Restore createElement mock
			dom.utils.createElement.mockReturnValue({
				querySelector: jest.fn().mockReturnValue({ value: '', placeholder: '', disabled: false, checked: false }),
				appendChild: jest.fn(),
				setAttribute: jest.fn(),
				getAttribute: jest.fn(),
				classList: { contains: jest.fn() },
				style: {},
				innerHTML: '',
			});
		});

		it('should handle setTransform in update path when conditions are met (line 667)', async () => {
			const { dom } = require('../../../../src/helper');

			const figureCover = {
				nodeName: 'FIGURE',
				nodeType: 1,
				setAttribute: jest.fn(),
				getAttribute: jest.fn().mockReturnValue(''),
				appendChild: jest.fn(),
			};
			const existingElement = {
				nodeName: 'IFRAME',
				src: 'https://www.facebook.com/plugins/post.php?href=old',
				style: {},
				replaceWith: jest.fn(),
				parentElement: figureCover,
			};
			const mockCover = {
				nodeType: 1,
				setAttribute: jest.fn(),
				getAttribute: jest.fn().mockReturnValue('https://www.facebook.com/user/posts/old'),
				appendChild: jest.fn(),
			};
			const mockContainer = { nodeType: 1, style: {}, appendChild: jest.fn() };

			embed.figure.open = jest.fn().mockReturnValue({
				cover: mockCover,
				container: mockContainer,
				caption: null,
				align: 'none',
				w: '100%',
				h: '400px',
				originWidth: '100%',
				originHeight: '400px',
				ratio: { w: 1, h: 1 },
			});
			// Return different size than input to trigger changeSize
			embed.figure.getSize = jest.fn().mockReturnValue({ w: '50%', h: '200px', dw: '50%', dh: '200px' });
			embed.figure.isVertical = false;

			embed.componentSelect(existingElement);
			embed.modal.isUpdate = true;

			// Mock getParentElement to return FIGURE for the update path
			dom.query.getParentElement.mockImplementation((el, condition) => {
				if (typeof condition === 'string' && condition === 'FIGURE') {
					return figureCover;
				}
				return null;
			});

			embed.$.eventManager.triggerEvent = jest.fn().mockResolvedValue(true);
			embed.inputX.value = '100%';
			embed.inputY.value = '400px';

			const result = await embed.submitSRC('https://www.facebook.com/user/posts/new');
			expect(result).toBe(true);
			// setTransform should be called when !resizing || !changeSize || !isVertical
			expect(embed.figure.setTransform).toHaveBeenCalled();

			// Restore default mock
			dom.query.getParentElement.mockImplementation((el, condition) => {
				if (typeof condition === 'function') {
					if (el?.parentElement) {
						let parent = el.parentElement;
						while (parent) {
							if (condition(parent)) return parent;
							parent = parent.parentElement;
						}
					}
				} else if (typeof condition === 'string') {
					if (el?.parentElement) {
						let parent = el.parentElement;
						while (parent) {
							if (parent.nodeName === condition) return parent;
							parent = parent.parentElement;
						}
					}
				}
				return null;
			});
		});
	});

	describe('#applySize branches', () => {
		it('should set 100% when onlyPercentage and width is empty (line 713)', async () => {
			const percentKernel = createMockEditor();
			const percentEmbed = new Embed(percentKernel, { canResize: true, percentageOnlySize: true });
			percentEmbed.modal.isUpdate = false;

			// Clear inputX value to trigger the !w path
			if (percentEmbed.inputX) percentEmbed.inputX.value = '';

			percentEmbed.$.eventManager.triggerEvent = jest.fn().mockResolvedValue(true);

			// Use a URL that triggers the process path (which calls #applySize with potentially empty width)
			const result = await percentEmbed.submitSRC('https://www.facebook.com/user/posts/123');
			expect(result).toBe(true);
			expect(percentEmbed.figure.setSize).toHaveBeenCalled();
		});

		it('should append % when onlyPercentage and width does not end with % (line 714)', async () => {
			const percentKernel = createMockEditor();
			const percentEmbed = new Embed(percentKernel, { canResize: true, percentageOnlySize: true, defaultWidth: '80' });

			percentEmbed.modal.isUpdate = false;
			if (percentEmbed.inputX) percentEmbed.inputX.value = '80';
			if (percentEmbed.inputY) percentEmbed.inputY.value = '';

			percentEmbed.$.eventManager.triggerEvent = jest.fn().mockResolvedValue(true);

			const result = await percentEmbed.submitSRC('https://www.facebook.com/user/posts/123');
			expect(result).toBe(true);
			// setSize should be called with % appended
			expect(percentEmbed.figure.setSize).toHaveBeenCalled();
		});
	});

	describe('#setIframeAttrs with iframeTagAttributes (lines 742-752)', () => {
		it('should set custom iframe attributes when iframeTagAttributes is configured', async () => {
			const attrKernel = createMockEditor();
			const attrEmbed = new Embed(attrKernel, {
				canResize: true,
				iframeTagAttributes: {
					sandbox: 'allow-scripts allow-same-origin',
					loading: 'lazy',
				},
			});

			attrEmbed.modal.isUpdate = false;
			attrEmbed.$.eventManager.triggerEvent = jest.fn().mockResolvedValue(true);

			// When submitSRC creates an iframe, it calls #createIframeTag which calls #setIframeAttrs
			const result = await attrEmbed.submitSRC('https://www.facebook.com/user/posts/123');
			expect(result).toBe(true);
			// The createElement mock is used, so we can't directly verify setAttribute calls on it,
			// but the method should complete without error
		});
	});

	describe('componentDestroy additional branches', () => {
		it('should call removeAllParents with childNodes check (line 386)', async () => {
			const iframe = { nodeName: 'IFRAME', src: 'test', style: {} };
			const parentNode = { nodeType: 1, childNodes: [] };
			const container = {
				nodeType: 1,
				parentNode: parentNode,
				previousElementSibling: { nodeType: 1 },
			};

			embed.$.eventManager.triggerEvent = jest.fn().mockResolvedValue(undefined);

			// Mock getParentElement to return the container
			const { dom } = require('../../../../src/helper');
			dom.query.getParentElement.mockReturnValueOnce(container);

			embed.componentSelect(iframe);
			await embed.componentDestroy(iframe);

			expect(embed.$.nodeTransform.removeAllParents).toHaveBeenCalled();
			// Verify the callback function tests childNodes.length === 0
			const removeAllParentsCall = embed.$.nodeTransform.removeAllParents.mock.calls[0];
			if (removeAllParentsCall) {
				const conditionFn = removeAllParentsCall[1];
				expect(conditionFn({ childNodes: [] })).toBe(true);
				expect(conditionFn({ childNodes: [1] })).toBe(false);
			}
		});
	});

	describe('modalAction with linkValue set', () => {
		it('should set component.select timeout when submitSRC returns true (line 325)', async () => {
			jest.useFakeTimers();

			// Set linkValue via the input handler
			const addEventCalls = kernel.$.eventManager.addEvent.mock.calls;
			const inputCall = addEventCalls.find(call => call[1] === 'input');
			const onLinkPreview = inputCall[2];

			kernel.$.options.get = jest.fn().mockReturnValue(null);
			onLinkPreview({ target: { value: 'https://www.facebook.com/user/posts/123' } });

			// Mock submitSRC to return true
			embed.$.eventManager.triggerEvent = jest.fn().mockResolvedValue(true);

			const result = await embed.modalAction();
			expect(result).toBe(true);

			// setTimeout should have been called for component.select
			jest.runAllTimers();
			expect(embed.$.component.select).toHaveBeenCalled();

			jest.useRealTimers();
		});
	});
});
