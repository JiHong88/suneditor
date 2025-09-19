import Editor from '../../../src/core/editor';
import { SELECT_ALL } from '../../../src/core/section/actives';

describe('Editor', () => {
	let container;
	let mockElement;
	let multiTargets;
	let options;

	beforeEach(() => {
		container = document.createElement('div');
		container.innerHTML = '<textarea id="editor">Test content</textarea>';
		document.body.appendChild(container);

		mockElement = document.getElementById('editor');
		multiTargets = [{
			target: mockElement,
			key: 'editor1',
			options: {}
		}];

		options = {
			value: `<pre>​dsadsa</pre><figure class="se-flex-component se-input-component se-scroll-figure-x" style="width: 100%;"><table class="se-table-layout-auto" style=""><colgroup><col style="width: 20%;"><col style="width: 20%;"><col style="width: 20%;"><col style="width: 20%;"><col style="width: 20%;"></colgroup><tbody><tr><td><div><br></div></td><td class=""><div>dsadsa</div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td class=""><div><br></div></td><td><div>dsa</div></td><td class=""><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td class=""><div>dsadasdsa</div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr></tbody></table></figure><p>​dsadsa</p><ol style="list-style-type: "><li>dsadsa</li><li>bbdadas    <ol><li>dsadsadsa</li><li>dsadsadas        <ol><li>dsadsa</li><li>dsadsa</li><li>dsadas</li></ol></li></ol></li></ol><ol style="list-style-type: "><li>dsadsa    <ol><li>dsadas        <ol><li>dsa<br><br></li></ol></li></ol></li></ol>`,
			mode: 'classic',
			width: '100%',
			height: 'auto',
			minHeight: '400px'
		};
	});

	afterEach(() => {
		document.body.removeChild(container);
	});

	describe('constructor', () => {
		it('should create editor instance with required properties', () => {
			const editor = new Editor(multiTargets, options);

			expect(editor).toBeInstanceOf(Editor);
			expect(editor._d).toBe(document);
			expect(editor._w).toBe(window);
			expect(editor.rootKeys).toBeDefined();
			expect(editor.frameRoots).toBeInstanceOf(Map);
			expect(editor.__context).toBeDefined();
			expect(editor.context).toBeDefined();
			expect(editor.__frameContext).toBeInstanceOf(Map);
			expect(editor.frameContext).toBeDefined();
			expect(editor.__frameOptions).toBeInstanceOf(Map);
			expect(editor.frameOptions).toBeDefined();
			expect(editor.__options).toBeDefined();
			expect(editor.options).toBeDefined();
		});

		it('should initialize editor status with default values', () => {
			const editor = new Editor(multiTargets, options);

			expect(editor.status).toBeDefined();
			expect(editor.status.hasFocus).toBe(false);
			expect(editor.status.tabSize).toBe(4);
			expect(editor.status.indentSize).toBe(25);
			expect(editor.status.codeIndentSize).toBe(2);
			expect(editor.status.currentNodes).toEqual([]);
			expect(editor.status.currentNodesMap).toEqual([]);
			expect(editor.status.onSelected).toBe(false);
			expect(editor.status._onMousedown).toBe(false);
		});

		it('should initialize editor mode flags', () => {
			const classicEditor = new Editor(multiTargets, { ...options, mode: 'classic' });
			expect(classicEditor.isClassic).toBe(true);
			expect(classicEditor.isInline).toBe(false);
			expect(classicEditor.isBalloon).toBe(false);
			expect(classicEditor.isBalloonAlways).toBe(false);

			const inlineEditor = new Editor(multiTargets, { ...options, mode: 'inline' });
			expect(inlineEditor.isInline).toBe(true);
			expect(inlineEditor.isClassic).toBe(false);

			const balloonEditor = new Editor(multiTargets, { ...options, mode: 'balloon' });
			expect(balloonEditor.isBalloon).toBe(true);
			expect(balloonEditor.isClassic).toBe(false);

			const balloonAlwaysEditor = new Editor(multiTargets, { ...options, mode: 'balloon-always' });
			expect(balloonAlwaysEditor.isBalloonAlways).toBe(true);
			expect(balloonAlwaysEditor.isBalloon).toBe(true);
		});

		it('should initialize command and plugin maps', () => {
			const editor = new Editor(multiTargets, options);

			expect(editor.allCommandButtons).toBeInstanceOf(Map);
			expect(editor.subAllCommandButtons).toBeInstanceOf(Map);
			expect(editor.shortcutsKeyMap).toBeInstanceOf(Map);
			expect(editor.reverseKeys).toBeInstanceOf(Set);
			expect(editor.commandTargets).toBeInstanceOf(Map);
			expect(editor.plugins).toBeDefined();
		});
	});

	describe('registerPlugin', () => {
		it('should register a plugin successfully', () => {
			const editor = new Editor(multiTargets, options);
			const mockPlugin = {
				init: jest.fn(),
				action: jest.fn()
			};

			editor.plugins.testPlugin = function() { return mockPlugin; };

			expect(() => {
				editor.registerPlugin('testPlugin', [], {});
			}).not.toThrow();

			expect(typeof editor.plugins.testPlugin).toBe('object');
		});

		it('should throw error for non-existent plugin', () => {
			const editor = new Editor(multiTargets, options);

			expect(() => {
				editor.registerPlugin('nonExistentPlugin', [], {});
			}).toThrow('[SUNEDITOR.registerPlugin.fail]');
		});
	});

	describe('run', () => {
		it('should handle command execution', () => {
			const editor = new Editor(multiTargets, options);
			editor.commandHandler = jest.fn();

			editor.run('bold');

			expect(editor.commandHandler).toHaveBeenCalledWith('bold', undefined);
		});

		it('should handle dropdown type commands', () => {
			const editor = new Editor(multiTargets, options);
			const mockButton = document.createElement('button');
			mockButton.setAttribute('data-command', 'fontSize');

			editor.menu = {
				targetMap: { fontSize: null },
				currentDropdownActiveButton: null,
				dropdownOn: jest.fn(),
				dropdownOff: jest.fn(),
				containerOff: jest.fn()
			};

			editor.run('fontSize', 'dropdown', mockButton);

			expect(editor.menu.dropdownOn).toHaveBeenCalledWith(mockButton);
		});
	});

	describe('commandHandler', () => {
		it('should handle newDocument command', async () => {
			const editor = new Editor(multiTargets, options);
			editor.html = { set: jest.fn() };
			editor.focus = jest.fn();
			editor.history = { push: jest.fn() };
			editor.frameContext = {
				has: jest.fn().mockReturnValue(false),
				get: jest.fn()
			};

			await editor.commandHandler('newDocument');

			expect(editor.html.set).toHaveBeenCalled();
			expect(editor.focus).toHaveBeenCalled();
			expect(editor.history.push).toHaveBeenCalledWith(false);
		});

		it('should handle undo command', async () => {
			const editor = new Editor(multiTargets, options);
			editor.history = { undo: jest.fn() };

			await editor.commandHandler('undo');

			expect(editor.history.undo).toHaveBeenCalled();
		});

		it('should handle redo command', async () => {
			const editor = new Editor(multiTargets, options);
			editor.history = { redo: jest.fn() };

			await editor.commandHandler('redo');

			expect(editor.history.redo).toHaveBeenCalled();
		});
	});

	describe('isEmpty', () => {
		it('should return true for empty editor content', () => {
			const editor = new Editor(multiTargets, options);
			const mockFrameContext = {
				get: jest.fn().mockReturnValue({
					textContent: '',
					querySelector: jest.fn().mockReturnValue(null),
					innerText: ''
				})
			};

			const result = editor.isEmpty(mockFrameContext);

			expect(result).toBe(true);
		});

		it('should return false for non-empty editor content', () => {
			const editor = new Editor(multiTargets, options);
			const mockFrameContext = {
				get: jest.fn().mockReturnValue({
					textContent: 'Some content',
					querySelector: jest.fn().mockReturnValue(null),
					innerText: 'Some content'
				})
			};

			const result = editor.isEmpty(mockFrameContext);

			expect(result).toBe(false);
		});
	});

	describe('setDir', () => {
		it('should set text direction to RTL', () => {
			const editor = new Editor(multiTargets, options);
			editor.options = {
				get: jest.fn().mockReturnValue(false),
				set: jest.fn()
			};
			editor.ui = { _offCurrentController: jest.fn() };
			editor.plugins = {};
			editor.context = {
				get: jest.fn().mockReturnValue(document.createElement('div'))
			};
			editor.carrierWrapper = document.createElement('div');
			editor.applyFrameRoots = jest.fn();
			editor.frameContext = {
				get: jest.fn().mockReturnValue(document.createElement('div')),
				has: jest.fn().mockReturnValue(false)
			};
			editor.eventManager = { applyTagEffect: jest.fn() };

			editor.setDir('rtl');

			expect(editor.options.set).toHaveBeenCalledWith('_rtl', true);
		});
	});

	describe('focus', () => {
		it('should focus the editor', () => {
			const editor = new Editor(multiTargets, options);
			editor.changeFrameContext = jest.fn();
			editor.frameContext = {
				get: jest.fn().mockReturnValue({
					style: { display: 'block' },
					contains: jest.fn().mockReturnValue(false)
				})
			};
			editor.frameOptions = {
				get: jest.fn().mockReturnValue(false)
			};
			editor.selection = {
				getNode: jest.fn().mockReturnValue(document.createElement('p'))
			};
			editor._nativeFocus = jest.fn();

			editor.focus();

			expect(editor._preventBlur).toBe(false);
		});
	});

	describe('destroy', () => {
		it('should clean up editor instance', () => {
			const editor = new Editor(multiTargets, options);
			editor.carrierWrapper = document.createElement('div');
			const result = editor.destroy();
			expect(result).toBeNull();
		});
	});

	describe('execCommand', () => {
		it('should execute native document command', () => {
			const editor = new Editor(multiTargets, options);
			const mockDocument = {
				execCommand: jest.fn()
			};
			editor.frameContext = {
				get: jest.fn().mockReturnValue(mockDocument)
			};
			editor.history = { push: jest.fn() };

			editor.execCommand('bold', false, 'value');

			expect(mockDocument.execCommand).toHaveBeenCalledWith('bold', false, 'value');
			expect(editor.history.push).toHaveBeenCalledWith(true);
		});
	});
});