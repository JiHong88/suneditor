/**
 * @fileoverview Component class
 */

import CoreInjector from '../../editorInjector/_core';
import { domUtils, env, numbers, unicode } from '../../helper';
import { Figure, _DragHandle } from '../../modules';

const { _w, ON_OVER_COMPONENT, isMobile } = env;
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
	this.__selectionSelected = false;

	this.editor.applyFrameRoots((e) => {
		// drag
		const dragHandle = domUtils.createElement('DIV', { class: 'se-drag-handle', draggable: 'true' }, this.icons.selection);
		e.get('wrapper').appendChild(dragHandle);
		this.eventManager.addEvent(dragHandle, 'mouseenter', OnDragEnter.bind(this));
		this.eventManager.addEvent(dragHandle, 'mouseleave', OnDragLeave.bind(this));
		this.eventManager.addEvent(dragHandle, 'dragstart', OnDragStart.bind(this));
		this.eventManager.addEvent(dragHandle, 'dragend', OnDragEnd.bind(this));
		this.eventManager.addEvent(dragHandle, 'click', OnDragClick.bind(this));
	});
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
		const isInline = this.isInline(element);
		this.selection.getRangeAndAddLine(this.selection.getRange(), r.container);
		const selectionNode = this.selection.getNode();
		let oNode = null;
		let formatEl = this.format.getLine(selectionNode, null);

		if (domUtils.isListCell(formatEl)) {
			this.html.insertNode(element, isInline ? null : selectionNode === formatEl ? null : r.container.nextSibling, true);
			if (!isInline && !element.nextSibling) element.parentNode.appendChild(domUtils.createElement('BR'));
		} else {
			if (!isInline && this.selection.getRange().collapsed && (r.container.nodeType === 3 || domUtils.isBreak(r.container))) {
				const depthFormat = domUtils.getParentElement(r.container, this.format.isBlock.bind(this.format));
				oNode = this.nodeTransform.split(r.container, r.offset, !depthFormat ? 0 : domUtils.getNodeDepth(depthFormat) + 1);
				if (oNode) formatEl = oNode.previousSibling;
			}
			this.html.insertNode(element, isInline ? null : this.format.isBlock(formatEl) ? null : formatEl, true);
			if (!isInline && formatEl && domUtils.isZeroWith(formatEl)) domUtils.removeItem(formatEl);
		}

		if (isInline) {
			const empty = domUtils.createTextNode(unicode.zeroWidthSpace);
			element.parentNode.insertBefore(empty, element.nextSibling);
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
			if (domUtils.hasClass(element, 'se-component') && !domUtils.hasClass(element, 'se-inline-component')) element = element.firstElementChild || element;
			if (/^FIGURE$/i.test(element.nodeName)) element = element.firstElementChild;
			if (!element) return null;

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

		if (!isInput && _DragHandle.get('__overInfo') !== ON_OVER_COMPONENT) {
			this.editor._antiBlur = true;
			this.__selectionSelected = true;
			if (this.isInline(info.container)) {
				this.selection.setRange(info.container, 0, info.container, 0);
			}
			this.editor.blur();
			_w.setTimeout(() => {
				this.__selectionSelected = false;
			});
		}

		this.isSelected = true;

		let isNonFigureComponent;
		if (typeof plugin.select === 'function') isNonFigureComponent = plugin.select(element);

		if (!isNonFigureComponent && !domUtils.hasClass(info.container, 'se-inline-component')) this._setComponentLineBreaker(info.container || info.cover || element);

		this.currentTarget = element;
		this.currentPlugin = plugin;
		this.currentPluginName = pluginName;
		this.currentInfo = info;

		_DragHandle.set('__dragInst', this);

		const __overInfo = _DragHandle.get('__overInfo');
		_w.setTimeout(() => {
			_DragHandle.set('__overInfo', __overInfo === ON_OVER_COMPONENT ? undefined : false);
			if (__overInfo !== ON_OVER_COMPONENT) this.__addGlobalEvent();
			if (!info.isFile) this.__addNotFileGlobalEvent();
		}, 0);
		domUtils.addClass(info.container, 'se-component-selected');

		if (__overInfo !== ON_OVER_COMPONENT) {
			domUtils.setDisabled(this.editor._controllerOnDisabledButtons, true);

			// set zero width space
			if (!this.isInline(info.container)) return;

			const oNode = info.container;
			let zeroWidth = null;
			if (!oNode.previousSibling || domUtils.isBreak(oNode.previousSibling)) {
				zeroWidth = domUtils.createTextNode(unicode.zeroWidthSpace);
				oNode.parentNode.insertBefore(zeroWidth, oNode);
			}

			if (!oNode.nextSibling || domUtils.isBreak(oNode.nextSibling)) {
				zeroWidth = domUtils.createTextNode(unicode.zeroWidthSpace);
				oNode.parentNode.insertBefore(zeroWidth, oNode.nextSibling);
			}

			this.editor.status.onSelected = true;
		} else if (!domUtils.hasClass(info.container, 'se-input-component')) {
			const dragHandle = this.editor.frameContext.get('wrapper').querySelector('.se-drag-handle');
			domUtils.addClass(dragHandle, 'se-drag-handle-full');
			this.editor._visibleControllers(false, false);

			const sizeTarget = info.caption ? info.target : info.cover || info.container || info.target;
			const w = sizeTarget.offsetWidth;
			const h = sizeTarget.offsetHeight;
			const { top, left } = this.offset.getLocal(sizeTarget);

			dragHandle.style.opacity = 0;
			dragHandle.style.width = w + 'px';
			dragHandle.style.height = h + 'px';
			dragHandle.style.top = top + 'px';
			dragHandle.style.left = left + 'px';

			_DragHandle.set('__dragHandler', dragHandle);
			_DragHandle.set('__dragContainer', info.container);
			_DragHandle.set('__dragCover', info.cover);

			dragHandle.style.display = 'block';
		}
	},

	deselect() {
		this.editor.status.onSelected = false;
		this.__deselect();
		domUtils.setDisabled(this.editor._controllerOnDisabledButtons, false);
	},

	/**
	 * @description Determines if the specified node is a block component (e.g., img, iframe, video, audio, table) with the class "se-component"
	 * or a direct FIGURE node. This function checks if the node itself is a component
	 * or if it belongs to any components identified by the component manager.
	 * @param {Node} element The DOM node to check.
	 * @returns {boolean} True if the node is a block component or part of it, otherwise false.
	 */
	is(element) {
		if (!element) return false;

		if (/^FIGURE$/i.test(element.nodeName) || domUtils.hasClass(element, 'se-component')) return true;
		if (this.editor._componentManager.find((f) => f(element))) return true;

		return false;
	},

	/**
	 * @description Checks if the given node is an inline component (class "se-inline-component").
	 * If the node is a FIGURE, it checks the parent element instead.
	 * It also verifies whether the node is part of an inline component recognized by the component manager.
	 * @param {Node} element The DOM node to check.
	 * @returns {boolean} True if the node is an inline component or part of it, otherwise false.
	 */
	isInline(element) {
		if (!element) return false;

		if (/^FIGURE$/i.test(element.nodeName)) element = element.parentElement;
		if (domUtils.hasClass(element, 'se-inline-component')) return true;

		const container = this.editor._componentManager.find((f) => f(element));
		if (container && domUtils.hasClass(element, 'se-inline-component')) return true;

		return false;
	},

	/**
	 * @description Checks if the specified node qualifies as a basic component within the editor.
	 * This function verifies whether the node is recognized as a component by the `is` function, while also ensuring that it is not an inline component as determined by the `isInline` function.
	 * This is used to identify block-level elements or standalone components that are not part of the inline component classification.
	 * @param {Node} element The DOM node to check.
	 * @returns {boolean} True if the node is a basic (non-inline) component, otherwise false.
	 */
	isBasic(element) {
		return this.is(element) && !this.isInline(element);
	},

	__isFiles(element) {
		const nodeName = element.nodeName.toLowerCase();
		return this.editor._fileManager.regExp.test(nodeName) && (!this.editor._fileManager.tagAttrs[nodeName] || this.editor._fileManager.tagAttrs[nodeName]?.every((v) => element.hasAttribute(v)));
	},

	__deselect() {
		this.editor._antiBlur = false;
		_DragHandle.set('__overInfo', null);
		this._removeDragEvent(this);
		domUtils.removeClass(this.currentInfo?.container, 'se-component-selected|');
		domUtils.removeClass(this.currentInfo?.cover, 'se-figure-over-selected');

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
	 * @description Set line breaker of component
	 * @param {Element} element Element tag
	 * @private
	 */
	_setComponentLineBreaker(element) {
		this.eventManager._lineBreakComp = null;
		const info = this.get(element);
		if (!info) return;

		const fc = this.editor.frameContext;
		const container = info.container;
		const isNonSelected = domUtils.hasClass(container, 'se-flex-component');
		const lb_t = fc.get('lineBreaker_t');
		const lb_b = fc.get('lineBreaker_b');
		const t_style = lb_t.style;
		const b_style = lb_b.style;
		const offsetTarget = container.offsetWidth < element.offsetWidth ? container : element;
		const target = this.editor._figureContainer?.style.display === 'block' ? this.editor._figureContainer : offsetTarget;
		const isList = domUtils.isListCell(container.parentNode);

		// top
		let componentTop, w;
		const isRtl = this.options.get('_rtl');
		const dir = isRtl ? ['right', 'left'] : ['left', 'right'];
		const top = offsetTarget.offsetTop;
		const { scrollX, scrollY } = this.offset.getLocal(offsetTarget);

		if (isList ? !container.previousSibling : !this.format.isLine(container.previousElementSibling)) {
			const tH = numbers.get(_w.getComputedStyle(lb_t).height, 1);
			this.eventManager._lineBreakComp = container;
			componentTop = top;
			w = target.offsetWidth / 2 / 2;
			t_style.top = componentTop - scrollY - tH / 2 + 'px';
			t_style[dir[0]] = (isNonSelected ? 4 : this.offset.get(target).left + w) + 'px';
			t_style[dir[1]] = '';
			lb_t.setAttribute('data-offset', scrollY + ',' + scrollX);
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
				componentTop = top;
				w = target.offsetWidth / 2 / 2;
			}

			b_style.top = componentTop + target.offsetHeight - scrollY - bH / 2 + 'px';
			b_style.right = '';
			b_style.left = this.offset.get(target).left + (isRtl ? 0 : target.offsetWidth) - (isNonSelected ? 0 : w) - (isNonSelected ? bW / 2 : bW) + 'px';

			const bDir = 'left';
			lb_b.setAttribute('data-offset', scrollY + ',' + bDir + ',' + scrollX);
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
		if (!isMobile) this._bindClose_mousedown = this.eventManager.addGlobalEvent('mousedown', this.__globalEvents.mousedown, true);
		else this._bindClose_touchstart = this.eventManager.addGlobalEvent('touchstart', this.__globalEvents.mousedown, true);
	},

	__removeNotFileGlobalEvent() {
		if (this._bindClose_mousedown) this._bindClose_mousedown = this.eventManager.removeGlobalEvent(this._bindClose_mousedown);
		if (this._bindClose_touchstart) this._bindClose_touchstart = this.eventManager.removeGlobalEvent(this._bindClose_touchstart);
	},

	_removeDragEvent() {
		this.carrierWrapper.querySelector('.se-drag-cursor').style.left = '-10000px';
		if (_DragHandle.get('__dragHandler')) _DragHandle.get('__dragHandler').style.display = 'none';

		domUtils.removeClass([_DragHandle.get('__dragHandler'), _DragHandle.get('__dragContainer')], 'se-dragging');
		domUtils.removeClass([_DragHandle.get('__dragCover'), _DragHandle.get('__dragContainer')], 'se-drag-over');

		_DragHandle.set('__figureInst', null);
		_DragHandle.set('__dragInst', null);
		_DragHandle.set('__dragHandler', null);
		_DragHandle.set('__dragContainer', null);
		_DragHandle.set('__dragCover', null);
		_DragHandle.set('__dragMove', null);
		_DragHandle.set('__overInfo', null);
	},

	constructor: Component
};

function OnDragEnter() {
	this.editor._antiBlur = true;
	this.editor._visibleControllers(false, domUtils.hasClass(_DragHandle.get('__dragHandler'), 'se-drag-handle-full'));
	domUtils.addClass(_DragHandle.get('__dragCover') || _DragHandle.get('__dragContainer'), 'se-drag-over');
}

function OnDragLeave() {
	this.editor._antiBlur = false;
	if (!domUtils.hasClass(_DragHandle.get('__dragHandler'), 'se-drag-handle-full')) this.editor._visibleControllers(true, true);
	domUtils.removeClass([_DragHandle.get('__dragCover'), _DragHandle.get('__dragContainer')], 'se-drag-over');
}

function OnDragStart(e) {
	const cover = _DragHandle.get('__dragCover') || _DragHandle.get('__dragContainer');

	if (!cover) {
		e.preventDefault();
		return;
	}

	this.editor._antiBlur = false;
	domUtils.addClass(_DragHandle.get('__dragHandler'), 'se-dragging');
	domUtils.addClass(_DragHandle.get('__dragContainer'), 'se-dragging');
	e.dataTransfer.setDragImage(cover, this.options.get('_rtl') ? cover.offsetWidth : -5, -5);
}

function OnDragEnd() {
	this.editor._antiBlur = false;
	domUtils.removeClass([_DragHandle.get('__dragHandler'), _DragHandle.get('__dragContainer')], 'se-dragging');
	this._removeDragEvent();
}

function OnDragClick({ target }) {
	if (!domUtils.hasClass(target, 'se-drag-handle-full')) return;

	const dragInst = _DragHandle.get('__dragInst');
	this._removeDragEvent();
	this.select(dragInst.currentTarget, dragInst.currentPluginName, false);
}

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
	if (domUtils.isInputElement(e.target) && domUtils.getParentElement(e.target, '.se-modal')) return;

	const info = this.info;
	if (!info) return;

	SetClipboardComponent(e, info.container, e.clipboardData);
	domUtils.addClass(info.container, 'se-copy');
	// copy effect
	_w.setTimeout(() => {
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

async function OnKeyDown_component(e) {
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

	// backspace key, delete key
	if (keyCode === 8 || keyCode === 46) {
		e.preventDefault();
		e.stopPropagation();
		if (typeof this.currentPlugin?.destroy === 'function') {
			await this.currentPlugin.destroy(this.currentTarget);
			this.deselect();
			this.editor.focus();
			return;
		}
	}

	// enter key
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
		this.history.push(false);

		return;
	}

	// up down, left right
	if (DIR_KEYCODE.test(keyCode)) {
		const { container } = this.get(this.currentTarget);
		const isInline = this.isInline(container || this.currentTarget);

		let el = null;
		let offset = 1;
		if (isInline) {
			switch (keyCode) {
				case 37: // left
					el = container.previousSibling;
					offset = el?.nodeType === 3 ? el.textContent.length : 1;
					break;
				case 39: // right
					el = container.nextSibling;
					break;
				case 38: {
					// up
					const line = this.format.getLine(container, null);
					el = line?.previousElementSibling;
					offset = 0;
					break;
				}
				case 40: {
					// down
					const line = this.format.getLine(container, null);
					el = line?.nextElementSibling;
					break;
				}
			}
		} else {
			if (DIR_UP_KEYCODE.test(keyCode)) {
				el = container.previousElementSibling;
			} else {
				el = container.nextElementSibling;
				offset = 0;
			}
		}

		if (!el) return;

		this.deselect();

		const elComp = this.get(el);
		if (elComp?.container) {
			e.stopPropagation();
			e.preventDefault();
			this.select(elComp.target, elComp.pluginName);
		} else {
			try {
				this.editor._antiBlur = true;
				e.stopPropagation();
				e.preventDefault();
				this.selection.setRange(el, offset, el, offset);
			} finally {
				this.editor._antiBlur = false;
			}
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
	const pasteContainer = container.cloneNode(true);
	domUtils.removeClass(pasteContainer, 'se-component-selected');
	pasteContainer.querySelectorAll('.se-figure-selected').forEach((el) => domUtils.removeClass(el, 'se-figure-selected'));
	clipboardData.setData('text/html', pasteContainer.outerHTML);
}

export default Component;
