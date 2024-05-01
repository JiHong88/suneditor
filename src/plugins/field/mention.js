import EditorInjector from '../../editorInjector';
import { ApiManager, SelectMenu, Controller } from '../../modules';
import { domUtils, converter } from '../../helper';

const { debounce } = converter;

const Mention = function (editor, pluginOptions) {
	EditorInjector.call(this, editor);
	// plugin basic properties
	this.title = this.lang.mention;
	this.icon = 'mention';

	// members
	this.triggerText = pluginOptions.triggerText || '@';
	this.limitSize = pluginOptions.limitSize || 5;
	this.searchStartLength = pluginOptions.searchStartLength || 0;
	this.delayTime = typeof pluginOptions.delayTime === 'number' ? pluginOptions.delayTime : 200;
	this.apiUrl = pluginOptions.apiUrl?.replace(/\s/g, '').replace(/\{limitSize\}/i, this.limitSize) || '';
	this._delay = 0;
	this._lastAtPos = 0;
	this._anchorOffset = 0;
	this._anchorNode = null;
	// members - api, caching
	this.apiManager = new ApiManager(this, { headers: pluginOptions.apiHeaders });
	this.cachingData = pluginOptions.useCachingData ?? true ? new Map() : null;

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
};

Mention.key = 'mention';
Mention.type = 'field';
Mention.className = '';
Mention.prototype = {
	/**
	 * @override core
	 */
	async onInput() {
		this.apiManager.cancel();

		const sel = this.selection.get();
		if (!sel.rangeCount) {
			this.selectMenu.close();
			return;
		}

		const anchorNode = sel.anchorNode;
		const anchorOffset = sel.anchorOffset;
		const textBeforeCursor = anchorNode.textContent.substring(0, anchorOffset);
		const lastAtPos = textBeforeCursor.lastIndexOf(this.triggerText);

		if (lastAtPos > -1) {
			const mentionQuery = textBeforeCursor.substring(lastAtPos + 1, anchorOffset);
			const beforeText = textBeforeCursor[lastAtPos - 1]?.trim();
			if (!/\s/.test(mentionQuery) && (!beforeText || domUtils.isZeroWith(beforeText))) {
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
	},

	async _createMentionList(value, targetNode) {
		let response = null;
		if (this.cachingData) {
			response = this.cachingData.get(value);
		}

		if (!response) {
			const xmlHttp = await this.apiManager.asyncCall({ method: 'GET', url: this._createUrl(value) });
			response = JSON.parse(xmlHttp.responseText);
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
	},

	_createUrl(key) {
		return this.apiUrl.replace(/\{key\}/i, key);
	},

	constructor: Mention
};

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
		if (!this.html.insertNode(oA, null, false)) return false;
	}

	this.selectMenu.close();

	const space = domUtils.createTextNode('\u00A0');
	oA.parentNode.insertBefore(space, oA.nextSibling);
	this.selection.setRange(space, 1, space, 1);
}

function CreateHTML_controller() {
	return domUtils.createElement('DIV', { class: 'se-controller se-empty-controller' }, '<div></div>');
}

export default Mention;
