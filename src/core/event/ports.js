import { isMobile } from '../../helper/env';

/**
 * @typedef {import('./eventOrchestrator').default} EventManagerInstanceType
 */

/**
 * @typedef {import('../logic/dom/selection').default} Selection
 * @typedef {import('../logic/dom/format').default} Format
 * @typedef {import('../logic/dom/listFormat').default} ListFormat
 * @typedef {import('../logic/shell/component').default} Component
 * @typedef {import('../logic/dom/html').default} Html
 * @typedef {import('../logic/dom/nodeTransform').default} NodeTransform
 * @typedef {import('../logic/dom/char').default} Char
 * @typedef {import('../logic/panel/menu').default} Menu
 */

/**
 * @typedef {Object} SelectionPorts
 * @property {(...args: Parameters<Selection['getRange']>) => ReturnType<Selection['getRange']>} getRange
 * @property {(...args: Parameters<Selection['getNode']>) => ReturnType<Selection['getNode']>} getNode
 * @property {(...args: Parameters<Selection['setRange']>) => ReturnType<Selection['setRange']>} setRange
 * @property {(...args: Parameters<Selection['get']>) => ReturnType<Selection['get']>} get
 */

/**
 * @typedef {Object} FormatPorts
 * @property {(...args: Parameters<Format['isLine']>) => ReturnType<Format['isLine']>} isLine
 * @property {(...args: Parameters<Format['getLine']>) => ReturnType<Format['getLine']>} getLine
 * @property {(...args: Parameters<Format['getLines']>) => ReturnType<Format['getLines']>} getLines
 * @property {(...args: Parameters<Format['getBrLine']>) => ReturnType<Format['getBrLine']>} getBrLine
 * @property {(...args: Parameters<Format['getBlock']>) => ReturnType<Format['getBlock']>} getBlock
 * @property {(...args: Parameters<Format['isNormalLine']>) => ReturnType<Format['isNormalLine']>} isNormalLine
 * @property {(...args: Parameters<Format['isBrLine']>) => ReturnType<Format['isBrLine']>} isBrLine
 * @property {(...args: Parameters<Format['isClosureBrLine']>) => ReturnType<Format['isClosureBrLine']>} isClosureBrLine
 * @property {(...args: Parameters<Format['isClosureBlock']>) => ReturnType<Format['isClosureBlock']>} isClosureBlock
 * @property {(...args: Parameters<Format['isEdgeLine']>) => ReturnType<Format['isEdgeLine']>} isEdgeLine
 * @property {(...args: Parameters<Format['removeBlock']>) => ReturnType<Format['removeBlock']>} removeBlock
 * @property {(...args: Parameters<Format['addLine']>) => ReturnType<Format['addLine']>} addLine
 */

/**
 * @typedef {Object} ListFormatPorts
 * @property {(...args: Parameters<ListFormat['applyNested']>) => ReturnType<ListFormat['applyNested']>} applyNested
 */

/**
 * @typedef {Object} ComponentPorts
 * @property {(...args: Parameters<Component['deselect']>) => ReturnType<Component['deselect']>} deselect
 * @property {(...args: Parameters<Component['is']>) => ReturnType<Component['is']>} is
 * @property {(...args: Parameters<Component['get']>) => ReturnType<Component['get']>} get
 * @property {(...args: Parameters<Component['select']>) => ReturnType<Component['select']>} select
 */

/**
 * @typedef {Object} HtmlPorts
 * @property {(...args: Parameters<Html['remove']>) => ReturnType<Html['remove']>} remove
 * @property {(...args: Parameters<Html['insert']>) => ReturnType<Html['insert']>} insert
 * @property {(...args: Parameters<Html['insertNode']>) => ReturnType<Html['insertNode']>} insertNode
 */

/**
 * @typedef {Object} NodeTransformPorts
 * @property {(...args: Parameters<NodeTransform['removeAllParents']>) => ReturnType<NodeTransform['removeAllParents']>} removeAllParents
 * @property {(...args: Parameters<NodeTransform['split']>) => ReturnType<NodeTransform['split']>} split
 */

/**
 * @typedef {Object} CharPorts
 * @property {(...args: Parameters<Char['check']>) => ReturnType<Char['check']>} check
 */

/**
 * @typedef {Object} MenuPorts
 * @property {(...args: Parameters<Menu['dropdownOff']>) => ReturnType<Menu['dropdownOff']>} dropdownOff
 */

/**
 * @description Create ports for event reducers
 * @param {EventManagerInstanceType} inst - EventManager instance
 * @param {Object} param1 - Additional parameters
 * @param {*} param1._styleNodes - Style nodes reference object
 */
export function makePorts(inst, { _styleNodes }) {
	const { frameContext, ui, focusManager, selection, format, listFormat, component, html, nodeTransform, history, char, menu } = inst.$;

	return {
		// focusManager
		focusManager: {
			nativeFocus: () => focusManager.nativeFocus(),
			blur: () => focusManager.blur(),
		},

		// === class ===
		selection: {
			getRange: () => selection.getRange(),
			getNode: () => selection.getNode(),
			setRange: (se, so, ec, eo) => selection.setRange(se, so, ec, eo),
			get: () => selection.get(),
		},

		format: {
			isLine: (n) => format.isLine(n),
			getLine: (n, p) => format.getLine(n, p),
			getLines: (v) => format.getLines(v),
			getBrLine: (n, p) => format.getBrLine(n, p),
			getBlock: (n, p) => format.getBlock(n, p),
			isNormalLine: (n) => format.isNormalLine(n),
			isBrLine: (n) => format.isBrLine(n),
			isClosureBrLine: (n) => format.isClosureBrLine(n),
			isClosureBlock: (n) => format.isClosureBlock(n),
			isEdgeLine: (node, offset, dir) => format.isEdgeLine(node, offset, dir),
			removeBlock: (n, p) => format.removeBlock(n, p),
			addLine: (el, nextOrTag) => format.addLine(el, nextOrTag),
		},

		listFormat: {
			applyNested: (cells, shift) => listFormat.applyNested(cells, shift),
		},

		component: {
			deselect: () => component.deselect(),
			is: (n) => component.is(n),
			get: (n) => component.get(n),
			select: (t, p) => component.select(t, p),
		},

		html: {
			remove: () => html.remove(),
			insert: (h, p) => html.insert(h, p),
			insertNode: (n, p) => html.insertNode(n, p),
		},

		history: {
			push: (hard) => history.push(!!hard),
		},

		nodeTransform: {
			removeAllParents: (s, n, p) => nodeTransform.removeAllParents(s, n, p),
			split: (n, o, d) => nodeTransform.split(n, o, d),
		},

		char: {
			check: (content) => char.check(content),
		},

		menu: {
			dropdownOff: () => menu.dropdownOff(),
		},

		// === inst(eventManager) commands ===
		setDefaultLine: (tag) => inst._setDefaultLine(tag),
		hideToolbar: () => inst._hideToolbar(),
		hideToolbar_sub: () => inst._hideToolbar_sub(),
		styleNodeCache: () => (_styleNodes.value = inst.__cacheStyleNodes),
		formatAttrsTempCache: (attrs) => (inst._formatAttrsTemp = attrs),
		setOnShortcutKey: (v) => (inst._onShortcutKey = v),

		// === enter event specific ===
		/**
		 * @description Scrolls the editor view to the caret position after pressing `Enter`. (Ignored on mobile devices)
		 * @param {Range} range Range object
		 */
		enterScrollTo(range) {
			ui._iframeAutoHeight(frameContext);

			// scroll to
			if (isMobile && inst.scrollparents.length > 0) return;
			selection.scrollTo(range, { behavior: 'auto', block: 'nearest', inline: 'nearest' });
		},
		/**
		 * @description Prevents the default behavior of the `Enter` key and refocuses the editor.
		 * @param {Event} e The keyboard event
		 */
		enterPrevent(e) {
			e.preventDefault();
			if (!isMobile) return;

			inst.__focusTemp.focus({ preventScroll: true });
			frameContext.get('wysiwyg').focus({ preventScroll: true });
		},
	};
}

/**
 * @typedef {Object} EventReducerPorts
 *
 * @property {Object} focusManager
 * @property {() => void} focusManager.nativeFocus
 * @property {() => void} focusManager.blur
 * @property {SelectionPorts} selection
 * @property {FormatPorts} format
 * @property {ListFormatPorts} listFormat
 * @property {ComponentPorts} component
 * @property {HtmlPorts} html
 * @property {Object} history
 * @property {(hard: boolean) => void} history.push
 * @property {NodeTransformPorts} nodeTransform
 * @property {CharPorts} char
 * @property {MenuPorts} menu
 *
 * @property {(tag: string) => void} setDefaultLine
 * @property {() => void} hideToolbar
 * @property {() => void} hideToolbar_sub
 * @property {() => void} styleNodeCache
 * @property {(attrs: Object<string, *>) => void} formatAttrsTempCache
 * @property {(v: boolean) => void} setOnShortcutKey
 *
 * @property {(e: Event) => void} enterPrevent
 * @property {(range: Range) => void} enterScrollTo
 */
