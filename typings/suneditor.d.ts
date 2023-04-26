import { SunEditorOptions } from './options';
import SunEditor from '../src/core/editor';

declare namespace _default {
    export function init(init_options: SunEditorOptions): { create: typeof create; };
    export function create(idOrElement: String | Element, options: SunEditorOptions, _init_options?: SunEditorOptions): SunEditor;
}

export default _default;
