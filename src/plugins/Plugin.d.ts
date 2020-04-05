export interface Plugin {
    /**
     * @description Plugin name
     */
    name: string;

    /**
     * @description Plugin type ('container', 'command', 'submenu', 'dialog')
     */
    display: string;

    /**
     * @description Constructor
     * @param core Core object 
     * @param targetElement Target button Element
     */
    add: (core: any, targetElement?: any) => void;

    /**
     * @description Plugins with active methods load immediately when the editor loads.
     * Called each time the selection is moved.
     * @param element Selected elements
     */
    active?: (element: any) => boolean;

    /**
     * @description TML title attribute (tooltip) - default: plugin's name
     */
    title?: string,

    /**
     * @description HTML to be append to button (icon)
     * Recommend using the inline svg icon. - default: "<span class="se-icon-text">!</span>"
     */
    innerHTML?: string,

    /**
     * @description The class of the button. - default: "se-btn"
     * Do not recommend using it unless it is a special situation.
     */
    buttonClass?: string
}