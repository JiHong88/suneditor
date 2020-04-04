import SunEditor from '../../lib/core';
import { Module } from '../Module';

declare interface _colorPicker extends Module {
    createColorList(core: SunEditor, makeColor: Function): string;
    _makeColorList(colorList: any[]): string;
    init(node: Node, color: string): void;
    setCurrentColor(hexColorStr: string): void;
    setInputText(hexColorStr: string): void;
    getColorInNode(node: Node): string;
    isHexColor(str: string): boolean;
    rgb2hex(rgb: string): string;
    colorName2hex(colorName: string): string;
}

export default _colorPicker;