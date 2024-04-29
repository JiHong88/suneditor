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
	'|data-exp|data-font-size'
}
