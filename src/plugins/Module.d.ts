import SunEditor from '../lib/core';

export interface Module {
    /**
     * @description Module name
     */
    name: string;
    
    /**
     * @description Constructor
     * @param core Core object 
     */
    add: (core: SunEditor) => void;
}