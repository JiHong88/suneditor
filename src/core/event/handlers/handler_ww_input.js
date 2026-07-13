import { dom, keyCodeMap } from '../../../helper';
import { actionExecutor } from '../executor';
import { makePorts } from '../ports';
import { reduceEnterDown } from '../rules/keydown.rule.enter';
import { ENTER_FROM_BEFOREINPUT } from '../reducers/keydown.reducer';

// The Enter rule/effects never touch the retain-style node cache (a backspace concern) — a local
// placeholder is enough to satisfy `makePorts`.
const _enterStyleNodes = { value: [] };

/**
 * @typedef {import('../eventOrchestrator').default} EventManagerThis_handler_ww_input
 */

/**
 * @this {EventManagerThis_handler_ww_input}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {InputEvent} e - Event object
 */
export async function OnBeforeInput_wysiwyg(fc, e) {
	if (fc.get('isReadOnly') || fc.get('isDisabled')) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	// Enter is dispatched here — not on keydown — so the IME has finished committing before the DOM
	// mutates (iOS/mobile marked-text stability). `insertParagraph` = Enter, `insertLineBreak` = Shift+Enter.
	// ctrl/alt+Enter are shortcuts and never produce these inputTypes, so they stay on the keydown path.
	if (ENTER_FROM_BEFOREINPUT && (e.inputType === 'insertParagraph' || e.inputType === 'insertLineBreak')) {
		await dispatchEnter.call(this, fc, e);
		return;
	}

	const data = (e.data === null ? '' : e.data === undefined ? ' ' : e.data) || '';
	if (!keyCodeMap.isComposing(e)) {
		if (!this.$.char.test(data, false)) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
		this._handledInBefore = true;
	} else {
		this._handledInBefore = false;
	}

	// user event
	if ((await this.$.eventManager.triggerEvent('onBeforeInput', { frameContext: fc, event: e, data })) === false)
		return;
	// plugin event
	await this._callPluginEventAsync('onBeforeInput', { frameContext: fc, event: e, data });
}

/**
 * @this {EventManagerThis_handler_ww_input}
 * @description Runs SunEditor's Enter logic from the `beforeinput` event (post-IME-commit) by reusing the
 * exact keydown Enter rule + effects — only the dispatch site moves off keydown. See ENTER_FROM_BEFOREINPUT.
 * The guards mirror `OnKeyDown_wysiwyg` (selectMenu, input-element, open-dropdown) so a `beforeinput` Enter
 * is dropped in the same situations a keydown Enter is.
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {InputEvent} e - The `beforeinput` event (`insertParagraph` | `insertLineBreak`)
 */
async function dispatchEnter(fc, e) {
	// Skip while an IME composition is still active
	if (e.isComposing || this.isComposing) return;
	if (this.$.ui.selectMenuOn) return;

	let selectionNode = this.$.selection.getNode();
	if (dom.check.isInputElement(selectionNode)) return;
	if (this.$.menu.currentDropdownName) return;

	if (dom.check.isWysiwygFrame(selectionNode)) {
		this._setDefaultLine(this.$.options.get('defaultLine'));
		selectionNode = this.$.selection.getNode();
	}

	const normalized = this._normalizeEnterRange();
	if (normalized) selectionNode = normalized;

	const range = this.$.selection.getRange();
	const formatEl = /** @type {HTMLElement} */ (this.$.format.getLine(selectionNode, null) || selectionNode);
	const shift = e.inputType === 'insertLineBreak';

	/** @type {import('../reducers/keydown.reducer').KeydownReducerCtx} */
	const ctx = {
		e,
		fc,
		store: this.$.store,
		options: this.$.options,
		frameOptions: this.$.frameOptions,
		range,
		selectionNode,
		formatEl,
		keyCode: 'Enter',
		ctrl: false,
		alt: false,
		shift,
	};

	const ports = makePorts(this, { _styleNodes: _enterStyleNodes });
	const actions = [];
	reduceEnterDown(actions, ports, ctx);

	// `beforeinput.preventDefault()` MUST run synchronously (before the first `await` below), or the browser
	// commits its native insertParagraph/insertLineBreak on top of ours (duplicate line / cloned container).
	if (actions.some((a) => a.t === 'event.prevent' || a.t === 'event.prevent.stop')) {
		e.preventDefault();
	}

	await actionExecutor(actions, { ports, ctx });
}

/**
 * @this {EventManagerThis_handler_ww_input}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {InputEvent} e - Event object
 */
export async function OnInput_wysiwyg(fc, e) {
	if (fc.get('isReadOnly') || fc.get('isDisabled')) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	const range = this.$.selection.getRange();
	const selectionNode = this.$.selection.getNode();
	const formatEl = this.$.format.getLine(selectionNode, null);
	if (
		!this.$.format.isNormalLine(formatEl) &&
		!this.$.format.isBrLine(formatEl) &&
		range.collapsed &&
		!this.$.component.is(selectionNode) &&
		!dom.check.isList(selectionNode)
	) {
		const rangeEl = this.$.format.getBlock(selectionNode, null);
		this._setDefaultLine(this.$.format.isBlock(rangeEl) ? 'DIV' : this.$.options.get('defaultLine'));
	}

	this.$.selection.init();

	const data = (e.data === null ? '' : e.data === undefined ? ' ' : e.data) || '';
	if (!this._handledInBefore) {
		if (!this.$.char.test(data, true)) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	}
	this._handledInBefore = false;

	// user event
	if ((await this.$.eventManager.triggerEvent('onInput', { frameContext: fc, event: e, data })) === false) return;
	// plugin event
	await this._callPluginEventAsync('onInput', { frameContext: fc, event: e, data });

	this.$.history.push(true);
}
