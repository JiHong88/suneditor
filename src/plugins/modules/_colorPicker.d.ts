import SunEditor from '../../lib/core';
import { Module } from '../Module';

declare interface _colorPicker extends Module {
    /**
     * @description Create color list
     * @param core Core object 
     * @param makeColor this._makeColorList
     * @returns HTML string
     */
    createColorList(core: SunEditor, makeColor: Function): string;
    
    /**
     * @description Displays or resets the currently selected color at color list.
     * @param node Current Selected node
     * @param color Color value
     */
    init(node: Node, color: string): void;

    /**
     * @description Store color values
     * @param hexColorStr Hax color value
     */
    setCurrentColor(hexColorStr: string): void;

    /**
     * @description Set color at input element
     * @param hexColorStr Hax color value
     */
    setInputText(hexColorStr: string): void;

    /**
     * @description Gets color value at color property of node
     * @param node Selected node 
     * @returns
     */
    getColorInNode(node: Node): string;

    /**
     * @description Function to check hex format color
     * @param str Color value
     */
    isHexColor(str: string): boolean;

    /**
     * @description Function to convert hex format to a rgb color
     * @param rgb RGB color format
     * @returns
     */
    rgb2hex(rgb: string): string;

    /**
     * @description Converts color values of other formats to hex color values and returns.
     * @param colorName Color value
     * @returns
     */
    colorName2hex(colorName: string): string;
}

export default _colorPicker;