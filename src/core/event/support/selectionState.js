import { dom, numbers } from '../../../helper';

/**
 * @description Service class managing the selection state and toolbar updates.
 * - Handles activating toolbar buttons based on the current selection.
 * - Manages the 'active' state of plugins and commands.
 */
export default class SelectionState {
	#editor;
	#options;
	#status;
	#frameContext;
	#frameOptions;
	#plugins;
	#commandTargets;

	/** @type {RegExp} */
	#onButtonsCheck;

	/**
	 * @constructor
	 * @param {SunEditor.Instance} editor
	 */
	constructor(editor) {
		this.#editor = editor;
		this.#options = editor.options;
		this.#status = editor.status;
		this.#frameContext = editor.frameContext;
		this.#frameOptions = editor.frameOptions;
		this.#plugins = editor.plugins;
		this.#commandTargets = editor.commandDispatcher.targets;

		this.#onButtonsCheck = new RegExp(`^(${Object.keys(editor.options.get('_defaultStyleTagMap')).join('|')})$`, 'i');
	}

	get #selection() {
		return this.#editor.selection;
	}

	get #format() {
		return this.#editor.format;
	}

	get #component() {
		return this.#editor.component;
	}

	/**
	 * @description Updates the toolbar state based on the current selection.
	 * - Traverses the DOM from the selection to the root.
	 * - Checks for active tags and styles.
	 * - Activates corresponding toolbar buttons.
	 * @param {Node} [selectionNode] The node where the selection is currently located.
	 * @returns {Node|undefined} The processed selection node.
	 */
	update(selectionNode) {
		selectionNode ||= this.#selection.getNode();
		if (selectionNode === this.#editor.effectNode) return;
		this.#editor.effectNode = selectionNode;

		const marginDir = this.#options.get('_rtl') ? 'marginRight' : 'marginLeft';
		const plugins = this.#plugins;
		const commandTargets = this.#commandTargets;
		const classOnCheck = this.#onButtonsCheck;
		const styleCommand = this.#options.get('_styleCommandMap');
		const commandMapNodes = [];
		const currentNodes = [];

		const styleTags = this.#options.get('_textStyleTags');
		const styleNodes = [];

		const ignoreCommands = [];
		const activeCommands = this.#editor.activeCommands;
		const cLen = activeCommands.length;
		let nodeName = '';

		if (this.#component.is(selectionNode) && !this.#component.__selectionSelected) {
			const component = this.#component.get(selectionNode);
			if (!component) return;
			this.#editor.effectNode = null;
			this.#component.select(component.target, component.pluginName);
			return;
		}

		while (selectionNode.firstChild) {
			selectionNode = selectionNode.firstChild;
		}

		const fc = this.#frameContext;
		const notReadonly = !fc.get('isReadOnly');
		for (let element = selectionNode; !dom.check.isWysiwygFrame(element); element = element.parentElement) {
			if (!element) break;
			if (element.nodeType !== 1 || dom.check.isBreak(element)) continue;
			if (this.#isNonFocusNode(element)) {
				this.#editor.focusManager.blur();
				return;
			}

			nodeName = element.nodeName.toLowerCase();
			currentNodes.push(nodeName);
			if (styleTags.includes(nodeName) && !this.#format.isLine(nodeName)) styleNodes.push(element);

			/* Active plugins */
			if (notReadonly) {
				for (let c = 0, name; c < cLen; c++) {
					name = activeCommands[c];
					if (
						!commandMapNodes.includes(name) &&
						!ignoreCommands.includes(name) &&
						commandTargets.get(name) &&
						commandTargets.get(name).filter((e) => {
							const r = plugins[name]?.active(element, e);
							if (r === undefined) {
								ignoreCommands.push(name);
							}
							return r;
						}).length > 0
					) {
						commandMapNodes.push(name);
					}
				}
			}

			/** indent, outdent */
			if (this.#format.isLine(element)) {
				/* Outdent */
				if (!commandMapNodes.includes('outdent') && commandTargets.has('outdent') && (dom.check.isListCell(element) || (element.style[marginDir] && numbers.get(element.style[marginDir], 0) > 0))) {
					if (
						commandTargets.get('outdent').filter((e) => {
							if (dom.check.isImportantDisabled(e)) return false;
							e.disabled = false;
							return true;
						}).length > 0
					) {
						commandMapNodes.push('outdent');
					}
				}
				/* Indent */
				if (!commandMapNodes.includes('indent') && commandTargets.has('indent')) {
					const indentDisable = dom.check.isListCell(element) && !element.previousElementSibling;
					if (
						commandTargets.get('indent').filter((e) => {
							if (dom.check.isImportantDisabled(e)) return false;
							e.disabled = indentDisable;
							return true;
						}).length > 0
					) {
						commandMapNodes.push('indent');
					}
				}

				continue;
			}

			/** default active buttons [strong, ins, em, del, sub, sup] */
			if (classOnCheck.test(nodeName)) {
				nodeName = styleCommand[nodeName] || nodeName;
				commandMapNodes.push(nodeName);
				dom.utils.addClass(commandTargets.get(nodeName), 'active');
			}
		}

		this.#setKeyEffect(commandMapNodes);

		// cache style nodes
		this.__cacheStyleNodes = styleNodes.reverse();

		/** save current nodes */
		this.#status.currentNodes = currentNodes.reverse();
		this.#status.currentNodesMap = commandMapNodes;

		/**  Displays the current node structure to statusbar */
		if (this.#frameOptions.get('statusbar_showPathLabel') && fc.get('navigation')) {
			fc.get('navigation').textContent = this.#options.get('_rtl') ? this.#status.currentNodes.reverse().join(' < ') : this.#status.currentNodes.join(' > ');
		}

		return selectionNode;
	}

	/**
	 * @description Resets the toolbar state.
	 * - Deactivates all buttons and clears the effect.
	 * - Equivalent to calling setKeyEffect([]).
	 */
	reset() {
		this.#setKeyEffect([]);
	}

	/**
	 * @description Internal logic to update the visual state of buttons.
	 * - Checks the list of active commands and updates the DOM classes (active/inactive).
	 * @param {Array<string>} ignoredList List of formatting commands to keep active (others will be deactivated).
	 */
	#setKeyEffect(ignoredList) {
		const activeCommands = this.#editor.activeCommands;
		const commandTargets = this.#commandTargets;
		const plugins = this.#plugins;
		for (let i = 0, len = activeCommands.length, k, c, p; i < len; i++) {
			k = activeCommands[i];
			if (ignoredList.includes(k) || !(c = commandTargets.get(k))) continue;

			p = plugins[k];
			for (let j = 0, jLen = c.length, e; j < jLen; j++) {
				e = c[j];
				if (!e) continue;
				if (p) {
					p.active(null, e);
				} else if (/^outdent$/i.test(k)) {
					if (!dom.check.isImportantDisabled(e)) e.disabled = true;
				} else if (/^indent$/i.test(k)) {
					if (!dom.check.isImportantDisabled(e)) e.disabled = false;
				} else {
					dom.utils.removeClass(e, 'active');
				}
			}
		}
	}

	/**
	 * @description Checks if a node is a non-focusable element(.data-se-non-focus). (e.g. fileUpload.component > span)
	 * @param {Node} node Node to check
	 * @returns {boolean} True if the node is non-focusable, otherwise false
	 */
	#isNonFocusNode(node) {
		return dom.check.isElement(node) && node.getAttribute('data-se-non-focus') === 'true';
	}
}
