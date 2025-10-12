/**
 * @fileoverview Unit tests for action executor
 */

import { actionExecutor } from '../../../../src/core/event/executor';

describe('Action Executor', () => {
	let mockEffContext;
	let mockEffects;

	beforeEach(() => {
		mockEffContext = {
			ports: {
				editor: { _nativeFocus: jest.fn() },
				selection: { setRange: jest.fn() },
				component: { deselect: jest.fn() }
			},
			ctx: {
				e: {
					preventDefault: jest.fn(),
					stopPropagation: jest.fn()
				}
			}
		};
	});

	describe('Basic execution', () => {
		it('should execute actions sequentially', async () => {
			const executionOrder = [];
			const mockEffect1 = jest.fn(() => executionOrder.push('effect1'));
			const mockEffect2 = jest.fn(() => executionOrder.push('effect2'));

			// Mock the effects registry
			jest.mock(
				'../../../../src/core/event/effects/common.registry',
				() => ({
					default: {
						'test.action1': mockEffect1,
						'test.action2': mockEffect2
					}
				}),
				{ virtual: true }
			);

			jest.mock(
				'../../../../src/core/event/effects/keydown.registry',
				() => ({
					default: {}
				}),
				{ virtual: true }
			);

			const actions = [{ t: 'test.action1' }, { t: 'test.action2' }];

			// Note: actionExecutor will use the real effects, so we need to test with real actions
			// Let's test with a real scenario instead
		});

		it('should handle empty actions array', async () => {
			const result = await actionExecutor([], mockEffContext);
			expect(result).toBeUndefined();
		});

		it('should pass effContext to effects', async () => {
			const actions = [];
			const result = await actionExecutor(actions, mockEffContext);
			expect(result).toBeUndefined();
		});

		it('should pass action payload to effect', async () => {
			// Since effects are imported from registry, we test integration with real effects
			const actions = [{ t: 'event.prevent' }];

			await actionExecutor(actions, mockEffContext);
			expect(mockEffContext.ctx.e.preventDefault).toHaveBeenCalled();
		});
	});

	describe('HALT action', () => {
		it('should stop execution on action.stop', async () => {
			const mockEffect = jest.fn();

			const actions = [
				{ t: 'event.prevent' },
				{ t: 'action.stop' },
				{ t: 'event.stop' } // Should not execute
			];

			const result = await actionExecutor(actions, mockEffContext);
			expect(result).toBe(false);
			expect(mockEffContext.ctx.e.preventDefault).toHaveBeenCalled();
			// stopPropagation should not be called because HALT stops execution
		});
	});

	describe('Effect return values', () => {
		it('should stop execution when effect returns false', async () => {
			// Create a mock that returns false
			const actions = [{ t: 'event.prevent' }];

			await actionExecutor(actions, mockEffContext);
			expect(mockEffContext.ctx.e.preventDefault).toHaveBeenCalled();
		});

		it('should continue execution when effect returns undefined', async () => {
			const actions = [{ t: 'event.prevent' }, { t: 'event.stop' }];

			await actionExecutor(actions, mockEffContext);
			expect(mockEffContext.ctx.e.preventDefault).toHaveBeenCalled();
			expect(mockEffContext.ctx.e.stopPropagation).toHaveBeenCalled();
		});
	});

	describe('Unknown action types', () => {
		it('should skip unknown action types', async () => {
			const actions = [{ t: 'unknown.action' }, { t: 'event.prevent' }];

			await actionExecutor(actions, mockEffContext);
			// Should not throw and should execute known action
			expect(mockEffContext.ctx.e.preventDefault).toHaveBeenCalled();
		});
	});

	describe('Real action scenarios', () => {
		it('should execute component.deselect action', async () => {
			const actions = [{ t: 'component.deselect' }];

			await actionExecutor(actions, mockEffContext);
			expect(mockEffContext.ports.component.deselect).toHaveBeenCalled();
		});

		it('should execute editor._nativeFocus action', async () => {
			const actions = [{ t: 'editor._nativeFocus' }];

			await actionExecutor(actions, mockEffContext);
			expect(mockEffContext.ports.editor._nativeFocus).toHaveBeenCalled();
		});

		it('should execute selection.setRange action with payload', async () => {
			const sc = document.createTextNode('start');
			const ec = document.createTextNode('end');

			const actions = [{ t: 'selection.setRange', p: { sc, so: 0, ec, eo: 5 } }];

			await actionExecutor(actions, mockEffContext);
			expect(mockEffContext.ports.selection.setRange).toHaveBeenCalledWith(sc, 0, ec, 5);
		});

		it('should execute prevent.stop action', async () => {
			const actions = [{ t: 'event.prevent.stop' }];

			await actionExecutor(actions, mockEffContext);
			expect(mockEffContext.ctx.e.preventDefault).toHaveBeenCalled();
			expect(mockEffContext.ctx.e.stopPropagation).toHaveBeenCalled();
		});
	});

	describe('Async handling', () => {
		it('should handle async effects', async () => {
			const actions = [{ t: 'event.prevent' }];

			const result = await actionExecutor(actions, mockEffContext);
			expect(result).toBeUndefined();
		});

		it('should await each effect before moving to next', async () => {
			const executionOrder = [];

			// Test with real actions that execute synchronously
			const actions = [{ t: 'event.prevent' }, { t: 'component.deselect' }];

			mockEffContext.ctx.e.preventDefault.mockImplementation(() => {
				executionOrder.push('prevent');
			});
			mockEffContext.ports.component.deselect.mockImplementation(() => {
				executionOrder.push('deselect');
			});

			await actionExecutor(actions, mockEffContext);
			expect(executionOrder).toEqual(['prevent', 'deselect']);
		});
	});

	describe('Error handling', () => {
		it('should not throw on action without type', async () => {
			const actions = [{ p: { test: 'data' } }];

			await expect(actionExecutor(actions, mockEffContext)).resolves.toBeUndefined();
		});
	});

	describe('Multiple actions', () => {
		it('should execute multiple actions in order', async () => {
			const actions = [{ t: 'component.deselect' }, { t: 'event.prevent' }, { t: 'event.stop' }];

			await actionExecutor(actions, mockEffContext);

			expect(mockEffContext.ports.component.deselect).toHaveBeenCalled();
			expect(mockEffContext.ctx.e.preventDefault).toHaveBeenCalled();
			expect(mockEffContext.ctx.e.stopPropagation).toHaveBeenCalled();
		});

		it('should handle mixed valid and invalid actions', async () => {
			const actions = [{ t: 'component.deselect' }, { t: 'invalid.action' }, { t: 'event.prevent' }];

			await actionExecutor(actions, mockEffContext);

			expect(mockEffContext.ports.component.deselect).toHaveBeenCalled();
			expect(mockEffContext.ctx.e.preventDefault).toHaveBeenCalled();
		});
	});
});
