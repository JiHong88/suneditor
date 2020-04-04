import { Plugin } from '../Plugin';

export interface SubmenuPlugin extends Plugin {
    on: () => void;
}