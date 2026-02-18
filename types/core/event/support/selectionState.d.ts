import type {} from '../../../typedef';
/**
 * @description Service class managing the selection state and toolbar updates.
 * - Handles activating toolbar buttons based on the current selection.
 * - Manages the 'active' state of plugins and commands.
 */
export default class SelectionState {
	/**
	 * @constructor
	 * @param {import('../eventOrchestrator').default} eventOrchestrator
	 */
	constructor(eventOrchestrator: import('../eventOrchestrator').default);
	/**
	 * @description Updates the toolbar state based on the current selection.
	 * - Traverses the DOM from the selection to the root.
	 * - Checks for active tags and styles.
	 * - Activates corresponding toolbar buttons.
	 * @param {Node} [selectionNode] The node where the selection is currently located.
	 * @returns {Node|undefined} The processed selection node.
	 */
	update(selectionNode?: Node): Node | undefined;
	/**
	 * @description Resets the toolbar state.
	 * - Deactivates all buttons and clears the effect.
	 * - Equivalent to calling setKeyEffect([]).
	 */
	reset(): void;
	#private;
}
