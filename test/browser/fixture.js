import suneditor, { plugins } from '../../src/suneditor';
import '../../src/assets/suneditor.css';
import '../../src/assets/suneditor-contents.css';

window.createBrowserEditor = ({ withAlign = false, ...options } = {}) =>
	new Promise((resolve) => {
		const target = document.createElement('textarea');
		document.getElementById('host').appendChild(target);
		const editor = suneditor.create(target, {
			plugins: withAlign ? [plugins.align] : [],
			buttonList: withAlign ? [['undo', 'redo', 'align']] : [['undo', 'redo', 'bold']],
			width: '640px',
			height: '240px',
			toolbar_sticky: false,
			resizingBar: false,
			defaultStyle: 'font-family: sans-serif; font-size: 16px; line-height: 24px;',
			...options,
			events: {
				onload: async () => {
					window.browserEditor = editor;
					await editor.$.frameContext.get('_wd').fonts.ready;
					resolve();
				},
			},
		});
	});
