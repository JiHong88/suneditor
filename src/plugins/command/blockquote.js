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
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 */
	constructor(kernel) {
		super(kernel);
		// plugin basic properties
		this.title = this.$.lang.tag_blockquote;
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
	 * @hook Editor.Core
	 * @type {SunEditor.Hook.Core.Shortcut}
	 */
	shortcut({ range, line, info }) {
		const { startContainer } = range;
		if (dom.check.isText(startContainer)) {
			startContainer.textContent = startContainer.substringData(info.key.length, startContainer.length);
		}

		if (line && dom.check.isEmptyLine(line)) {
			line.replaceChildren(dom.utils.createElement('BR'));
			this.$.selection.setRange(line, 0, line, 0);
		}

		this.$.format.applyBlock(this.quoteTag.cloneNode(false));
	}

	/**
	 * @override
	 * @type {PluginCommand['action']}
	 */
	action() {
		const currentBlockquote = dom.query.getParentElement(this.$.selection.getNode(), 'blockquote');

		if (currentBlockquote) {
			this.$.format.removeBlock(currentBlockquote, {
				selectedFormats: null,
				newBlockElement: null,
				shouldDelete: false,
				skipHistory: false,
			});
		} else {
			this.$.format.applyBlock(this.quoteTag.cloneNode(false));
		}
	}
}

export default Blockquote;
