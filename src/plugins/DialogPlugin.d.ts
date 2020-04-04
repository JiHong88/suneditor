import { Plugin } from './Plugin';

export interface DialogPlugin extends Plugin {
    open: () => void;
    on?: () => void;
    init: () => void;
}