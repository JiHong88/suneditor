import { domUtils, env } from '../../../helper';

const { isMobile } = env;

/**
 * @typedef {Omit<import('../eventManager').default & Partial<EditorInjector>, 'eventManager'>} EventManagerThis
 */

/**
 * @private
 * @this {EventManagerThis}
 * @param {MouseEvent} e - Event object
 */
export function ButtonsHandler(e) {
	const eventTarget = domUtils.getEventTarget(e);
	let target = eventTarget;

	if (this.editor.isSubBalloon && !this.context.get('toolbar.sub.main')?.contains(target)) {
		this._hideToolbar_sub();
	}

	const isInput = domUtils.isInputElement(target);

	if (isInput) {
		this.editor._preventBlur = false;
	} else if (!this.editor.frameContext.get('wysiwyg').contains(this.selection.getNode())) {
		this.editor.focus();
	}

	if (domUtils.getParentElement(target, '.se-dropdown')) {
		e.stopPropagation();
		this.editor._notHideToolbar = true;
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
			this.editor._preventBlur = this._inputFocus = true;
			if (!this.status.hasFocus) this.applyTagEffect();
			/* event */
			if (!domUtils.isInputElement(eventTarget) || eventTarget.disabled) return;

			const plugin = this.plugins[command];
			if (!plugin) return;

			if (this.__inputBlurEvent) this.__removeInput();

			// blur event
			if (typeof plugin.onInputChange === 'function') this.__inputPlugin = { obj: plugin, target: eventTarget, value: eventTarget.value };
			this.__inputBlurEvent = this.addEvent(eventTarget, 'blur', (ev) => {
				if (plugin.isInputActive) return;

				try {
					const value = eventTarget.value.trim();
					if (typeof plugin.onInputChange === 'function' && value !== this.__inputPlugin.value) plugin.onInputChange({ target: eventTarget, value, event: ev });
				} finally {
					this._w.setTimeout(() => (this._inputFocus = false), 0);
					this.__removeInput();
				}
			});

			if (!plugin) return;

			// keydown event
			if (typeof plugin.onInputKeyDown === 'function') {
				this.__inputKeyEvent = this.addEvent(eventTarget, 'keydown', (event) => {
					plugin.onInputKeyDown({ target: eventTarget, event });
				});
			}
		} else if (this.__inputBlurEvent && this.__inputPlugin) {
			const value = this.__inputPlugin.target.value.trim();
			if (value !== this.__inputPlugin.value) {
				this.__inputPlugin.obj.onInputChange({ target: this.__inputPlugin.target, value, event: e });
			}

			this.__removeInput();
			return;
		} else if (!this.editor.frameContext.get('isCodeView')) {
			if (isMobile) {
				this.editor._preventBlur = true;
			} else {
				e.preventDefault();
				if (env.isGecko && command) {
					this._injectActiveEvent(target);
				}
			}
		}

		if (command === this.menu.currentDropdownName || command === this.menu.currentContainerName) {
			e.stopPropagation();
		}
	}
}

/**
 * @private
 * @this {EventManagerThis}
 * @param {MouseEvent} e - Event object
 */
export function OnClick_menuTray(e) {
	const eventTarget = domUtils.getEventTarget(e);
	const target = domUtils.getCommandTarget(eventTarget);
	if (!target) return;

	let t = target;
	let k = '';
	while (t && !/se-menu-tray/.test(t.className) && !k) {
		t = t.parentElement;
		k = t.getAttribute('data-key');
	}
	if (!k) return;

	const plugin = this.plugins[k];
	if (!plugin || typeof plugin.action !== 'function') return;

	e.stopPropagation();
	plugin.action(target);
}

/**
 * @private
 * @this {EventManagerThis}
 * @param {MouseEvent} e - Event object
 */
export function OnClick_toolbar(e) {
	const eventTarget = domUtils.getEventTarget(e);
	this.editor.runFromTarget(eventTarget);
}
