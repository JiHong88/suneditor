import type {} from '../../typedef';
export default Anchor;
/**
 * @class
 * @description Anchor plugin
 * - Allows you to create, edit, and delete elements that act as anchors (bookmarks) within a document.
 */
declare class Anchor extends PluginPopup {
	/**
	 * @this {Anchor}
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(this: Anchor, node: HTMLElement): HTMLElement | null;
	title: any;
	bookmarkIcon: HTMLElement;
	displayId: Element;
	controllerSelect: Controller;
	inputEl: HTMLInputElement;
	controller: Controller;
	componentSelect(target: HTMLElement): void | boolean;
	componentDeselect(target: HTMLElement): void;
	controllerAction(target: HTMLButtonElement): void;
	#private;
}
import { PluginPopup } from '../../interfaces';
import { Controller } from '../../modules/contract';
