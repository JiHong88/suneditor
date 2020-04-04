import SunEditor from '../lib/core';

export interface Module {
    name: string;
    add: (core: SunEditor) => void;
}