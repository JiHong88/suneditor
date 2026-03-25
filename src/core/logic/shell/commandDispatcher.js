import { dom } from '../../../helper';
import CommandExecutor from './_commandExecutor';
import { CreateShortcuts } from '../../section/constructor';

export const COMMAND_BUTTONS = '.se-menu-list .se-toolbar-btn[data-command]';

/**
 * @description List of commands that trigger active event handling in the editor.
 * - These commands typically apply inline formatting or structural changes.
 * @constant {string[]}
 */
const ACTIVE_EVENT_COMMANDS = ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'indent', 'outdent'];

/**
 * @description List of basic editor commands, including active event commands and additional actions
 * - such as undo, redo, saving, full-screen toggle, and text direction commands.
 * @constant {string[]}
 */
const BASIC_COMMANDS = ACTIVE_EVENT_COMMANDS.concat(['undo', 'redo', 'save', 'fullScreen', 'showBlocks', 'codeView', 'markdownView', 'finder', 'dir', 'dir_ltr', 'dir_rtl']);

/**
 * @description Routes toolbar button commands to their handlers and manages active button states.
 */
export default class CommandDispatcher {
	#$;
	#context;
	#options;

	#commandExecutor;

	/**
	 * @description A map with the plugin's buttons having an `active` method and the default command buttons with an `active` action.
	 * - Each button is contained in an array.
	 * @type {Map<string, Array<HTMLButtonElement>>}
	 */
	#commandTargets = new Map();

	/** @type {Array<string>} */
	#activeCommands = ACTIVE_EVENT_COMMANDS;

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel) {
		this.#$ = kernel.$;
		this.#context = this.#$.context;
		this.#options = this.#$.options;

		this.#commandExecutor = new CommandExecutor(kernel);

		/**
		 * @description All command buttons map
		 * @type {Map<string, HTMLElement>}
		 */
		this.allCommandButtons = new Map();

		/**
		 * @description All command buttons map
		 * @type {Map<string, HTMLElement>}
		 */
		this.subAllCommandButtons = new Map();
	}

	get targets() {
		return this.#commandTargets;
	}

	/**
	 * @description Returns the active commands array.
	 * @returns {Array<string>}
	 */
	get activeCommands() {
		return this.#activeCommands;
	}

	/**
	 * @description Run plugin calls and basic commands.
	 * @param {string} command Command string
	 * @param {string} type Display type string (`command`, `dropdown`, `modal`, `container`)
	 * @param {?Node} [button] The element of command button
	 */
	run(command, type, button) {
		if (type) {
			if (/more/i.test(type)) {
				const toolbar = dom.query.getParentElement(button, '.se-toolbar');
				const toolInst = dom.utils.hasClass(toolbar, 'se-toolbar-sub') ? this.#$.subToolbar : this.#$.toolbar;
				if (button !== toolInst.currentMoreLayerActiveButton) {
					const layer = toolbar.querySelector('.' + command);
					if (layer) {
						toolInst._moreLayerOn(button, layer);
						toolInst._showBalloon();
						toolInst._showInline();
					}
					dom.utils.addClass(button, 'on');
				} else if (toolInst.currentMoreLayerActiveButton) {
					toolInst._moreLayerOff();
					toolInst._showBalloon();
					toolInst._showInline();
				}

				this.#$.viewer._resetFullScreenHeight();
				return;
			}

			if (/container/.test(type) && (this.#$.menu.targetMap[command] === null || button !== this.#$.menu.currentContainerActiveButton)) {
				this.#$.menu.containerOn(button);
				return;
			}

			if (this.#$.ui.isButtonDisabled(button)) return;

			if (/dropdown/.test(type) && (this.#$.menu.targetMap[command] === null || button !== this.#$.menu.currentDropdownActiveButton)) {
				this.#$.menu.dropdownOn(button);
				return;
			} else if (/modal/.test(type)) {
				this.#$.plugins[command].open(button);
				return;
			} else if (/command/.test(type)) {
				this.#$.plugins[command].action(button);
			} else if (/browser/.test(type)) {
				this.#$.plugins[command].open(null);
			} else if (/popup/.test(type)) {
				this.#$.plugins[command].show();
			}
		} else if (command) {
			this.#commandExecutor.execute(command, button);
		}

		if (/dropdown/.test(type)) {
			this.#$.menu.dropdownOff();
		} else if (!/command/.test(type)) {
			this.#$.menu.dropdownOff();
			this.#$.menu.containerOff();
		}
	}

	/**
	 * @description Execute `editor.run` with command button.
	 * @param {Node} target Command target
	 */
	runFromTarget(target) {
		if (dom.check.isInputElement(target)) return;

		const targetBtn = /** @type {HTMLButtonElement} */ (dom.query.getCommandTarget(target));
		if (!targetBtn) return;

		const command = targetBtn.getAttribute('data-command');
		const type = targetBtn.getAttribute('data-type');

		if (!command && !type) return;
		if (targetBtn.disabled) return;

		this.run(command, type, target);
	}

	/**
	 * @description It is executed by inserting the button of `commandTargets` as the argument value of the `func` function.
	 * - `func` is called as long as the button array's length.
	 * @param {string} cmd data-command
	 * @param {(...args: *) => *} func Function.
	 */
	applyTargets(cmd, func) {
		if (this.#commandTargets.has(cmd)) {
			this.#commandTargets.get(cmd).forEach(func);
		}
	}

	/**
	 * @description Sets command target elements.
	 * @param {string} cmd - The command identifier.
	 * @param {HTMLButtonElement} target - The associated command button.
	 */
	registerTargets(cmd, target) {
		if (!cmd || !target) return;

		const isBasicCmd = BASIC_COMMANDS.includes(cmd);
		if (!isBasicCmd && !this.#$.plugins[cmd]) return;

		if (!this.#commandTargets.get(cmd)) {
			this.#commandTargets.set(cmd, [target]);
		} else if (!this.#commandTargets.get(cmd).includes(target)) {
			this.#commandTargets.get(cmd).push(target);
		}
	}

	resetTargets() {
		this.#commandTargets = new Map();
		this._initCommandButtons();
	}

	/**
	 * @internal
	 * @description Caching basic buttons to use
	 */
	_initCommandButtons() {
		const ctx = this.#context;

		this.#saveCommandButtons(this.allCommandButtons, ctx.get('toolbar_buttonTray'));
		this.#saveCommandButtons(this.subAllCommandButtons, ctx.get('toolbar_sub_buttonTray'));
	}

	_copyFormat() {
		this.#commandExecutor.copyFormat();
	}

	/**
	 * @description Save the current buttons
	 * @param {Map<string, Element>} cmdButtons Command button map
	 * @param {?Element} tray Button tray
	 */
	#saveCommandButtons(cmdButtons, tray) {
		if (!tray) return;

		const currentButtons = tray.querySelectorAll(COMMAND_BUTTONS);
		const shortcuts = this.#options.get('shortcuts');
		const reverseCommandArray = this.#options.get('_reverseCommandArray');
		const keyMap = this.#$.shortcuts.keyMap;
		const reverseKeys = this.#$.shortcuts.reverseKeys;

		for (let i = 0, len = currentButtons.length, e, c; i < len; i++) {
			e = /** @type {HTMLButtonElement} */ (currentButtons[i]);
			c = e.getAttribute('data-command');
			// command set
			cmdButtons.set(c, e);
			this.registerTargets(c, e);
			// shortcuts
			CreateShortcuts(c, e, shortcuts[c], keyMap, reverseCommandArray, reverseKeys);
		}
	}

	/**
	 * @description Destroy the CommandDispatcher
	 */
	_destroy() {
		this.#commandTargets.clear();
		this.allCommandButtons.clear();
		this.subAllCommandButtons.clear();
		this.#activeCommands = null;
	}
}
