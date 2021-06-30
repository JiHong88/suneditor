import Global from "./global";
import Env from "./env";
import Unicode from "./unicode";
import Converter from "./converter";
import domUtils from "./domUtils";
import Numbers from "./numbers";

export const global = Global;
export const env = Env;
export const unicode = Unicode;
export const converter = Converter;
export const domUtils = domUtils;
export const numbers = Numbers;

const helper = {
	global: global,
	env: env,
	unicode: unicode,
	converter: converter,
	domUtils: domUtils,
	numbers: numbers,
};

export default helper;
