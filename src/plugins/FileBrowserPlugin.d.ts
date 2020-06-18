import { Plugin } from './Plugin';

export interface FileBrowserPlugin extends Plugin {
    /**
     * @description Open a file browser window
     * @param pluginName Plugin name using the file browser
     * @param selectorHandler When the function comes as an argument value, it substitutes "context.selectorHandler".
     * @example this.plugins.fileBrowser.open.call(this, 'imageGallery', (selectorHandler || null));
     */
    open(kind: string, update: boolean): void;

    /**
     * @description Define the HTML of the item to be put in "div.se-file-item-column".
     * @param item Item of the response data's array
     */
    drawItems: (item: object) => string;

    /**
     * @description Close a file browser window
     * The plugin's "init" method is called.
     * @example this.plugins.fileBrowser.close.call(this);
     */
    close(): void;

    /**
     * @description This method is called when the file browser window is closed.
     * Initialize the properties.
     */
    init?: () => void;
}