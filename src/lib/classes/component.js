/**
 * @fileoverview Event class
 * @author JiHong Lee.
 */
"use strict";

import CoreInterface from "../../interface/_core";
import domUtil from "../../helpers/dom";

function Component(editor) {
	CoreInterface.call(this, editor);
}

Component.prototype = {
	/**
	 * @description The method to insert a element and return. (used elements : table, hr, image, video)
	 * If "element" is "HR", insert and return the new line.
	 * @param {Element} element Element to be inserted
	 * @param {Boolean} notHistoryPush When true, it does not update the history stack and the selection object and return EdgeNodes (util.getEdgeChildNodes)
	 * @param {Boolean} checkCharCount If true, if "options.maxCharCount" is exceeded when "element" is added, null is returned without addition.
	 * @param {Boolean} notSelect If true, Do not automatically select the inserted component.
	 * @returns {Element}
	 */
	insert: function (element, notHistoryPush, checkCharCount, notSelect) {
		if (this.editor.isReadOnly || (checkCharCount && !this.char.check(element))) {
			return null;
		}

		const r = this.removeNode();
		this.getRange_addLine(this.getRange(), r.container);
		let oNode = null;
		let selectionNode = this.selection.getNode();
		let formatEl = this.format.getLine(selectionNode, null);

		if (util.isListCell(formatEl)) {
			this.insertNode(element, selectionNode === formatEl ? null : r.container.nextSibling, false);
			if (!element.nextSibling) element.parentNode.appendChild(util.createElement("BR"));
		} else {
			if (this.getRange().collapsed && (r.container.nodeType === 3 || util.isBreak(r.container))) {
				const depthFormat = util.getParentElement(
					r.container,
					function (current) {
						return this.isRangeFormatElement(current);
					}.bind(util)
				);
				oNode = this.node.split(r.container, r.offset, !depthFormat ? 0 : util.getElementDepth(depthFormat) + 1);
				if (oNode) formatEl = oNode.previousSibling;
			}
			this.insertNode(element, util.isRangeFormatElement(formatEl) ? null : formatEl, false);
			if (formatEl && util.onlyZeroWidthSpace(formatEl)) util.removeItem(formatEl);
		}

		this.setRange(element, 0, element, 0);

		if (!notSelect) {
			const fileComponentInfo = this.get(element);
			if (fileComponentInfo) {
				this.select(fileComponentInfo.target, fileComponentInfo.pluginName);
			} else if (oNode) {
				oNode = util.getEdgeChildNodes(oNode, null).sc || oNode;
				this.setRange(oNode, 0, oNode, 0);
			}
		}

		// history stack
		if (!notHistoryPush) this.history.push(1);

		return oNode || element;
	},

	/**
	 * @description Gets the file component and that plugin name
	 * return: {target, component, pluginName} | null
	 * @param {Element} element Target element (figure tag, component div, file tag)
	 * @returns {Object|null}
	 */
	get: function (element) {
		if (!this._fileManager.queryString || !element) return null;

		let target, pluginName;
		if (/^FIGURE$/i.test(element.nodeName) || /se-component/.test(element.className)) {
			target = element.querySelector(this._fileManager.queryString);
		}
		if (!target && element.nodeName && this._fileManager.regExp.test(element.nodeName)) {
			target = element;
		}

		if (target) {
			pluginName = this._fileManager.pluginMap[target.nodeName.toLowerCase()];
			if (pluginName) {
				return {
					target: target,
					component: util.getParentElement(target, this.node.isComponent),
					pluginName: pluginName
				};
			}
		}

		return null;
	},

	/**
	 * @description The component(image, video) is selected and the resizing module is called.
	 * @param {Element} element Element tag (img, iframe, video)
	 * @param {String} pluginName Plugin name (image, video)
	 */
	select: function (element, pluginName) {
		if (util.isUneditable(util.getParentElement(element, this.node.isComponent)) || util.isUneditable(element)) return false;
		if (!this.hasFocus) this.focus();
		const plugin = this.plugins[pluginName];
		if (!plugin) return;
		_w.setTimeout(
			function () {
				if (typeof plugin.select === "function") this.callPlugin(pluginName, plugin.select.bind(this, element), null);
				this._setComponentLineBreaker(element);
			}.bind(this)
		);
	},

	/**
	 * @description Set line breaker of component
	 * @param {Element} element Element tag (img, iframe, video)
	 * @private
	 */
	_setComponentLineBreaker: function (element) {
		// line breaker
		this._lineBreaker.style.display = "none";
		const container = util.getParentElement(element, this.node.isComponent);
		const t_style = context.element.lineBreaker_t.style;
		const b_style = context.element.lineBreaker_b.style;
		const target = this.context.resizing.resizeContainer.style.display === "block" ? this.context.resizing.resizeContainer : element;

		const isList = util.isListCell(container.parentNode);
		let componentTop, wScroll, w;
		// top
		if (isList ? !container.previousSibling : !util.isFormatElement(container.previousElementSibling)) {
			this._variable._lineBreakComp = container;
			wScroll = context.element.wysiwyg.scrollTop;
			componentTop = domUtil.getOffset(element, context.element.wysiwygFrame).top + wScroll;
			w = target.offsetWidth / 2 / 2;

			t_style.top = componentTop - wScroll - 12 + "px";
			t_style.left = domUtil.getOffset(target).left + w + "px";
			t_style.display = "block";
		} else {
			t_style.display = "none";
		}
		// bottom
		if (isList ? !container.nextSibling : !util.isFormatElement(container.nextElementSibling)) {
			if (!componentTop) {
				this._variable._lineBreakComp = container;
				wScroll = context.element.wysiwyg.scrollTop;
				componentTop = domUtil.getOffset(element, context.element.wysiwygFrame).top + wScroll;
				w = target.offsetWidth / 2 / 2;
			}

			b_style.top = componentTop + target.offsetHeight - wScroll - 12 + "px";
			b_style.left = domUtil.getOffset(target).left + target.offsetWidth - w - 24 + "px";
			b_style.display = "block";
		} else {
			b_style.display = "none";
		}
	},

	constructor: Component
};

export default Component;