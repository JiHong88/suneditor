import { Plugin } from './Plugin';

export interface DialogPlugin extends Plugin {
    /**
     * @description This method is called when the plugin button is clicked.
     * Open the modal window here.
     */
    open: () => void;

    /**
     * @description Called after the submenu has been rendered
     */
    on?: () => void;

    /**
     * @description This method is called when the dialog window is closed.
     * Initialize the properties.
     */
    init: () => void;
}