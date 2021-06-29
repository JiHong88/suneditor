import CoreInterface from "../../interface/_core";

class Toolbar extends CoreInterface {
	/**
	 * @description Disable the toolbar
	 */
	disabled(): void;

	/**
	 * @description Enable the toolbar
	 */
	enabled(): void;

	/**
	 * @description Show the toolbar
	 */
	show(): void;

	/**
	 * @description Hide the toolbar
	 */
	hide(): void;

	/**
	 * @description Reset the buttons on the toolbar. (Editor is not reloaded)
	 * You cannot set a new plugin for the button.
	 * @param buttonList Button list
	 */
	setToolbarButtons(buttonList: any[]): void;
}

export default Toolbar;
