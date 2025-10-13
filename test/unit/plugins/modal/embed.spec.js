import Embed from '../../../../src/plugins/modal/embed';

// Mock dependencies
jest.mock('../../../../src/editorInjector', () => {
	return class MockEditorInjector {
		constructor() {
			this.lang = {
				embed: 'Embed',
				embed_modal_title: 'Embed',
				embed_modal_source: 'Source',
				close: 'Close',
				submitButton: 'Submit',
				width: 'Width',
				height: 'Height',
				ratio: 'Ratio',
				proportion: 'Proportion',
				revert: 'Revert',
				basic: 'Basic',
				left: 'Left',
				center: 'Center',
				right: 'Right'
			};
			this.icons = { cancel: '<svg>cancel</svg>', revert: '<svg>revert</svg>', embed: '<svg>embed</svg>' };
			this.eventManager = { addEvent: jest.fn() };
			this.editor = { focusEdge: jest.fn() };
			this.format = {
				getLine: jest.fn().mockReturnValue(null),
				addLine: jest.fn().mockReturnValue({ nodeType: 1 })
			};
			this.history = { push: jest.fn(), pause: jest.fn(), resume: jest.fn() };
			this.frameContext = new Map([['wysiwyg', { nodeType: 1 }]]);
			this.nodeTransform = { removeAllParents: jest.fn() };
			this.component = { select: jest.fn(), insert: jest.fn() };
			this.selection = { setRange: jest.fn() };
			this.triggerEvent = jest.fn().mockResolvedValue(undefined);
			this.options = {
				get: jest.fn((key) => {
					if (key === 'defaultUrlProtocol') return 'https://';
					if (key === 'componentInsertBehavior') return null;
					return null;
				})
			};
			this.plugins = {};
		}
	};
});

jest.mock('../../../../src/modules', () => ({
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
			appendChild: jest.fn()
		},
		isUpdate: false
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
			ratio: { w: 1, h: 1 }
		}),
		getSize: jest.fn().mockReturnValue({ w: '100%', h: '400px', dw: '100%', dh: '400px' }),
		setSize: jest.fn(),
		setAlign: jest.fn(),
		setTransform: jest.fn(),
		retainFigureFormat: jest.fn(),
		isVertical: false
	}))
}));

const mockModal = require('../../../../src/modules').Modal;
const mockFigure = require('../../../../src/modules').Figure;

Object.assign(mockModal, {
	OnChangeFile: jest.fn(),
	CreateFileInput: jest.fn().mockReturnValue(''),
	CreateGallery: jest.fn().mockReturnValue('')
});

Object.assign(mockFigure, {
	CreateContainer: jest.fn().mockReturnValue({
		container: { nodeType: 1, style: {}, appendChild: jest.fn() },
		cover: { nodeType: 1, setAttribute: jest.fn(), appendChild: jest.fn() }
	}),
	GetContainer: jest.fn().mockReturnValue({
		container: { nodeType: 1, style: {} },
		cover: { nodeType: 1 }
	}),
	CalcRatio: jest.fn((w, h, unit, ratio) => ({ w: w, h: h })),
	is: jest.fn((node) => node && node.nodeType === 1)
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
				innerHTML: ''
			}),
			removeItem: jest.fn(),
			hasClass: jest.fn((el, className) => el?.classList?.contains(className))
		},
		check: {
			isIFrame: jest.fn((node) => node && node.nodeName === 'IFRAME')
		},
		query: {
			getParentElement: jest.fn((el, condition) => {
				if (typeof condition === 'function' && el?.parentElement) {
					let parent = el.parentElement;
					while (parent) {
						if (condition(parent)) return parent;
						parent = parent.parentElement;
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
			getEventTarget: jest.fn((e) => e?.target || e)
		}
	},
	numbers: {
		get: jest.fn((val, def) => {
			const parsed = parseFloat(val);
			return isNaN(parsed) ? def : parsed;
		}),
		is: jest.fn((val) => typeof val === 'number')
	},
	env: { _w: global, NO_EVENT: Symbol('NO_EVENT') },
	keyCodeMap: {
		key: { 13: 'Enter' },
		isSpace: jest.fn((code) => code === 'Space')
	}
}));

describe('Embed Plugin', () => {
	let mockEditor;
	let embed;

	beforeEach(() => {
		mockEditor = {
			lang: {
				embed: 'Embed',
				embed_modal_title: 'Embed',
				embed_modal_source: 'Source',
				close: 'Close',
				submitButton: 'Submit',
				width: 'Width',
				height: 'Height',
				ratio: 'Ratio',
				proportion: 'Proportion',
				revert: 'Revert',
				basic: 'Basic',
				left: 'Left',
				center: 'Center',
				right: 'Right'
			},
			icons: { cancel: '<svg>cancel</svg>', revert: '<svg>revert</svg>', embed: '<svg>embed</svg>' },
			plugins: {}
		};
		embed = new Embed(mockEditor, {});
		// Mock DOM elements that would be created by CreateHTML_modal
		embed.embedInput = { value: '', addEventListener: jest.fn(), dispatchEvent: jest.fn() };
		embed.previewSrc = { textContent: '' };
		embed.inputX = { value: '', disabled: false, placeholder: '', addEventListener: jest.fn(), dispatchEvent: jest.fn() };
		embed.inputY = { value: '', disabled: false, placeholder: '', addEventListener: jest.fn(), dispatchEvent: jest.fn() };
		embed.proportion = { checked: false, disabled: false };
		embed.fileModalWrapper = {};
	});

	describe('Constructor', () => {
		it('should create Embed instance', () => {
			expect(() => new Embed(mockEditor, {})).not.toThrow();
		});

		it('should create instance with default options', () => {
			expect(embed.title).toBe('Embed');
			expect(embed.icon).toBe('embed');
		});

		it('should create instance with custom options', () => {
			const customEmbed = new Embed(mockEditor, {
				canResize: false,
				showHeightInput: false,
				defaultWidth: '600px',
				defaultHeight: '400px',
				percentageOnlySize: true,
				uploadUrl: 'https://example.com/upload',
				uploadSizeLimit: 5000000
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
			const iframe = { nodeName: 'IFRAME', src: 'https://www.youtube.com/embed/test', style: {} };
			embed.checkContentType = jest.fn().mockReturnValue(true);
			const result = Embed.component.call(embed, iframe);
			expect(result).toBe(iframe);
		});

		it('should return null when src is not valid', () => {
			const iframe = { nodeName: 'IFRAME', src: 'invalid' };
			embed.checkContentType = jest.fn().mockReturnValue(false);
			const result = Embed.component.call(embed, iframe);
			expect(result).toBeNull();
		});
	});

	describe('checkContentType', () => {
		it('should return true for facebook URLs', () => {
			expect(embed.checkContentType('https://www.facebook.com/user/posts/123')).toBe(true);
		});

		it('should return true for twitter URLs', () => {
			expect(embed.checkContentType('https://twitter.com/user/status/123')).toBe(true);
			expect(embed.checkContentType('https://x.com/user/status/456')).toBe(true);
		});

		it('should return true for instagram URLs', () => {
			expect(embed.checkContentType('https://www.instagram.com/p/ABC123')).toBe(true);
		});

		it('should return true for linkedin URLs', () => {
			expect(embed.checkContentType('https://www.linkedin.com/posts/user_123')).toBe(true);
		});

		it('should return true for pinterest URLs', () => {
			expect(embed.checkContentType('https://www.pinterest.com/pin/123456')).toBe(true);
		});

		it('should return true for spotify URLs', () => {
			expect(embed.checkContentType('https://open.spotify.com/track/123')).toBe(true);
			expect(embed.checkContentType('https://open.spotify.com/album/456')).toBe(true);
			expect(embed.checkContentType('https://open.spotify.com/playlist/789')).toBe(true);
		});

		it('should return true for codepen URLs', () => {
			expect(embed.checkContentType('https://codepen.io/user/pen/abc123')).toBe(true);
		});

		it('should return false for invalid URLs', () => {
			expect(embed.checkContentType('https://example.com')).toBe(false);
			expect(embed.checkContentType('')).toBe(false);
			expect(embed.checkContentType(null)).toBe(false);
		});

		it('should handle case insensitive URLs', () => {
			expect(embed.checkContentType('HTTPS://WWW.FACEBOOK.COM/user/posts/123')).toBe(true);
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
		it('should have required methods', () => {
			const methods = ['open', 'edit', 'on', 'modalAction', 'init', 'select', 'destroy', 'submitSRC', 'checkContentType', 'findProcessUrl', 'retainFormat'];
			methods.forEach((method) => {
				expect(typeof embed[method]).toBe('function');
			});
		});

		describe('open', () => {
			it('should open modal', () => {
				embed.open();
				expect(embed.modal.open).toHaveBeenCalled();
			});
		});

		describe('edit', () => {
			it('should open modal', () => {
				embed.edit();
				expect(embed.modal.open).toHaveBeenCalled();
			});
		});

		describe('on', () => {
			it('should initialize values when not updating', () => {
				embed.on(false);
				expect(embed.inputX.value).toBe('');
				expect(embed.inputY.value).toBe('');
			});

			it('should load existing values when updating', () => {
				const mockCover = {
					nodeType: 1,
					setAttribute: jest.fn(),
					getAttribute: jest.fn().mockReturnValue('https://example.com/video'),
					appendChild: jest.fn()
				};
				embed.figure.open = jest.fn().mockReturnValue({
					cover: mockCover,
					container: { nodeType: 1 },
					align: 'center'
				});

				const mockElement = { nodeName: 'IFRAME', src: 'https://example.com/embed', style: {} };
				embed.select(mockElement);
				embed.modal.isUpdate = true;
				embed.on(true);

				expect(embed.embedInput.value).toBe('https://example.com/video');
			});
		});

		describe('init', () => {
			it('should reset form values', () => {
				embed.embedInput.value = 'test';
				embed.init();
				expect(embed.embedInput.value).toBe('');
				expect(embed.previewSrc.textContent).toBe('');
			});

			it('should reset size inputs', () => {
				embed.inputX.value = '500px';
				embed.inputY.value = '300px';
				embed.init();
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
		});

		describe('submitSRC', () => {
			it('should process iframe embed code', async () => {
				const iframeCode = '<iframe src="https://example.com/embed"></iframe>';
				const result = await embed.submitSRC(iframeCode);
				expect(result).toBe(true);
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
		});

		describe('select', () => {
			it('should prepare component for editing', () => {
				const iframe = { nodeName: 'IFRAME', src: 'https://www.youtube.com/embed/test', style: {} };
				embed.select(iframe);
				expect(embed.figure.open).toHaveBeenCalledWith(iframe, expect.any(Object));
			});
		});

		describe('destroy', () => {
			it('should remove element and trigger event', async () => {
				const iframe = { nodeName: 'IFRAME', src: 'test', style: {} };
				const container = { nodeType: 1, parentNode: { nodeType: 1 }, previousElementSibling: { nodeType: 1 } };
				embed.triggerEvent = jest.fn().mockResolvedValue(undefined);

				embed.select(iframe);
				await embed.destroy(iframe);

				expect(embed.triggerEvent).toHaveBeenCalledWith('onEmbedDeleteBefore', expect.any(Object));
			});

		it('should not remove when event returns false', async () => {
			const iframe = { nodeName: 'IFRAME', src: 'test', style: {} };
			embed.triggerEvent = jest.fn().mockResolvedValue(false);
			const { dom } = require('../../../../src/helper');
			dom.utils.removeItem.mockClear();

			embed.select(iframe);
			await embed.destroy(iframe);

			expect(embed.triggerEvent).toHaveBeenCalledWith('onEmbedDeleteBefore', expect.any(Object));
			expect(dom.utils.removeItem).not.toHaveBeenCalled();
		});		});

		describe('retainFormat', () => {
			it('should return format retention object', () => {
				const format = embed.retainFormat();
				expect(format).toHaveProperty('query', 'iframe');
				expect(format).toHaveProperty('method');
				expect(typeof format.method).toBe('function');
			});

			it('should process iframe elements', async () => {
				const iframe = { nodeName: 'IFRAME', src: 'https://www.youtube.com/embed/test', style: {}, getAttribute: jest.fn() };
				embed.checkContentType = jest.fn().mockReturnValue(true);
				const format = embed.retainFormat();
				await format.method(iframe);
				expect(embed.checkContentType).toHaveBeenCalledWith(iframe.src);
			});
		});
	});

	describe('Plugin options', () => {
		it('should handle percentageOnlySize option', () => {
			const percentEmbed = new Embed(mockEditor, {
				percentageOnlySize: true,
				canResize: true
			});
			expect(percentEmbed.pluginOptions.percentageOnlySize).toBe(true);
			expect(percentEmbed.sizeUnit).toBe('%');
		});

		it('should handle upload options', () => {
			const uploadEmbed = new Embed(mockEditor, {
				uploadUrl: 'https://example.com/upload',
				uploadHeaders: { Authorization: 'Bearer token' },
				uploadSizeLimit: 10000000,
				uploadSingleSizeLimit: 5000000
			});
			expect(uploadEmbed.pluginOptions.uploadUrl).toBe('https://example.com/upload');
			expect(uploadEmbed.pluginOptions.uploadHeaders).toEqual({ Authorization: 'Bearer token' });
			expect(uploadEmbed.pluginOptions.uploadSizeLimit).toBe(10000000);
			expect(uploadEmbed.pluginOptions.uploadSingleSizeLimit).toBe(5000000);
		});

		it('should handle iframe tag attributes', () => {
			const attrEmbed = new Embed(mockEditor, {
				iframeTagAttributes: {
					sandbox: 'allow-scripts',
					loading: 'lazy'
				}
			});
			expect(attrEmbed.pluginOptions.iframeTagAttributes).toEqual({
				sandbox: 'allow-scripts',
				loading: 'lazy'
			});
		});

		it('should handle custom embed query', () => {
			const customEmbed = new Embed(mockEditor, {
				embedQuery: {
					customService: {
						pattern: /https:\/\/custom\.com\/(.+)/i,
						action: (url) => `https://custom.com/embed/${url.match(/https:\/\/custom\.com\/(.+)/i)[1]}`,
						tag: 'iframe'
					}
				}
			});
			expect(customEmbed.checkContentType('https://custom.com/video123')).toBe(true);
			const result = customEmbed.findProcessUrl('https://custom.com/video123');
			expect(result).toBeTruthy();
			expect(result.url).toContain('custom.com/embed');
		});
	});
});
