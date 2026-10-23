/** Behavioral teardown checks; these do not claim to measure garbage collection. */
import Editor from '../../src/core/editor';
import { PluginCommand } from '../../src/interfaces';

describe('Editor resource lifecycle', () => {
	const editors = [];

	async function create(options = {}) {
		const target = document.createElement('textarea');
		document.body.appendChild(target);
		let ready;
		const loaded = new Promise((resolve) => {
			ready = resolve;
		});
		const editor = new Editor([{ key: null, target }], {
			buttonList: [['undo', 'redo', 'bold']],
			height: '200px',
			value: '<p>initial</p>',
			...options,
			events: { ...options.events, onload: ready },
		});
		const entry = {
			editor,
			target,
			destroyed: false,
			destroy() {
				if (!this.destroyed) {
					editor.destroy();
					this.destroyed = true;
				}
			},
		};
		editors.push(entry);
		await loaded;
		return entry;
	}

	afterEach(() => {
		for (const entry of editors.splice(0)) {
			entry.destroy();
			entry.target.remove();
		}
		jest.useRealTimers();
		jest.restoreAllMocks();
	});

	it('runs a registered plugin cleanup and clears populated registries and DOM', async () => {
		const dispose = jest.fn();
		class Probe extends PluginCommand {
			static key = 'probe';
			action() {}
			_destroy() {
				dispose();
			}
		}
		const entry = await create({ plugins: [Probe], buttonList: [['probe', 'bold']] });
		const $ = entry.editor.$;
		const plugin = $.plugins.probe;
		const targets = $.commandDispatcher.targets;
		const context = $.context;
		const options = $.options;
		const roots = $.frameRoots;
		const topArea = $.frameContext.get('topArea');
		expect(plugin).toBeInstanceOf(Probe);
		expect(targets.size).toBeGreaterThan(0);
		expect(context.size).toBeGreaterThan(0);
		expect(options.size()).toBeGreaterThan(0);
		expect(roots.size).toBe(1);
		expect(topArea.isConnected).toBe(true);

		entry.destroy();
		expect(dispose).toHaveBeenCalledTimes(1);
		expect(targets.size).toBe(0);
		expect(context.size).toBe(0);
		expect(options.size()).toBe(0);
		expect(roots.size).toBe(0);
		expect(topArea.isConnected).toBe(false);
		expect(entry.editor.events).toBeNull();
	});

	it('cancels a pending history save before it can notify or access destroyed state', async () => {
		const change = jest.fn();
		const entry = await create({ events: { onChange: change }, historyStackDelayTime: 250 });
		jest.useFakeTimers();
		const $ = entry.editor.$;
		change.mockClear();
		$.frameContext.get('wysiwyg').firstChild.textContent = 'pending edit';
		$.history.push(true);
		// Complete the current edit's frame sync, leaving the delayed snapshot outstanding.
		jest.advanceTimersByTime(0);
		expect(change).not.toHaveBeenCalled();
		expect(jest.getTimerCount()).toBeGreaterThan(0);
		entry.destroy();
		expect(jest.getTimerCount()).toBe(0);
		expect(() => jest.advanceTimersByTime(1000)).not.toThrow();
		expect(change).not.toHaveBeenCalled();
	});

	it('detaches listeners on retained DOM and leaves the other editor functional', async () => {
		const first = await create();
		const second = await create();
		const node = first.editor.$.frameContext.get('wysiwyg');
		const firstCallback = jest.fn();
		const secondCallback = jest.fn();
		first.editor.$.eventManager.addEvent(node, 'probe', firstCallback);
		first.editor.$.eventManager.addGlobalEvent('probe', firstCallback);
		second.editor.$.eventManager.addGlobalEvent('probe', secondCallback);
		node.dispatchEvent(new Event('probe'));
		window.dispatchEvent(new Event('probe'));
		expect(firstCallback).toHaveBeenCalledTimes(2);
		expect(secondCallback).toHaveBeenCalledTimes(1);

		first.destroy();
		node.dispatchEvent(new Event('probe'));
		window.dispatchEvent(new Event('probe'));
		expect(firstCallback).toHaveBeenCalledTimes(2);
		expect(secondCallback).toHaveBeenCalledTimes(2);
		second.editor.$.html.set('<p>still editable</p>');
		expect(second.editor.$.frameContext.get('wysiwyg').textContent).toBe('still editable');
	});

	it('repeated create/destroy cycles remove all registered callbacks and editor DOM', async () => {
		const callback = jest.fn();
		const originalCount = document.querySelectorAll('.sun-editor').length;
		for (let i = 0; i < 5; i++) {
			const entry = await create();
			entry.editor.$.eventManager.addGlobalEvent('probe', callback);
			window.dispatchEvent(new Event('probe'));
			expect(callback).toHaveBeenCalledTimes(i + 1);
			entry.destroy();
			window.dispatchEvent(new Event('probe'));
			expect(callback).toHaveBeenCalledTimes(i + 1);
			expect(document.querySelectorAll('.sun-editor').length).toBe(originalCount);
		}
	});
});
