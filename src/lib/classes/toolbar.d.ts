import EditorInterface from "../../interface/editor";

class Toolbar extends EditorInterface {
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
	setButtons(buttonList: any[]): void;
}

export default Toolbar;
