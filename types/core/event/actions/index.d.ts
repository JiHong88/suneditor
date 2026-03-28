import type {} from '../../../typedef';
export namespace A {
	function prevent(): Action;
	function stop(): Action;
	function preventStop(): Action;
	function cacheStyleNode(): Action;
	function cacheFormatAttrsTemp(attrs: NamedNodeMap): Action;
	function componentDeselect(): Action;
	function editorNativeFocus(): Action;
	function historyPush(hard: boolean): Action;
	function documentTypeRefreshHeader(): Action;
	function selectionSetRange(sc: Node, so: number, ec: Node, eo: number): Action;
	function formatRemoveBlock(rangeEl: Element, selectedFormats: Element[] | null, newBlockElement: Element | null, shouldDelete: boolean, skipHistory: boolean): Action;
	function domUtilsRemoveItem(item: Node): Action;
	function selectComponentFallback(cmponentInfo: SunEditor.ComponentInfo): Action;
	function delFormatRemoveAndMove(container: Node, formatEl: Element): Action;
	function backspaceFormatMaintain(formatEl: Element): Action;
	function backspaceBrLineStrip(formatEl: Element): Action;
	function backspaceComponentSelect(selectionNode: Node, range: Range, fileComponentInfo: SunEditor.ComponentInfo): Action;
	function backspaceComponentRemove(isList: boolean, sel: Node, formatEl: Element, fileComponentInfo: SunEditor.ComponentInfo): Action;
	function backspaceListMergePrev(prev: Element, formatEl: Element, rangeEl: Element): Action;
	function backspaceListRemoveNested(range: Range): Action;
	function deleteComponentSelect(formatEl: Element, fileComponentInfo: SunEditor.ComponentInfo): Action;
	function deleteComponentSelectNext(formatEl: any, nextEl: Element): Action;
	function deleteListRemoveNested(range: Range, formatEl: Element, rangeEl: Element): Action;
	function tabFormatIndent(range: Range, formatEl: Element, shift: boolean): Action;
	function enterScrollTo(range: Range): Action;
	function enterLineAddDefault(formatEl: Element): Action;
	function enterListAddItem(formatEl: Element, selectionNode: Node): Action;
	function enterFormatExitEmpty(formatEl: Element, rangeEl: Element): Action;
	function enterFormatCleanBrAndZWS(selectionNode: Node, selectionFormat: boolean, brBlock: Element, children: NodeList, offset: number): Action;
	function enterFormatInsertBrHtml(brBlock: Element, range: Range, wSelection: Selection, offset: number): Action;
	function enterFormatInsertBrNode(wSelection: Selection): Action;
	function enterFormatBreakAtEdge(formatEl: Element, selectionNode: Node, formatStartEdge: boolean, formatEndEdge: boolean): Action;
	function enterFormatBreakWithSelection(formatEl: Element, range: Range, formatStartEdge: boolean, formatEndEdge: boolean): Action;
	function enterFormatBreakAtCursor(formatEl: Element, range: Range): Action;
	function enterFigcaptionExitInList(formatEl: Element): Action;
	function keydownInputInsertNbsp(): Action;
	function keydownInputInsertZWS(): Action;
}
export type Action = {
	t: string;
	p?: any;
};
export namespace SunEditor {
	type ComponentInfo = {
		target: Element;
		pluginName: string;
		options?: any;
	};
}
