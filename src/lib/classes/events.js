/**
 * @fileoverview Event class
 * @author JiHong Lee.
 */
"use strict";

import CoreInterface from "../../interface/_core";

const Events = function (editor) {
	CoreInterface.call(this, editor);
	this.selection = editor.selection;
};

Events.prototype = {
	/**
	 * @description Focus to wysiwyg area using "native focus function"
	 */
	nativeFocus: function () {
		const caption = util.getParentElement(this.selection.getSelectionNode(), "figcaption");
		if (caption) {
			caption.focus();
		} else {
			context.element.wysiwyg.focus();
		}

		this.selection._editorRange();
	},

	/**
	 * @description Focus to wysiwyg area
	 */
	focus: function () {
		if (context.element.wysiwygFrame.style.display === "none") return;

		if (options.iframe) {
			this.nativeFocus();
		} else {
			try {
				const range = this.selection.getRange();
				if (range.startContainer === range.endContainer && util.isWysiwygDiv(range.startContainer)) {
					const currentNode = range.commonAncestorContainer.children[range.startOffset];
					if (!util.isFormatElement(currentNode) && !util.isComponent(currentNode)) {
						const format = util.createElement(options.defaultTag);
						const br = util.createElement("BR");
						format.appendChild(br);
						context.element.wysiwyg.insertBefore(format, currentNode);
						this.selection.setRange(br, 0, br, 0);
						return;
					}
				}
				this.selection.setRange(range.startContainer, range.startOffset, range.endContainer, range.endOffset);
			} catch (e) {
				this.nativeFocus();
			}
		}

		event._applyTagEffects();
		if (this._isBalloon) event._toggleToolbarBalloon();
	},

	/**
	 * @description If "focusEl" is a component, then that component is selected; if it is a format element, the last text is selected
	 * If "focusEdge" is null, then selected last element
	 * @param {Element|null} focusEl Focus element
	 */
	focusEdge: function (focusEl) {
		if (!focusEl) focusEl = context.element.wysiwyg.lastElementChild;

		const fileComponentInfo = this.getFileComponent(focusEl);
		if (fileComponentInfo) {
			this.selectComponent(fileComponentInfo.target, fileComponentInfo.pluginName);
		} else if (focusEl) {
			focusEl = util.getChildElement(
				focusEl,
				function (current) {
					return current.childNodes.length === 0 || current.nodeType === 3;
				},
				true
			);
			if (!focusEl) this.nativeFocus();
			else this.selection.setRange(focusEl, focusEl.textContent.length, focusEl, focusEl.textContent.length);
		} else {
			this.focus();
		}
	},

	/**
	 * @description Focusout to wysiwyg area (.blur())
	 */
	blur: function () {
		if (options.iframe) {
			context.element.wysiwygFrame.blur();
		} else {
			context.element.wysiwyg.blur();
		}
	},

	constructor: Events
};

export default Events;
