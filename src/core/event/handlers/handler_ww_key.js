import { dom, env, unicode, keyCodeMap } from '../../../helper';
import { actionExecutor } from '../executor';
import { makePorts } from '../ports';
import { reduceKeydown } from '../reducers/keydown.reducer';

const { _w } = env;
const FRONT_ZEROWIDTH = new RegExp(unicode.zeroWidthSpace + '+', '');

const keyState = {
	ctrl: false,
	alt: false
};
const _styleNodes = Object.preventExtensions({ value: [] });

/**
 * @typedef {Omit<import('../eventManager').default & Partial<SunEditor.Injector>, 'eventManager'>} EventManagerThis_handler_ww_key_input
 */

/**
 * @private
 * @this {EventManagerThis_handler_ww_key_input}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {KeyboardEvent} e - Event object
 */
export async function OnKeyDown_wysiwyg(fc, e) {
	if ((this.isComposing = keyCodeMap.isComposing(e))) return true;
	if (this.editor.selectMenuOn || !e.isTrusted) return;

	let selectionNode = this.selection.getNode();
	if (dom.check.isInputElement(selectionNode)) return;
	if (this.menu.currentDropdownName) return;

	const keyCode = e.code;
	const shift = keyCodeMap.isShift(e);
	const ctrl = (keyState.ctrl = keyCodeMap.isCtrl(e));
	const alt = (keyState.alt = keyCodeMap.isAlt(e));

	if (!ctrl && fc.get('isReadOnly') && !keyCodeMap.isDirectionKey(keyCode)) {
		e.preventDefault();
		return false;
	}

	this.menu.dropdownOff();

	if (this.editor.isBalloon) {
		this._hideToolbar();
	} else if (this.editor.isSubBalloon) {
		this._hideToolbar_sub();
	}

	// user event
	if ((await this.triggerEvent('onKeyDown', { frameContext: fc, event: e })) === false) return;

	/** default key action */
	if (keyCodeMap.isEnter(keyCode) && this.format.isLine(this.selection.getRange()?.startContainer)) {
		this.selection._resetRangeToTextNode();
		selectionNode = this.selection.getNode();
	}

	const range = this.selection.getRange();
	const formatEl = /** @type {HTMLElement} */ (this.format.getLine(selectionNode, null) || selectionNode);

	/** Shortcuts */
	if (ctrl && !keyCodeMap.isNonTextKey(keyCode) && this.shortcuts.command(e, ctrl, shift, keyCode, '', false, null, null)) {
		this._onShortcutKey = true;
		e.preventDefault();
		e.stopPropagation();
		return false;
	} else if (!ctrl && !keyCodeMap.isNonTextKey(keyCode) && this.format.isLine(formatEl) && range.collapsed && dom.check.isEdgePoint(range.startContainer, 0, 'front')) {
		const keyword = /** @type {Text} */ (range.startContainer).substringData?.(0, range.startOffset);
		if (keyword && this.shortcuts.command(e, false, shift, keyCode, keyword, true, formatEl, range)) {
			this._onShortcutKey = true;
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	} else if (this._onShortcutKey) {
		this._onShortcutKey = false;
	}

	// plugin event
	if (this._callPluginEvent('onKeyDown', { frameContext: fc, event: e, range, line: formatEl }) === false) return;

	// reducer / actions
	/** @type {SunEditor.EventKeydownCtx} */
	const ctx = { e, fc, status: this.status, options: this.options, frameOptions: this.frameOptions, range, selectionNode, formatEl, keyCode, ctrl, alt, shift };
	const ports = makePorts(this, { _styleNodes });

	// action execute
	const actions = await reduceKeydown(ports, ctx);
	await actionExecutor(actions, { ports, ctx });
}

/**
 * @private
 * @this {EventManagerThis_handler_ww_key_input}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {KeyboardEvent} e - Event object
 */
export async function OnKeyUp_wysiwyg(fc, e) {
	if (this._onShortcutKey || this.menu.currentDropdownName) return;

	const keyCode = e.code;
	const ctrl = keyCodeMap.isCtrl(e);
	const alt = keyCodeMap.isAlt(e);

	if (ctrl) keyState.ctrl = false;
	if (alt) keyState.alt = false;

	if (fc.get('isReadOnly')) return;

	const range = this.selection.getRange();
	let selectionNode = this.selection.getNode();

	if ((this.editor.isBalloon || this.editor.isSubBalloon) && (((this.editor.isBalloonAlways || this.editor.isSubBalloonAlways) && !keyCodeMap.isEsc(keyCode)) || !range.collapsed)) {
		if (this.editor.isBalloonAlways || this.editor.isSubBalloonAlways) {
			if (!keyCodeMap.isEsc(keyCode)) this._showToolbarBalloonDelay();
		} else {
			if (this.editor.isSubBalloon) this.subToolbar._showBalloon();
			else this.toolbar._showBalloon();
			return;
		}
	}

	/** when format tag deleted */
	if (keyCodeMap.isBackspace(keyCode) && dom.check.isWysiwygFrame(selectionNode) && selectionNode.textContent === '' && selectionNode.children.length === 0) {
		e.preventDefault();
		e.stopPropagation();

		selectionNode.innerHTML = '';

		const oFormatTag = dom.utils.createElement(this.format.isLine(this.status.currentNodes[0]) && !dom.check.isListCell(this.status.currentNodes[0]) ? this.status.currentNodes[0] : this.options.get('defaultLine'), null, '<br>');
		selectionNode.appendChild(oFormatTag);
		this.selection.setRange(oFormatTag, 0, oFormatTag, 0);
		this.applyTagEffect();

		this.history.push(false);

		// document type
		if (fc.has('documentType_use_header')) {
			if (keyCodeMap.isDocumentTypeObserverKey(keyCode)) {
				fc.get('documentType').reHeader();
			}
		}

		return;
	}

	const formatEl = this.format.getLine(selectionNode, null);
	const rangeEl = this.format.getBlock(selectionNode, null);
	const attrs = this._formatAttrsTemp;

	if (formatEl && attrs) {
		for (let i = 0, len = attrs.length; i < len; i++) {
			if (keyCodeMap.isEnter(keyCode) && /^id$/i.test(attrs[i].name)) {
				formatEl.removeAttribute('id');
				continue;
			}
			formatEl.setAttribute(attrs[i].name, attrs[i].value);
		}
		this._formatAttrsTemp = null;
	}

	if (
		!this.format.isNormalLine(formatEl) &&
		!this.format.isBrLine(formatEl) &&
		range.collapsed &&
		!this.component.is(selectionNode) &&
		!dom.check.isList(selectionNode) &&
		this._setDefaultLine(this.format.isBlock(rangeEl) ? 'DIV' : this.options.get('defaultLine')) !== null
	) {
		selectionNode = this.selection.getNode();
	}

	const textKey = !keyState.ctrl && !keyState.alt && !keyCodeMap.isNonTextKey(keyCode);
	if (textKey && selectionNode.nodeType === 3 && unicode.zeroWidthRegExp.test(selectionNode.textContent) && !(e.isComposing !== undefined ? e.isComposing : this.isComposing)) {
		let so = range.startOffset,
			eo = range.endOffset;
		const frontZeroWidthCnt = (selectionNode.textContent.substring(0, eo).match(FRONT_ZEROWIDTH) || '').length;
		so = range.startOffset - frontZeroWidthCnt;
		eo = range.endOffset - frontZeroWidthCnt;
		selectionNode.textContent = selectionNode.textContent.replace(unicode.zeroWidthRegExp, '');
		this.selection.setRange(selectionNode, so < 0 ? 0 : so, selectionNode, eo < 0 ? 0 : eo);
	}

	if (keyCodeMap.isRemoveKey(keyCode) && dom.check.isZeroWidth(formatEl?.textContent) && !formatEl.previousElementSibling && !dom.check.isListCell(formatEl)) {
		const rsMode = this.options.get('retainStyleMode');
		if (rsMode !== 'none' && _styleNodes.value?.length > 0) {
			if (rsMode === 'repeat') {
				if (this.__retainTimer) {
					this.__retainTimer = _w.clearTimeout(this.__retainTimer);
					this._clearRetainStyleNodes(formatEl);
				} else {
					this.__retainTimer = _w.setTimeout(() => {
						this.__retainTimer = null;
					}, 0);
					this._retainStyleNodes(formatEl, _styleNodes.value);
				}
			} else {
				this.__retainTimer = null;
				this._retainStyleNodes(formatEl, _styleNodes.value);
			}
		} else {
			this._clearRetainStyleNodes(formatEl);
		}
	}

	// document type
	if (fc.has('documentType_use_header')) {
		if (keyCodeMap.isDocumentTypeObserverKey(keyCode)) {
			fc.get('documentType').reHeader();
			const el = dom.query.getParentElement(this.selection.selectionNode, this.format.isLine.bind(this.format));
			fc.get('documentType').on(el);
		} else {
			const el = dom.query.getParentElement(selectionNode, (current) => current.nodeType === 1);
			fc.get('documentType').onChangeText(el);
		}
	}

	// user event
	if ((await this.triggerEvent('onKeyUp', { frameContext: fc, event: e })) === false) return;
	// plugin event
	if (this._callPluginEvent('onKeyUp', { frameContext: fc, event: e, range, line: formatEl }) === false) return;

	if (keyCodeMap.isHistoryRelevantKey(keyCode)) {
		this.history.push(true);
	}
}
