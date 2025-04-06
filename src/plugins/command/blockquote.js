import EditorInjector from '../../editorInjector';
import { dom } from '../../helper';

/**
 * @class
 * @description Blockquote plugin
 */
class Blockquote extends EditorInjector {
	static key = 'blockquote';
	static type = 'command';
	static className = '';

	/**
	 * @constructor
	 * @param {__se__EditorCore} editor - The root editor instance
	 */
	constructor(editor) {
		super(editor);
		// plugin basic properties
		this.title = this.lang.tag_blockquote;
		this.icon = 'blockquote';

		// members
		this.quoteTag = dom.utils.createElement('BLOCKQUOTE');
	}

	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the method that is called whenever the cursor position changes.
	 * @param {?HTMLElement=} element - Node element where the cursor is currently located
	 * @param {?HTMLElement=} target - The plugin's toolbar button element
	 * @returns {boolean} - Whether the plugin is active
	 */
	active(element, target) {
		if (/blockquote/i.test(element?.nodeName)) {
			dom.utils.addClass(target, 'active');
			return true;
		}

		dom.utils.removeClass(target, 'active');
		return false;
	}

	/**
	 * @editorMethod Editor.core
	 * @description Executes the main execution method of the plugin.
	 * - It is executed by clicking a toolbar "command" button or calling an API.
	 */
	action() {
		const currentBlockquote = dom.query.getParentElement(this.selection.getNode(), 'blockquote');

		if (currentBlockquote) {
			this.format.removeBlock(currentBlockquote, { selectedFormats: null, newBlockElement: null, shouldDelete: false, skipHistory: false });
		} else {
			this.format.applyBlock(this.quoteTag.cloneNode(false));
		}
	}
}

export default Blockquote;
