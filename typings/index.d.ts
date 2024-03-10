import Env from './env';
import Unicode from './unicode';
import Converter from './converter';
import DomUtils from './domUtils';
import Numbers from './numbers';

export const env = Env;
export const unicode = Unicode;
export const converter = Converter;
export const domUtils = DomUtils;
export const numbers = Numbers;

class helper {
	env: env;
	unicode: unicode;
	converter: converter;
	domUtils: domUtils;
	numbers: numbers;
}

export default helper;
