import suneditor from '../../src/suneditor';
require('../../src/assets/suneditor.css');
require('../../src/assets/suneditor-content.css');
// require('../../src/assets/themes/test.css');

// katex
import Katex from 'katex';
require('katex/dist/katex.css');

// codemirror6
// import { EditorView, basicSetup, minimalSetup } from 'codemirror';
// import { javascript } from '@codemirror/lang-javascript';
// import { html } from '@codemirror/lang-html';

// // codemirror5
// import Codemirror5 from 'codemirror5';
// require('codemirror5/lib/codemirror.css');
// require('codemirror5/mode/htmlmixed/htmlmixed');

// import lang from '../../src/langs';
// import blockquote from '../../src/plugins/command/blockquote';
// import align from '../../src/plugins/dropdown/align';
// import font from '../../src/plugins/dropdown/font';
// import fontColor from '../../src/plugins/dropdown/fontColor';
// import backgroundColor from '../../src/plugins/dropdown/backgroundColor';
// import fontSize from '../../src/plugins/dropdown/fontSize';
// import formatBlock from '../../src/plugins/dropdown/formatBlock';
// import hr from '../../src/plugins/dropdown/hr';
// import lineHeight from '../../src/plugins/dropdown/lineHeight';
// import list from '../../src/plugins/dropdown/list';
// import paragraphStyle from '../../src/plugins/dropdown/paragraphStyle';
// import template from '../../src/plugins/dropdown/template';
// import layout from '../../src/plugins/dropdown/layout';
// import textStyle from '../../src/plugins/dropdown/textStyle';
// import table from '../../src/plugins/dropdown/table';
// import math from '../../src/plugins/modal/math';
// import link from '../../src/plugins/modal/link';
// import audio from '../../src/plugins/modal/audio';
// import image from '../../src/plugins/modal/image';
// import video from '../../src/plugins/modal/video';
// import imageGallery from '../../src/plugins/fileBrowser/imageGallery';
import plugins from '../../src/plugins';

const bl = [
	['undo', 'redo', 'dir'],
	['dir_ltr', 'dir_rtl'],
	['font', 'fontSize', 'formatBlock'],
	['paragraphStyle', 'blockquote'],
	['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
	['fontColor', 'backgroundColor', 'textStyle'],
	['removeFormat'],
	'/',
	['outdent', 'indent'],
	['align', 'hr', 'list', 'lineHeight'],
	['table', 'link', 'image', 'video', 'audio', 'math'],
	['imageGallery'],
	['fullScreen', 'showBlocks', 'codeView'],
	['preview', 'print'],
	['save', 'template', 'layout'],
	// (min-width: 1565)
	[
		'%1565',
		[
			['undo', 'redo'],
			['font', 'fontSize', 'formatBlock'],
			['paragraphStyle', 'blockquote'],
			['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
			['fontColor', 'backgroundColor', 'textStyle'],
			['removeFormat'],
			['outdent', 'indent'],
			['align', 'hr', 'list', 'lineHeight'],
			['table', 'link', 'image', 'video', 'audio', 'math'],
			['imageGallery'],
			['fullScreen', 'showBlocks', 'codeView'],
			['-right', ':More Misc-default.more_vertical', 'preview', 'print', 'save', 'template', 'layout']
		]
	],
	// (min-width: 1455)
	[
		'%1455',
		[
			['undo', 'redo'],
			['font', 'fontSize', 'formatBlock'],
			['paragraphStyle', 'blockquote'],
			['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
			['fontColor', 'backgroundColor', 'textStyle'],
			['removeFormat'],
			['outdent', 'indent'],
			['align', 'hr', 'list', 'lineHeight'],
			['table', 'link', 'image', 'video', 'audio', 'math'],
			['imageGallery'],
			['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout']
		]
	],
	// (min-width: 1326)
	[
		'%1326',
		[
			['undo', 'redo'],
			['font', 'fontSize', 'formatBlock'],
			['paragraphStyle', 'blockquote'],
			['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
			['fontColor', 'backgroundColor', 'textStyle'],
			['removeFormat'],
			['outdent', 'indent'],
			['align', 'hr', 'list', 'lineHeight'],
			['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout'],
			['-right', ':More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio', 'math', 'imageGallery']
		]
	],
	// (min-width: 1123)
	[
		'%1123',
		[
			['undo', 'redo'],
			[':More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
			['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
			['fontColor', 'backgroundColor', 'textStyle'],
			['removeFormat'],
			['outdent', 'indent'],
			['align', 'hr', 'list', 'lineHeight'],
			['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout'],
			['-right', ':More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio', 'math', 'imageGallery']
		]
	],
	// (min-width: 817)
	[
		'%817',
		[
			['undo', 'redo'],
			[':More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
			['bold', 'underline', 'italic', 'strike'],
			[':More Text-default.more_text', 'subscript', 'superscript', 'fontColor', 'backgroundColor', 'textStyle'],
			['removeFormat'],
			['outdent', 'indent'],
			['align', 'hr', 'list', 'lineHeight'],
			['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout'],
			['-right', ':More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio', 'math', 'imageGallery']
		]
	],
	// (min-width: 673)
	[
		'%673',
		[
			['undo', 'redo'],
			[':More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
			[':More Text-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'backgroundColor', 'textStyle'],
			['removeFormat'],
			['outdent', 'indent'],
			['align', 'hr', 'list', 'lineHeight'],
			[':More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio', 'math', 'imageGallery'],
			['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout']
		]
	],
	// (min-width: 525)
	[
		'%525',
		[
			['undo', 'redo'],
			[':More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
			[':More Text-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'backgroundColor', 'textStyle'],
			['removeFormat'],
			['outdent', 'indent'],
			[':More Line-default.more_horizontal', 'align', 'hr', 'list', 'lineHeight'],
			[':More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio', 'math', 'imageGallery'],
			['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout']
		]
	],
	// (min-width: 420)
	[
		'%420',
		[
			['undo', 'redo'],
			[':lang.test-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
			[':More Text-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'backgroundColor', 'textStyle', 'removeFormat'],
			[':More Line-default.more_horizontal', 'outdent', 'indent', 'align', 'hr', 'list', 'lineHeight'],
			[':More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio', 'math', 'imageGallery'],
			['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout']
		]
	]
];

const begContent = `
<p><span class="__se__katex katex" data-se-value="\begin{Bmatrix}
a &amp;amp;amp; b \\
a &amp;amp;amp; b \\
c &amp;amp;amp; d
\end{Bmatrix}" data-se-type="1em" style="font-size: 1em;" contenteditable="false"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mo fence="true">{</mo><mtable rowspacing="0.16em" columnalign="center center" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mi>a</mi></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>a</mi><mi>m</mi><mi>p</mi><mo separator="true">;</mo><mi>b</mi></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mi>a</mi></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>a</mi><mi>m</mi><mi>p</mi><mo separator="true">;</mo><mi>b</mi></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mi>c</mi></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>a</mi><mi>m</mi><mi>p</mi><mo separator="true">;</mo><mi>d</mi></mrow></mstyle></mtd></mtr></mtable><mo fence="true">}</mo></mrow><annotation encoding="application/x-tex">\begin{Bmatrix}
a &amp;amp; b \\
a &amp;amp; b \\
c &amp;amp; d
\end{Bmatrix}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:3.6em;vertical-align:-1.55em;"></span><span class="minner"><span class="mopen"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.05em;"><span style="top:-2.5em;"><span class="pstrut" style="height:3.15em;"></span><span class="delimsizinginner delim-size4"><span>⎩</span></span></span><span style="top:-2.492em;"><span class="pstrut" style="height:3.15em;"></span><span style="height:0.016em;width:0.8889em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.8889em" height="0.016em" style="width:0.8889em" viewBox="0 0 888.89 16" preserveAspectRatio="xMinYMin"><path d="M384 0 H504 V16 H384z M384 0 H504 V16 H384z"></path></svg></span></span><span style="top:-3.15em;"><span class="pstrut" style="height:3.15em;"></span><span class="delimsizinginner delim-size4"><span>⎨</span></span></span><span style="top:-4.292em;"><span class="pstrut" style="height:3.15em;"></span><span style="height:0.016em;width:0.8889em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.8889em" height="0.016em" style="width:0.8889em" viewBox="0 0 888.89 16" preserveAspectRatio="xMinYMin"><path d="M384 0 H504 V16 H384z M384 0 H504 V16 H384z"></path></svg></span></span><span style="top:-4.3em;"><span class="pstrut" style="height:3.15em;"></span><span class="delimsizinginner delim-size4"><span>⎧</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.55em;"><span></span></span></span></span></span></span><span class="mord"><span class="mtable"><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.05em;"><span style="top:-4.21em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">a</span></span></span><span style="top:-3.01em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">a</span></span></span><span style="top:-1.81em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">c</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.55em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:0.5em;"></span><span class="arraycolsep" style="width:0.5em;"></span><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.05em;"><span style="top:-4.21em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">am</span><span class="mord mathnormal">p</span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">b</span></span></span><span style="top:-3.01em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">am</span><span class="mord mathnormal">p</span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">b</span></span></span><span style="top:-1.81em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">am</span><span class="mord mathnormal">p</span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">d</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.55em;"><span></span></span></span></span></span></span></span><span class="mclose"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.05em;"><span style="top:-2.5em;"><span class="pstrut" style="height:3.15em;"></span><span class="delimsizinginner delim-size4"><span>⎭</span></span></span><span style="top:-2.492em;"><span class="pstrut" style="height:3.15em;"></span><span style="height:0.016em;width:0.8889em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.8889em" height="0.016em" style="width:0.8889em" viewBox="0 0 888.89 16" preserveAspectRatio="xMinYMin"><path d="M384 0 H504 V16 H384z M384 0 H504 V16 H384z"></path></svg></span></span><span style="top:-3.15em;"><span class="pstrut" style="height:3.15em;"></span><span class="delimsizinginner delim-size4"><span>⎬</span></span></span><span style="top:-4.292em;"><span class="pstrut" style="height:3.15em;"></span><span style="height:0.016em;width:0.8889em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.8889em" height="0.016em" style="width:0.8889em" viewBox="0 0 888.89 16" preserveAspectRatio="xMinYMin"><path d="M384 0 H504 V16 H384z M384 0 H504 V16 H384z"></path></svg></span></span><span style="top:-4.3em;"><span class="pstrut" style="height:3.15em;"></span><span class="delimsizinginner delim-size4"><span>⎫</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.55em;"><span></span></span></span></span></span></span></span></span></span></span></p>
`;

let dir = '';
// dir = 'rtl'
const mode = ['inline', 'balloon-always', 'balloon', 'classic'][1];

// suneditor.create('#scrolleditor', {
// 	// value: begContent,
// 	plugins: plugins,
// 	toolbar_sticky: 0,
// 	width: 450,
// 	height: 350,
// 	katex: {
// 		src: Katex
// 	},
// 	textDirection: dir,
// 	mode: mode,
// 	buttonList: bl
// });

// suneditor.create('#editor_classic', {
// 	// value: begContent,
// 	plugins: plugins,
// 	toolbar_sticky: 0,
// 	width: 450,
// 	height: 350,
// 	katex: {
// 		src: Katex
// 	},
// 	textDirection: dir,
// 	mode: mode,
// 	buttonList: bl
// });

// window.e = suneditor.create(['#editor1'], {
// 	placeholder: 'placeholder',
// 	toolbar_container: document.getElementById('ttt'),
// 	textDirection: dir,
// 	mode: mode,
// 	// toolbar_sticky: 50,
// 	// value: `<p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p><p>aaaaa</p>`,
// 	// value: '<h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2><h2 style="text-align: right">Hello</h2>',
// 	// iframe: true,
// 	// iframe_fullPage: true,
// 	elementBlacklist: 'p',
// 	// toolbar_sticky: 60,
// 	width: '350px',
// 	height: '345',
// 	minHeight: '',
// 	charCounter: true,
// 	// tableCellControllerPosition: 'top',
// 	statusbar: true,
// 	codeMirror: {
// 		EditorView: EditorView,
// 		extensions: [
// 			basicSetup,
// 			html({
// 				matchClosingTags: true,
// 				autoCloseTags: true
// 			}),
// 			javascript()
// 		],
// 		minimalSetup: minimalSetup
// 	},
// 	// codeMirror: {
// 	// 	src: Codemirror5
// 	// },
// 	// mode: "inline",
// 	// imageUploadUrl: 'http://localhost:3000/editor/upload',
// 	// videoUploadUrl: 'http://localhost:3000/editor/upload',
// 	// audioUploadUrl: 'http://localhost:3000/editor/upload',
// 	katex: {
// 		src: Katex
// 	},
// 	charCounter: true,
// 	font: ['Vazir', 'Arial', 'Comic Sans MS', 'Courier New', 'Impact', 'Georgia', 'tahoma', 'Trebuchet MS', 'Verdana'],
// 	templates: [
// 		{
// 			name: 'Template-1',
// 			html: '<p>HTML source1</p>'
// 		},
// 		{
// 			name: 'Template-2',
// 			html: '<p>HTML source2</p>'
// 		}
// 	],
// 	layouts: [
// 		{
// 			name: 'Layout-1',
// 			html: '<div class="__se__block"><table><tr><td contenteditable="false">aaaa</td><td><br></td></tr></table></div>'
// 		}
// 	],
// 	linkRel: ['author', 'external', 'help', 'license', 'next', 'follow', 'nofollow', 'noreferrer', 'noopener', 'prev', 'search', 'tag'],
// 	linkRelDefault: 'noreferrer noopener',
// 	linkTargetNewWindow: true,
// 	defaultUrlProtocol: 'https://',
// 	imageMultipleFile: true,
// 	imageResizing: true,
// 	plugins: plugins,
// 	events: {
// 		// onBlur(a, b, c, d, e) {
// 		// 	console.log('blur', a);
// 		// },
// 		// onFocus() {
// 		// 	console.log('focus');
// 		// },
// 		// onload: () => {
// 		// 	console.log('onload');
// 		// }
// 	},
// 	// buttonList: [
// 	// 	['undo', 'redo'],
// 	// 	['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
// 	// 	['removeFormat'],
// 	// 	['outdent', 'indent'],
// 	// 	['fullScreen', 'showBlocks', 'codeView'],
// 	// 	['preview', 'print'],
// 	// 	['align', 'blockquote', 'font', 'fontColor', 'backgroundColor', 'fontSize', 'formatBlock', 'hr'],
// 	// 	['lineHeight', 'list', 'paragraphStyle', 'template', 'layout', 'textStyle', 'table'],
// 	// 	['math', 'link', 'audio', 'image', 'video']
// 	// ],
// 	buttonList: bl
// });

window.c = () => {
	window.editor_root = suneditor.create(
		document.querySelector('#multi_editor_1'),
		// {
		// 	editor1: {
		// 		target: document.querySelector('#multi_editor_1'),
		// 		options: {
		// 			value: `
		// 			<p><a href="http://localhost:8088/dsa">http://localhost:808</a></p>

		// 			<p>ed1</p>

		// 			<hr class="__se__solid">

		// 			<p><br>
		// 			</p>

		// 			<p>ed2</p>

		// 			<div class="se-component se-image-container __se__float-none">
		// 			<figure>
		// 				<img src="http://suneditor.com/docs/cat.jpg" alt="Tabby" data-se-size="auto,auto" data-se-file-name="cat.jpg" data-se-file-size="0" style="" data-se-index="0">
		// 			</figure>
		// 			</div>

		// 			<p>ed3</p>

		// 			<p>ed4</p>

		// 			<p>edend--</p>

		// 			<div>					</div>

		// 			`,
		// 			placeholder: 'place1',
		// 			height: '400px',
		// 			width: '500px',
		// 			iframe: true,
		// 			// iframe_fullPage: true,
		// 			statusbar: true,
		// 			statusbar_resizeEnable: true
		// 		}
		// 	},
		// 	editor2: {
		// 		target: document.querySelector('#multi_editor_2'),
		// 		options: {
		// 			value: '<p>ed2</p>',
		// 			placeholder: 'place21'
		// 		}
		// 	},
		// 	editor3: {
		// 		target: document.querySelector('#multi_editor_3'),
		// 		options: {
		// 			value: '<p>ed3</p>',
		// 			placeholder: 'place3'
		// 		}
		// 	},
		// 	editor4: {
		// 		target: document.querySelector('#multi_editor_4'),
		// 		options: {
		// 			// value: '<p>ed4</p>',
		// 			placeholder: 'place4'
		// 		}
		// 	}
		// },
		{
			// mode: "inline",
			// toolbar_width: 300,
			// textDirection: 'rtl',
			// value: 'Common value',
			// editorStyle: 'font-size:40px',
			value:`
			<table><colgroup><col style="width: 25%;"><col style="width: 25%;"><col style="width: 25%;"><col style="width: 25%;"></colgroup><tbody><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr></tbody></table>
			`,
			plugins: plugins,
			allowedClassName: '.+',
			toolbar_container: '#root_toolbar_container',
			attributeWhitelist: { '*': 'class|data-.+' },
			// statusbar_container: '#root_statusbar_container',
			// shortcutsHint: false,
			// codeMirror: {
			// 	EditorView: EditorView,
			// 	extensions: [
			// 		basicSetup,
			// 		html({
			// 			matchClosingTags: true,
			// 			autoCloseTags: true
			// 		}),
			// 		javascript()
			// 	],
			// 	minimalSetup: minimalSetup
			// },
			// codeMirror: {
			// 	src: Codemirror5
			// },
			iframe: false,
			// defaultLine: 'div',
			toolbar_sticky: 0,
			lineAttrReset: 'id',
			buttonList: bl,
			subToolbar: {
				buttonList: [['bold', 'dir', 'dir_ltr', 'dir_rtl', 'save']],
				width: 'auto',
				mode: 'balloon' // balloon, balloon-always, balloon-block
			},
			shortcuts: {
				bold: ['s75', 'K'],
				italic: [],
				image: ['73', 'I'],
				list: ['76', 'L']
			},
			math: {
				katex: {
					src: Katex
				},
				fontSizeList: [
					{
						text: '1',
						value: '1em'
					},
					{
						text: '1.5',
						value: '1.5em'
					}
				]
			},
			imageGallery: {
				url: 'https://etyswjpn79.execute-api.ap-northeast-1.amazonaws.com/suneditor-demo'
			},
			image: {
				uploadUrl: 'http://localhost:3000/editor/upload'
			}
		}
	);
};

window.r = () => {
	window.editor_root.resetOptions({
		editor1: {
			statusbar_resizeEnable: false
		}
	});
};

window.d = () => {
	// window.editor_root = window.editor_root.destroy()
};

c();

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function delayedFunction() {
	console.log('Starting---');
	await delay(2000);
	console.log('Finished...');
}

function loadEvent() {
	// editor_root.events.onClick = async (rootKey) => {
	// 	await delayedFunction();
	// 	console.log('rootkeuy', rootKey);
	// };
	editor_root.events.onSave = async ({ frameContext, data }) => {
		await delayedFunction();
		console.log('rootkeuy', data);
	};

	window.editor_root.events.imageUploadHandler = async ({ xmlHttp, info }) => {
		await delayedFunction();
		console.log(xmlHttp);
		console.log(info);
		editor_root.plugins.image._register(info, JSON.parse(xmlHttp.response));
	};
	window.editor_root.events.onImageUploadBefore = async ({ handler, info, files, file, url }) => {
		await delayedFunction();
		if(url) handler('http://suneditor.com/docs/cat.jpg')
		else return true;
	};
	window.editor_root.events.onImageUpload = async ({ handler, info, files, file, url }) => {
		await delayedFunction();
		handler('http://suneditor.com/docs/cat.jpg')
	};
	window.editor_root.events.onImageUploadError = async (params) => {
		await delayedFunction();
		return 'aaa'
	};
	// window.editor_root.events.onPaste = async (params) => {
	// 	await delayedFunction();
	// 	return 'bbb'
	// };
}

editor_root.events.onload = () => {
	loadEvent();
};

// editor_root.events.onBlur = (rootKey, e, htmlFrame) => {
// 	console.log('blur', editor_root.frameContext);
// };

// editor_root.events.onload = function () {
// 	editor_root.html.set('fdjksl;afjds ...fdjksafl;d');
// };
// editor_root.events.onChange = function (c) {
// 	console.log(c);
// };
