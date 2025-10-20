import type {} from '../../../typedef';
declare const _default: {
	/** @action delFormatRemoveAndMove */
	'del.format.removeAndMove': ({ ports }: EffectContext_keydown, { container, formatEl }: any) => void;
	/** @action backspaceFormatMaintain */
	'backspace.format.maintain': ({ ctx }: EffectContext_keydown, { formatEl }: any) => void;
	/** @action backspaceComponentSelect */
	'backspace.component.select': ({ ports }: EffectContext_keydown, { selectionNode, range, fileComponentInfo }: any) => void;
	/** @action backspaceComponentRemove */
	'backspace.component.remove': ({ ports }: EffectContext_keydown, { isList, sel, formatEl, fileComponentInfo }: any) => void;
	/** @action backspaceListMergePrev */
	'backspace.list.mergePrev': ({ ports }: EffectContext_keydown, { prev, formatEl, rangeEl }: any) => void;
	/** @action backspaceListRemoveNested */
	'backspace.list.removeNested': ({ ports }: EffectContext_keydown, { range }: any) => void;
	/** @action deleteComponentSelect */
	'delete.component.select': ({ ports }: EffectContext_keydown, { formatEl, fileComponentInfo }: any) => void;
	/** @action deleteComponentSelectNext */
	'delete.component.selectNext': ({ ports, ctx }: EffectContext_keydown, { formatEl, nextEl }: any) => void;
	/** @action deleteListRemoveNested */
	'delete.list.removeNested': ({ ports, ctx }: EffectContext_keydown, { range, formatEl, rangeEl }: any) => void;
	/** @action tabFormatIndent */
	'tab.format.indent': ({ ports, ctx }: EffectContext_keydown, { range, formatEl, shift }: any) => boolean;
	/** @action enterScrollTo */
	'enter.scrollTo': ({ ports }: EffectContext_keydown, { range }: any) => void;
	/** @action enterLineAddDefault */
	'enter.line.addDefault': ({ ports, ctx }: EffectContext_keydown, { formatEl }: any) => void;
	/** @action enterListAddItem */
	'enter.list.addItem': ({ ports }: EffectContext_keydown, { formatEl, selectionNode }: any) => void;
	/** @action enterFormatExitEmpty */
	'enter.format.exitEmpty': ({ ports, ctx }: EffectContext_keydown, { formatEl, rangeEl }: any) => void;
	/** @action enterFormatCleanBrAndZWS */
	'enter.format.cleanBrAndZWS': ({ ports }: EffectContext_keydown, { selectionNode, selectionFormat, brBlock, children, offset }: any) => void;
	/** @action enterFormatInsertBrHtml */
	'enter.format.insertBrHtml': ({ ports }: EffectContext_keydown, { brBlock, range, wSelection, offset }: any) => void;
	/** @action enterFormatInsertBrNode */
	'enter.format.insertBrNode': ({ ports }: EffectContext_keydown, { wSelection }: any) => void;
	/** @action enterFormatBreakAtEdge */
	'enter.format.breakAtEdge': ({ ports, ctx }: EffectContext_keydown, { formatEl, selectionNode, formatStartEdge, formatEndEdge }: any) => void;
	/** @action enterFormatBreakWithSelection */
	'enter.format.breakWithSelection': ({ ports, ctx }: EffectContext_keydown, { formatEl, range, formatStartEdge, formatEndEdge }: any) => void;
	/** @action enterFormatBreakAtCursor */
	'enter.format.breakAtCursor': ({ ports, ctx }: EffectContext_keydown, { formatEl, range }: any) => void;
	/** @action enterFigcaptionExitInList */
	'enter.figcaption.exitInList': ({ ports }: EffectContext_keydown, { formatEl }: any) => void;
	/** @action keydownInputInsertNbsp */
	'keydown.input.insertNbsp': ({ ports }: EffectContext_keydown) => void;
	/** @action keydownInputInsertZWS */
	'keydown.input.insertZWS': ({ ports }: EffectContext_keydown) => void;
};
export default _default;
export type EffectContext_keydown = {
	/**
	 * - Ports for interacting with editor
	 */
	ports: __se__EventPorts;
	/**
	 * - Reducer context
	 */
	ctx: __se__EventKeydownCtx;
};
export type Effect = (ctx: EffectContext_keydown, payload?: any) => any;
/**
 * @param {HTMLElement} formatEl - Format element
 * @returns {Node}
 */
export function LineDelete_next(formatEl: HTMLElement): Node;
/**
 * @param {HTMLElement} formatEl - Format element
 * @returns {{focusNode: Node, focusOffset: number}}
 */
export function LineDelete_prev(formatEl: HTMLElement): {
	focusNode: Node;
	focusOffset: number;
};
