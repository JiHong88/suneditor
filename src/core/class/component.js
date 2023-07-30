/**
 * @fileoverview Component class
 */

import CoreInjector from '../../editorInjector/_core';
import { domUtils } from '../../helper';
import Figure from '../../modules/Figure';

const Component = function (editor) {
	CoreInjector.call(this, editor);

	// members
	this.info = null;
	this.currentTarget = null;
	this.currentPlugin = null;
	this.currentPluginName = '';
	this.__globalEvents = [OnCopy_component.bind(this), OnCut_component.bind(this), OnKeyDown_component.bind(this), CloseListener_mouse.bind(this)];
	this._bindClose_copy = null;
	this._bindClose_cut = null;
	this._bindClose_keydown = null;
	this._bindClose_mouse = null;
};

Component.prototype = {
	/**
	 * @description The method to insert a element and return. (used elements : table, hr, image, video)
	 * If "element" is "HR", insert and return the new line.
	 * @param {Element} element Element to be inserted
	 * @param {boolean} notCheckCharCount If true, it will be inserted even if "frameOptions.get('charCounter_max')" is exceeded.
	 * @param {boolean} notSelect If true, Do not automatically select the inserted component.
	 * @returns {Element}
	 */
	insert(element, notCheckCharCount, notSelect) {
		if (this.editor.frameContext.get('isReadOnly') || (!notCheckCharCount && !this.char.check(element))) {
			return null;
		}

		const r = this.html.remove();
		this.selection.getRangeAndAddLine(this.selection.getRange(), r.container);
		let oNode = null;
		let selectionNode = this.selection.getNode();
		let formatEl = this.format.getLine(selectionNode, null);

		if (domUtils.isListCell(formatEl)) {
			this.html.insertNode(element, selectionNode === formatEl ? null : r.container.nextSibling, true);
			if (!element.nextSibling) element.parentNode.appendChild(domUtils.createElement('BR'));
		} else {
			if (this.selection.getRange().collapsed && (r.container.nodeType === 3 || domUtils.isBreak(r.container))) {
				const depthFormat = domUtils.getParentElement(r.container, this.format.isBlock.bind(this.format));
				oNode = this.node.split(r.container, r.offset, !depthFormat ? 0 : domUtils.getNodeDepth(depthFormat) + 1);
				if (oNode) formatEl = oNode.previousSibling;
			}
			this.html.insertNode(element, this.format.isBlock(formatEl) ? null : formatEl, true);
			if (formatEl && domUtils.isZeroWith(formatEl)) domUtils.removeItem(formatEl);
		}

		this.history.push(false);

		if (!notSelect) {
			this.selection.setRange(element, 0, element, 0);
			const fileComponentInfo = this.get(element);
			if (fileComponentInfo) {
				this.select(fileComponentInfo.target, fileComponentInfo.pluginName);
			} else if (oNode) {
				oNode = domUtils.getEdgeChildNodes(oNode, null).sc || oNode;
				this.selection.setRange(oNode, 0, oNode, 0);
			}
		}

		return oNode || element;
	},

	/**
	 * @description Gets the file component and that plugin name
	 * return: {target, component, pluginName} | null
	 * @param {Element} element Target element (figure tag, component div, file tag)
	 * @returns {Object|null}
	 */
	get(element) {
		if (!element) return null;

		let target;
		let pluginName = '';
		let isFile = false;
		if (/^FIGURE$/i.test(element.nodeName) || /se-component/.test(element.className)) {
			if (this.editor._fileManager.queryString) target = element.querySelector(this.editor._fileManager.queryString);
		}
		if (!target && element.nodeName) {
			if (this.editor._fileManager.regExp.test(element.nodeName)) {
				target = element;
				isFile = true;
			} else if ((pluginName = this.editor._componentManager.find((f) => f(element)))) {
				target = element;
				pluginName = pluginName(element);
			}
		}
		if (!target) {
			return null;
		}

		const figureInfo = Figure.GetContainer(target);
		return (this.info = {
			target: target,
			pluginName: pluginName || this.editor._fileManager.pluginMap[target.nodeName.toLowerCase()] || '',
			container: figureInfo.container,
			cover: figureInfo.cover,
			caption: figureInfo.caption,
			isFile: isFile
		});
	},

	/**
	 * @description The component(image, video) is selected and the resizing module is called.
	 * @param {Element} element Element tag (img, iframe, video)
	 * @param {string} pluginName Plugin name (image, video)
	 */
	select(element, pluginName) {
		this.get(element);
		if (domUtils.isUneditable(domUtils.getParentElement(element, this.is.bind(this))) || domUtils.isUneditable(element)) return false;

		this.editor._antiBlur = true;
		this.editor.blur();

		const plugin = this.plugins[pluginName];
		if (!plugin) return;

		setTimeout(
			() => {
				if (typeof plugin.select === 'function') plugin.select(element);
				this._setComponentLineBreaker(element);
				this.__addGlobalEvent();
				if (!this.info.isFile) this.__addNotFileGlobalEvent();
				this.currentTarget = element;
				this.currentPlugin = plugin;
				this.currentPluginName = pluginName;
			},
			this.editor.frameOptions.get('iframe') ? 100 : 0
		);
	},

	close() {
		this.editor._antiBlur = false;
		this.editor.frameContext.get('lineBreaker').style.display = 'none';
		if (this.currentPlugin && typeof this.currentPlugin.close === 'function') {
			this.currentPlugin.close(this.currentTarget);
		}
		this.__removeGlobalEvent();
		this.editor._offCurrentController();
	},

	/**
	 * @description It is judged whether it is the component[img, iframe, video, audio, table] cover(class="se-component") and table, hr
	 * @param {Node} element The node to check
	 * @returns {boolean}
	 */
	is(element) {
		if (!element) return false;

		if (/^FIGURE$/i.test(element.nodeName) || /se-component/.test(element.className)) {
			if (this.editor._fileManager.queryString) return true;
		}
		if (element.nodeName) {
			if (this.editor._fileManager.regExp.test(element.nodeName)) {
				return true;
			} else if (this.editor._componentManager.find((f) => f(element))) {
				return true;
			}
		}

		return false;
	},

	/**
	 * @description Set line breaker of component
	 * @param {Element} element Element tag (img, iframe, video)
	 * @private
	 */
	_setComponentLineBreaker(element) {
		this.eventManager._lineBreakComp = null;
		const fc = this.editor.frameContext;
		const wysiwyg = fc.get('wysiwyg');
		fc.get('lineBreaker').style.display = 'none';

		const info = this.get(element);
		if (!info) return;

		const yScroll = wysiwyg.scrollY || wysiwyg.scrollTop || 0;
		const wScroll = wysiwyg.scrollX || wysiwyg.scrollLeft || 0;
		const container = info.container;
		const t_style = fc.get('lineBreaker_t').style;
		const b_style = fc.get('lineBreaker_b').style;
		const target = this.editor._figureContainer && this.editor._figureContainer.style.display === 'block' ? this.editor._figureContainer : element;
		const toolbarH = this.editor.isClassic && !this.options.get('toolbar_container') ? this.context.get('toolbar.main').offsetHeight : 0;

		const isList = domUtils.isListCell(container.parentNode);
		let componentTop, w;
		// top
		if (isList ? !container.previousSibling : !this.format.isLine(container.previousElementSibling)) {
			this.eventManager._lineBreakComp = container;
			componentTop = this.offset.get(element).top + yScroll;
			w = target.offsetWidth / 2 / 2;

			fc.get('lineBreaker_t').setAttribute('data-offset', componentTop - 12 + ',' + (this.offset.get(target).left + wScroll + w));
			t_style.top = componentTop - yScroll - toolbarH - 12 + 'px';
			t_style.left = this.offset.get(target).left + w + 'px';
			t_style.display = 'block';
		} else {
			t_style.display = 'none';
		}
		// bottom
		if (isList ? !container.nextSibling : !this.format.isLine(container.nextElementSibling)) {
			if (!componentTop) {
				this.eventManager._lineBreakComp = container;
				componentTop = this.offset.get(element).top + yScroll;
				w = target.offsetWidth / 2 / 2;
			}

			fc.get('lineBreaker_b').setAttribute(
				'data-offset',
				componentTop + target.offsetHeight - 12 + ',' + (this.offset.get(target).left + wScroll + target.offsetWidth - w - 24)
			);
			b_style.top = componentTop + target.offsetHeight - yScroll - toolbarH - 12 + 'px';
			b_style.left = this.offset.get(target).left + target.offsetWidth - w - 24 + 'px';
			b_style.display = 'block';
		} else {
			b_style.display = 'none';
		}
	},

	__addGlobalEvent() {
		this.__removeGlobalEvent();
		this._bindClose_copy = this.eventManager.addGlobalEvent('copy', this.__globalEvents[0]);
		this._bindClose_cut = this.eventManager.addGlobalEvent('cut', this.__globalEvents[1]);
		this._bindClose_keydown = this.eventManager.addGlobalEvent('keydown', this.__globalEvents[2]);
	},

	__removeGlobalEvent() {
		this.__removeNotFileGlobalEvent();
		if (this._bindClose_copy) this._bindClose_copy = this.eventManager.removeGlobalEvent(this._bindClose_copy);
		if (this._bindClose_cut) this._bindClose_cut = this.eventManager.removeGlobalEvent(this._bindClose_cut);
		if (this._bindClose_keydown) this._bindClose_keydown = this.eventManager.removeGlobalEvent(this._bindClose_keydown);
		this.currentPlugin = null;
		this.currentTarget = null;
	},

	__addNotFileGlobalEvent() {
		this.__removeNotFileGlobalEvent();
		this._bindClose_mouse = this.eventManager.addGlobalEvent('mousedown', this.__globalEvents[3], true);
	},

	__removeNotFileGlobalEvent() {
		if (this._bindClose_mouse) this._bindClose_mouse = this.eventManager.removeGlobalEvent(this._bindClose_mouse);
	},

	constructor: Component
};

function CloseListener_mouse(e) {
	if (this.currentTarget && this.currentTarget.contains(e.target)) return;
	this.close();
}

function OnCopy_component(e) {
	const info = this.info;
	if (info) {
		SetClipboardComponent(e, info.container, e.clipboardData);
		domUtils.addClass(info.container, 'se-component-copy');
		// copy effect
		setTimeout(() => {
			domUtils.removeClass(info.container, 'se-component-copy');
		}, 120);
	}
}

function OnCut_component(e) {
	const info = this.info;
	if (info) {
		this.__removeGlobalEvent();
		SetClipboardComponent(e, info.container, e.clipboardData);
		this.editor._offCurrentController();
		domUtils.removeItem(info.container);
	}
}

function OnKeyDown_component(e) {
	const keyCode = e.keyCode;
	const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92 || keyCode === 224;

	// redo, undo
	if (ctrl) {
		if (keyCode !== 17) {
			const info = this.editor.shortcutsKeyMap.get(keyCode + (e.shiftKey ? 1000 : 0));
			if (info && /^(redo|undo)$/.test(info.c)) {
				e.preventDefault();
				e.stopPropagation();
				this.__removeGlobalEvent();
				this.editor.run(info.c, info.t, info.e);
			}
		}
		return;
	}

	// backspace, delete
	if (keyCode === 8 || keyCode === 46) {
		e.preventDefault();
		e.stopPropagation();
		if (this.currentPlugin && typeof this.currentPlugin.destroy === 'function') {
			this.currentPlugin.destroy(this.currentTarget);
			this.editor._offCurrentController();
			this.__removeGlobalEvent();
			return;
		}
	}

	// enter
	if (keyCode === 13) {
		e.preventDefault();
		const compContext = this.currentInfo || this.get(this.currentTarget);
		const container = compContext.container || compContext.target;
		const sibling = container.previousElementSibling || container.nextElementSibling;
		let newEl = null;
		if (domUtils.isListCell(container.parentNode)) {
			newEl = domUtils.createElement('BR');
		} else {
			newEl = domUtils.createElement(this.format.isLine(sibling) && !this.format.isBlock(sibling) ? sibling.nodeName : this.options.get('defaultLine'), null, '<br>');
		}

		this.editor._offCurrentController();
		container.parentNode.insertBefore(newEl, container);
		if (this.select(compContext.target, this.currentPluginName) === false) this.editor.blur();
	}

	// up down
	if (keyCode === 38 || keyCode === 40) {
		const compContext = this.get(this.currentTarget);
		const el = keyCode === 38 ? compContext.container.previousElementSibling : compContext.container.nextElementSibling;
		if (!el) return;

		this.close();

		const focusEl = this.eventManager.applyTagEffect(el);
		if (focusEl) {
			e.stopPropagation();
			e.preventDefault();
			this.selection.setRange(focusEl, 0, focusEl, 0);
		}
		return;
	}

	// ESC
	if (keyCode === 27) {
		this.close();
		return;
	}
}

function SetClipboardComponent(e, container, clipboardData) {
	e.preventDefault();
	e.stopPropagation();
	clipboardData.setData('text/html', container.outerHTML);
}

export default Component;
