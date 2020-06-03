import { Plugin } from './Plugin';

export interface DialogPlugin extends Plugin {
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