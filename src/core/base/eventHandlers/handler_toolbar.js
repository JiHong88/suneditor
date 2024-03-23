import { domUtils, env } from '../../../helper';

const { isMobile } = env;

export function ButtonsHandler(e) {
	let target = e.target;

	if (this.editor.isSubBalloon && !this.context.get('toolbar.sub.main')?.contains(target)) {
		this._hideToolbar_sub();
	}

	const isInput = domUtils.isInputElement(target);
	if (this.menu._bindControllersOff) e.stopPropagation();

	if (isInput) {
		this.editor._antiBlur = false;
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
			target = target.parentNode;
			command = target.getAttribute('data-command');
			className = target.className;
		}

		// toolbar input button
		if (isInput && /^INPUT$/i.test(target?.getAttribute('data-type'))) {
			this.editor._antiBlur = this._inputFocus = true;
			if (!this.status.hasFocus) this.applyTagEffect();
			/* event */
			const eventTarget = e.target;
			if (!domUtils.isInputElement(eventTarget) || eventTarget.disabled) return;

			const plugin = this.plugins[command];

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
				this.editor._antiBlur = true;
			} else {
				e.preventDefault();
				if (env.isGecko && command) {
					this._injectActiveEvent(target);
				}
			}
		}

		if (command === this.menu.currentDropdownName || command === this.editor._containerName) {
			e.stopPropagation();
		}
	}
}

export function OnClick_menuTray(e) {
	const target = domUtils.getCommandTarget(e.target);
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

export function OnClick_toolbar(e) {
	this.editor.runFromTarget(e.target);
}
