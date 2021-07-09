import global from "./global.d";
import env from "./env.d";
import unicode from "./unicode.d";
import converter from "./converter.d";
import domUtils from "./domUtils.d";
import numbers from "./numbers.d";

export const global = global;
export const env = env;
export const unicode = unicode;
export const converter = converter;
export const domUtils = domUtils;
export const numbers = numbers;

class helper {
	global: global;
	env: env;
	unicode: unicode;
	converter: converter;
	domUtils: domUtils;
	numbers: numbers
};

export default helper;
