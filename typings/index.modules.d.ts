import { Module } from '../Module';

import dialog from './dialog';
import component from './component';
import fileManager from './fileManager';
import Figure from './resizing';

declare const _modules: Module[];

export { dialog, component, fileManager, Figure as resizing };
export default _modules;