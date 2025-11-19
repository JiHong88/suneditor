import { PluginCommand } from '../../interfaces';
import { dom } from '../../helper';

/**
 * @class
 * @description Blockquote plugin
 */
class Blockquote extends PluginCommand {
	static key = 'blockquote';
	static className = '';

	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
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
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.Active}
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
	 * @override
	 * @type {PluginCommand['action']}
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
