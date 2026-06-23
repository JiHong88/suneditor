import type {} from '../../../typedef';
export default BlockHandle;
/**
 * @class
 * @description Block handle UI — appears in the left gutter on block hover.
 */
declare class BlockHandle {
	/**
	 * @constructor
	 * @param {SunEditor.Deps} $ - Kernel dependencies
	 * @param {HTMLElement} blockHandleArea - Container (.se-block-handle-area)
	 * @param {HTMLElement} blockHandle - Handle group (.se-block-handle)
	 * @param {HTMLElement} blockHandlePlus - Plus button
	 * @param {HTMLElement} blockHandleDrag - Drag button
	 * @param {Array<string | { title: string, icon?: string, action: function(SunEditor.Deps, { block: HTMLElement }): void }>|null} menuConfig
	 *   Menu entries. Strings resolve via `ResolveButton` (plugin names, built-in commands). Objects
	 *   define a custom row whose `action` is invoked with the Deps bag and the current block element.
	 */
	constructor(
		$: SunEditor.Deps,
		blockHandleArea: HTMLElement,
		blockHandle: HTMLElement,
		blockHandlePlus: HTMLElement,
		blockHandleDrag: HTMLElement,
		menuConfig: Array<
			| string
			| {
					title: string;
					icon?: string;
					action: (
						arg0: SunEditor.Deps,
						arg1: {
							block: HTMLElement;
						},
					) => void;
			  }
		> | null,
	);
	/**
	 * @description Position the block handle for the given mouse target. Uses rAF throttle.
	 * Called from wysiwyg mousemove.
	 * @param {Node} eventTarget - The element under the mouse cursor
	 * @param {number} [mouseY] - Mouse clientY for nested list resolution
	 */
	positionForTarget(eventTarget: Node, mouseY?: number): void;
	/**
	 * @description Schedule hiding the block handle with a short delay.
	 * @param {MouseEvent} e - Mouse event
	 */
	hide(e: MouseEvent): void;
	/**
	 * @description Immediately hide the block handle (no delay).
	 */
	hideNow(): void;
	/**
	 * @description Sync handle position on editor scroll. Closes menu if open.
	 */
	syncScroll(): void;
	/**
	 * @description Cleanup — remove listeners, destroy menus, null references.
	 */
	destroy(): void;
	#private;
}
