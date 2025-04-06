/** ------------------------------------------------------- [meta] -------------------------------------------------------  */
/**
 * @description Shift check
 * @param {KeyboardEvent} e Event object
 * @returns {boolean}
 */
export function isShift(e: KeyboardEvent): boolean;
/**
 * @description [Ctrl|Meta] check
 * @param {KeyboardEvent} e Event object
 * @returns {boolean}
 */
export function isCtrl(e: KeyboardEvent): boolean;
/**
 * @description Alt check
 * @param {KeyboardEvent} e Event object
 * @returns {boolean}
 */
export function isAlt(e: KeyboardEvent): boolean;
/**
 * @description event.isComposing check
 * @param {KeyboardEvent} e Event object
 * @returns {boolean}
 */
export function isComposing(e: KeyboardEvent): boolean;
/**
 * @description Backspace key check
 * @param {string} code Event.code
 * @returns {boolean}
 */
export function isBackspace(code: string): boolean;
/**
 * @description Tab key check
 * @param {string} code Event.code
 * @returns {boolean}
 */
export function isTab(code: string): boolean;
/**
 * @description Enter key check
 * @param {string} code Event.code
 * @returns {boolean}
 */
export function isEnter(code: string): boolean;
/**
 * @description ESC key check
 * @param {string} code Event.code
 * @returns {boolean}
 */
export function isEsc(code: string): boolean;
/**
 * @description Space key check
 * @param {string} code Event.code
 * @returns {boolean}
 */
export function isSpace(code: string): boolean;
/** ------------------------------------------------------- [key] -------------------------------------------------------  */
/**
 * @description Direction key check
 * @param {string} code Event.code
 * @returns {boolean}
 */
export function isDirectionKey(code: string): boolean;
/**
 * @description [delete, backspace] key check
 * @param {string} code Event.code
 * @returns {boolean}
 */
export function isRemoveKey(code: string): boolean;
/**
 * @description Non-text key check
 * @param {string} code Event.code
 * @returns {boolean}
 */
export function isNonTextKey(code: string): boolean;
/**
 * @description History ignore key check
 * @param {string} code Event.code
 * @returns {boolean}
 */
export function isHistoryIgnoreKey(code: string): boolean;
/**
 * @description Document type observer key check
 * @param {string} code Event.code
 * @returns {boolean}
 */
export function isDocumentTypeObserverKey(code: string): boolean;
/**
 * @description Non-response key check
 * @param {string} code Event.code
 * @returns {boolean}
 */
export function isNonResponseKey(code: string): boolean;
export default keyCodeMap;
declare namespace keyCodeMap {
	export { isShift };
	export { isCtrl };
	export { isAlt };
	export { isComposing };
	export { isBackspace };
	export { isTab };
	export { isEnter };
	export { isEsc };
	export { isSpace };
	export { isDirectionKey };
	export { isRemoveKey };
	export { isNonTextKey };
	export { isHistoryIgnoreKey };
	export { isDocumentTypeObserverKey };
	export { isNonResponseKey };
}
