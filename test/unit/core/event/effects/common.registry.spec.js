/**
 * @fileoverview Unit tests for common effects registry
 */

import commonEffects from '../../../../../src/core/event/effects/common.registry';

describe('Common Effects Registry', () => {
	let mockPorts;
	let mockCtx;
	let effContext;

	beforeEach(() => {
		mockPorts = {
			editor: {
				_nativeFocus: jest.fn(),
				blur: jest.fn()
			},
			styleNodeCache: jest.fn(),
			formatAttrsTempCache: jest.fn(),
			history: {
				push: jest.fn()
			},
			component: {
				deselect: jest.fn(),
				select: jest.fn(() => true)
			},
			selection: {
				setRange: jest.fn()
			},
			format: {
				removeBlock: jest.fn()
			}
		};

		mockCtx = {
			e: {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			},
			fc: new Map([
				['documentType', { reHeader: jest.fn() }]
			])
		};

		effContext = {
			ports: mockPorts,
			ctx: mockCtx
		};
	});

	describe('Registry structure', () => {
		it('should export an object with effect functions', () => {
			expect(typeof commonEffects).toBe('object');
			expect(Object.keys(commonEffects).length).toBeGreaterThan(0);
		});

		it('should have all required effect keys', () => {
			const keys = Object.keys(commonEffects);
			expect(keys).toContain('event.prevent');
			expect(keys).toContain('event.stop');
			expect(keys).toContain('event.prevent.stop');
			expect(keys).toContain('cache.styleNode');
			expect(keys).toContain('cache.formatAttrsTemp');
			expect(keys).toContain('editor._nativeFocus');
			expect(keys).toContain('history.push');
			expect(keys).toContain('documentType.refreshHeader');
			expect(keys).toContain('component.deselect');
			expect(keys).toContain('selection.setRange');
			expect(keys).toContain('format.removeBlock');
			expect(keys).toContain('dom.utils.removeItem');
			expect(keys).toContain('select.component.fallback');
		});

		it('should have all effects as functions', () => {
			Object.keys(commonEffects).forEach(key => {
				expect(typeof commonEffects[key]).toBe('function');
			});
		});
	});

	describe('Event effects', () => {
		it('should prevent default event', () => {
			commonEffects['event.prevent'](effContext);
			expect(mockCtx.e.preventDefault).toHaveBeenCalled();
		});

		it('should stop event propagation', () => {
			commonEffects['event.stop'](effContext);
			expect(mockCtx.e.stopPropagation).toHaveBeenCalled();
		});

		it('should prevent default and stop propagation', () => {
			commonEffects['event.prevent.stop'](effContext);
			expect(mockCtx.e.preventDefault).toHaveBeenCalled();
			expect(mockCtx.e.stopPropagation).toHaveBeenCalled();
		});
	});

	describe('Cache effects', () => {
		it('should cache style node', () => {
			commonEffects['cache.styleNode'](effContext);
			expect(mockPorts.styleNodeCache).toHaveBeenCalled();
		});

		it('should cache format attributes', () => {
			const attrs = { class: 'test', id: 'test-id' };
			commonEffects['cache.formatAttrsTemp'](effContext, { attrs });
			expect(mockPorts.formatAttrsTempCache).toHaveBeenCalledWith(attrs);
		});
	});

	describe('Command effects', () => {
		it('should call editor native focus', () => {
			commonEffects['editor._nativeFocus'](effContext);
			expect(mockPorts.editor._nativeFocus).toHaveBeenCalled();
		});

		it('should push history', () => {
			commonEffects['history.push'](effContext, true);
			expect(mockPorts.history.push).toHaveBeenCalledWith(true);
		});

		it('should push history with false', () => {
			commonEffects['history.push'](effContext, false);
			expect(mockPorts.history.push).toHaveBeenCalledWith(false);
		});

		it('should refresh document type header asynchronously', (done) => {
			commonEffects['documentType.refreshHeader'](effContext);

			// reHeader should be called asynchronously with setTimeout 0
			setTimeout(() => {
				expect(mockCtx.fc.get('documentType').reHeader).toHaveBeenCalled();
				done();
			}, 10);
		});
	});

	describe('Class effects', () => {
		it('should deselect component', () => {
			commonEffects['component.deselect'](effContext);
			expect(mockPorts.component.deselect).toHaveBeenCalled();
		});

		it('should set selection range', () => {
			const sc = document.createTextNode('start');
			const ec = document.createTextNode('end');
			const payload = { sc, so: 0, ec, eo: 5 };

			commonEffects['selection.setRange'](effContext, payload);
			expect(mockPorts.selection.setRange).toHaveBeenCalledWith(sc, 0, ec, 5);
		});

		it('should remove format block', () => {
			const rangeEl = document.createElement('div');
			const payload = {
				rangeEl,
				selectedFormats: [],
				newBlockElement: null,
				shouldDelete: true,
				skipHistory: false
			};

			commonEffects['format.removeBlock'](effContext, payload);
			expect(mockPorts.format.removeBlock).toHaveBeenCalledWith(rangeEl, {
				selectedFormats: [],
				newBlockElement: null,
				shouldDelete: true,
				skipHistory: false
			});
		});
	});

	describe('Helper effects', () => {
		it('should remove DOM item', () => {
			const item = document.createElement('div');
			document.body.appendChild(item);

			commonEffects['dom.utils.removeItem'](effContext, { item });

			expect(document.body.contains(item)).toBe(false);
		});

		it('should handle removing already removed item', () => {
			const item = document.createElement('div');
			// Don't append to body

			expect(() => {
				commonEffects['dom.utils.removeItem'](effContext, { item });
			}).not.toThrow();
		});
	});

	describe('Utility effects', () => {
		it('should select component fallback when selection succeeds', () => {
			const target = document.createElement('img');
			const cmponentInfo = {
				target,
				pluginName: 'image'
			};

			mockPorts.component.select.mockReturnValue(true);

			commonEffects['select.component.fallback'](effContext, { cmponentInfo });

			expect(mockPorts.component.select).toHaveBeenCalledWith(target, 'image');
			expect(mockPorts.editor.blur).not.toHaveBeenCalled();
		});

		it('should blur editor when component selection fails', () => {
			const target = document.createElement('img');
			const cmponentInfo = {
				target,
				pluginName: 'image'
			};

			mockPorts.component.select.mockReturnValue(false);

			commonEffects['select.component.fallback'](effContext, { cmponentInfo });

			expect(mockPorts.component.select).toHaveBeenCalledWith(target, 'image');
			expect(mockPorts.editor.blur).toHaveBeenCalled();
		});
	});

	describe('Integration tests', () => {
		it('should execute multiple effects in sequence', () => {
			commonEffects['event.prevent'](effContext);
			commonEffects['component.deselect'](effContext);
			commonEffects['cache.styleNode'](effContext);

			expect(mockCtx.e.preventDefault).toHaveBeenCalled();
			expect(mockPorts.component.deselect).toHaveBeenCalled();
			expect(mockPorts.styleNodeCache).toHaveBeenCalled();
		});

		it('should handle effects with no payload', () => {
			expect(() => {
				commonEffects['event.prevent'](effContext);
				commonEffects['component.deselect'](effContext);
				commonEffects['editor._nativeFocus'](effContext);
			}).not.toThrow();
		});

		it('should handle effects with payload', () => {
			const attrs = { class: 'test' };
			expect(() => {
				commonEffects['cache.formatAttrsTemp'](effContext, { attrs });
				commonEffects['history.push'](effContext, true);
			}).not.toThrow();
		});
	});

	describe('Edge cases', () => {
		it('should handle missing context properties', () => {
			const minimalContext = {
				ports: {},
				ctx: { e: { preventDefault: jest.fn(), stopPropagation: jest.fn() } }
			};

			expect(() => {
				commonEffects['event.prevent'](minimalContext);
			}).not.toThrow();
		});

		it('should handle null payload gracefully', () => {
			expect(() => {
				commonEffects['history.push'](effContext, null);
			}).not.toThrow();
		});

		it('should handle undefined payload', () => {
			expect(() => {
				commonEffects['history.push'](effContext, undefined);
			}).not.toThrow();
		});
	});
});
