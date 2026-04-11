import { PluginField } from '../../interfaces';
import { Controller } from '../../modules/contract';
import { ApiManager } from '../../modules/manager';
import { SelectMenu } from '../../modules/ui';
import { dom, converter } from '../../helper';

const { debounce } = converter;

/**
 * @description Default render function for dropdown items.
 * @param {{key: string, name?: string}} item - The data item.
 * @returns {string} HTML string for the dropdown item.
 */
function defaultRenderItem(item) {
	return `<div class="se-autocomplete-item"><span>${item.key}</span>${item.name ? `<span>${item.name}</span>` : ''}</div>`;
}

/**
 * @description Default select handler. Creates a span element with the trigger text + key.
 * @param {{key: string}} item - The selected data item.
 * @param {string} triggerText - The trigger character.
 * @returns {{tag: string, attrs: Object, text: string}} Descriptor for element creation.
 */
function defaultOnSelect(item, triggerText) {
	return {
		tag: 'span',
		attrs: { 'data-se-autocomplete': triggerText + item.key },
		text: triggerText + item.key,
	};
}

/**
 * @typedef {Object} AutocompleteTriggerConfig
 * @property {Array<{key: string, [x: string]: any}>} [data] - Static data array. Each item must have a `key` field. Mutually exclusive with `apiUrl`.
 * ```js
 * // data
 * [{ key: 'john', name: 'John Doe', url: '/users/john' }]
 * ```
 * @property {string} [apiUrl] - API endpoint URL. Supports `{key}` and `{limitSize}` placeholders. Mutually exclusive with `data`.
 * @property {Object<string, string>} [apiHeaders] - HTTP headers for the API request.
 * @property {function(Object, XMLHttpRequest): Array<{key: string}>} [transformResponse] - Transforms parsed JSON response into an array of data items.
 * @property {number} [limitSize] - Override global `limitSize` for this trigger.
 * @property {number} [searchStartLength] - Override global `searchStartLength` for this trigger.
 * @property {boolean} [useCachingData] - Override global `useCachingData` for this trigger.
 * @property {boolean} [useCachingFieldData] - Override global `useCachingFieldData` for this trigger.
 * @property {function({key: string, [x: string]: any}, string): string} [renderItem] - Custom dropdown item renderer. Receives `(item, triggerText)`, returns HTML string.
 * @property {function({key: string, [x: string]: any}, string): (string|Element|{tag: string, attrs?: Object, text?: string})} [onSelect] - Custom selection handler. Returns:
 *   - `string`: inserted as text node
 *   - `Element`: inserted as-is
 *   - `{tag, attrs, text}`: creates element via `dom.utils.createElement`
 */

/**
 * @typedef {Object} AutocompletePluginOptions
 * @property {number} [delayTime=120] - Debounce delay in ms before processing input.
 * @property {number} [limitSize=5] - Maximum number of items to display in the dropdown.
 * @property {number} [searchStartLength=0] - Minimum input length before triggering search.
 * @property {boolean} [useCachingData=true] - Whether to cache query responses per trigger.
 * @property {boolean} [useCachingFieldData=true] - Whether to cache selected items for priority display.
 * @property {Object<string, AutocompleteTriggerConfig>} triggers - Per-trigger configurations keyed by trigger character.
 * ```js
 * // triggers
 * {
 *   '@': { data: [...], renderItem: (item) => `...` },
 *   '#': { apiUrl: '/api/tags?q={key}' }
 * }
 * ```
 */

/**
 * @class
 * @description Autocomplete Plugin
 * - A generic autocomplete plugin supporting multiple trigger characters.
 * - Each trigger can have its own data source, rendering, and selection behavior.
 * - Supports static data arrays and API-based data fetching.
 * - Uses per-trigger caching for optimized performance.
 */
class Autocomplete extends PluginField {
	static key = 'autocomplete';
	static className = '';

	#lastTriggerPos = 0;
	#anchorOffset = 0;
	#anchorNode = null;
	#activeTrigger = null;

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {AutocompletePluginOptions} pluginOptions
	 */
	constructor(kernel, pluginOptions) {
		super(kernel);
		this.title = this.$.lang.autocomplete;
		this.icon = 'autocomplete';

		// global defaults
		const limitSize = pluginOptions.limitSize || 5;
		const searchStartLength = pluginOptions.searchStartLength || 0;
		const delayTime = typeof pluginOptions.delayTime === 'number' ? pluginOptions.delayTime : 120;
		const useCachingData = pluginOptions.useCachingData ?? true;
		const useCachingFieldData = pluginOptions.useCachingFieldData ?? true;

		// build trigger contexts
		this.triggerContexts = new Map();
		const triggers = pluginOptions.triggers || {};
		for (const [triggerChar, config] of Object.entries(triggers)) {
			const triggerLimit = config.limitSize ?? limitSize;
			this.triggerContexts.set(triggerChar, {
				trigger: triggerChar,
				limitSize: triggerLimit,
				searchStartLength: config.searchStartLength ?? searchStartLength,
				directData: config.data || null,
				apiUrl: config.apiUrl?.replace(/\s/g, '').replace(/\{limitSize\}/i, String(triggerLimit)) || '',
				apiHeaders: config.apiHeaders || null,
				transformResponse: config.transformResponse || null,
				renderItem: config.renderItem || defaultRenderItem,
				onSelect: config.onSelect || defaultOnSelect,
				apiManager: config.apiUrl ? new ApiManager(this, this.$, { headers: config.apiHeaders }) : null,
				cachingData: (config.useCachingData ?? useCachingData) ? new Map() : null,
				cachingFieldData: (config.useCachingFieldData ?? useCachingFieldData) ? [] : null,
			});
		}

		// sort triggers by length descending (longest match first)
		this.sortedTriggers = [...this.triggerContexts.keys()].sort((a, b) => b.length - a.length);

		// controller
		const controllerEl = CreateHTML_controller();
		this.selectMenu = new SelectMenu(this.$, { position: 'right-bottom', dir: 'ltr', closeMethod: () => this.controller.close() });
		this.controller = new Controller(
			this,
			this.$,
			controllerEl,
			{
				position: 'bottom',
				initMethod: () => {
					this.#cancelActiveApi();
					this.selectMenu.close();
				},
			},
			null,
		);
		this.selectMenu.on(controllerEl.firstElementChild, this.#onSelectItem.bind(this));

		// onInput debounce
		this.onInput = debounce(this.onInput.bind(this), delayTime);
	}

	/**
	 * @description Cancels the active trigger's in-flight API request.
	 */
	#cancelActiveApi() {
		if (this.#activeTrigger?.apiManager) {
			this.#activeTrigger.apiManager.cancel();
		}
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.OnInputAsync}
	 */
	async onInput() {
		this.#cancelActiveApi();

		const sel = this.$.selection.get();
		if (!sel.rangeCount) {
			this.selectMenu.close();
			return;
		}

		const anchorNode = sel.anchorNode;
		const anchorOffset = sel.anchorOffset;
		const textBeforeCursor = anchorNode.textContent.substring(0, anchorOffset);

		// find matching trigger (longest first)
		for (const trigger of this.sortedTriggers) {
			const lastPos = textBeforeCursor.lastIndexOf(trigger);
			if (lastPos === -1) continue;

			const query = textBeforeCursor.substring(lastPos + trigger.length, anchorOffset);
			const beforeText = textBeforeCursor[lastPos - 1]?.trim();

			if (!/\s/.test(query) && (!beforeText || dom.check.isZeroWidth(beforeText))) {
				const ctx = this.triggerContexts.get(trigger);
				if (query.length < ctx.searchStartLength) return;

				const anchorParent = anchorNode.parentNode;
				if (dom.check.isAnchor(anchorParent) && !anchorParent.getAttribute('data-se-autocomplete')) {
					return;
				}

				try {
					this.#activeTrigger = ctx;
					await this.#createList(ctx, query, anchorNode);
					this.#lastTriggerPos = lastPos;
					this.#anchorNode = anchorNode;
					this.#anchorOffset = anchorOffset;
					return;
				} catch (error) {
					console.warn('[SUNEDITOR.autocomplete.api] ', error);
				}
			}

			continue;
		}

		this.selectMenu.close();
	}

	/**
	 * @description Generates the autocomplete dropdown list.
	 * @param {Object} ctx - The trigger context.
	 * @param {string} value - The query text after the trigger.
	 * @param {Node} targetNode - The node where the trigger was detected.
	 * @returns {Promise<boolean>}
	 */
	async #createList(ctx, value, targetNode) {
		const limit = ctx.limitSize;
		const lowerValue = value.toLowerCase();
		let response = null;

		if (ctx.cachingData) {
			response = ctx.cachingData.get(value);
		}

		if (!response) {
			if (ctx.directData) {
				response = ctx.directData.filter((item) => item.key.toLowerCase().startsWith(lowerValue)).slice(0, limit);
			} else {
				const xmlHttp = await ctx.apiManager.asyncCall({ method: 'GET', url: this.#createUrl(ctx, value) });
				const json = JSON.parse(xmlHttp.responseText);
				response = ctx.transformResponse ? ctx.transformResponse(json, xmlHttp) : json;
			}
		}

		if (ctx.cachingFieldData) {
			const uniqueKeys = new Set();
			response = ctx.cachingFieldData
				.concat(response)
				.filter(({ key }) => {
					if (uniqueKeys.has(key)) return false;
					uniqueKeys.add(key);
					return key.toLowerCase().startsWith(lowerValue);
				})
				.slice(0, limit);
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
			menus.push(ctx.renderItem(v, ctx.trigger));
		}

		// controller open
		this.controller.open(targetNode, null, { isWWTarget: true, initMethod: null, addOffset: null });
		// select menu create
		this.selectMenu.create(list, menus);
		this.selectMenu.open();
		this.selectMenu.setItem(0);
		if (ctx.cachingData) ctx.cachingData.set(value, list);
		return true;
	}

	/**
	 * @description Constructs the API request URL with the query value.
	 * @param {Object} ctx - The trigger context.
	 * @param {string} key - The query text.
	 * @returns {string}
	 */
	#createUrl(ctx, key) {
		return ctx.apiUrl.replace(/\{key\}/i, key);
	}

	/**
	 * @description Handles item selection from the dropdown.
	 * @param {{key: string, [x: string]: any}} item - The selected data item.
	 * @returns {boolean}
	 */
	#onSelectItem(item) {
		if (!item) return false;

		const ctx = this.#activeTrigger;
		if (!ctx) return false;

		const result = ctx.onSelect(item, ctx.trigger);
		let insertedNode = null;

		const anchorParent = this.#anchorNode.parentNode;

		if (typeof result === 'string') {
			// plain text insertion
			this.$.selection.setRange(this.#anchorNode, this.#lastTriggerPos, this.#anchorNode, this.#anchorOffset);
			insertedNode = dom.utils.createTextNode(result);
			if (!this.$.html.insertNode(insertedNode, { afterNode: null, skipCharCount: false })) return false;
		} else {
			// element insertion (descriptor or DOM element)
			let element;
			if (result?.nodeType) {
				element = result;
			} else if (result?.tag) {
				element = dom.utils.createElement(result.tag.toUpperCase(), result.attrs || {}, result.text || '');
			} else {
				return false;
			}

			if (anchorParent.getAttribute?.('data-se-autocomplete')) {
				// update existing autocomplete element in-place
				for (const attr of [...anchorParent.attributes]) anchorParent.removeAttribute(attr.name);
				for (const attr of [...element.attributes]) anchorParent.setAttribute(attr.name, attr.value);
				anchorParent.textContent = element.textContent;
				insertedNode = anchorParent;
			} else {
				this.$.selection.setRange(this.#anchorNode, this.#lastTriggerPos, this.#anchorNode, this.#anchorOffset);
				if (!this.$.html.insertNode(element, { afterNode: null, skipCharCount: false })) return false;
				insertedNode = element;
			}
		}

		this.selectMenu.close();

		const space = dom.utils.createTextNode('\u00A0');
		insertedNode.parentNode.insertBefore(space, insertedNode.nextSibling);
		this.$.selection.setRange(space, 1, space, 1);

		if (ctx.cachingFieldData && !ctx.cachingFieldData.some((data) => data.key === item.key)) {
			ctx.cachingFieldData.push(item);
		}
	}
}

/**
 * @returns {HTMLElement}
 */
function CreateHTML_controller() {
	return dom.utils.createElement('DIV', { class: 'se-controller se-empty-controller' }, '<div></div>');
}

export default Autocomplete;
