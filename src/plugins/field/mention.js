import EditorInjector from '../../editorInjector';
import { ApiManager, SelectMenu, Controller } from '../../modules';
import { domUtils, converter } from '../../helper';

const { debounce } = converter;

/**
 * @class
 * @description Mention Plugin
 * - A plugin that provides a mention feature using `@` or a custom trigger character.
 * - Displays a mention list when the trigger character is typed.
 * - Supports fetching mention data from an API or a predefined data array.
 * - Uses caching for optimized performance.
 */
class Mention extends EditorInjector {
	static key = 'mention';
	static type = 'field';
	static className = '';

	/**
	 * @constructor
	 * @param {EditorCore} editor - The root editor instance
	 * @param {Object} pluginOptions
	 * @param {string=} [pluginOptions.triggerText="@"] The character that triggers the mention list. Default is '@'.
	 * @param {number=} [pluginOptions.limitSize=5] The number of items to display in the mention list. Default is 5.
	 * @param {number=} [pluginOptions.searchStartLength=0] The number of characters to start searching for the mention list. Default is 0.
	 * @param {number=} [pluginOptions.delayTime=200] The time to wait before displaying the mention list. Default is 200ms.
	 * @param {Array<{key: string, name: string, url: string}>=} pluginOptions.data Use data without using API.
	 * @param {string=} pluginOptions.apiUrl The URL to call the mention list. Default is ''.
	 * @param {Object<string, string>=} pluginOptions.apiHeaders The headers to send with the API call. Default is {}.
	 * @param {boolean=} [pluginOptions.useCachingData=true] Whether to cache the mention list data. Default is true.
	 * @param {boolean=} [pluginOptions.useCachingFieldData=true] Whether to cache the mention list data in the field. Default is true.
	 */
	constructor(editor, pluginOptions) {
		super(editor);
		// plugin basic properties
		this.title = this.lang.mention;
		this.icon = 'mention';

		// members
		this.triggerText = pluginOptions.triggerText || '@';
		this.limitSize = pluginOptions.limitSize || 5;
		this.searchStartLength = pluginOptions.searchStartLength || 0;
		this.delayTime = typeof pluginOptions.delayTime === 'number' ? pluginOptions.delayTime : 200;
		this.directData = pluginOptions.data;
		this.apiUrl = pluginOptions.apiUrl?.replace(/\s/g, '').replace(/\{limitSize\}/i, String(this.limitSize)) || '';
		this._delay = 0;
		this._lastAtPos = 0;
		this._anchorOffset = 0;
		this._anchorNode = null;
		// members - api, caching
		this.apiManager = new ApiManager(this, { headers: pluginOptions.apiHeaders });
		this.cachingData = pluginOptions.useCachingData ?? true ? new Map() : null;
		this.cachingFieldData = pluginOptions.useCachingFieldData ?? true ? new Map([['', []]]) : null;

		// controller
		const controllerEl = CreateHTML_controller();
		this.selectMenu = new SelectMenu(this, { position: 'right-bottom', dir: 'ltr', closeMethod: () => this.controller.close() });
		this.controller = new Controller(
			this,
			controllerEl,
			{
				position: 'bottom',
				initMethod: () => {
					this.apiManager.cancel();
					this.selectMenu.close();
				}
			},
			null
		);
		this.selectMenu.on(controllerEl.firstElementChild, SelectMention.bind(this));

		// onInput debounce
		this.onInput = debounce(this.onInput.bind(this), this.delayTime);
	}

	/**
	 * @editorMethod Editor.EventManager
	 * @description Executes the event function of "input".
	 * @returns {Promise<boolean>}
	 */
	async onInput() {
		if (!this.directData) {
			this.apiManager.cancel();
		}

		const sel = this.selection.get();
		if (!sel.rangeCount) {
			this.selectMenu.close();
			return true;
		}

		const anchorNode = sel.anchorNode;
		const anchorOffset = sel.anchorOffset;
		const textBeforeCursor = anchorNode.textContent.substring(0, anchorOffset);
		const lastAtPos = textBeforeCursor.lastIndexOf(this.triggerText);

		if (lastAtPos > -1) {
			const mentionQuery = textBeforeCursor.substring(lastAtPos + 1, anchorOffset);
			const beforeText = textBeforeCursor[lastAtPos - 1]?.trim();
			if (!/\s/.test(mentionQuery) && (!beforeText || domUtils.isZeroWidth(beforeText))) {
				if (mentionQuery.length < this.searchStartLength) return true;

				const anchorParent = anchorNode.parentNode;
				if (domUtils.isAnchor(anchorParent) && !anchorParent.getAttribute('data-se-mention')) {
					return true;
				}

				try {
					const result = await this._createMentionList(mentionQuery, anchorNode);
					this._lastAtPos = lastAtPos;
					this._anchorNode = anchorNode;
					this._anchorOffset = anchorOffset;
					return !result;
				} catch (error) {
					console.warn('[SUNEDITOR.mention.api.file] ', error);
				}
			}
		}

		this.selectMenu.close();
		return true;
	}

	/**
	 * @private
	 * @description Generates the mention list based on user input.
	 * - Fetches data from cache, direct data, or an API.
	 * - Creates and opens the mention dropdown.
	 * - Caches the fetched data for future use.
	 * @param {string} value - The mention query text.
	 * @param {Node} targetNode - The node where the mention is triggered.
	 * @returns {Promise<boolean>} - Returns `true` if the mention list is displayed, `false` otherwise.
	 */
	async _createMentionList(value, targetNode) {
		let response = null;
		if (this.cachingData) {
			response = this.cachingData.get(value);
		}

		if (!response) {
			if (this.directData) {
				const limit = this.limitSize;
				this.directData.filter((item) => item.key.toLowerCase().startsWith(value.toLowerCase())).slice(0, limit);
				response = this.directData;
			} else {
				const xmlHttp = await this.apiManager.asyncCall({ method: 'GET', url: this._createUrl(value) });
				response = JSON.parse(xmlHttp.responseText);
			}
		}

		if (this.cachingFieldData) {
			response = this.cachingFieldData.get('').concat(response).splice(0, this.limitSize);
		}

		if (!response?.length) {
			this.selectMenu.close();
			return false;
		}

		const list = [];
		const menus = [];
		for (let i = 0, len = response.length, v; i < len; i++) {
			v = response[i];
			list.push(v);
			menus.push(`<div class="se-mention-item"><span>${v.key}</span><span>${v.name}</span></div>`);
		}

		if (list.length === 0) {
			this.selectMenu.close();
			return false;
		} else {
			// controller open
			this.controller.open(targetNode, null, { isWWTarget: true, initMethod: null, addOffset: null });
			// select menu create
			this.selectMenu.create(list, menus);
			this.selectMenu.open();
			this.selectMenu.setItem(0);
			if (this.cachingData) this.cachingData.set(value, list);
			return true;
		}
	}

	/**
	 * @private
	 * @description Constructs the API request URL with the mention query.
	 * @param {string} key - The mention query text.
	 * @returns {string} - The formatted API request URL.
	 */
	_createUrl(key) {
		return this.apiUrl.replace(/\{key\}/i, key);
	}
}

/**
 * @description Inserts a mention link into the editor when a user selects a mention from the list.
 * @param {{ key: string, name: string, url: string }} item - The selected mention item.
 * @returns {boolean} - Returns `false` if insertion fails, otherwise completes execution.
 */
function SelectMention(item) {
	if (!item) return false;

	let oA = null;
	const { key, name, url } = item;
	const anchorParent = this._anchorNode.parentNode;

	if (domUtils.isAnchor(anchorParent)) {
		oA = anchorParent;
		oA.setAttribute('data-se-mention', key);
		oA.setAttribute('href', url);
		oA.setAttribute('title', name);
		oA.textContent = this.triggerText + key;
	} else {
		this.selection.setRange(this._anchorNode, this._lastAtPos, this._anchorNode, this._anchorOffset);
		oA = domUtils.createElement('A', { 'data-se-mention': key, href: url, title: name, target: '_blank' }, this.triggerText + key);
		if (!this.html.insertNode(oA, { afterNode: null, skipCharCount: false })) return false;
	}

	this.selectMenu.close();

	const space = domUtils.createTextNode('\u00A0');
	oA.parentNode.insertBefore(space, oA.nextSibling);
	this.selection.setRange(space, 1, space, 1);

	if (this.cachingFieldData) {
		this.cachingFieldData.get('').push(item);
	}
}

function CreateHTML_controller() {
	return domUtils.createElement('DIV', { class: 'se-controller se-empty-controller' }, '<div></div>');
}

export default Mention;
