import { dom } from '../../../helper';
import { _w } from '../../../helper/env';

/**
 * @typedef {Object} EffectContext
 * @property {SunEditor.EventPorts} ports - Ports for interacting with editor
 * @property {SunEditor.EventKeydownCtx} ctx - Reducer context
 */

/**
 * @typedef {(ctx: EffectContext, payload?: *) => *} Effect
 */

/** @type {Record<string, Effect>} */
export default {
	// event, cache
	/** @action prevent */
	'event.prevent': ({ ctx }) => ctx.e.preventDefault(),
	/** @action stop */
	'event.stop': ({ ctx }) => ctx.e.stopPropagation(),
	/** @action preventStop */
	'event.prevent.stop': ({ ctx }) => {
		ctx.e.preventDefault();
		ctx.e.stopPropagation();
	},
	/** @action cacheStyleNode */
	'cache.styleNode': ({ ports }) => ports.styleNodeCache(),
	/** @action cacheFormatAttrsTemp */
	'cache.formatAttrsTemp': ({ ports }, { attrs }) => ports.formatAttrsTempCache(attrs),

	// commands
	/** @action editorNativeFocus */
	'editor._nativeFocus': ({ ports }) => ports.editor._nativeFocus(),
	/** @action historyPush */
	'history.push': ({ ports }, hard) => ports.history.push(hard),
	/** @action documentTypeRefreshHeader */
	'documentType.refreshHeader': ({ ctx }) => {
		_w.setTimeout(() => {
			ctx.fc.get('documentType').reHeader();
		}, 0);
	},

	// class
	/** @action componentDeselect */
	'component.deselect': ({ ports }) => ports.component.deselect(),
	/** @action selectionSetRange */
	'selection.setRange': ({ ports }, { sc, so, ec, eo }) => ports.selection.setRange(sc, so, ec, eo),
	/** @action formatRemoveBlock */
	'format.removeBlock': ({ ports }, { rangeEl, selectedFormats, newBlockElement, shouldDelete, skipHistory }) => ports.format.removeBlock(rangeEl, { selectedFormats, newBlockElement, shouldDelete, skipHistory }),

	// helper
	/** @action domUtilsRemoveItem */
	'dom.utils.removeItem': (_, { item }) => dom.utils.removeItem(item),

	// utils
	/** @action selectComponentFallback */
	'select.component.fallback': ({ ports }, { cmponentInfo }) => {
		if (ports.component.select(cmponentInfo.target, cmponentInfo.pluginName) === false) ports.editor.blur();
	},
};
