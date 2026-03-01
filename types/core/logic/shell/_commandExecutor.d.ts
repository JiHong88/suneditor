import type {} from '../../../typedef';
/**
 * @description Executes built-in editor commands (formatting, undo/redo, save, codeView, etc.)
 * - and manages copy-format state.
 */
export default class CommandExecutor {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel: SunEditor.Kernel);
	/**
	 * @description Execute default command of command button
	 */
	execute(command: any, button: any): Promise<void>;
	copyFormat(): void;
	#private;
}
