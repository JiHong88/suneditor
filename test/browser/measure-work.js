// Serialized by Playwright into the browser. Instrumentation is test-only and restored.
function measureEditorWork({ samples, operationsPerSample }) {
	const $ = window.browserEditor.$;
	const fc = $.frameContext;
	const root = fc.get('wysiwyg');
	const paragraphs = root.querySelectorAll('p');
	const nodes = [paragraphs[0].querySelector('em').firstChild, paragraphs[1].firstChild];
	const align = $.plugins.align;
	const restore = [];
	let counts;
	const reset = () =>
		(counts = {
			rootQueries: 0,
			rootSerializations: 0,
			rootWalkers: 0,
			rectReads: 0,
			activeCalls: 0,
			historyPushes: 0,
		});
	const wrap = (object, key, kind, count) => {
		const descriptor = Object.getOwnPropertyDescriptor(object, key);
		const original = descriptor[kind];
		Object.defineProperty(object, key, {
			...descriptor,
			[kind]: function (...args) {
				count(this, args);
				return original.apply(this, args);
			},
		});
		restore.push(() => Object.defineProperty(object, key, descriptor));
	};
	const wrapMethod = (object, key, metric) => {
		const own = Object.getOwnPropertyDescriptor(object, key);
		const original = object[key];
		object[key] = function (...args) {
			counts[metric]++;
			return original.apply(this, args);
		};
		restore.push(() => (own ? Object.defineProperty(object, key, own) : delete object[key]));
	};
	const sample = (action) => {
		for (let i = 0; i < 20; i++) action(i);
		reset();
		const millisecondsPerOperation = [];
		for (let sample = 0; sample < samples; sample++) {
			const start = performance.now();
			for (let i = 0; i < operationsPerSample; i++) action(i);
			millisecondsPerOperation.push((performance.now() - start) / operationsPerSample);
		}
		return { counts: { ...counts }, millisecondsPerOperation, operations: samples * operationsPerSample };
	};
	reset();
	try {
		for (const realm of new Set([window, fc.get('_ww')])) {
			for (const key of ['querySelector', 'querySelectorAll', 'getElementsByTagName', 'getElementsByClassName']) {
				wrap(realm.Element.prototype, key, 'value', (element) => {
					if (element === root) counts.rootQueries++;
				});
			}
			wrap(realm.Element.prototype, 'innerHTML', 'get', (element) => {
				if (element === root) counts.rootSerializations++;
			});
			wrap(realm.Node.prototype, 'textContent', 'get', (element) => {
				if (element === root) counts.rootSerializations++;
			});
			wrap(realm.Document.prototype, 'createTreeWalker', 'value', (_, args) => {
				if (args[0] === root) counts.rootWalkers++;
			});
			for (const prototype of [realm.Element.prototype, realm.Range.prototype]) {
				for (const key of ['getBoundingClientRect', 'getClientRects'])
					wrap(prototype, key, 'value', () => counts.rectReads++);
			}
		}
		if (align) wrapMethod(align, 'active', 'activeCalls');
		wrapMethod($.history, 'push', 'historyPushes');
		// Verify that the actual WYSIWYG realm is instrumented before relying on zero counts.
		root.querySelectorAll('*');
		void root.innerHTML;
		void root.textContent;
		fc.get('_wd').createTreeWalker(root);
		root.getBoundingClientRect();
		const probe = { ...counts };
		const selection = sample((i) => {
			const node = nodes[i % 2];
			$.selection.setRange(node, 0, node, 0);
			$.eventManager.applyTagEffect(node);
		});
		// Last selection is the right-aligned second paragraph: validate output, not just counts.
		const selectedRange = $.selection.getRange();
		const selectionResult = {
			correctNode: selectedRange.startContainer === nodes[1],
			align: align ? $.commandDispatcher.targets.get('align')[0].getAttribute('data-focus') : null,
		};
		const cachedSelection = sample(() => $.eventManager.applyTagEffect(nodes[1]));
		const offset = sample(() => $.offset.getGlobal(paragraphs[1]));
		return { paragraphCount: paragraphs.length, probe, selection, selectionResult, cachedSelection, offset };
	} finally {
		for (const undo of restore.reverse()) undo();
	}
}

module.exports = { measureEditorWork };
