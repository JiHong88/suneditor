function root(root) {}

function math() {
	return {
		query: '.katex',
		method: (element) => {
			if (!domUtils.hasClass(element, 'katex')) return;
			if (element.hasAttribute('data-exp')) {
				element.setAttribute('data-se-value', element.getAttribute('data-exp'));
				element.removeAttribute('data-exp');
			}
			if (element.hasAttribute('data-font-size')) {
				element.setAttribute('data-se-type', element.getAttribute('data-font-size'));
				element.removeAttribute('data-font-size');
			}
		}
	};
}
