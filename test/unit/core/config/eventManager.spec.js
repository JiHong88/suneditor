import EventManager from '../../../../src/core/config/eventManager';
import { NO_EVENT } from '../../../../src/helper/env';

describe('EventManager listener lifecycle', () => {
	let manager;
	let frame;
	let frameOptions;
	let iframe;
	let deps;

	beforeEach(() => {
		frame = new Map([['wysiwyg', document.createElement('div')]]);
		frameOptions = new Map();
		deps = {};
		manager = new EventManager(
			{ frameContext: frame },
			{
				frameOptions,
				options: new Map([['events', {}]]),
			},
			deps,
		);
	});

	afterEach(() => {
		manager?._init();
		iframe?.remove();
		iframe = null;
		jest.restoreAllMocks();
	});

	function enableIframe() {
		iframe = document.createElement('iframe');
		document.body.appendChild(iframe);
		frameOptions.set('iframe', true);
		frame.set('_ww', iframe.contentWindow);
		return iframe.contentWindow;
	}

	it.each([false, true, { capture: true, passive: false }])(
		'removes the exact listener using its handle (%j)',
		(options) => {
			const element = document.createElement('button');
			const removed = jest.fn();
			const retained = jest.fn();
			const handle = manager.addEvent(element, 'click', removed, options);
			manager.addEvent(element, 'click', retained);
			element.click();
			expect(removed).toHaveBeenCalledTimes(1);
			expect(retained).toHaveBeenCalledTimes(1);

			expect(manager.removeEvent(handle)).toBeNull();
			element.click();
			expect(removed).toHaveBeenCalledTimes(1);
			expect(retained).toHaveBeenCalledTimes(2);
		},
	);

	it('registers and removes every target in a collection', () => {
		const elements = [document.createElement('button'), document.createElement('button')];
		const listener = jest.fn();
		const handle = manager.addEvent(elements, 'click', listener);
		elements.forEach((element) => element.click());
		expect(listener).toHaveBeenCalledTimes(2);
		manager.removeEvent(handle);
		elements.forEach((element) => element.click());
		expect(listener).toHaveBeenCalledTimes(2);
	});

	it.each([null, []])('does not register an empty target (%j)', (target) => {
		expect(manager.addEvent(target, 'click', jest.fn())).toBeNull();
	});

	it.each(['handle', 'arguments'])('removes global listeners from host and iframe by %s', (form) => {
		const ww = enableIframe();
		const listener = jest.fn();
		const handle = manager.addGlobalEvent('probe', listener, true);
		window.dispatchEvent(new Event('probe'));
		ww.dispatchEvent(new ww.Event('probe'));
		expect(listener).toHaveBeenCalledTimes(2);

		if (form === 'handle') manager.removeGlobalEvent(handle);
		else manager.removeGlobalEvent('probe', listener, true);
		window.dispatchEvent(new Event('probe'));
		ww.dispatchEvent(new ww.Event('probe'));
		expect(listener).toHaveBeenCalledTimes(2);
	});

	it('teardown detaches element, document, host and iframe listeners', () => {
		const ww = enableIframe();
		const element = document.createElement('button');
		const local = jest.fn();
		const global = jest.fn();
		manager.addEvent([element, document, window], 'probe', local);
		manager.addGlobalEvent('probe', global);
		const dispatch = () => {
			element.dispatchEvent(new Event('probe'));
			document.dispatchEvent(new Event('probe'));
			window.dispatchEvent(new Event('probe'));
			ww.dispatchEvent(new ww.Event('probe'));
		};
		dispatch();
		expect(local).toHaveBeenCalledTimes(3);
		expect(global).toHaveBeenCalledTimes(2);
		manager._init();
		manager = null;
		dispatch();
		expect(local).toHaveBeenCalledTimes(3);
		expect(global).toHaveBeenCalledTimes(2);
	});

	it('repeated global open/close cycles leave no active handlers', () => {
		const listener = jest.fn();
		for (let i = 0; i < 20; i++) {
			const handle = manager.addGlobalEvent('probe', listener);
			window.dispatchEvent(new Event('probe'));
			manager.removeGlobalEvent(handle);
			window.dispatchEvent(new Event('probe'));
		}
		expect(listener).toHaveBeenCalledTimes(20);
	});

	it('awaits a user cancellation and passes the originating frame and dependencies', async () => {
		let finish;
		const handler = jest.fn(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				}),
		);
		manager.events.onPaste = handler;
		const event = new Event('paste');
		const result = manager.triggerEvent('onPaste', { frameContext: frame, event, data: 'text' });
		expect(handler).toHaveBeenCalledWith({ $: deps, frameContext: frame, event, data: 'text' });
		finish(false);
		await expect(result).resolves.toBe(false);
	});

	it('distinguishes no handler from cancellation', async () => {
		await expect(manager.triggerEvent('onPaste', {})).resolves.toBe(NO_EVENT);
	});

	it('reports a rejected public callback as cancellation', async () => {
		const error = new Error('callback failed');
		const report = jest.spyOn(console, 'error').mockImplementation(() => {});
		manager.events.onPaste = jest.fn().mockRejectedValue(error);
		await expect(manager.triggerEvent('onPaste', {})).resolves.toBe(false);
		expect(report).toHaveBeenCalledWith('[SUNEDITOR.triggerEvent.onPaste]', error);
	});
});
