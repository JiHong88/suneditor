import { Module } from '../Module';

/**
 * @description This is a required module of dialog plugin.
 */
declare interface dialog extends Module {
    /**
     * @description Open a Dialog plugin
     * @param kind Dialog plugin name
     * @param update Whether it will open for update ('image' === this.currentControllerName)
     * @example this.plugins.dialog.open.call(this, 'image', 'image' === this.currentControllerName);
     */
    open(kind: string, update: boolean): void;

    /**
     * @description Called after the submenu has been rendered
     */
    on?: () => void;

    /**
     * @description Close a Dialog plugin
     * The plugin's "init" method is called.
     * @example this.plugins.dialog.close.call(this);
     */
    close(): void;
}

export default dialog;