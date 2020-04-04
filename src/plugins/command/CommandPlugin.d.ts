import { Plugin } from '../Plugin';

export interface CommandPlugin extends Plugin {
    action: () => void;
}