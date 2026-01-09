import type {} from '../../typedef';
export const COMMAND_BUTTONS: '.se-menu-list .se-toolbar-btn[data-command]';
/**
 * @description
 */
export default class CommandDispatcher {
	/**
	 * @constructor
	 * @param {SunEditor.Instance} editor
	 */
	constructor(editor: SunEditor.Instance);
	/**
	 * @description All command buttons map
	 * @type {Map<string, HTMLElement>}
	 */
	allCommandButtons: Map<string, HTMLElement>;
	/**
	 * @description All command buttons map
	 * @type {Map<string, HTMLElement>}
	 */
	subAllCommandButtons: Map<string, HTMLElement>;
	get targets(): Map<string, HTMLButtonElement[]>;
	/**
	 * @description Run plugin calls and basic commands.
	 * @param {string} command Command string
	 * @param {string} type Display type string ('command', 'dropdown', 'modal', 'container')
	 * @param {?Node} [button] The element of command button
	 */
	run(command: string, type: string, button?: Node | null): void;
	/**
	 * @description Execute "editor.run" with command button.
	 * @param {Node} target Command target
	 */
	runFromTarget(target: Node): void;
	/**
	 * @description It is executed by inserting the button of commandTargets as the argument value of the "f" function.
	 * - "func" is called as long as the button array's length.
	 * @param {string} cmd data-command
	 * @param {(...args: *) => *} func Function.
	 */
	applyTargets(cmd: string, func: (...args: any) => any): void;
	/**
	 * @description Sets command target elements.
	 * @param {string} cmd - The command identifier.
	 * @param {HTMLButtonElement} target - The associated command button.
	 */
	registerTargets(cmd: string, target: HTMLButtonElement): void;
	resetTargets(): void;
	/**
	 * @internal
	 * @description Caching basic buttons to use
	 */
	_initCommandButtons(): void;
	/**
	 * @description Destroy the CommandDispatcher
	 */
	destroy(): void;
	#private;
}
