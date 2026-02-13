import { dom, env } from '../../../helper';

const { isMobile, _w } = env;

/**
 * @typedef {import('../eventOrchestrator').default} EventManagerThis_handler_toolbar
 */

/**
 * @this {EventManagerThis_handler_toolbar}
 * @param {MouseEvent} e - Event object
 */
export function ButtonsHandler(e) {
	const eventTarget = dom.query.getEventTarget(e);
	let target = eventTarget;

	if (this.$.store.mode.isBalloon && !this.$.context.get('toolbar_sub_main')?.contains(target)) {
		this._hideToolbar_sub();
	}

	const isInput = dom.check.isInputElement(target);

	if (isInput) {
		this.$.store.set('_preventBlur', false);
	} else if (!this.$.frameContext.get('wysiwyg').contains(this.$.selection.getNode())) {
		this.$.focusManager.focus();
	}

	if (dom.query.getParentElement(target, '.se-dropdown')) {
		e.stopPropagation();
		this.$.ui.preventToolbarHide(true);
	} else {
		let command = target.getAttribute('data-command');
		let className = target.className;

		while (target && !command && !/(se-menu-list|sun-editor-common|se-menu-tray)/.test(className)) {
			target = target.parentElement;
			command = target.getAttribute('data-command');
			className = target.className;
		}

		// toolbar input button
		if (isInput && /^INPUT$/i.test(target?.getAttribute('data-type'))) {
			this.$.store.set('_preventBlur', true);
			this._inputFocus = true;
			if (!this.$.store.get('hasFocus')) this.applyTagEffect();
			/* event */
			if (!dom.check.isInputElement(eventTarget) || eventTarget.disabled) return;

			const plugin = this.$.plugins[command];
			if (!plugin) return;

			if (this.__inputBlurEvent) this.__removeInput();

			// blur event
			if (typeof plugin.toolbarInputChange === 'function') this.__inputPlugin = { obj: plugin, target: eventTarget, value: eventTarget.value };
			this.__inputBlurEvent = this.$.eventManager.addEvent(eventTarget, 'blur', (ev) => {
				if (plugin.isInputActive) return;

				try {
					const value = eventTarget.value.trim();
					if (typeof plugin.toolbarInputChange === 'function' && value !== this.__inputPlugin.value) plugin.toolbarInputChange({ target: eventTarget, value, event: ev });
				} finally {
					// Defer flag reset — wysiwyg focus event fires synchronously during blur and checks this flag
					_w.setTimeout(() => (this._inputFocus = false), 0);
					this.__removeInput();
				}
			});

			if (!plugin) return;

			// keydown event
			if (typeof plugin.toolbarInputKeyDown === 'function') {
				this.__inputKeyEvent = this.$.eventManager.addEvent(eventTarget, 'keydown', (event) => {
					plugin.toolbarInputKeyDown({ target: eventTarget, event });
				});
			}
		} else if (this.__inputBlurEvent && this.__inputPlugin) {
			const value = this.__inputPlugin.target.value.trim();
			if (value !== this.__inputPlugin.value) {
				this.__inputPlugin.obj.toolbarInputChange({ target: this.__inputPlugin.target, value, event: e });
			}

			this.__removeInput();
			return;
		} else if (!this.$.frameContext.get('isCodeView')) {
			if (isMobile) {
				this.$.store.set('_preventBlur', true);
			} else {
				e.preventDefault();
				if (env.isGecko && command) {
					this.$.eventManager._injectActiveEvent(target);
				}
			}
		}

		if (command === this.$.menu.currentDropdownName || command === this.$.menu.currentContainerName) {
			e.stopPropagation();
		}
	}
}

/**
 * @this {EventManagerThis_handler_toolbar}
 * @param {MouseEvent} e - Event object
 */
export function OnClick_menuTray(e) {
	const eventTarget = dom.query.getEventTarget(e);
	const target = dom.query.getCommandTarget(eventTarget);
	if (!target) return;

	let t = target;
	let k = '';
	while (t && !/se-menu-tray/.test(t.className) && !k) {
		t = t.parentElement;
		k = t?.getAttribute('data-key');
	}
	if (!k) return;

	const plugin = this.$.plugins[k];
	if (!plugin || typeof plugin.action !== 'function') return;

	e.stopPropagation();
	plugin.action(target);
}

/**
 * @this {EventManagerThis_handler_toolbar}
 * @param {MouseEvent} e - Event object
 */
export function OnClick_toolbar(e) {
	const eventTarget = dom.query.getEventTarget(e);
	this.$.commandDispatcher.runFromTarget(eventTarget);
}
