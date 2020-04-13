import SunEditor from '../lib/core';

export interface Module {
    /**
     * @description Module name
     */
    name: string;
    
    /**
     * @description Constructor, It will run automatically.
     * @param core Core object 
     * @example core.addModule([dialog, resizing, fileManager])
     */
    add?: (core: SunEditor) => void;
}