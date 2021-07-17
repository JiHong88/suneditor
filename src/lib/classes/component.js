/**
 * @fileoverview Event class
 * @author JiHong Lee.
 */
"use strict";

import CoreInterface from "../../interface/_core";
import { domUtils, unicode } from "../../helpers";

function Component(editor) {
	CoreInterface.call(this, editor);
}

Component.prototype = {
	/**
	 * @description The method to insert a element and return. (used elements : table, hr, image, video)
	 * If "element" is "HR", insert and return the new line.
	 * @param {Element} element Element to be inserted
	 * @param {boolean} notHistoryPush When true, it does not update the history stack and the selection object and return EdgeNodes (util.getEdgeChildNodes)
	 * @param {boolean} checkCharCount If true, if "options.maxCharCount" is exceeded when "element" is added, null is returned without addition.
	 * @param {boolean} notSelect If true, Do not automatically select the inserted component.
	 * @returns {Element}
	 */
	insert: function (element, notHistoryPush, checkCharCount, notSelect) {
		if (this.editor.isReadOnly || (checkCharCount && !this.char.check(element))) {
			return null;
		}

		const r = this.selection.removeNode();
		this.selection.getRange_addLine(this.selection.getRange(), r.container);
		let oNode = null;
		let selectionNode = this.selection.getNode();
		let formatEl = this.format.getLine(selectionNode, null);

		if (domUtils.isListCell(formatEl)) {
			this.selection.insertNode(element, selectionNode === formatEl ? null : r.container.nextSibling, false);
			if (!element.nextSibling) element.parentNode.appendChild(domUtils.createElement("BR"));
		} else {
			if (this.selection.getRange().collapsed && (r.container.nodeType === 3 || domUtils.isBreak(r.container))) {
				const depthFormat = domUtils.getParentElement(
					r.container,
					function (current) {
						return this.format.isBlock(current);
					}.bind(this)
				);
				oNode = this.node.split(r.container, r.offset, !depthFormat ? 0 : domUtils.getElementDepth(depthFormat) + 1);
				if (oNode) formatEl = oNode.previousSibling;
			}
			this.selection.insertNode(element, this.format.isBlock(formatEl) ? null : formatEl, false);
			if (formatEl && unicode.onlyZeroWidthSpace(formatEl)) domUtils.remove(formatEl);
		}

		this.selection.setRange(element, 0, element, 0);

		if (!notSelect) {
			const fileComponentInfo = this.get(element);
			if (fileComponentInfo) {
				this.select(fileComponentInfo.target, fileComponentInfo.pluginName);
			} else if (oNode) {
				oNode = domUtils.getEdgeChildNodes(oNode, null).sc || oNode;
				this.selection.setRange(oNode, 0, oNode, 0);
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
		if (!element) return null;

		let target;
		if (/^FIGURE$/i.test(element.nodeName) || /se-component/.test(element.className)) {
			if (this.editor._fileManager.queryString) target = element.querySelector(this.editor._fileManager.queryString);
		}
		if (!target && element.nodeName && this.editor._fileManager.regExp.test(element.nodeName)) {
			target = element;
		}
		if (!target) {
			target = element;
		}

		return {
			target: target,
			component: domUtils.getParentElement(target, this.is),
			pluginName: this.editor._fileManager.pluginMap[target.nodeName.toLowerCase()] || ""
		};
	},

	/**
	 * @description The component(image, video) is selected and the resizing module is called.
	 * @param {Element} element Element tag (img, iframe, video)
	 * @param {string} pluginName Plugin name (image, video)
	 */
	select: function (element, pluginName) {
		if (domUtils.isUneditable(domUtils.getParentElement(element, this.is)) || domUtils.isUneditable(element)) return false;
		if (!this.status.hasFocus) this.editor.focus();
		const plugin = this.plugins[pluginName];
		if (!plugin) return;
		_w.setTimeout(
			function () {
				if (typeof plugin.select === "function") this.editor.callPlugin(pluginName, plugin.select.bind(this, element), null);
				this._setComponentLineBreaker(element);
			}.bind(this)
		);
	},

	/**
	 * @description It is judged whether it is the component[img, iframe, video, audio, table] cover(class="se-component") and table, hr
	 * @param {Node} element The node to check
	 * @returns {boolean}
	 */
	is: function (element) {
		return element && (/se-component/.test(element.className) || /^(TABLE|HR)$/.test(element.nodeName));
	},

	/**
	 * @description Set line breaker of component
	 * @param {Element} element Element tag (img, iframe, video)
	 * @private
	 */
	_setComponentLineBreaker: function (element) {
		// line breaker
		this.editor._lineBreaker.style.display = "none";
		const contextEl = this.context.element;
		const container = domUtils.getParentElement(element, this.is);
		const t_style = contextEl.lineBreaker_t.style;
		const b_style = contextEl.lineBreaker_b.style;
		const target = this.context.resizing.resizeContainer.style.display === "block" ? this.context.resizing.resizeContainer : element;

		const isList = domUtils.isListCell(container.parentNode);
		let componentTop, wScroll, w;
		// top
		if (isList ? !container.previousSibling : !this.format.isLine(container.previousElementSibling)) {
			this.status._lineBreakComp = container;
			wScroll = contextEl.wysiwyg.scrollTop;
			componentTop = this.offset.get(element).top + wScroll;
			w = target.offsetWidth / 2 / 2;

			t_style.top = componentTop - wScroll - 12 + "px";
			t_style.left = this.offset.get(target).left + w + "px";
			t_style.display = "block";
		} else {
			t_style.display = "none";
		}
		// bottom
		if (isList ? !container.nextSibling : !this.format.isLine(container.nextElementSibling)) {
			if (!componentTop) {
				this.status._lineBreakComp = container;
				wScroll = contextEl.wysiwyg.scrollTop;
				componentTop = this.offset.get(element).top + wScroll;
				w = target.offsetWidth / 2 / 2;
			}

			b_style.top = componentTop + target.offsetHeight - wScroll - 12 + "px";
			b_style.left = this.offset.get(target).left + target.offsetWidth - w - 24 + "px";
			b_style.display = "block";
		} else {
			b_style.display = "none";
		}
	},

	constructor: Component
};

export default Component;