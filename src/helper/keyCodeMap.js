/**
 * @fileoverview keyCode helper
 */

const _arrow = 'ArrowLeft|ArrowUp|ArrowRight|ArrowDown';
const _fN = 'F1|F2|F3|F4|F5|F6|F7|F8|F9|F10|F11|F12';
// const DIR_KEYCODE = /^(3[7-9]|40)$/;
const DIR_KEYCODE = _arrow.split('|');
// const DELETE_KEYCODE = /^(8|46)$/;
const DELETE_KEYCODE = 'Backspace|Delete'.split('|');
// const NON_TEXT_KEYCODE = /^(8|9|13|1[6-9]|20|27|3[3-9]|40|45|46|11[2-9]|12[0-3]|144|145|229)$/;
const NON_TEXT_KEYCODE = `Backspace|Tab|Enter|ShiftLeft|ShiftRight|ControlLeft|ControlRight|AltLeft|AltRight|Pause|CapsLock|Escape|PageUp|PageDown|End|Home|${_arrow}|Insert|Delete|${_fN}|NumLock|ScrollLock`.split('|');
// const HISTORY_RELEVANT_KEYS = /^(9|13|46)$/;
const HISTORY_RELEVANT_KEYS = `Backspace|Enter|Delete`.split('|');
// const DOCUMENT_TYPE_OBSERVER_KEYCODE = /^(8|13|46)$/;
const DOCUMENT_TYPE_OBSERVER_KEYCODE = 'Backspace|Enter|Delete'.split('|');
// const NON_RESPONSE_KEYCODE = /^(1[7-9]|20|27|45|11[2-9]|12[0-3]|144|145)$/;
const NON_RESPONSE_CODE = `ControlLeft|ControlRight|AltLeft|AltRight|Pause|CapsLock|Escape|Insert|${_fN}|NumLock|ScrollLock`.split('|');

/** ------------------------------------------------------- [meta] -------------------------------------------------------  */
/**
 * @description Shift check
 * @param {KeyboardEvent} e Event object
 * @returns {boolean}
 */
export function isShift(e) {
	return e.shiftKey || e.keyCode === 16;
}

/**
 * @description [Ctrl|Meta] check
 * @param {KeyboardEvent} e Event object
 * @returns {boolean}
 */
export function isCtrl(e) {
	const keyCode = e.code;
	// return e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92 || keyCode === 224;
	return e.ctrlKey || e.metaKey || keyCode === 'MetaLeft' || keyCode === 'MetaRight';
}

/**
 * @description Alt check
 * @param {KeyboardEvent} e Event object
 * @returns {boolean}
 */
export function isAlt(e) {
	return e.altKey;
}

/**
 * @description event.isComposing check
 * @param {KeyboardEvent|InputEvent} e Event object
 * @returns {boolean}
 */
export function isComposing(e) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return e.isComposing || e.keyCode === 229;
}

/**
 * @description Backspace key check
 * @param {string} code Event.code
 * @returns {boolean}
 */
export function isBackspace(code) {
	// return code === 8;
	return code === 'Backspace';
}

/**
 * @description Tab key check
 * @param {string} code Event.code
 * @returns {boolean}
 */
export function isTab(code) {
	// return code === 9;
	return code === 'Tab';
}

/**
 * @description Enter key check
 * @param {string} code Event.code
 * @returns {boolean}
 */
export function isEnter(code) {
	// return code === 13;
	return code === 'Enter';
}

/**
 * @description ESC key check
 * @param {string} code Event.code
 * @returns {boolean}
 */
export function isEsc(code) {
	// return code === 27;
	return code === 'Escape';
}

/**
 * @description Space key check
 * @param {string} code Event.code
 * @returns {boolean}
 */
export function isSpace(code) {
	// return code === 32;
	return code === 'Space';
}

/** ------------------------------------------------------- [key] -------------------------------------------------------  */

/**
 * @description Direction key check
 * @param {string} code Event.code
 * @returns {boolean}
 */
export function isDirectionKey(code) {
	return DIR_KEYCODE.includes(code);
}

/**
 * @description [delete, backspace] key check
 * @param {string} code Event.code
 * @returns {boolean}
 */
export function isRemoveKey(code) {
	return DELETE_KEYCODE.includes(code);
}

/**
 * @description Non-text key check
 * @param {string} code Event.code
 * @returns {boolean}
 */
export function isNonTextKey(code) {
	return NON_TEXT_KEYCODE.includes(code);
}

/**
 * @description Check if the given key is relevant for history push
 * @param {string} code - Event.code
 * @returns {boolean}
 */
export function isHistoryRelevantKey(code) {
	return HISTORY_RELEVANT_KEYS.includes(code);
}

/**
 * @description Document type observer key check
 * @param {string} code Event.code
 * @returns {boolean}
 */
export function isDocumentTypeObserverKey(code) {
	return DOCUMENT_TYPE_OBSERVER_KEYCODE.includes(code);
}

/**
 * @description Non-response key check
 * @param {string} code Event.code
 * @returns {boolean}
 */
export function isNonResponseKey(code) {
	return NON_RESPONSE_CODE.includes(code);
}

const keyCodeMap = {
	isShift,
	isCtrl,
	isAlt,
	isComposing,
	isBackspace,
	isTab,
	isEnter,
	isEsc,
	isSpace,
	isDirectionKey,
	isRemoveKey,
	isNonTextKey,
	isHistoryRelevantKey,
	isDocumentTypeObserverKey,
	isNonResponseKey
};

export default keyCodeMap;
