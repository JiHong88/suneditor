import { Plugin } from './Plugin';

export interface DropdownPlugin extends Plugin {
    /**
     * @description Called after the dropdown has been rendered
     */
    on?: () => void;
}