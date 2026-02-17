import { env, converter, dom } from '../helper';
import Constructor from './section/constructor';

// type
import DocumentType from './section/documentType';

// kernel
import CoreKernel from './kernel/coreKernel';

/**
 * @description SunEditor class.
 */
class Editor {
	#kernel;

	/** @type {SunEditor.Deps} */
	$;

	/**
	 * @constructor
	 * @description SunEditor constructor function.
	 * @param {Array<{target: Element, key: *, options: SunEditor.InitFrameOptions}>} multiTargets Target element
	 * @param {SunEditor.InitOptions} options options
	 */
	constructor(multiTargets, options) {
		const product = Constructor(multiTargets, options);

		// CoreKernel
		const kernel = new CoreKernel(this, { product, options });
		this.#kernel = kernel;

		this.$ = kernel.$;

		this.#Create(options).catch((e) => {
			console.error('[SUNEDITOR:E_CREATE_FAIL] Failed to create editor instance.', e);
		});
	}

	/**
	 * @description Checks if the content of the editor is empty.
	 * - Display criteria for "placeholder".
	 * @param {?SunEditor.FrameContext} [fc] Frame context, if not present, currently selected frame context.
	 * @returns {boolean}
	 */
	isEmpty(fc) {
		const wysiwyg = (fc || this.$.frameContext).get('wysiwyg');
		return dom.check.isZeroWidth(wysiwyg.textContent) && !wysiwyg.querySelector(this.$.options.get('allowedEmptyTags')) && (wysiwyg.innerText.match(/\n/g) || '').length <= 1;
	}

	/**
	 * @description Add or reset option property (Editor is reloaded)
	 * @param {SunEditor.InitOptions} newOptions Options
	 */
	resetOptions(newOptions) {
		this.$.optionProvider.reset(newOptions);

		this.$.store.set('_lastSelectionNode', null);
		this.#setFrameInfo(this.$.frameRoots.get(this.$.store.get('rootKey')));

		// plugin hook
		for (const plugin of Object.values(this.$.plugins)) {
			plugin.init?.();
		}
	}

	/**
	 * @description Change the current root index.
	 * @param {*} rootKey Root frame key.
	 */
	changeFrameContext(rootKey) {
		if (rootKey === this.$.store.get('rootKey')) return;

		this.$.store.set('rootKey', rootKey);
		this.#setFrameInfo(this.$.frameRoots.get(rootKey));
		this.$.toolbar._resetSticky();
	}

	/**
	 * @description Destroy the suneditor
	 */
	destroy() {
		/** destroy external library */
		if (this.$.options.get('hasCodeMirror')) {
			this.$.contextProvider.applyToRoots((e) => {
				const opts = e.get('options');
				const cm6 = opts.get('codeMirror6Editor');
				const cm5 = opts.get('codeMirror5Editor');
				if (cm6) cm6.destroy();
				else if (cm5) cm5.toTextArea();
			});
		}

		/** remove DOM elements */
		dom.utils.removeItem(this.$.context.get('toolbar_wrapper'));
		dom.utils.removeItem(this.$.context.get('toolbar_sub_wrapper'));
		dom.utils.removeItem(this.$.context.get('statusbar_wrapper'));

		/** clear events */
		for (const k in this.events) {
			this.events[k] = null;
		}
		this.events = null;

		/** destroy kernel (handles all internal cleanup) */
		this.#kernel._destroy();

		return null;
	}

	/**
	 * @description Set frameContext, frameOptions
	 * @param {SunEditor.FrameContext} rt Root target[key] FrameContext
	 */
	#setFrameInfo(rt) {
		this.$.contextProvider.reset(rt);
		this.$.optionProvider.resetFrame(rt.get('options'));
		this.$.ui.reset(rt);
	}

	/**
	 * @description Initializ editor
	 * @param {SunEditor.InitOptions} options Options
	 */
	#editorInit(options) {
		this.$.store.set('initViewportHeight', env._w.visualViewport.height);
		this.#kernel._eventOrchestrator.__setViewportSize();

		this.$.contextProvider.init();

		// initialize core and add event listeners
		this.#setFrameInfo(this.$.frameRoots.get(this.$.store.get('rootKey')));
		this.#init(options);

		this.$.contextProvider.applyToRoots((e) => {
			this.#kernel._eventOrchestrator._addFrameEvents(e);
			this.#initWysiwygArea(e, e.get('options').get('value'));
			if (e.get('options').get('iframe') && e.get('options').get('height') === 'auto') {
				this.$.ui._emitResizeEvent(e, e.get('wysiwygFrame').offsetHeight, null);
			}
		});

		this.#kernel._eventOrchestrator.__eventDoc = null;
		this.$.store._editorInitFinished = true;
		this.$.pluginManager.checkFileInfo(true);

		// Defer post-init tasks (observers, history reset, plugin init, onload) to allow DOM to settle after iframe/wysiwyg insertion
		env._w.setTimeout(() => {
			// Check if instance was destroyed (e.g., in SSR with dynamic imports mistake)
			if (!this.$.context?.size) {
				console.warn('[SUNEDITOR:E_INIT_FAIL] Editor instance was destroyed before initialization completed. Check if destroy() was called.');
				return;
			}

			// toolbar visibility
			this.$.context.get('toolbar_main').style.visibility = '';
			// roots
			this.$.contextProvider.applyToRoots((e) => {
				// observer
				if (this.#kernel._eventOrchestrator._wwFrameObserver) this.#kernel._eventOrchestrator._wwFrameObserver.observe(e.get('wysiwygFrame'));
				if (this.#kernel._eventOrchestrator._toolbarObserver) this.#kernel._eventOrchestrator._toolbarObserver.observe(e.get('_toolbarShadow'));
				// resource state
				this.$.ui._syncFrameState(e);
			});

			// history reset
			this.$.history.reset();
			// plugin hook
			for (const plugin of Object.values(this.$.plugins)) {
				plugin.init?.();
			}
			// class init
			this.$.selection.__init();

			// user event
			this.$.eventManager.triggerEvent('onload', {});
		}, 0);
	}

	/**
	 * @description Initializ wysiwyg area (Only called from core._init)
	 * @param {SunEditor.FrameContext} e frameContext
	 * @param {string} value initial html string
	 */
	#initWysiwygArea(e, value) {
		// set content
		e.get('wysiwyg').innerHTML =
			this.$.html.clean(typeof value === 'string' ? value : (/^TEXTAREA$/i.test(e.get('originElement').nodeName) ? e.get('originElement').value : e.get('originElement').innerHTML) || '', {
				forceFormat: true,
				whitelist: null,
				blacklist: null,
				_freeCodeViewMode: this.$.options.get('freeCodeViewMode'),
			}) || '<' + this.$.options.get('defaultLine') + '><br></' + this.$.options.get('defaultLine') + '>';

		// char counter
		if (e.has('charCounter')) e.get('charCounter').textContent = String(this.$.char.getLength());

		// document type init
		if (this.$.options.get('type') === 'document') {
			e.set('documentType', new DocumentType(this.#kernel, e));
			if (e.get('documentType').useHeader) {
				e.set('documentType_use_header', true);
			}
			if (e.get('documentType').usePage) {
				e.set('documentType_use_page', true);
				e.get('documentTypePageMirror').innerHTML = e.get('wysiwyg').innerHTML;
			}
		}
	}

	/**
	 * @description Initializ core variable
	 * @param {SunEditor.InitOptions} options Options
	 */
	#init(options) {
		this.$.pluginManager.init(options);
		this.$.commandDispatcher._initCommandButtons();
		this.$.shortcuts._registerCustomShortcuts();
		this.$.ui.init();
	}

	/**
	 * @description Configures the document properties of an iframe editor.
	 * @param {HTMLIFrameElement} frame - The editor iframe.
	 * @param {SunEditor.Options} originOptions - The original options.
	 * @param {SunEditor.FrameOptions} targetOptions - The new options.
	 */
	#setIframeDocument(frame, originOptions, targetOptions) {
		frame.contentDocument.documentElement.className = 'sun-editor';
		frame.contentDocument.head.innerHTML =
			'<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">' +
			converter._setIframeStyleLinks(targetOptions.get('iframe_cssFileName')) +
			converter._setAutoHeightStyle(targetOptions.get('height'));
		frame.contentDocument.body.className = originOptions.get('_editableClass');
		frame.contentDocument.body.setAttribute('contenteditable', 'true');
	}

	/**
	 * @description Creates the editor instance and initializes components.
	 * @param {SunEditor.InitOptions} originOptions - The initial editor options.
	 * @returns {Promise<void>}
	 */
	async #Create(originOptions) {
		// common events
		this.#kernel._eventOrchestrator._addCommonEvents();

		// init
		const iframePromises = [];
		this.$.contextProvider.applyToRoots((e) => {
			const o = e.get('originElement');
			const t = e.get('topArea');
			o.style.display = 'none';
			t.style.display = 'block';
			o.parentNode.insertBefore(t, o.nextElementSibling);

			if (e.get('options').get('iframe')) {
				const iframeLoaded = new Promise((resolve) => {
					this.$.eventManager.addEvent(e.get('wysiwygFrame'), 'load', ({ target }) => {
						this.#setIframeDocument(/** @type{HTMLIFrameElement} */ (target), this.$.optionProvider.options, e.get('options'));
						resolve();
					});
				});
				iframePromises.push(iframeLoaded);
			}
		});

		this.$.contextProvider.applyToRoots((e) => {
			e.get('wrapper').appendChild(e.get('wysiwygFrame'));

			// document type
			if (e.get('documentTypeInner')) {
				if (this.$.options.get('_rtl')) e.get('wrapper').appendChild(e.get('documentTypeInner'));
				else e.get('wrapper').insertBefore(e.get('documentTypeInner'), e.get('wysiwygFrame'));
			}
			if (e.get('documentTypePage')) {
				if (this.$.options.get('_rtl')) e.get('wrapper').insertBefore(e.get('documentTypePage'), e.get('wysiwygFrame'));
				else e.get('wrapper').appendChild(e.get('documentTypePage'));
				// page mirror
				e.get('wrapper').appendChild(e.get('documentTypePageMirror'));
			}
		});

		if (iframePromises.length > 0) {
			await Promise.all(iframePromises);
		}

		this.#editorInit(originOptions);
	}
}

export default Editor;
