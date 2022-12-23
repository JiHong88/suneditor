/**
 * @fileoverview Component class
 * @author Yi JiHong.
 */

import CoreDependency from '../../dependency/_core';
import { domUtils } from '../../helper';
import Figure from '../../modules/Figure';

const Component = function (editor) {
	CoreDependency.call(this, editor);
	this._lineBreakComp = null;
};

Component.prototype = {
	/**
	 * @description The method to insert a element and return. (used elements : table, hr, image, video)
	 * If "element" is "HR", insert and return the new line.
	 * @param {Element} element Element to be inserted
	 * @param {boolean} notHistoryPush When true, it does not update the history stack and the selection object and return EdgeNodes (domUtils.getEdgeChildNodes)
	 * @param {boolean} notCheckCharCount If true, it will be inserted even if "options.charCounter_max" is exceeded.
	 * @param {boolean} notSelect If true, Do not automatically select the inserted component.
	 * @returns {Element}
	 */
	insert: function (element, notHistoryPush, notCheckCharCount, notSelect) {
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

		return {
			target: target,
			container: domUtils.getParentElement(target, this.is),
			pluginName: this.editor._fileManager.pluginMap[target.nodeName.toLowerCase()] || ''
		};
	},

	/**
	 * @description The component(image, video) is selected and the resizing module is called.
	 * @param {Element} element Element tag (img, iframe, video)
	 * @param {string} pluginName Plugin name (image, video)
	 */
	select: function (element, pluginName) {
		if (domUtils.isUneditable(domUtils.getParentElement(element, this.is)) || domUtils.isUneditable(element)) return false;
		if (!this.editor.hasFocus) this.editor.focus();

		const plugin = this.plugins[pluginName];
		if (!plugin) return;
		this._w.setTimeout(
			function () {
				if (typeof plugin.select === 'function') plugin.select(element);
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
		return Figure.__isComponent(element);
	},

	/**
	 * @description Set line breaker of component
	 * @param {Element} element Element tag (img, iframe, video)
	 * @private
	 */
	_setComponentLineBreaker: function (element) {
		this._lineBreakComp = null;
		const tc = this.targetContext;
		tc.get('lineBreaker').style.display = 'none';

		const yScroll = tc.get('wysiwyg').scrollY || tc.get('wysiwyg').scrollTop || 0;
		const wScroll = tc.get('wysiwyg').scrollX || tc.get('wysiwyg').scrollLeft || 0;
		const container = domUtils.getParentElement(element, this.is);
		const t_style = tc.get('lineBreaker_t').style;
		const b_style = tc.get('lineBreaker_b').style;
		const target = this.editor._figureContainer && this.editor._figureContainer.style.display === 'block' ? this.editor._figureContainer : element;

		const isList = domUtils.isListCell(container.parentNode);
		let componentTop, w;
		// top
		if (isList ? !container.previousSibling : !this.format.isLine(container.previousElementSibling)) {
			this._lineBreakComp = container;
			componentTop = this.offset.get(element).top + yScroll;
			w = target.offsetWidth / 2 / 2;

			tc.get('lineBreaker_t').setAttribute('data-offset', componentTop - 12 + ',' + (this.offset.get(target).left + wScroll + w));
			t_style.top = componentTop - yScroll - 12 + 'px';
			t_style.left = this.offset.get(target).left + w + 'px';
			t_style.display = 'block';
		} else {
			t_style.display = 'none';
		}
		// bottom
		if (isList ? !container.nextSibling : !this.format.isLine(container.nextElementSibling)) {
			if (!componentTop) {
				this._lineBreakComp = container;
				componentTop = this.offset.get(element).top + yScroll;
				w = target.offsetWidth / 2 / 2;
			}

			tc.get('lineBreaker_b').setAttribute('data-offset', componentTop + target.offsetHeight - 12 + ',' + (this.offset.get(target).left + wScroll + target.offsetWidth - w - 24));
			b_style.top = componentTop + target.offsetHeight - yScroll - 12 + 'px';
			b_style.left = this.offset.get(target).left + target.offsetWidth - w - 24 + 'px';
			b_style.display = 'block';
		} else {
			b_style.display = 'none';
		}
	},

	constructor: Component
};

export default Component;
