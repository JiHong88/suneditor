import { Module } from '../Module';

import dialog from './dialog';
import component from './component';
import fileManager from './fileManager';
import resizing from './resizing';

declare const _modules: Module[];

export { dialog, component, fileManager, resizing };
export default _modules;