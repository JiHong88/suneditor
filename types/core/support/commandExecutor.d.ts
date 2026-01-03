import type {} from '../../typedef';
/**
 * @description 명령어 실행 담당 서비스 (기존 commandHandler 대체)
 */
export default class CommandExecutor {
	/**
	 * @constructor
	 * @param {SunEditor.Instance} editor
	 */
	constructor(editor: SunEditor.Instance);
	editor: import('../editor').default;
	frameContext: import('../config/frameContext').FrameContextUtil;
	options: any;
	/**
	 * @description Execute default command of command button
	 */
	execute(command: any, button: any): Promise<void>;
	#private;
}
