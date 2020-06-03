import { Module } from '../Module';

/**
 * @description Require context properties when fileBrowser module
    url(@Required): "File server url",
    listClass(@Required): "Class name of list div",
    itemTemplateHandler(@Required): "Function that defines the HTML of an file item",
    selectorHandler(@Required): "Function that action when item click",
    columnSize(@Option): "Number of "div.se-file-item-column" to be created (default: 4)"
*/
declare interface fileBrowser extends Module {
    /**
     * @description Open a file browser window
     * @param {String} pluginName Plugin name using the file browser
     * @param {Function|null} selectorHandler When the function comes as an argument value, it substitutes "context.selectorHandler".
     * @example this.plugins.fileBrowser.open.call(this, 'imageGallery', (selectorHandler || null));
     */
    open(kind: string, update: boolean): void;

    /**
     * @description Close a Dialog window
     * The plugin's "init" method is called.
     * @example this.plugins.dialog.close.call(this);
     */
    close(): void;
}

export default fileBrowser;