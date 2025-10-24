import type {} from '../../../typedef';
declare const _default: {
	/** @action prevent */
	'event.prevent': ({ ctx }: EffectContext) => void;
	/** @action stop */
	'event.stop': ({ ctx }: EffectContext) => void;
	/** @action preventStop */
	'event.prevent.stop': ({ ctx }: EffectContext) => void;
	/** @action cacheStyleNode */
	'cache.styleNode': ({ ports }: EffectContext) => void;
	/** @action cacheFormatAttrsTemp */
	'cache.formatAttrsTemp': ({ ports }: EffectContext, { attrs }: any) => void;
	/** @action editorNativeFocus */
	'editor._nativeFocus': ({ ports }: EffectContext) => void;
	/** @action historyPush */
	'history.push': ({ ports }: EffectContext, hard: any) => void;
	/** @action documentTypeRefreshHeader */
	'documentType.refreshHeader': ({ ctx }: EffectContext) => void;
	/** @action componentDeselect */
	'component.deselect': ({ ports }: EffectContext) => void;
	/** @action selectionSetRange */
	'selection.setRange': ({ ports }: EffectContext, { sc, so, ec, eo }: any) => Range;
	/** @action formatRemoveBlock */
	'format.removeBlock': (
		{ ports }: EffectContext,
		{ rangeEl, selectedFormats, newBlockElement, shouldDelete, skipHistory }: any
	) => {
		cc: Node;
		sc: Node;
		so: number;
		ec: Node;
		eo: number;
		removeArray: Array<Node> | null;
	};
	/** @action domUtilsRemoveItem */
	'dom.utils.removeItem': (_: EffectContext, { item }: any) => void;
	/** @action selectComponentFallback */
	'select.component.fallback': ({ ports }: EffectContext, { cmponentInfo }: any) => void;
};
export default _default;
export type EffectContext = {
	/**
	 * - Ports for interacting with editor
	 */
	ports: SunEditor.EventPorts;
	/**
	 * - Reducer context
	 */
	ctx: SunEditor.EventKeydownCtx;
};
export type Effect = (ctx: EffectContext, payload?: any) => any;
