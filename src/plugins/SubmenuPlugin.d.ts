import { Plugin } from './Plugin';

export interface SubmenuPlugin extends Plugin {
    /**
     * @description Called after the submenu has been rendered
     */
    on?: () => void;
}