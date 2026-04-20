/**
 * @typedef {{ t: string, p?: * }} Action
 * @typedef {Object} SunEditor.ComponentInfo
 * @property {Element} target
 * @property {string} pluginName
 * @property {Object} [options]
 */

export const A = {
	/**
	 * @category [[ common.registry ]]
	 */

	// === event, cache ===
	/** @returns {Action} */
	prevent: () => ({ t: 'event.prevent' }),
	/** @returns {Action} */
	stop: () => ({ t: 'event.stop' }),
	/** @returns {Action} */
	preventStop: () => ({ t: 'event.prevent.stop' }),
	/** @returns {Action} */
	cacheStyleNode: () => ({ t: 'cache.styleNode' }),
	/**
	 * @param {NamedNodeMap} attrs
	 * @returns {Action}
	 */
	cacheFormatAttrsTemp: (attrs) => ({ t: 'cache.formatAttrsTemp', p: { attrs } }),

	// === commands ===
	/** @returns {Action} */
	componentDeselect: () => ({ t: 'component.deselect' }),
	/** @returns {Action} */
	editorNativeFocus: () => ({ t: 'focusManager.nativeFocus' }),
	/**
	 * @param {boolean} hard
	 * @returns {Action}
	 */
	historyPush: (hard) => ({ t: 'history.push', p: hard }),
	/** @returns {Action} */
	documentTypeRefreshHeader: () => ({ t: 'documentType.refreshHeader' }),

	// === class ===
	/**
	 * @param {Node} sc - Start container
	 * @param {number} so - Start offset
	 * @param {Node} ec - End container
	 * @param {number} eo - End offset
	 * @returns {Action}
	 */
	selectionSetRange: (sc, so, ec, eo) => ({ t: 'selection.setRange', p: { sc, so, ec, eo } }),
	/**
	 * @param {Element} rangeEl
	 * @param {?Element[]} selectedFormats
	 * @param {?Element} newBlockElement
	 * @param {boolean} shouldDelete
	 * @param {boolean} skipHistory
	 * @returns {Action}
	 */
	formatRemoveBlock: (rangeEl, selectedFormats, newBlockElement, shouldDelete, skipHistory) => ({
		t: 'format.removeBlock',
		p: { rangeEl, selectedFormats, newBlockElement, shouldDelete, skipHistory },
	}),
	/**
	 * @param {Node} item
	 * @returns {Action}
	 */
	domUtilsRemoveItem: (item) => ({ t: 'dom.utils.removeItem', p: { item } }),

	// === utils ===
	/**
	 * @param {SunEditor.ComponentInfo} cmponentInfo
	 * @returns {Action}
	 */
	selectComponentFallback: (cmponentInfo) => ({ t: 'select.component.fallback', p: { cmponentInfo } }),

	/**
	 * @category [[ keydown.registry ]]
	 */

	// === backspace and delete ===
	/**
	 * @param {Node} container
	 * @param {Element} formatEl
	 * @returns {Action}
	 */
	delFormatRemoveAndMove: (container, formatEl) => ({ t: 'del.format.removeAndMove', p: { container, formatEl } }),

	// === backspace ===
	/**
	 * @param {Element} formatEl
	 * @returns {Action}
	 */
	backspaceFormatMaintain: (formatEl) => ({ t: 'backspace.format.maintain', p: { formatEl } }),
	/**
	 * @param {Element} formatEl - brLine element (e.g. PRE) to strip
	 * @returns {Action}
	 */
	backspaceBrLineStrip: (formatEl) => ({ t: 'backspace.brline.strip', p: { formatEl } }),
	/**
	 * @param {Node} selectionNode
	 * @param {Range} range
	 * @param {SunEditor.ComponentInfo} fileComponentInfo
	 * @returns {Action}
	 */
	backspaceComponentSelect: (selectionNode, range, fileComponentInfo) => ({ t: 'backspace.component.select', p: { selectionNode, range, fileComponentInfo } }),
	/**
	 * @param {boolean} isList
	 * @param {Node} sel
	 * @param {Element} formatEl
	 * @param {SunEditor.ComponentInfo} fileComponentInfo
	 * @returns {Action}
	 */
	backspaceComponentRemove: (isList, sel, formatEl, fileComponentInfo) => ({ t: 'backspace.component.remove', p: { isList, sel, formatEl, fileComponentInfo } }),
	/**
	 * @param {Element} prev
	 * @param {Element} formatEl
	 * @param {Element} rangeEl
	 * @returns {Action}
	 */
	backspaceListMergePrev: (prev, formatEl, rangeEl) => ({ t: 'backspace.list.mergePrev', p: { prev, formatEl, rangeEl } }),
	/**
	 * @param {Range} range
	 * @returns {Action}
	 */
	backspaceListRemoveNested: (range) => ({ t: 'backspace.list.removeNested', p: { range } }),

	// === delete ===
	/**
	 * @param {Element} formatEl
	 * @param {SunEditor.ComponentInfo} fileComponentInfo
	 * @returns {Action}
	 */
	deleteComponentSelect: (formatEl, fileComponentInfo) => ({ t: 'delete.component.select', p: { formatEl, fileComponentInfo } }),
	/**
	 * @param {Element} nextEl
	 * @returns {Action}
	 */
	deleteComponentSelectNext: (formatEl, nextEl) => ({ t: 'delete.component.selectNext', p: { formatEl, nextEl } }),
	/**
	 * @param {Range} range
	 * @param {Element} formatEl
	 * @param {Element} rangeEl
	 * @returns {Action}
	 */
	deleteListRemoveNested: (range, formatEl, rangeEl) => ({ t: 'delete.list.removeNested', p: { range, formatEl, rangeEl } }),

	// === tab ===
	/**
	 * @param {Range} range
	 * @param {Element} formatEl
	 * @param {boolean} shift
	 * @returns {Action}
	 */
	tabFormatIndent: (range, formatEl, shift) => ({ t: 'tab.format.indent', p: { range, formatEl, shift } }),

	// === enter ===
	/**
	 * @param {Range} range Range object
	 * @returns {Action}
	 */
	enterScrollTo: (range) => ({ t: 'enter.scrollTo', p: { range } }),
	/**
	 * @param {Element} formatEl
	 * @returns {Action}
	 */
	enterLineAddDefault: (formatEl) => ({ t: 'enter.line.addDefault', p: { formatEl } }),
	/**
	 * @param {Element} formatEl
	 * @param {Node} selectionNode
	 * @returns {Action}
	 */
	enterListAddItem: (formatEl, selectionNode) => ({ t: 'enter.list.addItem', p: { formatEl, selectionNode } }),
	/**
	 * @param {Element} formatEl
	 * @param {Element} rangeEl
	 * @returns {Action}
	 */
	enterFormatExitEmpty: (formatEl, rangeEl) => ({ t: 'enter.format.exitEmpty', p: { formatEl, rangeEl } }),
	/**
	 * @param {Node} selectionNode
	 * @param {boolean} selectionFormat
	 * @param {Element} brBlock
	 * @param {NodeList} children
	 * @param {number} offset
	 * @returns {Action}
	 */
	enterFormatCleanBrAndZWS: (selectionNode, selectionFormat, brBlock, children, offset) => ({ t: 'enter.format.cleanBrAndZWS', p: { selectionNode, selectionFormat, brBlock, children, offset } }),
	/**
	 * @param {Element} brBlock
	 * @param {Range} range
	 * @param {Selection} wSelection
	 * @param {number} offset
	 * @returns {Action}
	 */
	enterFormatInsertBrHtml: (brBlock, range, wSelection, offset) => ({ t: 'enter.format.insertBrHtml', p: { brBlock, range, wSelection, offset } }),
	/**
	 * @param {Selection} wSelection
	 * @returns {Action}
	 */
	enterFormatInsertBrNode: (wSelection) => ({ t: 'enter.format.insertBrNode', p: { wSelection } }),
	/**
	 * @param {Element} formatEl
	 * @param {Node} selectionNode
	 * @param {boolean} formatStartEdge
	 * @param {boolean} formatEndEdge
	 * @param {boolean} [bidiSwapped]
	 * @returns {Action}
	 */
	enterFormatBreakAtEdge: (formatEl, selectionNode, formatStartEdge, formatEndEdge, bidiSwapped) => ({ t: 'enter.format.breakAtEdge', p: { formatEl, selectionNode, formatStartEdge, formatEndEdge, bidiSwapped } }),
	/**
	 * @param {Element} formatEl
	 * @param {Range} range
	 * @param {boolean} formatStartEdge
	 * @param {boolean} formatEndEdge
	 * @returns {Action}
	 */
	enterFormatBreakWithSelection: (formatEl, range, formatStartEdge, formatEndEdge) => ({ t: 'enter.format.breakWithSelection', p: { formatEl, range, formatStartEdge, formatEndEdge } }),
	/**
	 * @param {Element} formatEl
	 * @param {Range} range
	 * @returns {Action}
	 */
	enterFormatBreakAtCursor: (formatEl, range) => ({ t: 'enter.format.breakAtCursor', p: { formatEl, range } }),
	/**
	 * @param {Element} formatEl
	 * @returns {Action}
	 */
	enterFigcaptionExitInList: (formatEl) => ({ t: 'enter.figcaption.exitInList', p: { formatEl } }),

	// === keydown reducer ===
	/** @returns {Action} */
	keydownInputInsertNbsp: () => ({ t: 'keydown.input.insertNbsp' }),
	/** @returns {Action} */
	keydownInputInsertZWS: () => ({ t: 'keydown.input.insertZWS' }),
};
