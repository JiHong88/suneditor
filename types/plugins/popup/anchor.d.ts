export default Anchor;
/**
 * @class
 * @description Anchor plugin
 * - Allows you to create, edit, and delete elements that act as anchors (bookmarks) within a document.
 */
declare class Anchor extends EditorInjector {
	static key: string;
	static type: string;
	static className: string;
	/**
	 * @this {Anchor}
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(this: Anchor, node: HTMLElement): HTMLElement | null;
	title: any;
	icon: string;
	bookmarkIcon: HTMLElement;
	displayId: Element;
	controllerSelect: Controller;
	inputEl: HTMLInputElement;
	controller: Controller;
	/**
	 * @editorMethod Editor.Plugin<popup>
	 * @description Displays a popup and gives focus to the input field.
	 */
	show(): void;
	/**
	 * @editorMethod Editor.component
	 * @description Executes the method that is called when a component of a plugin is selected.
	 * @param {HTMLElement} target Target component element
	 */
	select(target: HTMLElement): void;
	/**
	 * @editorMethod Editor.Component
	 * @description Called when a container is deselected.
	 */
	deselect(): void;
	/**
	 * @editorMethod Modules.Controller
	 * @description Executes the method that is called when a button is clicked in the "controller".
	 * @param {HTMLButtonElement} target Target button element
	 */
	controllerAction(target: HTMLButtonElement): void;
	#private;
}
import EditorInjector from '../../editorInjector';
import { Controller } from '../../modules';
