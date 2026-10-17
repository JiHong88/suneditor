import type {} from '../../typedef';
/**
 * @description Whether `Element.matches(':popover-open')` is valid in this engine.
 * Unsupported engines throw a `SyntaxError` instead of returning `false`.
 * @returns {boolean}
 */
export function supportsPopoverOpenSelector(): boolean;
/**
 * @description Whether `element` is currently shown as a popover.
 * Returns `false` when the element is missing or the `:popover-open` selector is unsupported.
 * @param {?Element} element
 * @returns {boolean}
 */
export function isPopoverOpen(element: Element | null): boolean;
/**
 * @description Show `element` unless it is already a shown popover.
 * Where `:popover-open` is unsupported, `showPopover()` is attempted and an already-open error is ignored.
 * @param {?HTMLElement} element
 */
export function showPopoverUnlessOpen(element: HTMLElement | null): void;
/**
 * @description Hide `element` when it is a shown popover.
 * Where `:popover-open` is unsupported, `hidePopover()` is attempted and a not-shown error is ignored.
 * @param {?HTMLElement} element
 */
export function hidePopoverIfOpen(element: HTMLElement | null): void;
