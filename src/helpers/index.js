import Global from "./global";
import Env from "./env";
import Unicode from "./unicode";
import Converter from "./converter";
import DomUtils from "./domUtils";
import Numbers from "./numbers";

export const global = Global;
export const env = Env;
export const unicode = Unicode;
export const converter = Converter;
export const domUtils = DomUtils;
export const numbers = Numbers;

const helpers = {
	global: global,
	env: env,
	unicode: unicode,
	converter: converter,
	domUtils: domUtils,
	numbers: numbers,
};

export default helpers;