import type {} from '../../typedef';
export default List;
/**
 * @class
 * @description List Plugin (OL, UL)
 */
declare class List extends PluginDropdown {
	title: any;
	listItems: NodeListOf<Element>;
	icons: {
		bulleted: string;
		numbered: string;
	};
	active(element?: HTMLElement | null, target?: HTMLElement | null): boolean | void;
}
import { PluginDropdown } from '../../interfaces';
