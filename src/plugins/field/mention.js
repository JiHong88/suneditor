import EditorInjector from '../../editorInjector';
import { ApiManager, SelectMenu } from '../../modules';
import { domUtils } from '../../helper';

const Mention = function (editor, pluginOptions) {
	EditorInjector.call(this, editor);
	// plugin basic properties
	this.title = this.lang.mention;
	this.icon = 'mention';

	// field plugin options
	this.triggerText = pluginOptions.triggerText || '@';

	// members
	this.limitSize = pluginOptions.limitSize || 5;
	this.searchStartLength = pluginOptions.searchStartLength || 1;
	this.delayTime = pluginOptions.delayTime || 300;
	// members - controller
	this.selectMenu = new SelectMenu(this, { position: 'right-bottom', dir: 'ltr' });
	this.selectMention = SelectMention.bind(this);
	// members - trigger regExp
	this.triggerKeyRegExp = new RegExp(`\\s*${this.triggerText}(.+)\\b`);
	// members - api, caching
	this.apiManager = new ApiManager(this, { url: pluginOptions.apiUrl, headers: pluginOptions.apiHeaders });
	this.chchingData = [];
};

Mention.key = 'mention';
Mention.type = 'field';
Mention.className = '';
Mention.prototype = {
	/**
	 * @override core
	 */
	triggerHandler(targetNode) {
		this.apiManager.cancel();

		const value = targetNode.textContent.match(this.triggerKeyRegExp)?.[1];
		if (!value) return;

		const { list, menu } = this._createMentionList(value);
		if (!list?.length) return;

		this.selectMenu.on(targetNode, this.selectMention);
		this.selectMenu.create(list, menu);
	},

	async _createMentionList(value) {
		const xmlHttp = await this.apiManager.asyncCall('GET', `${this.apiUrl}/${value}`, null);
		const response = JSON.parse(xmlHttp.responseText);
		if (response.errorMessage || !response.length) {
			return;
		}

		const list = [];
		const menus = [];

		for (let i = 0, len = response.length, v; i < len; i++) {
			v = response[i];
			list.push(v);
			menus.push('<div>' + v.name + '</div>');
		}

		if (list.length === 0) {
			this.selectMenu.close();
		} else {
			this.selectMenu.create(list, menus);
			this.selectMenu.open(this.options.get('_rtl') ? 'bottom-right' : '');
		}
	},

	constructor: Mention
};

function SelectMention() {}

export default Mention;
