import { Plugin } from './Plugin';

/**
 * @description Require context properties when using fileBrowser module:
    title(@Required): "File browser window title",
    url(@Required): "File server url",
    listClass(@Required): "Class name of list div",
    itemTemplateHandler(@Required): "Function that defines the HTML of an file item",
    selectorHandler(@Required): "Function that action when item click",
    columnSize(@Option): "Number of "div.se-file-item-column" to be created (default: 4)"
*/
export interface FileBrowserPlugin extends Plugin {
    /**
     * @description This method is called when the plugin button is clicked.
     * Open a file browser window
     */
    open: () => void;

    /**
     * @description Define the HTML of the item to be put in "div.se-file-item-column".
     * @param item Item of the response data's array
     */
    drawItems: (item: object) => string;

    /**
     * @description This method is called when the file browser window is closed.
     * Initialize the properties.
     */
    init?: () => void;
}