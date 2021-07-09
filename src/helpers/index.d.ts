import Global from "./global.d";
import Env from "./env.d";
import Unicode from "./unicode.d";
import Converter from "./converter.d";
import DomUtils from "./domUtils.d";
import Numbers from "./numbers.d";

export const global = Global;
export const env = Env;
export const unicode = Unicode;
export const converter = Converter;
export const domUtils = DomUtils;
export const numbers = Numbers;

class helpers {
	global: global;
	env: env;
	unicode: unicode;
	converter: converter;
	domUtils: domUtils;
	numbers: numbers;
};

export default helpers;
