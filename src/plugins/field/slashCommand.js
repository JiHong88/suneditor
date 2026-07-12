import { PluginField } from '../../interfaces';
import { Controller } from '../../modules/contract';
import { CommandMenu } from '../../modules/ui';
import { dom, converter, keyCodeMap } from '../../helper';
import { ResolveButton } from '../../core/section/constructor';

const { debounce } = converter;

/**
 * @typedef {Object} SlashCommandItem
 * @property {string} key - Unique identifier for the item.
 * @property {string} title - Display label.
 * @property {string} [icon] - Icon key from `$.icons` (e.g. `'h1'`) or a raw HTML string (e.g. `'<svg>...</svg>'`).
 * @property {string[]} [keywords] - Extra search terms used in addition to the title.
 * @property {function(SunEditor.Deps, SlashCommandActionContext): void | Promise<void>} action - Invoked when the item is selected.
 *   The trigger string (e.g. `/hea`) is already removed from the editor and the caret restored to that position before `action` runs.
 *   The action owns its history entry — calling an L3 wrapper (`$.html.*`, `$.format.*`, `$.inline.apply`) auto-pushes; otherwise call `$.history.push(false)` manually.
 */

/**
 * @typedef {Object} SlashCommandActionContext
 * @property {string} triggerChar - The configured trigger character (e.g. `'/'`).
 * @property {string} query - The text the user typed after the trigger (e.g. `'hea'`).
 * @property {SlashCommandItem} item - The selected item.
 */

/**
 * @typedef {Object} SlashCommandPluginOptions
 * @property {string} [triggerChar='/'] - Character that opens the command menu. Single character recommended.
 * @property {Array<SlashCommandItem | string>} items - Menu entries. Strings resolve via `ResolveButton`
 *   (plugin names, built-in commands like `'bold'`); objects are custom items with their own `action`.
 *   Required.
 * @property {number} [delayTime=120] - Debounce delay (ms) before the input is inspected for the trigger.
 * @property {number} [limitSize=10] - Maximum number of items shown in the dropdown.
 * @property {string} [emptyMessage] - Message shown when no items match the query. If unset, the menu closes on no match.
 * @property {function(SlashCommandItem, { icons: Object }): string} [renderItem] - Custom item HTML renderer.
 *   Applied only to custom item objects; plugin-name entries always render with the canonical BlockHandle row.
 * ```js
 * SUNEDITOR.create('#editor', {
 *   plugins: [slashCommand],
 *   slashCommand: {
 *     triggerChar: '/',
 *     items: [
 *       {
 *         key: 'h1',
 *         title: 'Heading 1',
 *         icon: 'h1',
 *         keywords: ['header', 'title'],
 *         action: ($) => $.format.applyBlock(document.createElement('H1')),
 *       },
 *       'bold',
 *       'image',
 *       'blockStyle',
 *     ],
 *   },
 * });
 * ```
 */

/**
 * @class
 * @description Slash Command plugin
 * - Notion / Tiptap style "/" command menu. Triggered by the configured character (default `'/'`).
 * - Menu rendering + dispatch is delegated to {@link CommandMenu}, which is also used by BlockHandle's
 *   action menu — both menus share the exact same row HTML and dispatch behavior.
 * - SlashCommand-specific concerns kept here: input watching, debounce, trigger detection,
 *   trigger text deletion before dispatch, empty-state row.
 */
class SlashCommand extends PluginField {
	static key = 'slashCommand';
	static className = '';

	#triggerChar;
	#limitSize;
	#emptyMessage;

	/** @type {CommandMenu} */
	#menu;

	#lastTriggerPos = 0;
	#anchorOffset = 0;
	#anchorNode = null;
	#internalClose = false;

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 * @param {SlashCommandPluginOptions} pluginOptions
	 */
	constructor(kernel, pluginOptions) {
		super(kernel);

		this.#triggerChar =
			typeof pluginOptions.triggerChar === 'string' && pluginOptions.triggerChar.length > 0
				? pluginOptions.triggerChar
				: '/';
		this.#limitSize =
			typeof pluginOptions.limitSize === 'number' && pluginOptions.limitSize > 0 ? pluginOptions.limitSize : 10;
		this.#emptyMessage = typeof pluginOptions.emptyMessage === 'string' ? pluginOptions.emptyMessage : '';
		const delayTime = typeof pluginOptions.delayTime === 'number' ? pluginOptions.delayTime : 120;

		this.#menu = new CommandMenu(this, this.$, {
			items: Array.isArray(pluginOptions.items) ? pluginOptions.items : [],
			resolveButton: ResolveButton,
			renderCustomItem: typeof pluginOptions.renderItem === 'function' ? pluginOptions.renderItem : null,
			selectMenuParams: {
				position: 'bottom-left',
				dir: 'ltr',
				minWidth: '200px',
				maxHeight: '320px',
				closeMethod: () => this.#onMenuClose(),
			},
		});

		const controllerEl = CreateHTML_controller();
		this.controller = new Controller(
			this,
			this.$,
			controllerEl,
			{
				position: 'bottom',
				escGuard: () => this.#menu.hasOpenSubPanel(),
			},
			null,
		);

		this.#menu.attach(/** @type {HTMLElement} */ (controllerEl.firstElementChild), this.#onSelectItem.bind(this), {
			class: 'se-block-action-menu se-slash-command-menu',
		});

		this.onInput = debounce(this.onInput.bind(this), delayTime);
	}

	/**
	 * @hook Editor.EventManager
	 * @description ESC while the menu is still pending must not let that scheduled `onInput` re-open the menu after the dismiss.
	 * @type {SunEditor.Hook.Event.OnKeyDown}
	 * @param {SunEditor.HookParams.KeyEvent} params
	 */
	onKeyDown({ event }) {
		if (keyCodeMap.isEsc(event.code)) /** @type {{ cancel?: () => void }} */ (this.onInput).cancel?.();
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.OnInput}
	 */
	onInput() {
		const items = this.#menu.getItems();
		if (items.length === 0) return;

		const sel = this.$.selection.get();
		if (!sel.rangeCount) {
			this.#closeMenu();
			return;
		}

		const anchorNode = sel.anchorNode;
		const anchorOffset = sel.anchorOffset;
		if (!anchorNode || typeof anchorNode.textContent !== 'string') {
			this.#closeMenu();
			return;
		}

		const textBeforeCursor = anchorNode.textContent.substring(0, anchorOffset);
		const trigger = this.#triggerChar;
		const lastPos = textBeforeCursor.lastIndexOf(trigger);
		if (lastPos === -1) {
			this.#closeMenu();
			return;
		}

		const query = textBeforeCursor.substring(lastPos + trigger.length, anchorOffset);
		// Reject when the query contains whitespace (user moved past the slash word).
		if (/\s/.test(query)) {
			this.#closeMenu();
			return;
		}

		// Trigger must sit at the start of the line or be preceded by whitespace / zero-width.
		const beforeChar = textBeforeCursor[lastPos - 1];
		if (beforeChar && beforeChar.trim() !== '' && !dom.check.isZeroWidth(beforeChar)) {
			this.#closeMenu();
			return;
		}

		const filtered = this.#menu.filter(query, this.#limitSize);

		if (filtered.length === 0) {
			if (this.#emptyMessage) {
				this.#renderEmpty(anchorNode);
				this.#cacheAnchor(anchorNode, lastPos, anchorOffset);
			} else {
				this.#closeMenu();
			}
			return;
		}

		this.controller.open(anchorNode, null, { isWWTarget: true, initMethod: null, addOffset: null });
		this.#menu.createRows(filtered);
		this.#menu.open();
		this.#menu.setItem(0);
		this.#cacheAnchor(anchorNode, lastPos, anchorOffset);
	}

	/**
	 * @description Close the menu from the plugin itself (invalid query, or after a selection). Flags
	 * the close as internal so `#onMenuClose` does not treat it as a user dismiss.
	 */
	#closeMenu() {
		this.#internalClose = true;
		this.#menu.close();
		this.#internalClose = false;
	}

	/**
	 * @description SelectMenu `closeMethod`. On a user dismiss (ESC / outside-click) — i.e. not an
	 * internal close and not a selection — drop the typed "/query" and restore the caret to where the
	 * trigger was, leaving the editor in a clean state. Always tears down the controller.
	 */
	#onMenuClose() {
		if (!this.#internalClose) this.#removeTrigger();
		this.#anchorNode = null;
		this.controller.close();
	}

	/**
	 * @description Remove the trigger + query text (`/hea`) and collapse the caret to the trigger
	 * position. No-op if the cached anchor is stale (text changed / node detached).
	 */
	#removeTrigger() {
		const anchorNode = this.#anchorNode;
		if (!anchorNode || !anchorNode.parentNode) return;
		if (anchorNode.textContent?.[this.#lastTriggerPos] !== this.#triggerChar) return;

		this.$.selection.setRange(anchorNode, this.#lastTriggerPos, anchorNode, this.#anchorOffset);
		const range = this.$.selection.getRange();
		if (range && !range.collapsed) this.$.html.remove();
	}

	/**
	 * @param {Node} anchorNode
	 * @param {number} lastPos
	 * @param {number} anchorOffset
	 */
	#cacheAnchor(anchorNode, lastPos, anchorOffset) {
		this.#anchorNode = anchorNode;
		this.#lastTriggerPos = lastPos;
		this.#anchorOffset = anchorOffset;
	}

	/**
	 * @description Render the no-match row as a single non-clickable entry.
	 * @param {Node} targetNode
	 */
	#renderEmpty(targetNode) {
		this.controller.open(targetNode, null, { isWWTarget: true, initMethod: null, addOffset: null });
		this.#menu.selectMenu.create([null], [`<span class="se-slash-empty">${this.#emptyMessage}</span>`]);
		this.#menu.open();
	}

	/**
	 * @description Click handler. Removes the trigger string from the editor, then hands the item
	 * to {@link CommandMenu#dispatch} — which routes to `plugin.open/show/action`,
	 * `commandDispatcher.run`, or the custom item's `action` callback.
	 * @param {import('../../modules/ui/CommandMenu.js').ResolvedItem | null} item
	 * @returns {boolean | undefined}
	 */
	#onSelectItem(item) {
		if (!item) return false;

		const anchorNode = this.#anchorNode;
		if (!anchorNode) return false;

		const triggerChar = this.#triggerChar;
		const query = anchorNode.textContent.substring(this.#lastTriggerPos + triggerChar.length, this.#anchorOffset);

		// Remove the trigger + query, leaving the caret at the trigger position so the action
		// (insert block, run command, etc.) operates from a clean cursor.
		this.$.selection.setRange(anchorNode, this.#lastTriggerPos, anchorNode, this.#anchorOffset);
		const range = this.$.selection.getRange();
		if (range && !range.collapsed) this.$.html.remove();

		this.#closeMenu();

		this.#menu.dispatch(item, { triggerChar, query, item: item.raw });
	}
}

/**
 * @returns {HTMLElement}
 */
function CreateHTML_controller() {
	return dom.utils.createElement('DIV', { class: 'se-controller se-empty-controller' }, '<div></div>');
}

export default SlashCommand;
