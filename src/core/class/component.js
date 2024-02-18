/**
 * @fileoverview Component class
 */

import CoreInjector from '../../editorInjector/_core';
import { domUtils, env, numbers } from '../../helper';
import Figure from '../../modules/Figure';

const { _w, ON_OVER_COMPONENT } = env;
const DIR_KEYCODE = /^(3[7-9]|40)$/;
const DIR_UP_KEYCODE = /^3[7-8]$/;

const Component = function (editor) {
	CoreInjector.call(this, editor);

	// members
	this.info = null;
	this.isSelected = false;
	this.currentTarget = null;
	this.currentPlugin = null;
	this.currentPluginName = '';
	this.currentInfo = null;
	this.__globalEvents = {
		copy: OnCopy_component.bind(this),
		cut: OnCut_component.bind(this),
		keydown: OnKeyDown_component.bind(this),
		mousedown: CloseListener_mousedown.bind(this)
	};
	this._bindClose_copy = null;
	this._bindClose_cut = null;
	this._bindClose_keydown = null;
	this._bindClose_mousedown = null;
	this._bindClose_touchstart = null;
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
				oNode = this.nodeTransform.split(r.container, r.offset, !depthFormat ? 0 : domUtils.getNodeDepth(depthFormat) + 1);
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
		let options = {};
		let isFile = false;

		if (this.is(element)) {
			if (/se-component/.test(element.className)) element = element.firstElementChild;
			if (/^FIGURE$/i.test(element.nodeName)) element = element.firstElementChild;
			const comp = this.editor._componentManager.map((f) => f(element)).find((e) => e);
			if (!comp) return null;
			target = comp.target;
			pluginName = comp.pluginName;
			options = comp.options;
		}

		if (!target && element.nodeName) {
			if (this.__isFiles(element)) {
				isFile = true;
			}
			const comp = this.editor._componentManager.map((f) => f(element)).find((e) => e);
			if (!comp) return null;
			target = comp.target;
			pluginName = comp.pluginName;
			options = comp.options;
		}

		if (!target) {
			return null;
		}

		const figureInfo = Figure.GetContainer(target);
		return (this.info = {
			target,
			pluginName,
			options,
			container: figureInfo.container || figureInfo.cover || target,
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
	select(element, pluginName, isInput) {
		const info = this.get(element);
		if (!info || domUtils.isUneditable(domUtils.getParentElement(element, this.is.bind(this))) || domUtils.isUneditable(element)) return false;

		const plugin = this.plugins[pluginName];
		if (!plugin) return;

		if (!isInput && this.eventManager.__overInfo !== ON_OVER_COMPONENT) {
			this.editor._antiBlur = true;
			this.selection.setRange(info.container, 0, info.container, 0);
			this.editor.blur();
		}

		this.isSelected = true;
		_w.setTimeout(() => (this.eventManager.__overInfo = undefined));

		if (typeof plugin.select === 'function') plugin.select(element);

		this._setComponentLineBreaker(info.container || info.cover || element);
		this.__addGlobalEvent();
		if (!this.info.isFile) this.__addNotFileGlobalEvent();
		this.currentTarget = element;
		this.currentPlugin = plugin;
		this.currentPluginName = pluginName;
		this.currentInfo = info;
		domUtils.addClass(info.container, 'se-component-selected');
	},

	deselect() {
		this.editor._antiBlur = false;
		this.eventManager.__overInfo = null;
		Figure.prototype._removeDragEvent.call(this);
		domUtils.removeClass(this.currentInfo?.container, 'se-component-selected');

		const { frameContext } = this.editor;
		frameContext.get('lineBreaker_t').style.display = frameContext.get('lineBreaker_b').style.display = 'none';

		if (this.currentPlugin && typeof this.currentPlugin.deselect === 'function') {
			this.currentPlugin.deselect(this.currentTarget);
		}

		this.isSelected = false;
		this.currentPlugin = null;
		this.currentTarget = null;
		this.currentPluginName = '';
		this.currentInfo = null;
		this.__removeGlobalEvent();
		this.editor.__offControllers();
	},

	/**
	 * @description It is judged whether it is the component[img, iframe, video, audio, table] cover(class="se-component") and table, hr
	 * @param {Node} element The node to check
	 * @returns {boolean}
	 */
	is(element) {
		if (!element) return false;

		if (/^FIGURE$/i.test(element.nodeName) || /se-component/.test(element.className)) return true;
		if (this.editor._componentManager.find((f) => f(element))) return true;

		return false;
	},

	__isFiles(element) {
		const nodeName = element.nodeName.toLowerCase();
		return this.editor._fileManager.regExp.test(nodeName) && (!this.editor._fileManager.tagAttrs[nodeName] || this.editor._fileManager.tagAttrs[nodeName]?.every((v) => element.hasAttribute(v)));
	},

	/**
	 * @description Set line breaker of component
	 * @param {Element} element Element tag
	 * @private
	 */
	_setComponentLineBreaker(element) {
		this.eventManager._lineBreakComp = null;
		const fc = this.editor.frameContext;
		const wysiwyg = fc.get('wysiwyg');

		const info = this.get(element);
		if (!info) return;

		const yScroll = wysiwyg.scrollY || wysiwyg.scrollTop || 0;
		const wScroll = wysiwyg.scrollX || wysiwyg.scrollLeft || 0;
		const container = info.container;
		const isNonSelected = domUtils.hasClass(container, 'se-non-resize-figure');
		const lb_t = fc.get('lineBreaker_t');
		const lb_b = fc.get('lineBreaker_b');
		const t_style = lb_t.style;
		const b_style = lb_b.style;
		const offsetTarget = container.offsetWidth < element.offsetWidth ? container : element;
		const target = this.editor._figureContainer?.style.display === 'block' ? this.editor._figureContainer : offsetTarget;
		const toolbarH = this.editor.isClassic && !this.options.get('toolbar_container') ? this.context.get('toolbar.main').offsetHeight : 0;
		const isList = domUtils.isListCell(container.parentNode);

		// top
		let componentTop, w;
		const isRtl = this.options.get('_rtl');
		const dir = isRtl ? ['right', 'left'] : ['left', 'right'];
		if (isList ? !container.previousSibling : !this.format.isLine(container.previousElementSibling)) {
			const tH = numbers.get(_w.getComputedStyle(lb_t).height, 1);
			this.eventManager._lineBreakComp = container;
			componentTop = this.offset.get(offsetTarget).top + yScroll;
			w = target.offsetWidth / 2 / 2;
			t_style.top = componentTop - yScroll - toolbarH - tH / 2 + 'px';
			t_style[dir[0]] = (isNonSelected ? 4 : this.offset.get(target).left + w) + 'px';
			t_style[dir[1]] = '';
			lb_t.setAttribute('data-offset', yScroll + ',' + wScroll);
			t_style.display = 'block';
		} else {
			t_style.display = 'none';
		}

		// bottom
		if (isList ? !container.nextSibling : !this.format.isLine(container.nextElementSibling)) {
			const cStyle = _w.getComputedStyle(lb_b);
			const bH = numbers.get(cStyle.height, 1);
			const bW = numbers.get(cStyle.width, 1);

			if (!componentTop) {
				this.eventManager._lineBreakComp = container;
				componentTop = this.offset.get(offsetTarget).top + yScroll;
				w = target.offsetWidth / 2 / 2;
			}

			b_style.top = componentTop + target.offsetHeight - yScroll - toolbarH - bH / 2 + 'px';
			b_style.right = '';
			b_style.left = this.offset.get(target).left + (isRtl ? 0 : target.offsetWidth) - (isNonSelected ? 0 : w) - (isNonSelected ? bW / 2 : bW) + 'px';

			const bDir = 'left';
			lb_b.setAttribute('data-offset', yScroll + ',' + bDir + ',' + wScroll);
			b_style.display = 'block';
		} else {
			b_style.display = 'none';
		}
	},

	__addGlobalEvent() {
		this.__removeGlobalEvent();
		this._bindClose_copy = this.eventManager.addGlobalEvent('copy', this.__globalEvents.copy);
		this._bindClose_cut = this.eventManager.addGlobalEvent('cut', this.__globalEvents.cut);
		this._bindClose_keydown = this.eventManager.addGlobalEvent('keydown', this.__globalEvents.keydown);
	},

	__removeGlobalEvent() {
		this.__removeNotFileGlobalEvent();
		if (this._bindClose_copy) this._bindClose_copy = this.eventManager.removeGlobalEvent(this._bindClose_copy);
		if (this._bindClose_cut) this._bindClose_cut = this.eventManager.removeGlobalEvent(this._bindClose_cut);
		if (this._bindClose_keydown) this._bindClose_keydown = this.eventManager.removeGlobalEvent(this._bindClose_keydown);
	},

	__addNotFileGlobalEvent() {
		this.__removeNotFileGlobalEvent();
		this._bindClose_mousedown = this.eventManager.addGlobalEvent('mousedown', this.__globalEvents.mousedown, true);
		this._bindClose_touchstart = this.eventManager.addGlobalEvent('touchstart', this.__globalEvents.mousedown, true);
	},

	__removeNotFileGlobalEvent() {
		if (this._bindClose_mousedown) this._bindClose_mousedown = this.eventManager.removeGlobalEvent(this._bindClose_mousedown);
		if (this._bindClose_touchstart) this._bindClose_touchstart = this.eventManager.removeGlobalEvent(this._bindClose_touchstart);
	},

	constructor: Component
};

function CloseListener_mousedown({ target }) {
	if (
		this.currentTarget?.contains(target) ||
		domUtils.getParentElement(target, '.se-controller') ||
		domUtils.hasClass(target, 'se-drag-handle') ||
		(this.currentPluginName === this.editor.currentControllerName && this.editor.opendControllers.some(({ form }) => form.contains(target)))
	) {
		return;
	}
	this.deselect();
}

function OnCopy_component(e) {
	const info = this.info;
	if (!info) return;

	SetClipboardComponent(e, info.container, e.clipboardData);
	domUtils.addClass(info.container, 'se-copy');
	// copy effect
	this._w.setTimeout(() => {
		domUtils.removeClass(info.container, 'se-copy');
	}, 120);
}

function OnCut_component(e) {
	const info = this.info;
	if (!info) return;

	SetClipboardComponent(e, info.container, e.clipboardData);
	this.deselect();
	domUtils.removeItem(info.container);
}

function OnKeyDown_component(e) {
	if (this.editor.selectMenuOn) return;

	const keyCode = e.keyCode;
	const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92 || keyCode === 224;

	// redo, undo
	if (ctrl) {
		if (keyCode !== 17) {
			const info = this.editor.shortcutsKeyMap.get(keyCode + (e.shiftKey ? 1000 : 0));
			if (/^(redo|undo)$/.test(info?.c)) {
				e.preventDefault();
				e.stopPropagation();
				this.editor.run(info.c, info.t, info.e);
			}
		}
		return;
	}

	// backspace, delete
	if (keyCode === 8 || keyCode === 46) {
		e.preventDefault();
		e.stopPropagation();
		if (typeof this.currentPlugin?.destroy === 'function') {
			this.currentPlugin.destroy(this.currentTarget);
			this.deselect();
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

		const pluginName = this.currentPluginName;
		this.deselect();
		container.parentNode.insertBefore(newEl, container);
		if (this.select(compContext.target, pluginName) === false) this.editor.blur();
	}

	// up down
	if (DIR_KEYCODE.test(keyCode)) {
		const compContext = this.get(this.currentTarget);
		const el = DIR_UP_KEYCODE.test(keyCode) ? compContext.container.previousElementSibling : compContext.container.nextElementSibling;
		if (!el) return;

		this.deselect();

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
		this.deselect();
		return;
	}
}

function SetClipboardComponent(e, container, clipboardData) {
	e.preventDefault();
	e.stopPropagation();
	clipboardData.setData('text/html', container.outerHTML);
}

export default Component;
