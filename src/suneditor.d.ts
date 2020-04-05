import { SunEditorOptions } from './options.d';
import SunEditor from './lib/core';

declare namespace _default {
    export function init(init_options: SunEditorOptions): { create: typeof create; };
    export function create(idOrElement: String | Element, options: SunEditorOptions, _init_options?: SunEditorOptions): SunEditor;
}

export default _default;
