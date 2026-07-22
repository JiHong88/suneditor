import { env, dom, keyCodeMap } from '../../../helper';

import { reduceBackspaceDown } from '../rules/keydown.rule.backspace';
import { reduceDeleteDown } from '../rules/keydown.rule.delete';
import { reduceEnterDown } from '../rules/keydown.rule.enter';
import { reduceTabDown } from '../rules/keydown.rule.tab';
import { reduceArrowDown } from '../rules/keydown.rule.arrow';
import { A } from '../actions';

const { isOSX_IOS } = env;

/**
 * @description Master switch for processing Enter from the `beforeinput` event (post-IME-commit) instead
 * of `keydown`, to avoid trapping iOS/mobile IME marked-text when `keydown` mutates the DOM (see
 * `handler_ww_input.js`).
 *
 * This is only the compile-time master; the effective per-environment decision is
 * {@link useEnterFromBeforeInput}, which additionally requires that this environment actually delivers
 * `beforeinput` at runtime (some corporate security SW / DLP / VDI drop it).
 * @type {boolean}
 */
export const ENTER_FROM_BEFOREINPUT = true;

/**
 * @description Routing decision for Enter. Auto-repeat (held key) fires `keydown` but not `beforeinput`,
 * so a repeat must stay on `keydown` or only the first line break would land.
 * @param {SunEditor.Store} store - Editor store object
 * @param {KeyboardEvent|InputEvent} [e] - Source event; a `repeat` flag forces the `keydown` path.
 * @returns {boolean} `true` to route Enter through `beforeinput`, `false` to keep it on `keydown`.
 */
export function useEnterFromBeforeInput(store, e) {
	return ENTER_FROM_BEFOREINPUT && store.get('_canUseBeforeInput') && !(/** @type {KeyboardEvent} */ (e)?.repeat);
}

/**
 * @typedef {import('../ports').EventReducerPorts} EventPorts
 */

/**
 * @typedef {Object} KeydownReducerCtx - Keydown Reducer Context object
 * @property {KeyboardEvent|InputEvent} ctx.e - The keyboard event (or the `beforeinput` InputEvent when Enter is dispatched from `beforeinput`)
 * @property {SunEditor.FrameContext} ctx.fc - Frame context object
 * @property {SunEditor.Store} ctx.store - Editor store object
 * @property {SunEditor.Options} ctx.options - Options object
 * @property {SunEditor.FrameOptions} ctx.frameOptions - Frame options object
 * @property {Range} ctx.range - Current selection range
 * @property {HTMLElement|Text} ctx.selectionNode - Current selection node
 * @property {HTMLElement} ctx.formatEl - Current format element
 * @property {string} ctx.keyCode - Key code
 * @property {boolean} ctx.ctrl - Whether the `ctrl` key is pressed
 * @property {boolean} ctx.alt - Whether the `alt` key is pressed
 * @property {boolean} ctx.shift - Whether the `shift` key is pressed
 */

/**
 * @typedef {import('../actions').Action[]} EventActions
 */

/**
 * @description Keydown event reducer
 * @param {EventPorts} ports - Ports for interacting with editor
 * @param {KeydownReducerCtx} ctx - Context object
 * @returns {Promise<EventActions>} Action list
 */
export async function reduceKeydown(ports, ctx) {
	const actions = [];

	switch (ctx.keyCode) {
		case 'Backspace' /** backspace key */: {
			if (reduceBackspaceDown(actions, ports, ctx) === false) {
				return actions;
			}
			break;
		}
		case 'Delete' /** delete key */: {
			if (reduceDeleteDown(actions, ports, ctx) === false) {
				return actions;
			}
			break;
		}
		case 'Tab' /** tab key */: {
			if (reduceTabDown(actions, ports, ctx) === false) {
				return actions;
			}
			break;
		}
		case 'Enter' /** enter key */: {
			if (!useEnterFromBeforeInput(ctx.store, ctx.e)) {
				if (reduceEnterDown(actions, ports, ctx) === false) {
					return actions;
				}
			}
			break;
		}
	}

	// ZWS, nbsp, documentType
	const { fc, keyCode, shift, alt, ctrl, range } = ctx;

	if (shift && (isOSX_IOS ? alt : ctrl) && keyCodeMap.isSpace(keyCode)) {
		actions.push(A.preventStop());
		actions.push(A.keydownInputInsertNbsp());
		return actions;
	}

	const selectRange = !range.collapsed || range.startContainer !== range.endContainer;
	if (
		!ctrl &&
		!alt &&
		!selectRange &&
		!keyCodeMap.isNonTextKey(keyCode) &&
		dom.check.isBreak(range.commonAncestorContainer)
	) {
		actions.push(A.keydownInputInsertZWS());
		return actions;
	}

	// document type
	if (
		fc.has('documentType_use_header') &&
		selectRange &&
		!ctrl &&
		!alt &&
		!shift &&
		!keyCodeMap.isDirectionKey(keyCode)
	) {
		actions.push(A.documentTypeRefreshHeader());
		return actions;
	}

	// Arrow key - select component action
	reduceArrowDown(actions, ports, ctx);

	return actions;
}
