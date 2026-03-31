import type {} from '../../typedef';
export default List;
/**
 * @class
 * @description List Plugin (`OL`, `UL`)
 */
declare class List extends PluginDropdown {
	title: any;
	active(element: HTMLElement | null, target: HTMLElement | null): boolean | void;
	#private;
}
import { PluginDropdown } from '../../interfaces';
