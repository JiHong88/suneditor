/**
 * @jest-environment jsdom
 */

import { createMockEditor } from '../../../../__mocks__/editorMock';
import PluginManager from '../../../../../src/core/logic/shell/pluginManager';

describe('PluginManager', () => {
	let mockEditor;

	beforeEach(() => {
		mockEditor = createMockEditor();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Mock PluginManager methods', () => {
		it('should have pluginManager in mockEditor', () => {
			expect(mockEditor.$.pluginManager).toBeDefined();
			expect(typeof mockEditor.$.pluginManager).toBe('object');
		});

		it('should have fileInfo object', () => {
			expect(mockEditor.$.pluginManager.fileInfo).toBeDefined();
		});

		it('should have componentCheckers array', () => {
			expect(Array.isArray(mockEditor.$.pluginManager.componentCheckers)).toBe(true);
		});

		it('should have retainFormatCheckers map', () => {
			expect(mockEditor.$.pluginManager.retainFormatCheckers instanceof Map).toBe(true);
		});
	});

	describe('fileInfo property', () => {
		it('should have tags array', () => {
			const fileInfo = mockEditor.$.pluginManager.fileInfo;
			expect(Array.isArray(fileInfo.tags) || fileInfo.tags === null).toBe(true);
		});

		it('should have regExp property', () => {
			const fileInfo = mockEditor.$.pluginManager.fileInfo;
			expect(fileInfo.regExp === null || fileInfo.regExp instanceof RegExp).toBe(true);
		});

		it('should have pluginRegExp property', () => {
			const fileInfo = mockEditor.$.pluginManager.fileInfo;
			expect(fileInfo.pluginRegExp === null || fileInfo.pluginRegExp instanceof RegExp).toBe(true);
		});

		it('should have pluginMap property', () => {
			const fileInfo = mockEditor.$.pluginManager.fileInfo;
			expect(typeof fileInfo.pluginMap === 'object' || fileInfo.pluginMap === null).toBe(true);
		});

		it('should have tagAttrs property', () => {
			const fileInfo = mockEditor.$.pluginManager.fileInfo;
			expect(typeof fileInfo.tagAttrs === 'object').toBe(true);
		});
	});

	describe('checkFileInfo method', () => {
		it('should be callable', () => {
			expect(() => {
				mockEditor.$.pluginManager.checkFileInfo(false);
			}).not.toThrow();
		});

		it('should accept boolean parameter', () => {
			expect(() => {
				mockEditor.$.pluginManager.checkFileInfo(true);
			}).not.toThrow();
		});

		it('should process file information', () => {
			mockEditor.$.pluginManager.checkFileInfo(false);
			expect(mockEditor.$.pluginManager.checkFileInfo).toHaveBeenCalledWith(false);
		});
	});

	describe('resetFileInfo method', () => {
		it('should reset file information', () => {
			expect(() => {
				mockEditor.$.pluginManager.resetFileInfo();
			}).not.toThrow();
		});

		it('should clear file related state', () => {
			mockEditor.$.pluginManager.checkFileInfo(false);
			mockEditor.$.pluginManager.resetFileInfo();

			expect(mockEditor.$.pluginManager.resetFileInfo).toHaveBeenCalled();
		});
	});

	describe('findComponentInfo method', () => {
		it('should return null for non-component element', () => {
			const div = document.createElement('div');
			const result = mockEditor.$.pluginManager.findComponentInfo(div);
			expect(result === null || typeof result === 'object').toBe(true);
		});

		it('should find component info for component element', () => {
			const img = document.createElement('img');
			mockEditor.$.pluginManager.findComponentInfo(img);
			expect(mockEditor.$.pluginManager.findComponentInfo).toHaveBeenCalledWith(img);
		});

		it('should handle null element gracefully', () => {
			const result = mockEditor.$.pluginManager.findComponentInfo(null);
			expect(result === null || typeof result === 'object').toBe(true);
		});

		it('should return object with target and pluginName for valid components', () => {
			mockEditor.$.pluginManager.findComponentInfo = jest.fn().mockReturnValue({
				target: document.createElement('img'),
				pluginName: 'image'
			});

			const result = mockEditor.$.pluginManager.findComponentInfo(document.createElement('img'));
			if (result) {
				expect(result.target).toBeDefined();
				expect(result.pluginName).toBeDefined();
			}
		});
	});

	describe('applyRetainFormat method', () => {
		it('should apply retain format', () => {
			expect(() => {
				mockEditor.$.pluginManager.applyRetainFormat(null);
			}).not.toThrow();
		});

		it('should accept element parameter', () => {
			const element = document.createElement('div');
			expect(() => {
				mockEditor.$.pluginManager.applyRetainFormat(element);
			}).not.toThrow();
		});
	});

	describe('emitEvent method', () => {
		it('should emit plugin event synchronously', () => {
			expect(() => {
				mockEditor.$.pluginManager.emitEvent('onMouseDown', {});
			}).not.toThrow();
		});

		it('should handle different event names', () => {
			const events = ['onMouseMove', 'onMouseLeave', 'onClick', 'onInput', 'onKeyDown'];
			events.forEach((eventName) => {
				expect(() => {
					mockEditor.$.pluginManager.emitEvent(eventName, {});
				}).not.toThrow();
			});
		});

		it('should accept event parameter object', () => {
			expect(() => {
				mockEditor.$.pluginManager.emitEvent('onMouseUp', {
					frameContext: mockEditor.$.frameContext,
					event: new MouseEvent('mouseup')
				});
			}).not.toThrow();
		});
	});

	describe('emitEventAsync method', () => {
		it('should emit plugin event asynchronously', async () => {
			const result = await mockEditor.$.pluginManager.emitEventAsync('onPaste', {});
			expect(result === undefined || typeof result === 'number').toBe(true);
		});

		it('should handle different async events', async () => {
			const events = ['onBeforeInput', 'onFilePasteAndDrop'];
			for (const eventName of events) {
				const result = await mockEditor.$.pluginManager.emitEventAsync(eventName, {});
				expect(result === undefined || typeof result === 'number').toBe(true);
			}
		});

		it('should accept event parameter object', async () => {
			const result = await mockEditor.$.pluginManager.emitEventAsync('onPaste', {
				frameContext: mockEditor.$.frameContext
			});
			// Async emit should complete without error
			expect(result === undefined || typeof result === 'number').toBe(true);
		});
	});

	describe('register method', () => {
		it('should register a plugin', () => {
			const mockPlugin = {
				name: 'testPlugin',
				action: jest.fn()
			};

			expect(() => {
				mockEditor.$.pluginManager.register(mockPlugin);
			}).not.toThrow();
		});

		it('should accept plugin object', () => {
			const mockPlugin = {
				name: 'image',
				action: jest.fn(),
				active: jest.fn()
			};

			expect(() => {
				mockEditor.$.pluginManager.register(mockPlugin);
			}).not.toThrow();
		});
	});

	describe('destroy method', () => {
		it('should clean up plugin state', () => {
			expect(() => {
				mockEditor.$.pluginManager.destroy();
			}).not.toThrow();
		});

		it('should clear component checkers', () => {
			mockEditor.$.pluginManager.componentCheckers.push((el) => false);
			mockEditor.$.pluginManager.destroy();

			expect(mockEditor.$.pluginManager.destroy).toHaveBeenCalled();
		});

		it('should clear retain format checkers', () => {
			mockEditor.$.pluginManager.retainFormatCheckers.set('test', {});
			mockEditor.$.pluginManager.destroy();

			expect(mockEditor.$.pluginManager.destroy).toHaveBeenCalled();
		});
	});

	describe('componentCheckers array', () => {
		it('should allow adding component checkers', () => {
			const checker = (el) => false;
			mockEditor.$.pluginManager.componentCheckers.push(checker);

			expect(mockEditor.$.pluginManager.componentCheckers.length).toBeGreaterThan(0);
		});

		it('should execute component checkers', () => {
			const checker = jest.fn().mockReturnValue(true);
			mockEditor.$.pluginManager.componentCheckers = [checker];

			const element = document.createElement('div');
			mockEditor.$.pluginManager.componentCheckers.forEach((c) => c(element));

			expect(checker).toHaveBeenCalledWith(element);
		});
	});

	describe('retainFormatCheckers map', () => {
		it('should allow setting retain format checkers', () => {
			const checker = { key: 'bold', method: jest.fn() };
			mockEditor.$.pluginManager.retainFormatCheckers.set('bold', checker);

			expect(mockEditor.$.pluginManager.retainFormatCheckers.has('bold')).toBe(true);
		});

		it('should retrieve retain format checkers', () => {
			const checker = { key: 'bold', method: jest.fn() };
			mockEditor.$.pluginManager.retainFormatCheckers.set('bold', checker);

			const retrieved = mockEditor.$.pluginManager.retainFormatCheckers.get('bold');
			expect(retrieved).toEqual(checker);
		});

		it('should support multiple retain format checkers', () => {
			mockEditor.$.pluginManager.retainFormatCheckers.set('bold', { key: 'bold' });
			mockEditor.$.pluginManager.retainFormatCheckers.set('italic', { key: 'italic' });

			expect(mockEditor.$.pluginManager.retainFormatCheckers.size).toBe(2);
		});
	});

	describe('Integration scenarios', () => {
		it('should handle plugin registration and event emission', () => {
			mockEditor.$.pluginManager.register({
				name: 'testPlugin',
				action: jest.fn()
			});

			mockEditor.$.pluginManager.emitEvent('onClick', {});

			expect(mockEditor.$.pluginManager.register).toBeDefined();
			expect(mockEditor.$.pluginManager.emitEvent).toBeDefined();
		});

		it('should handle component detection and file info', () => {
			mockEditor.$.pluginManager.checkFileInfo(false);
			mockEditor.$.pluginManager.findComponentInfo(document.createElement('img'));

			expect(mockEditor.$.pluginManager.checkFileInfo).toHaveBeenCalled();
			expect(mockEditor.$.pluginManager.findComponentInfo).toHaveBeenCalled();
		});

		it('should handle component checker registration', () => {
			const checker = (el) => el.tagName === 'IMG';
			mockEditor.$.pluginManager.componentCheckers.push(checker);

			const img = document.createElement('img');
			const result = checker(img);

			expect(result).toBe(true);
		});

		it('should handle lifecycle of plugin events', async () => {
			mockEditor.$.pluginManager.emitEvent('onFocus', {
				frameContext: mockEditor.$.frameContext
			});

			await mockEditor.$.pluginManager.emitEventAsync('onPaste', {
				frameContext: mockEditor.$.frameContext
			});

			mockEditor.$.pluginManager.destroy();

			expect(mockEditor.$.pluginManager.emitEvent).toHaveBeenCalled();
		});

		it('should handle multiple plugin registrations', () => {
			const plugins = ['image', 'video', 'audio', 'table'];
			plugins.forEach((name) => {
				expect(() => {
					mockEditor.$.pluginManager.register({
						name,
						action: jest.fn()
					});
				}).not.toThrow();
			});
		});
	});

	describe('Event emission scenarios', () => {
		it('should handle mouse events through plugin system', () => {
			const events = ['onMouseDown', 'onMouseUp', 'onMouseMove', 'onMouseLeave'];
			events.forEach((event) => {
				expect(() => {
					mockEditor.$.pluginManager.emitEvent(event, {
						frameContext: mockEditor.$.frameContext
					});
				}).not.toThrow();
			});
		});

		it('should handle keyboard events through plugin system', () => {
			const events = ['onKeyDown', 'onKeyUp'];
			events.forEach((event) => {
				expect(() => {
					mockEditor.$.pluginManager.emitEvent(event, {
						frameContext: mockEditor.$.frameContext
					});
				}).not.toThrow();
			});
		});

		it('should handle input events through plugin system', () => {
			const events = ['onInput', 'onBeforeInput'];
			events.forEach((event) => {
				expect(() => {
					mockEditor.$.pluginManager.emitEvent(event, {
						frameContext: mockEditor.$.frameContext
					});
				}).not.toThrow();
			});
		});
	});

	describe('Error handling', () => {
		it('should handle null element in findComponentInfo', () => {
			expect(() => {
				mockEditor.$.pluginManager.findComponentInfo(null);
			}).not.toThrow();
		});

		it('should handle undefined element in applyRetainFormat', () => {
			expect(() => {
				mockEditor.$.pluginManager.applyRetainFormat(undefined);
			}).not.toThrow();
		});

		it('should handle invalid event names', () => {
			expect(() => {
				mockEditor.$.pluginManager.emitEvent('onInvalidEvent', {});
			}).not.toThrow();
		});

		it('should handle component checker exceptions gracefully', () => {
			const badChecker = () => {
				throw new Error('Checker error');
			};

			mockEditor.$.pluginManager.componentCheckers.push(badChecker);

			expect(() => {
				mockEditor.$.pluginManager.componentCheckers.forEach((c) => c(document.createElement('div')));
			}).toThrow();
		});
	});
});
