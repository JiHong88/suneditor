import type {} from '../../../typedef';
/**
 * @description Command executor
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
