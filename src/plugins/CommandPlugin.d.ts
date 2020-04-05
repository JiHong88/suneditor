import { Plugin } from './Plugin';

export interface CommandPlugin extends Plugin {
    /**
     * @description The behavior of the "command plugin" must be defined in the "action" method.
     */
    action: () => void;
}