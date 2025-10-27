// index.js
import query from './domQuery';
import check from './domCheck';
import utils from './domUtils';

const dom = {
	query,
	check,
	utils,
};

export const domQuery = query;
export const domCheck = check;
export const domUtils = utils;

export default dom;
