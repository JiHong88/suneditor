import type {} from '../../typedef';
/**
 * @description Command executor
 */
export default class CommandExecutor {
	/**
	 * @constructor
	 * @param {SunEditor.Instance} editor
	 */
	constructor(editor: SunEditor.Instance);
	/**
	 * @description Execute default command of command button
	 */
	execute(command: any, button: any): Promise<void>;
	#private;
}
