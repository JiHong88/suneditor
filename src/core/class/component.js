/**
 * @fileoverview Component class
 */

import CoreInjector from '../../editorInjector/_core';
import { domUtils, env } from '../../helper';
import Figure from '../../modules/Figure';

const Component = function (editor) {
	CoreInjector.call(this, editor);

	// members
	this.info = null;
	this.currentTarget = null;
	this.__globalEvents = [OnCopy_component.bind(this), OnCut_component.bind(this), OnKeyDown_component.bind(this)];
	this._bindClose_copy = null;
	this._bindClose_cut = null;
	this._bindClose_redo = null;
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
		if (this.editor.isReadOnly || (!notCheckCharCount && !this.char.check(element))) {
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
		if (!this.editor._fileManager.queryString || !element) return null;

		let target;
		if (/^FIGURE$/i.test(element.nodeName) || /se-component/.test(element.className)) {
			if (this.editor._fileManager.queryString) target = element.querySelector(this.editor._fileManager.queryString);
		}
		if (!target && element.nodeName && this.editor._fileManager.regExp.test(element.nodeName)) {
			target = element;
		}
		if (!target) {
			return null;
		}

		const info = Figure.GetContainer(target);
		return {
			target: target,
			pluginName: this.editor._fileManager.pluginMap[target.nodeName.toLowerCase()] || '',
			container: info.container,
			cover: info.cover,
			caption: info.caption
		};
	},

	/**
	 * @description The component(image, video) is selected and the resizing module is called.
	 * @param {Element} element Element tag (img, iframe, video)
	 * @param {string} pluginName Plugin name (image, video)
	 */
	select(element, pluginName) {
		this.editor._antiBlur = true;
		this.currentTarget = element;
		this.info = Figure.GetContainer(element);
		this.editor.blur();

		if (domUtils.isUneditable(domUtils.getParentElement(element, this.is)) || domUtils.isUneditable(element)) return false;

		const plugin = this.plugins[pluginName];
		if (!plugin) return;
		if (typeof plugin.select === 'function') plugin.select(element);

		this._setComponentLineBreaker(element);
		this.__addGlobalEvent();
	},

	/**
	 * @description It is judged whether it is the component[img, iframe, video, audio, table] cover(class="se-component") and table, hr
	 * @param {Node} element The node to check
	 * @returns {boolean}
	 */
	is(element) {
		return Figure.__isComponent(element);
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

		const yScroll = wysiwyg.scrollY || wysiwyg.scrollTop || 0;
		const wScroll = wysiwyg.scrollX || wysiwyg.scrollLeft || 0;
		const container = domUtils.getParentElement(element, this.is);
		const t_style = fc.get('lineBreaker_t').style;
		const b_style = fc.get('lineBreaker_b').style;
		const target = this.editor._figureContainer && this.editor._figureContainer.style.display === 'block' ? this.editor._figureContainer : element;

		const isList = domUtils.isListCell(container.parentNode);
		let componentTop, w;
		// top
		if (isList ? !container.previousSibling : !this.format.isLine(container.previousElementSibling)) {
			this.eventManager._lineBreakComp = container;
			componentTop = this.offset.get(element).top + yScroll;
			w = target.offsetWidth / 2 / 2;

			fc.get('lineBreaker_t').setAttribute('data-offset', componentTop - 12 + ',' + (this.offset.get(target).left + wScroll + w));
			t_style.top = componentTop - yScroll - 12 + 'px';
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
			b_style.top = componentTop + target.offsetHeight - yScroll - 12 + 'px';
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
		this._bindClose_redo = this.eventManager.addGlobalEvent('keydown', this.__globalEvents[2]);
	},

	__removeGlobalEvent() {
		if (this._bindClose_copy) this._bindClose_copy = this.eventManager.removeGlobalEvent(this._bindClose_copy);
		if (this._bindClose_cut) this._bindClose_cut = this.eventManager.removeGlobalEvent(this._bindClose_cut);
		if (this._bindClose_redo) this._bindClose_redo = this.eventManager.removeGlobalEvent(this._bindClose_redo);
	},

	constructor: Component
};

function OnCopy_component(e) {
	const info = this.info;
	if (info) {
		SetClipboardComponent(e, info.container, e.clipboardData);
		domUtils.addClass(info.container, 'se-component-copy');
		// copy effect
		this._w.setTimeout(function () {
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
	if (ctrl && keyCode !== 17) {
		const info = this.editor.shortcutsKeyMap.get(keyCode + (e.shiftKey ? 1000 : 0));
		if (info && /^(redo|undo)$/.test(info.c)) {
			e.preventDefault();
			e.stopPropagation();
			this.__removeGlobalEvent();
			this.editor.run(info.c, info.t, info.e);
		}
	}
}

function SetClipboardComponent(e, container, clipboardData) {
	e.preventDefault();
	e.stopPropagation();
	clipboardData.setData('text/html', container.outerHTML);
}

export default Component;
