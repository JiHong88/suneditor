import { _d } from '../env';

/** @type {boolean|undefined} */
let popoverOpenSelectorSupported;

/**
 * @description Whether `Element.matches(':popover-open')` is valid in this engine.
 * Unsupported engines throw a `SyntaxError` instead of returning `false`.
 * @returns {boolean}
 */
export function supportsPopoverOpenSelector() {
	if (popoverOpenSelectorSupported !== undefined) return popoverOpenSelectorSupported;

	try {
		_d.createElement('div').matches(':popover-open');
		popoverOpenSelectorSupported = true;
	} catch {
		popoverOpenSelectorSupported = false;
	}

	return popoverOpenSelectorSupported;
}

/**
 * @description Whether `element` is currently shown as a popover.
 * Returns `false` when the element is missing or the `:popover-open` selector is unsupported.
 * @param {?Element} element
 * @returns {boolean}
 */
export function isPopoverOpen(element) {
	if (!element || typeof element.matches !== 'function' || !supportsPopoverOpenSelector()) return false;
	return element.matches(':popover-open');
}

/**
 * @description Show `element` unless it is already a shown popover.
 * Where `:popover-open` is unsupported, `showPopover()` is attempted and an already-open error is ignored.
 * @param {?HTMLElement} element
 */
export function showPopoverUnlessOpen(element) {
	if (!element || typeof element.showPopover !== 'function') return;

	if (supportsPopoverOpenSelector()) {
		if (!element.matches(':popover-open')) element.showPopover();
		return;
	}

	try {
		element.showPopover();
	} catch {
		// InvalidStateError: the popover is already shown.
	}
}

/**
 * @description Hide `element` when it is a shown popover.
 * Where `:popover-open` is unsupported, `hidePopover()` is attempted and a not-shown error is ignored.
 * @param {?HTMLElement} element
 */
export function hidePopoverIfOpen(element) {
	if (!element || typeof element.hidePopover !== 'function') return;

	if (supportsPopoverOpenSelector()) {
		if (element.matches(':popover-open')) element.hidePopover();
		return;
	}

	try {
		element.hidePopover();
	} catch {
		// InvalidStateError: the popover is not shown.
	}
}
