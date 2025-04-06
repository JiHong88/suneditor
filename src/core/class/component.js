/**
 * @fileoverview Component class
 */

import CoreInjector from '../../editorInjector/_core';
import { dom, env, numbers, unicode, keyCodeMap } from '../../helper';
import { Figure, _DragHandle } from '../../modules';

const { _w, ON_OVER_COMPONENT, isMobile } = env;
const DIR_KEYCODE = /^(3[7-9]|40)$/;
const DIR_UP_KEYCODE = /^3[7-8]$/;

/**
 * @typedef {Omit<Component & Partial<__se__EditorInjector>, 'component'>} ComponentThis
 */

/**
 * @constructor
 * @this {ComponentThis}
 * @description Class for managing components such as images and tables that are not in line format
 * @param {__se__EditorCore} editor - The root editor instance
 */
function Component(editor) {
	CoreInjector.call(this, editor);

	/**
	 * @description The current component information, used copy, cut, and keydown events
	 * @type {__se__ComponentInfo}
	 */
	this.info = null;

	/**
	 * @description Component is selected
	 * @type {boolean}
	 */
	this.isSelected = false;

	/**
	 * @description Currently selected component target
	 * @type {Node|null}
	 */
	this.currentTarget = null;

	/**
	 * @description Currently selected component plugin instance
	 * @type {*}
	 */
	this.currentPlugin = null;

	/**
	 * @description Currently selected component plugin name
	 * @type {*}
	 */
	this.currentPluginName = '';

	/**
	 * @description Currently selected component information
	 * @type {__se__ComponentInfo|null}
	 */
	this.currentInfo = null;

	/** @type {Object<string, (...args: *) => *>} */
	this.__globalEvents = {
		copy: OnCopy_component.bind(this),
		cut: OnCut_component.bind(this),
		keydown: OnKeyDown_component.bind(this),
		mousedown: CloseListener_mousedown.bind(this)
	};
	/** @type {__se__GlobalEventInfo|void} */
	this._bindClose_copy = null;
	/** @type {__se__GlobalEventInfo|void} */
	this._bindClose_cut = null;
	/** @type {__se__GlobalEventInfo|void} */
	this._bindClose_keydown = null;
	/** @type {__se__GlobalEventInfo|void} */
	this._bindClose_mousedown = null;
	/** @type {__se__GlobalEventInfo|void} */
	this._bindClose_touchstart = null;
	/** @type {boolean} */
	this.__selectionSelected = false;

	this.editor.applyFrameRoots((e) => {
		// drag
		const dragHandle = dom.utils.createElement('DIV', { class: 'se-drag-handle', draggable: 'true' }, this.icons.selection);
		e.get('wrapper').appendChild(dragHandle);
		this.eventManager.addEvent(dragHandle, 'mouseenter', OnDragEnter.bind(this));
		this.eventManager.addEvent(dragHandle, 'mouseleave', OnDragLeave.bind(this));
		this.eventManager.addEvent(dragHandle, 'dragstart', OnDragStart.bind(this));
		this.eventManager.addEvent(dragHandle, 'dragend', OnDragEnd.bind(this));
		this.eventManager.addEvent(dragHandle, 'click', OnDragClick.bind(this));
	});
}

Component.prototype = {
	/**
	 * @this {ComponentThis}
	 * @description Inserts an element and returns it. (Used for elements: table, hr, image, video)
	 * - If "element" is "HR", inserts and returns the new line.
	 * @param {Node} element Element to be inserted
	 * @param {Object} [options] Options
	 * @param {boolean} [options.skipCharCount=false] If true, it will be inserted even if "frameOptions.get('charCounter_max')" is exceeded.
	 * @param {boolean} [options.skipSelection=false] If true, do not automatically select the inserted component.
	 * @param {boolean} [options.skipHistory=false] If true, do not push to history.
	 * @returns {HTMLElement} The inserted element or new line (for HR)
	 */
	insert(element, { skipCharCount, skipSelection, skipHistory } = {}) {
		if (this.editor.frameContext.get('isReadOnly') || (!skipCharCount && !this.char.check(element))) {
			return null;
		}

		const r = this.html.remove();
		const isInline = this.isInline(element);
		this.selection.getRangeAndAddLine(this.selection.getRange(), r.container);
		const selectionNode = this.selection.getNode();
		let oNode = null;
		let formatEl = this.format.getLine(selectionNode, null);

		if (dom.check.isListCell(formatEl)) {
			this.html.insertNode(element, { afterNode: isInline ? null : selectionNode === formatEl ? null : r.container.nextSibling, skipCharCount: true });
			if (!isInline && !element.nextSibling) element.parentNode.appendChild(dom.utils.createElement('BR'));
		} else {
			if (!isInline && this.selection.getRange().collapsed && (r.container.nodeType === 3 || dom.check.isBreak(r.container))) {
				const depthFormat = dom.query.getParentElement(r.container, this.format.isBlock.bind(this.format));
				oNode = this.nodeTransform.split(r.container, r.offset, !depthFormat ? 0 : dom.query.getNodeDepth(depthFormat) + 1);
				if (oNode) formatEl = /** @type {HTMLElement} */ (oNode.previousSibling);
			}
			this.html.insertNode(element, { afterNode: isInline ? null : this.format.isBlock(formatEl) ? null : formatEl, skipCharCount: true });
			if (!isInline && formatEl && dom.check.isZeroWidth(formatEl)) dom.utils.removeItem(formatEl);
		}

		if (isInline) {
			const empty = dom.utils.createTextNode(unicode.zeroWidthSpace);
			element.parentNode.insertBefore(empty, element.nextSibling);
		}

		if (!skipHistory) this.history.push(false);

		if (!skipSelection) {
			this.selection.setRange(element, 0, element, 0);
			const fileComponentInfo = this.get(element);
			if (fileComponentInfo) {
				this.select(fileComponentInfo.target, fileComponentInfo.pluginName);
			} else if (oNode) {
				oNode = dom.query.getEdgeChildNodes(oNode, null).sc || oNode;
				this.selection.setRange(oNode, 0, oNode, 0);
			}
		}

		// document type
		if (this.editor.frameContext.has('documentType-use-header')) {
			this.editor.frameContext.get('documentType').reHeader();
		}

		return /** @type {HTMLElement} */ (oNode || element);
	},

	/**
	 * @this {ComponentThis}
	 * @description Gets the file component and that plugin name
	 * - return: {target, component, pluginName} | null
	 * @param {Node} element Target element (figure tag, component div, file tag)
	 * @returns {__se__ComponentInfo|null}
	 */
	get(element) {
		if (!element) return null;

		let target;
		let pluginName = '';
		let options = {};
		let isFile = false;
		let launcher = null;

		if (this.is(element)) {
			if (dom.utils.hasClass(element, 'se-component') && !dom.utils.hasClass(element, 'se-inline-component')) element = /** @type {HTMLElement} */ (element).firstElementChild || element;
			if (/^FIGURE$/i.test(element.nodeName)) element = /** @type {HTMLElement} */ (element).firstElementChild;
			if (!element) return null;

			const comp = this.editor._componentManager.map((f) => f(element)).find((e) => e);
			if (!comp) return null;
			target = comp.target;
			pluginName = comp.pluginName;
			options = comp.options;
			launcher = comp.launcher;
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
			launcher = comp.launcher;
		}

		if (!target) {
			return null;
		}

		const figureInfo = Figure.GetContainer(target);
		const container = figureInfo.container || figureInfo.cover || target;
		return (this.info = {
			target,
			pluginName,
			options,
			container: container,
			cover: figureInfo.cover,
			inlineCover: figureInfo.inlineCover,
			caption: figureInfo.caption,
			isFile,
			launcher,
			isInputType: dom.utils.hasClass(container, 'se-input-component')
		});
	},

	/**
	 * @this {ComponentThis}
	 * @description The component(media, file component, table, etc) is selected and the resizing module is called.
	 * @param {Node} element Target element
	 * @param {string} pluginName The plugin name for the selected target.
	 * @param {boolean} [isInput=false] Whether the target is an input component.(table)
	 * @param {boolean} [force=false] Forces the component selection action again even if it is already selected.
	 */
	select(element, pluginName, isInput, force) {
		if (!force && element === this.currentTarget && this.editor.currentControllerName === this.currentPluginName) return;

		const info = this.get(element);
		if (!info || dom.check.isUneditable(dom.query.getParentElement(element, this.is.bind(this))) || dom.check.isUneditable(element)) return false;

		const plugin = info.launcher || this.plugins[pluginName];
		if (!plugin) return;

		if (!isInput && _DragHandle.get('__overInfo') !== ON_OVER_COMPONENT) {
			if (this.editor.status._onMousedown) return;

			this.editor._preventBlur = true;
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

		const isBreakComponent = dom.utils.hasClass(info.target, 'se-component-line-break');
		if (isBreakComponent || (!isNonFigureComponent && !dom.utils.hasClass(info.container, 'se-inline-component'))) this._setComponentLineBreaker(/** @type {HTMLElement} */ (info.container || info.cover || element));

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
		dom.utils.addClass(info.container, 'se-component-selected');

		if (!isBreakComponent && __overInfo !== ON_OVER_COMPONENT) {
			// set zero width space
			if (!this.isInline(info.container)) return;

			const oNode = info.container;
			let zeroWidth = null;
			if (!oNode.previousSibling || dom.check.isBreak(oNode.previousSibling)) {
				zeroWidth = dom.utils.createTextNode(unicode.zeroWidthSpace);
				oNode.parentNode.insertBefore(zeroWidth, oNode);
			}

			if (!oNode.nextSibling || dom.check.isBreak(oNode.nextSibling)) {
				zeroWidth = dom.utils.createTextNode(unicode.zeroWidthSpace);
				oNode.parentNode.insertBefore(zeroWidth, oNode.nextSibling);
			}

			this.editor.status.onSelected = true;
		} else if (isBreakComponent || !dom.utils.hasClass(info.container, 'se-input-component')) {
			const dragHandle = this.editor.frameContext.get('wrapper').querySelector('.se-drag-handle');
			dom.utils.addClass(dragHandle, 'se-drag-handle-full');
			this.ui._visibleControllers(false, false);

			const sizeTarget = info.caption ? info.target : info.cover || info.container || info.target;
			const w = sizeTarget.offsetWidth;
			const h = sizeTarget.offsetHeight;
			const { top, left } = this.offset.getLocal(sizeTarget);

			dragHandle.style.opacity = 0;
			dragHandle.style.width = w + 'px';
			dragHandle.style.height = h + 'px';
			dragHandle.style.top = top - 1 + 'px';
			dragHandle.style.left = left + 'px';

			_DragHandle.set('__dragHandler', dragHandle);
			_DragHandle.set('__dragContainer', info.container);
			_DragHandle.set('__dragCover', info.cover);

			dragHandle.style.display = 'block';
		}
	},

	/**
	 * @this {ComponentThis}
	 * @description Deselects the selected component.
	 */
	deselect() {
		_w.setTimeout(() => {
			this.editor.status.onSelected = false;
		}, 0);
		this.__deselect();
		this.ui.setControllerOnDisabledButtons(false);
	},

	/**
	 * @this {ComponentThis}
	 * @description Determines if the specified node is a block component (e.g., img, iframe, video, audio, table) with the class "se-component"
	 * - or a direct FIGURE node. This function checks if the node itself is a component
	 * - or if it belongs to any components identified by the component manager.
	 * @param {Node} element The DOM node to check.
	 * @returns {boolean} True if the node is a block component or part of it, otherwise false.
	 */
	is(element) {
		if (!element) return false;

		if (/^FIGURE$/i.test(element.nodeName) || dom.utils.hasClass(element, 'se-component')) return true;
		if (this.editor._componentManager.find((f) => f(element))) return true;

		return false;
	},

	/**
	 * @this {ComponentThis}
	 * @description Checks if the given node is an inline component (class "se-inline-component").
	 * - If the node is a FIGURE, it checks the parent element instead.
	 * - It also verifies whether the node is part of an inline component recognized by the component manager.
	 * @param {Node} element The DOM node to check.
	 * @returns {boolean} True if the node is an inline component or part of it, otherwise false.
	 */
	isInline(element) {
		if (!element) return false;

		if (/^FIGURE$/i.test(element.nodeName)) element = element.parentElement;
		if (dom.utils.hasClass(element, 'se-inline-component')) return true;

		const container = this.editor._componentManager.find((f) => f(element));
		if (container && dom.utils.hasClass(element, 'se-inline-component')) return true;

		return false;
	},

	/**
	 * @this {ComponentThis}
	 * @description Checks if the specified node qualifies as a basic component within the editor.
	 * - This function verifies whether the node is recognized as a component by the `is` function, while also ensuring that it is not an inline component as determined by the `isInline` function.
	 * - This is used to identify block-level elements or standalone components that are not part of the inline component classification.
	 * @param {Node} element The DOM node to check.
	 * @returns {boolean} True if the node is a basic (non-inline) component, otherwise false.
	 */
	isBasic(element) {
		return this.is(element) && !this.isInline(element);
	},

	/**
	 * @this {ComponentThis}
	 * @description Copies the specified component node to the clipboard.
	 * - This function is different from the one called when the user presses the "Ctrl + C" key combination.
	 * @param {Node} container The DOM node to check.
	 */
	copy(container) {
		const cloneContainer = /** @type {HTMLElement} */ (dom.utils.clone(container, true));

		// remove selected class
		dom.utils.removeClass(cloneContainer, 'se-component-selected');
		dom.utils.removeClass(cloneContainer.querySelectorAll('.se-figure-selected'), 'se-figure-selected');
		dom.utils.removeClass(cloneContainer.querySelectorAll('.se-selected-table-cell'), 'se-selected-table-cell');
		dom.utils.removeClass(cloneContainer.querySelector('.se-selected-cell-focus'), 'se-selected-cell-focus');

		// copy to clipboard
		this.html.copy(cloneContainer);

		// copy effect
		dom.utils.flashClass(container, 'se-copy');
	},

	/**
	 * @private
	 * @this {ComponentThis}
	 * @description Checks if the given element is a file component by matching its tag name against the file manager's regular expressions.
	 * - It also verifies whether the element has the required attributes based on the tag type.
	 * @param {Node} element The element to check.
	 * @returns {boolean} Returns true if the element is a file component, otherwise false.
	 */
	__isFiles(element) {
		const nodeName = element.nodeName.toLowerCase();
		return this.editor._fileManager.regExp.test(nodeName) && (!this.editor._fileManager.tagAttrs[nodeName] || this.editor._fileManager.tagAttrs[nodeName]?.every((v) => /** @type {HTMLElement} */ (element).hasAttribute(v)));
	},

	/**
	 * @private
	 * @this {ComponentThis}
	 * @description Deselects the currently selected component, removing any selection effects and associated event listeners.
	 * - This method resets the selection state and hides UI elements related to the component selection.
	 */
	__deselect() {
		this.editor._preventBlur = false;
		_DragHandle.set('__overInfo', null);
		this._removeDragEvent();
		dom.utils.removeClass(this.currentInfo?.container, 'se-component-selected|');
		dom.utils.removeClass(this.currentInfo?.cover, 'se-figure-over-selected');

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
		this.ui.__offControllers();
	},

	/**
	 * @private
	 * @this {ComponentThis}
	 * @description Set line breaker of component
	 * @param {HTMLElement} element Element tag
	 */
	_setComponentLineBreaker(element) {
		const _overInfo = _DragHandle.get('__overInfo') === ON_OVER_COMPONENT;
		this.eventManager._lineBreakComp = null;
		const info = this.get(element);
		if (!info) return;

		const fc = this.editor.frameContext;
		const container = info.container;
		const isNonSelected = dom.utils.hasClass(container, 'se-flex-component');
		const lb_t = fc.get('lineBreaker_t');
		const lb_b = fc.get('lineBreaker_b');
		const t_style = lb_t.style;
		const b_style = lb_b.style;
		const offsetTarget = container.offsetWidth < element.offsetWidth ? container : element;
		const target = this.editor._figureContainer?.style.display === 'block' ? this.editor._figureContainer : offsetTarget;
		const isList = dom.check.isListCell(container.parentNode);

		// top
		let componentTop, w;
		const isRtl = this.options.get('_rtl');
		const dir = isRtl ? ['right', 'left'] : ['left', 'right'];
		const { top, left, scrollX, scrollY } = this.offset.getLocal(offsetTarget);

		if (isList ? !container.previousSibling : !this.format.isLine(container.previousElementSibling)) {
			const tlComputedStyle = _w.getComputedStyle(lb_t);
			const tH = numbers.get(tlComputedStyle.height, 1);
			this.eventManager._lineBreakComp = container;
			componentTop = top;
			w = target.offsetWidth / 2 / 2;
			t_style.top = componentTop - scrollY - tH / 2 + 'px';
			t_style[dir[0]] = (isNonSelected ? left - numbers.get(tlComputedStyle.height, 0) / 2 : left + w) + 'px';
			t_style[dir[1]] = '';

			lb_t.setAttribute('data-offset', scrollY + ',' + scrollX);
			if (_overInfo) dom.utils.removeClass(lb_t, 'se-on-selected');
			else dom.utils.addClass(lb_t, 'se-on-selected');

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
			b_style.left = left + (isRtl ? 0 : target.offsetWidth) - (isNonSelected ? 0 : w) - (isNonSelected ? bW / 2 : bW) + 'px';

			const bDir = 'left';
			lb_b.setAttribute('data-offset', scrollY + ',' + bDir + ',' + scrollX);
			if (_overInfo) dom.utils.removeClass(lb_b, 'se-on-selected');
			else dom.utils.addClass(lb_b, 'se-on-selected');

			b_style.display = 'block';
		} else {
			b_style.display = 'none';
		}
	},

	/**
	 * @private
	 * @this {ComponentThis}
	 * @description Adds global event listeners for component interactions such as copy, cut, and keydown events.
	 */
	__addGlobalEvent() {
		this.__removeGlobalEvent();
		this._bindClose_copy = this.eventManager.addGlobalEvent('copy', this.__globalEvents.copy);
		this._bindClose_cut = this.eventManager.addGlobalEvent('cut', this.__globalEvents.cut);
		this._bindClose_keydown = this.eventManager.addGlobalEvent('keydown', this.__globalEvents.keydown);
	},

	/**
	 * @private
	 * @this {ComponentThis}
	 * @description Removes global event listeners that were previously added for component interactions.
	 */
	__removeGlobalEvent() {
		this.__removeNotFileGlobalEvent();
		if (this._bindClose_copy) this._bindClose_copy = this.eventManager.removeGlobalEvent(this._bindClose_copy);
		if (this._bindClose_cut) this._bindClose_cut = this.eventManager.removeGlobalEvent(this._bindClose_cut);
		if (this._bindClose_keydown) this._bindClose_keydown = this.eventManager.removeGlobalEvent(this._bindClose_keydown);
	},

	/**
	 * @private
	 * @this {ComponentThis}
	 * @description Adds global event listeners for non-file-related interactions such as mouse and touch events.
	 */
	__addNotFileGlobalEvent() {
		this.__removeNotFileGlobalEvent();
		if (!isMobile) this._bindClose_mousedown = this.eventManager.addGlobalEvent('mousedown', this.__globalEvents.mousedown, true);
		else this._bindClose_touchstart = this.eventManager.addGlobalEvent('touchstart', this.__globalEvents.mousedown, true);
	},

	/**
	 * @private
	 * @this {ComponentThis}
	 * @description Removes global event listeners related to non-file interactions.
	 */
	__removeNotFileGlobalEvent() {
		if (this._bindClose_mousedown) this._bindClose_mousedown = this.eventManager.removeGlobalEvent(this._bindClose_mousedown);
		if (this._bindClose_touchstart) this._bindClose_touchstart = this.eventManager.removeGlobalEvent(this._bindClose_touchstart);
	},

	/**
	 * @private
	 * @this {ComponentThis}
	 * @description Removes drag-related events and resets drag-related states.
	 */
	_removeDragEvent() {
		/** @type {HTMLElement} */ (this.carrierWrapper.querySelector('.se-drag-cursor')).style.left = '-10000px';
		if (_DragHandle.get('__dragHandler')) _DragHandle.get('__dragHandler').style.display = 'none';

		dom.utils.removeClass([_DragHandle.get('__dragHandler'), _DragHandle.get('__dragContainer')], 'se-dragging');
		dom.utils.removeClass([_DragHandle.get('__dragCover'), _DragHandle.get('__dragContainer')], 'se-drag-over');

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

/**
 * @this {ComponentThis}
 */
function OnDragEnter() {
	this.editor._preventBlur = true;
	this.ui._visibleControllers(false, dom.utils.hasClass(_DragHandle.get('__dragHandler'), 'se-drag-handle-full'));
	dom.utils.addClass(_DragHandle.get('__dragCover') || _DragHandle.get('__dragContainer'), 'se-drag-over');
}

/**
 * @this {ComponentThis}
 */
function OnDragLeave() {
	this.editor._preventBlur = false;
	if (!dom.utils.hasClass(_DragHandle.get('__dragHandler'), 'se-drag-handle-full')) this.ui._visibleControllers(true, true);
	dom.utils.removeClass([_DragHandle.get('__dragCover'), _DragHandle.get('__dragContainer')], 'se-drag-over');
}

/**
 * @this {ComponentThis}
 * @param {DragEvent} e - Drag event
 */
function OnDragStart(e) {
	const cover = _DragHandle.get('__dragCover') || _DragHandle.get('__dragContainer');

	if (!cover) {
		e.preventDefault();
		return;
	}

	this.editor._preventBlur = false;
	dom.utils.addClass(_DragHandle.get('__dragHandler'), 'se-dragging');
	dom.utils.addClass(_DragHandle.get('__dragContainer'), 'se-dragging');
	e.dataTransfer.setDragImage(cover, this.options.get('_rtl') ? cover.offsetWidth : -5, -5);
}

/**
 * @this {ComponentThis}
 */
function OnDragEnd() {
	this.editor._preventBlur = false;
	dom.utils.removeClass([_DragHandle.get('__dragHandler'), _DragHandle.get('__dragContainer')], 'se-dragging');
	this._removeDragEvent();
}

/**
 * @this {ComponentThis}
 * @param {MouseEvent} e - Mouse event
 */
function OnDragClick(e) {
	const target = dom.query.getEventTarget(e);
	if (!dom.utils.hasClass(target, 'se-drag-handle-full')) return;

	const dragInst = _DragHandle.get('__dragInst');
	this._removeDragEvent();
	this.select(dragInst.currentTarget, dragInst.currentPluginName, false);
}

/**
 * @this {ComponentThis}
 * @param {MouseEvent} e - Mouse event
 */
function CloseListener_mousedown(e) {
	const target = dom.query.getEventTarget(e);
	if (
		this.currentTarget?.contains(target) ||
		dom.query.getParentElement(target, '.se-controller') ||
		dom.utils.hasClass(target, 'se-drag-handle') ||
		(this.currentPluginName === this.editor.currentControllerName && this.editor.opendControllers.some(({ form }) => form.contains(target)))
	) {
		return;
	}
	this.deselect();
}

/**
 * @this {ComponentThis}
 * @param {ClipboardEvent} e - Event object
 */
function OnCopy_component(e) {
	const target = dom.query.getEventTarget(e);
	if (dom.check.isInputElement(target) && dom.query.getParentElement(target, '.se-modal')) return;

	const info = this.info;
	if (!info) return;

	const cloneContainer = info.container.cloneNode(true);
	dom.utils.removeClass(cloneContainer, 'se-component-selected');

	if (typeof this.plugins[info.pluginName]?.onCopyComponent !== 'function' || this.plugins[info.pluginName].onCopyComponent({ event: e, cloneContainer, info }) === false) {
		SetClipboardComponent(e, cloneContainer, e.clipboardData);
	}

	// copy effect
	dom.utils.flashClass(info.container, 'se-copy');
}

/**
 * @this {ComponentThis}
 * @param {ClipboardEvent} e - Event object
 */
function OnCut_component(e) {
	const info = this.info;
	if (!info) return;

	const cloneContainer = info.container.cloneNode(true);
	dom.utils.removeClass(cloneContainer, 'se-component-selected');

	SetClipboardComponent(e, cloneContainer, e.clipboardData);
	this.deselect();
	dom.utils.removeItem(info.container);
}

/**
 * @this {ComponentThis}
 * @param {KeyboardEvent} e - Event object
 */
async function OnKeyDown_component(e) {
	if (this.editor.selectMenuOn) return;

	const keyCode = e.code;
	const ctrl = keyCodeMap.isCtrl(e);

	// redo, undo
	if (ctrl) {
		if (keyCode !== 'ControlRight' && keyCode !== 'ControlLeft') {
			const info = this.editor.shortcutsKeyMap.get(keyCode + (e.shiftKey ? '1000' : ''));
			if (/^(redo|undo)$/.test(info?.c)) {
				e.preventDefault();
				e.stopPropagation();
				this.editor.run(info.c, info.t, info.e);
			}
		}
		return;
	}

	// backspace key, delete key
	if (keyCodeMap.isRemoveKey(keyCode)) {
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
	if (keyCodeMap.isEnter(keyCode)) {
		e.preventDefault();
		const compContext = this.currentInfo || this.get(this.currentTarget);
		const container = compContext.container || compContext.target;
		const sibling = container.previousElementSibling || container.nextElementSibling;
		let newEl = null;
		if (dom.check.isListCell(container.parentNode)) {
			newEl = dom.utils.createElement('BR');
		} else {
			newEl = dom.utils.createElement(this.format.isLine(sibling) ? sibling.nodeName : this.options.get('defaultLine'), null, '<br>');
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
				case 'ArrowLeft': // left
					el = container.previousSibling;
					offset = el?.nodeType === 3 ? el.textContent.length : 1;
					break;
				case 'ArrowRight': // right
					el = container.nextSibling;
					offset = 0;
					break;
				case 'ArrowUp': {
					// up
					const line = this.format.getLine(container, null);
					el = line?.previousElementSibling;
					offset = 0;
					break;
				}
				case 'ArrowDown': {
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
				this.editor._preventBlur = true;
				e.stopPropagation();
				e.preventDefault();
				this.selection.setRange(el, offset, el, offset);
			} finally {
				this.editor._preventBlur = false;
			}
		}

		return;
	}

	// ESC
	if (keyCodeMap.isEsc(keyCode)) {
		this.deselect();
		return;
	}
}

function SetClipboardComponent(e, container, clipboardData) {
	e.preventDefault();
	e.stopPropagation();
	container.querySelectorAll('.se-figure-selected').forEach((el) => dom.utils.removeClass(el, 'se-figure-selected'));
	clipboardData.setData('text/html', container.outerHTML);
}

export default Component;
