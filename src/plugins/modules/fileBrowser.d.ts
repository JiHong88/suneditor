import { Module } from '../Module';

/**
 * @description This is a required module of fileBrowser plugin.
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
     * @description Close a file browser window
     * The plugin's "init" method is called.
     * @example this.plugins.fileBrowser.close.call(this);
     */
    close(): void;
}

export default fileBrowser;