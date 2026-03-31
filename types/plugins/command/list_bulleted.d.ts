import type {} from '../../typedef';
export default List_bulleted;
/**
 * @class
 * @implements {PluginDropdown}
 * @description List bulleted plugin, Several types of lists are provided.
 */
declare class List_bulleted extends PluginCommand implements PluginDropdown {
	title: any;
	active(element: HTMLElement | null, target: HTMLElement | null): boolean | void;
	on(target?: HTMLElement): void;
	shortcut(params: SunEditor.HookParams.Shortcut): void;
	/**
	 * @description Add a bulleted list
	 * @param {string} [type=""] List type
	 */
	submit(type?: string): void;
	#private;
}
import { PluginDropdown } from '../../interfaces';
import { PluginCommand } from '../../interfaces';
