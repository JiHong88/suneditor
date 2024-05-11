import { domUtils } from '../src/helper';

function root(root) {}

function table() {
	return {
		query: 'table',
		method: (element) => {
			const figure = domUtils.createElement('FIGURE');
			element.parentNode.insertBefore(figure, element);
			figure.appendChild(element);
		}
	};
}

function dataAttr() {
	const attr = {
		'data-index': 'data-se-index',
		'data-file-size': 'data-se-file-size',
		'data-file-name': 'data-se-file-name',
		'data-exp': 'data-se-value',
		'data-font-size': 'data-se-type'
	};
}
