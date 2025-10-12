import { env, dom, keyCodeMap } from '../../../helper';

import { reduceBackspaceDown } from '../rules/keydown.rule.backspace';
import { reduceDeleteDown } from '../rules/keydown.rule.delete';
import { reduceEnterDown } from '../rules/keydown.rule.enter';
import { reduceTabDown } from '../rules/keydown.rule.tab';
import { reduceArrowDown } from '../rules/keydown.rule.arrow';
import { A } from '../actions';

const { isOSX_IOS } = env;

/**
 * @typedef {Object} KeydownReducerCtx - Keydown Reducer Context object
 * @property {KeyboardEvent} ctx.e - The keyboard event
 * @property {__se__FrameContext} ctx.fc - Frame context object
 * @property {__se__EditorStatus} ctx.status - Editor status object
 * @property {__se__BaseOptions} ctx.options - Options object
 * @property {__se__FrameOptions} ctx.frameOptions - Frame options object
 * @property {Range} ctx.range - Current selection range
 * @property {HTMLElement|Text} ctx.selectionNode - Current selection node
 * @property {HTMLElement} ctx.formatEl - Current format element
 * @property {string} ctx.keyCode - Key code
 * @property {boolean} ctx.ctrl - Whether the ctrl key is pressed
 * @property {boolean} ctx.alt - Whether the alt key is pressed
 * @property {boolean} ctx.shift - Whether the shift key is pressed
 */

/**
 * @description Keydown event reducer
 * @param {__se__EventPorts} ports - Ports for interacting with editor
 * @param {KeydownReducerCtx} ctx - Context object
 * @returns {Promise<__se__EventActions>} Action list
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
			if (reduceEnterDown(actions, ports, ctx) === false) {
				return actions;
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
	if (!ctrl && !alt && !selectRange && !keyCodeMap.isNonTextKey(keyCode) && dom.check.isBreak(range.commonAncestorContainer)) {
		actions.push(A.keydownInputInsertZWS());
		return actions;
	}

	// document type
	if (fc.has('documentType_use_header') && selectRange && !ctrl && !alt && !shift && !keyCodeMap.isDirectionKey(keyCode)) {
		actions.push(A.documentTypeRefreshHeader());
		return actions;
	}

	// Arrow key - select component action
	reduceArrowDown(actions, ports, ctx);

	return actions;
}
