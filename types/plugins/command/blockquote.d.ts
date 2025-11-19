import type {} from '../../typedef';
export default Blockquote;
/**
 * @class
 * @description Blockquote plugin
 */
declare class Blockquote extends PluginCommand {
	title: any;
	quoteTag: HTMLElement;
	active(element?: HTMLElement | null, target?: HTMLElement | null): boolean | void;
}
import { PluginCommand } from '../../interfaces';
