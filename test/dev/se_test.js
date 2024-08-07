import suneditor from '../../src/suneditor';
require('../../src/assets/suneditor.css');
require('../../src/assets/suneditor-contents.css');
require('../../src/themes/dark.css');

// katex
import Katex from 'katex';
require('katex/dist/katex.css');

// MathJax
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { CHTML } from 'mathjax-full/js/output/chtml.js';
import { browserAdaptor } from 'mathjax-full/js/adaptors/browserAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';

// codemirror6
import { EditorView, basicSetup, minimalSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// // codemirror5
// import Codemirror5 from 'codemirror5';
// require('codemirror5/lib/codemirror.css');
// require('codemirror5/mode/htmlmixed/htmlmixed');

// perfect-freehand
// import PerfectFreehand from 'perfect-freehand';

import langs from '../../src/langs';
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
import plugins, { audio, exportPdf } from '../../src/plugins';

const bl = [
	['newDocument', 'selectAll', 'undo', 'redo', 'drawing', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak', 'dir'],
	['dir_ltr', 'dir_rtl'],
	['font', 'fontSize', 'formatBlock'],
	['paragraphStyle', 'blockquote'],
	['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
	['fontColor', 'backgroundColor', 'textStyle'],
	['copyFormat', 'removeFormat'],
	'/',
	['outdent', 'indent'],
	['align', 'hr', 'list', 'list_numbered', 'list_bulleted', 'lineHeight'],
	['table', 'link', 'image', 'video', 'audio', 'math'],
	['imageGallery'],
	['fullScreen', 'showBlocks', 'codeView'],
	['preview', 'print'],
	['save', 'template', 'layout', 'fileUpload', 'exportPdf', 'mention'],
	// (min-width: 1565)
	[
		'%1565',
		[
			['newDocument', 'selectAll', 'undo', 'redo', 'drawing', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak'],
			['font', 'fontSize', 'formatBlock'],
			['paragraphStyle', 'blockquote'],
			['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
			['fontColor', 'backgroundColor', 'textStyle'],
			['copyFormat', 'removeFormat'],
			['outdent', 'indent'],
			['align', 'hr', 'list', 'list_numbered', 'list_bulleted', 'lineHeight'],
			['table', 'link', 'image', 'video', 'audio', 'math'],
			['imageGallery'],
			['fullScreen', 'showBlocks', 'codeView'],
			['-right', ':More Misc-default.more_vertical', 'preview', 'print', 'save', 'template', 'layout', 'fileUpload', 'exportPdf', 'mention']
		]
	],
	// (min-width: 1455)
	[
		'%1455',
		[
			['newDocument', 'selectAll', 'undo', 'redo', 'drawing', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak'],
			['font', 'fontSize', 'formatBlock'],
			['paragraphStyle', 'blockquote'],
			['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
			['fontColor', 'backgroundColor', 'textStyle'],
			['copyFormat', 'removeFormat'],
			['outdent', 'indent'],
			['align', 'hr', 'list', 'list_numbered', 'list_bulleted', 'lineHeight'],
			['table', 'link', 'image', 'video', 'audio', 'math'],
			['imageGallery'],
			['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout', 'fileUpload', 'exportPdf', 'mention']
		]
	],
	// (min-width: 1326)
	[
		'%1326',
		[
			['newDocument', 'selectAll', 'undo', 'redo', 'drawing', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak'],
			['font', 'fontSize', 'formatBlock'],
			['paragraphStyle', 'blockquote'],
			['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
			['fontColor', 'backgroundColor', 'textStyle'],
			['copyFormat', 'removeFormat'],
			['outdent', 'indent'],
			['align', 'hr', 'list', 'list_numbered', 'list_bulleted', 'lineHeight'],
			['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout', 'fileUpload', 'exportPdf', 'mention'],
			['-right', ':More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio', 'math', 'imageGallery']
		]
	],
	// (min-width: 1123)
	[
		'%1123',
		[
			['newDocument', 'selectAll', 'undo', 'redo', 'drawing', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak'],
			[':More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
			['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
			['fontColor', 'backgroundColor', 'textStyle'],
			['copyFormat', 'removeFormat'],
			['outdent', 'indent'],
			['align', 'hr', 'list', 'list_numbered', 'list_bulleted', 'lineHeight'],
			['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout', 'fileUpload', 'exportPdf', 'mention'],
			['-right', ':More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio', 'math', 'imageGallery']
		]
	],
	// (min-width: 817)
	[
		'%817',
		[
			['newDocument', 'selectAll', 'undo', 'redo', 'drawing', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak'],
			[':More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
			['bold', 'underline', 'italic', 'strike'],
			[':More Text-default.more_text', 'subscript', 'superscript', 'fontColor', 'backgroundColor', 'textStyle'],
			['copyFormat', 'removeFormat'],
			['outdent', 'indent'],
			['align', 'hr', 'list', 'list_numbered', 'list_bulleted', 'lineHeight'],
			['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout', 'fileUpload', 'exportPdf', 'mention'],
			['-right', ':More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio', 'math', 'imageGallery']
		]
	],
	// (min-width: 673)
	[
		'%673',
		[
			['newDocument', 'selectAll', 'undo', 'redo', 'drawing', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak'],
			[':More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
			[':More Text-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'backgroundColor', 'textStyle'],
			['copyFormat', 'removeFormat'],
			['outdent', 'indent'],
			['align', 'hr', 'list', 'list_numbered', 'list_bulleted', 'lineHeight'],
			[':More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio', 'math', 'imageGallery'],
			['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout', 'fileUpload', 'exportPdf', 'mention']
		]
	],
	// (min-width: 525)
	[
		'%525',
		[
			['newDocument', 'selectAll', 'undo', 'redo', 'drawing', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak'],
			[':More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
			[':More Text-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'backgroundColor', 'textStyle'],
			['copyFormat', 'removeFormat'],
			['outdent', 'indent'],
			[':More Line-default.more_horizontal', 'align', 'hr', 'list', 'list_numbered', 'list_bulleted', 'lineHeight'],
			[':More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio', 'math', 'imageGallery'],
			['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout', 'fileUpload', 'exportPdf', 'mention']
		]
	],
	// (min-width: 420)
	[
		'%420',
		[
			['newDocument', 'selectAll', 'undo', 'redo', 'drawing', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak'],
			[':lang.test-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
			[':More Text-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'backgroundColor', 'textStyle', 'copyFormat', 'removeFormat'],
			[':More Line-default.more_horizontal', 'outdent', 'indent', 'align', 'hr', 'list', 'list_numbered', 'list_bulleted', 'lineHeight'],
			[':More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio', 'math', 'imageGallery'],
			['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout', 'fileUpload', 'exportPdf', 'mention']
		]
	]
];

const bb = [
	['newDocument', 'selectAll', 'undo', 'redo', 'drawing', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak', 'dir'],
	['dir_ltr', 'dir_rtl'],
	['font', 'fontSize', 'formatBlock'],
	['paragraphStyle', 'blockquote'],
	['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
	['fontColor', 'backgroundColor', 'textStyle'],
	['copyFormat', 'removeFormat'],
	'/',
	['outdent', 'indent'],
	['align', 'hr', 'list', 'list_numbered', 'list_bulleted', 'lineHeight'],
	['table', 'link', 'image', 'video', 'audio', 'math'],
	['imageGallery'],
	['fullScreen', 'showBlocks', 'codeView'],
	['preview', 'print'],
	['save', 'template', 'layout', 'fileUpload', 'exportPdf', 'mention']
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
// 	// 	['copyFormat', 'removeFormat'],
// 	// 	['outdent', 'indent'],
// 	// 	['fullScreen', 'showBlocks', 'codeView'],
// 	// 	['preview', 'print'],
// 	// 	['align', 'blockquote', 'font', 'fontColor', 'backgroundColor', 'fontSize', 'formatBlock', 'hr'],
// 	// 	['lineHeight', 'list', 'paragraphStyle', 'template', 'layout', 'textStyle', 'table'],
// 	// 	['math', 'link', 'audio', 'image', 'video']
// 	// ],
// 	buttonList: bl
// });

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
		allowedExtraTags: { script: true },
		// closeModalOutsideClick: true,
		previewTemplate: `
                <div style="width:auto; max-width:1136px; min-height:400px; margin:auto;">
                {{ contents }}
                </div>
            `,
		// tagStyles: { '.+': '.+' },
		// strictMode: {
		// 	styleFilter: false
		// },
		// lang: langs.ko,
		value: `<figure class="se-flex-component se-scroll-figure-x"><table class="se-size-100 se-table-layout-auto" ><colgroup><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"></colgroup><tbody><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td colspan="2" rowspan="2"><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td colspan="1" rowspan="4"><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td colspan="2" rowspan="1"><div><br></div></td><td colspan="1" rowspan="2"><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td colspan="2" rowspan="1"><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr></tbody></table></figure>`,
		value: `<p>sadas1<span class="__se__katex katex" data-se-value="l;l;;l" data-se-type="1em" style="font-size: 1em;"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>l</mi><mo separator="true">;</mo><mi>l</mi><mo separator="true">;</mo><mo separator="true">;</mo><mi>l</mi></mrow><annotation encoding="application/x-tex">l;l;;l</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mpunct">;;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span></span></span></span>​​<br></p><p>sadas2</p><figure class="se-flex-component"><table style=""><colgroup><col style="width: 33%;"><col style="width: 33%;"><col style="width: 33%;"></colgroup><tbody><tr><td><div>sdd<br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr></tbody></table></figure><div class="se-component se-file-figure se-flex-component"><figure><a href="https://link.testfile.org/30MB" title="document.pdf" download="document.pdf" data-se-file-download="" data-se-non-link="true" data-se-file-name="document.pdf" data-se-file-size="124826" data-se-size="auto,auto" contenteditable="false">document.pdf</a></figure></div><p>sadas3<br></p><p>sadas4<br></p><p>sadas5<br></p><p>sadas6<br></p><p>dsads<a href="http://localhost:3000/public/files/d5d13802a01dd4dea399c912f7b31e5e.png" download="1571311368279.png" name="1571311368279.png">1571311368279.png</a>​<br></p><div class="se-component se-image-container __se__float-none"><figure><img src="http://suneditor.com/docs/welsh Corgi.jpg" alt="Welsh Corgi" data-se-file-name="welsh%20Corgi.jpg" data-se-file-size="0" data-se-size="auto,auto" style="" data-se-index="0"></figure></div><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p>`,
		value: `<p>sadas1<span class="__se__katex katex" data-se-value="l;l;;l" data-se-type="1em" style="font-size: 1em;"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>l</mi><mo separator="true">;</mo><mi>l</mi><mo separator="true">;</mo><mo separator="true">;</mo><mi>l</mi></mrow><annotation encoding="application/x-tex">l;l;;l</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mpunct">;;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span></span></span></span>​​<br></p><p>sadas2</p><figure class="se-flex-component"><table style=""><colgroup><col style="width: 33%;"><col style="width: 33%;"><col style="width: 33%;"></colgroup><tbody><tr><td><div>sdd<br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr></tbody></table></figure><div class="se-component se-file-figure se-flex-component"><figure><a href="http://localhost:3000/editor/files/download/public/files/d31ed6f9e11d1661406efe5ed34328e5.pdf" title="document.pdf" download="document.pdf" data-se-file-download="" data-se-non-link="true" data-se-file-name="document.pdf" data-se-file-size="124826" data-se-index="0" data-se-size="auto,auto" contenteditable="false">document.pdf</a></figure></div><div class="se-component se-image-container __se__float-none"><figure><img src="http://suneditor.com/docs/welsh Corgi.jpg" alt="Welsh Corgi" data-se-file-name="welsh%20Corgi.jpg" data-se-file-size="0" data-se-size="auto,auto" style="" data-se-index="0"></figure></div>`,
		// 		value: `
		// <p>SunEditor</p>
		// <video controls="true" src="http://localhost:3000/public/files/d55bddf8d62910879ed9f605522149a8.mp4" width="100%" height="56.25%" data-se-size="100%,56.25%" data-se-file-name="SampleVideo_1280x720_1mb.mp4" data-se-file-size="1055736" data-se-index="1" style="width: 100%; height: 100%;"></video>
		// <iframe frameborder="0" allowfullscreen="" src="https://www.youtube.com/embed/zNPoScmAs3o" width="100%" height="56.25%" data-se-size="100%,56.25%" data-se-file-name="zNPoScmAs3o" data-se-file-size="0" data-se-index="0" style="width: 100%; height: 100%;"></iframe>
		// <p>sfds&nbsp;<a class="se-component se-inline-component" contenteditable="false" href="http://localhost:3000/editor/files/download/public/files/d31ed6f9e11d1661406efe5ed34328e5.pdf" download="document.pdf" data-se-file-download="" data-se-non-link="true" data-se-file-name="document.pdf" data-se-file-size="124826" data-se-size="auto,auto" name="document.pdf">document.pdf</a>&nbsp;fdsaf</p>
		// <div class="se-component se-file-figure se-flex-component"><figure><a href="http://localhost:3000/editor/files/download/public/files/d31ed6f9e11d1661406efe5ed34328e5.pdf" title="document.pdf" download="document.pdf" data-se-file-download="" data-se-non-link="true" contenteditable="false" data-se-non-focus="true" data-se-file-name="document.pdf" data-se-file-size="124826" data-se-index="0" data-se-size="auto,auto">document.pdf</a></figure></div>
		// <p>1234<div class="se-component se-image-container __se__float-center"><figure style="margin: auto;"><img src="http://suneditor.com/docs/cat.jpg" data-align="right" alt="Tabby" data-rotate="" data-proportion="false" data-rotatex="" data-rotatey="" origin-size="640,426" data-origin="640,426" style="transform: rotate(0deg);" data-index="0" data-file-name="cat.jpg" data-file-size="0" data-size="," data-percentage="auto,auto"><figcaption style="margin-top: 0px;"><p>Insert description</p></figcaption></figure></div>abcd</p>
		// <p>Here is an example of math -&gt; <span class="katex se-component se-inline-component" data-se-value="\\displaystyle\\sum_{i=1}^{k+1}i" data-se-type="1.5em" style="font-size: 1.5em;"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mstyle scriptlevel="0" displaystyle="true"><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mrow><mi>k</mi><mo>+</mo><mn>1</mn></mrow></munderover><mi>i</mi></mstyle></mrow><annotation encoding="application/x-tex">\displaystyle\sum_{i=1}^{k+1}i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:3.1137820000000005em;vertical-align:-1.277669em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8361130000000003em;"><span style="top:-1.872331em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathdefault mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.050005em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.300005em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathdefault mtight" style="margin-right:0.03148em;">k</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.277669em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord mathdefault">i</span></span></span></span> 123</p>
		// <p>123<span class="__se__katex katex se-component se-inline-component" contenteditable="false" data-se-value="\\displaystyle\\sum_{i=1}^{k+1}i" data-se-type="1em" style="font-size: 1em;"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mstyle scriptlevel="0" displaystyle="true"><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mrow><mi>k</mi><mo>+</mo><mn>1</mn></mrow></munderover><mi>i</mi></mstyle></mrow><annotation encoding="application/x-tex">\displaystyle\sum_{i=1}^{k+1}i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:3.1138em;vertical-align:-1.2777em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8361em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.03148em;">k</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">i</span></span></span></span>456</p>
		// <h3>The Suneditor is based on pure JavaScript, with no dependencies.</h3>
		// <pre>Suneditor is a lightweight, flexible, customizable WYSIWYG text editor for your web applications.</pre>
		// <blockquote><p>Supports Chrome, Safari, Opera, Firefox, Edge, IE11, Mobile web browser.</p></blockquote>
		// <p><strong><span style="color: rgb(255, 94, 0);">SunEditor</span></strong>&nbsp;<em><span style="background-color: rgb(250, 237, 125);">distributed under</span></em>&nbsp;the <a href="https://github.com/JiHong88/SunEditor/blob/master/LICENSE.txt" target="_blank">MIT</a> license.</p>
		// <div class="se-component se-flex-component"><figure><audio style="" controls="true" data-se-file-name="ssss.mp3" data-se-file-size="0" src="http://localhost:3000/editor/files/download/public/files/ssss.mp3" data-se-index="0"></audio></figure></div>
		// <p><hr class="dashed"></p>
		// <p><span style="font-size: 16px;"><span style="font-family: Impact;">Table</span></span></p>
		// <table class="se-table-size-auto"><thead><tr><th><div>Column_1</div></th><th><div>Column_2</div></th><th><div>Column_3</div></th><th><div>Column_4</div></th><th><div>Column_5</div></th></tr></thead><tbody><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr></tbody></table>
		// <p><br></p>
		// <ul>
		// 	<li>Pasting from Microsoft Word and Excel.</li>
		// 	<li>Custom table selection, merge and split.</li>
		// 	<li>Media embed, images upload.</li>
		// 	<li>Can use CodeMirror, KaTeX.<ul><li>And.. many other features :)</li></ul></li>
		// </ul>
		// <p><br></p>
		// 		`,
		// 		value: `<div class="se-component se-image-container __se__float-none"><figure style="margin: auto;"><img src="http://suneditor.com/docs/cat.jpg" data-align="right" alt="Tabby" data-rotate="" data-proportion="false" data-rotatex="" data-rotatey="" origin-size="640,426" data-origin="640,426" style="transform: rotate(0deg);" data-index="0" data-file-name="cat.jpg" data-file-size="0" data-size="," data-percentage="auto,auto"><figcaption style="margin-top: 0px;"><p>Insert description</p></figcaption></figure></div>`,
		// 		value: `<div class="se-component se-image-container __se__float-none"><figure style="margin: auto;"><img src="http://suneditor.com/docs/cat.jpg" data-align="right" alt="Tabby" data-rotate="" data-proportion="false" data-rotatex="" data-rotatey="" origin-size="640,426" data-origin="640,426" style="transform: rotate(0deg);" data-index="0" data-file-name="cat.jpg" data-file-size="0" data-size="," data-percentage="auto,auto"></figure></div>`,
		// 		value: `<p>dsa<strong>dsa</strong><u><strong>dsadsadsa</strong></u><span style="color: #ff0000;"><u><strong>dsadasdsa</strong></u></span><br></p><p>test abc  sss</p>`,
		// 		// value: `<p>ㅁㄴㅇ d</p>
		// 		// <div class="se-component se-file-figure se-flex-component">
		// 		//   <figure class="">
		// 		// 	<a href="http://local.apim.skcloud.io:3000/main/files/download/uploads/readme/adf2fe5a-c651-43ca-a4b8-1b8b274a082b.jpg" title="0eb2ea0060997f63dd4544419eec6980.jpg" download="0eb2ea0060997f63dd4544419eec6980.jpg" data-se-file-download="" data-se-non-focus="true" data-se-non-link="true" data-se-file-name="0eb2ea0060997f63dd4544419eec6980.jpg" data-se-file-size="74182" name="0eb2ea0060997f63dd4544419eec6980.jpg" data-se-index="0">0eb2ea0060997f63dd4544419eec6980.jpg</a>
		// 		//   </figure>
		// 		// </div>`,
		// 		value: `
		// 		<p>dsa<strong>d&nbsp;&nbsp;&nbsp;&nbsp;sa</strong><u><strong>dsadsadsa</strong></u><span style="color: #ff0000"><u><strong>dsadasdsa</strong></u></span><br>
		// </p>
		value: `<p>test abc  <span>
		<img src="http://suneditor.com/docs/welsh Corgi.jpg" alt="Welsh Corgi" data-se-file-name="welsh%20Corgi.jpg" data-se-file-size="0" data-se-size="auto,auto" style="width:40px;" data-se-index="0">
		</span>
		sss</p>
		<p>test abc  <span>
		<img src="http://suneditor.com/docs/welsh Corgi.jpg">
		</span>
		sss</p>`,
		value: `
		<h1>Header~1</h1>
		<p>test fdste text</p>
		<h2>header 22222</h2>
		<p>2222222</p>
		<p>2222222aa</p>
		<p>2222222sadsa</p>
		<p>2222222sadsa</p>
		<p>2222222sadsa</p>
		<p>2222222sadsa</p>
		<p>2222222sadsa</p>
		<h3>header33333</h3>
		<p>33333</p>
		<p>aafffff</p>
		<h4>hdaedde444</h4>
		<p>4894984o8p</p>
		<p>4894984o8p</p>
		<p>4894984o8p</p>
		<p>4894984o8p</p>
		<h5>header55555</h5>
		<p>ndfjsjio;dfsaji;fads</p>
		<p>dfs78oyfeaw</p>
		<h6>header66666</h6>
		<p>asfhjfds</p>
		<p>fdsaa99999</p>
		<h1>Header~1</h1>
		<p>test fdste text</p>
		<h2>header 22222</h2>
		<p>2222222</p>
		<p>2222222aa</p>
		<p>2222222sadsa</p>
		<p>2222222sadsa</p>
		<p>2222222sadsa</p>
		<p>2222222sadsa</p>
		<p>2222222sadsa</p>
		<h3>header33333</h3>
		<p>33333</p>
		<p>aafffff</p>
		<h4>hdaedde444</h4>
		<p>4894984o8p</p>
		<p>4894984o8p</p>
		<p>4894984o8p</p>
		<p>4894984o8p</p>
		<h5>header55555</h5>
		<p>ndfjsjio;dfsaji;fads</p>
		<p>dfs78oyfeaw</p>
		<h6>header66666</h6>
		<p>asfhjfds</p>
		<p>fdsaa99999</p>
		<h1>Header~1</h1>
		<p>test fdste text</p>
		<h2>header 22222</h2>
		<p>2222222</p>
		<p>2222222aa</p>
		<p>2222222sadsa</p>
		<p>2222222sadsa</p>
		<p>2222222sadsa</p>
		<p>2222222sadsa</p>
		<p>2222222sadsa</p>
		<h3>header33333</h3>
		<p>33333</p>
		<p>aafffff</p>
		<h4>hdaedde444</h4>
		<p>4894984o8p</p>
		<p>4894984o8p</p>
		<p>4894984o8p</p>
		<p>4894984o8p</p>
		<h5>header55555</h5>
		<p>ndfjsjio;dfsaji;fads</p>
		<p>dfs78oyfeaw</p>
		<h6>header66666</h6>
		<p>asfhjfds</p>
		<p>fdsaa99999</p>
		<h1>Header~1</h1>
		<p>test fdste text</p>
		<h2>header 22222</h2>
		<p>2222222</p>
		<p>2222222aa</p>
		<p>2222222sadsa</p>
		<p>2222222sadsa</p>
		<p>2222222sadsa</p>
		<p>2222222sadsa</p>
		<p>2222222sadsa</p>
		<h3>header33333</h3>
		<p>33333</p>
		<p>aafffff</p>
		<h4>hdaedde444</h4>
		<p>4894984o8p</p>
		<p>4894984o8p</p>
		<p>4894984o8p</p>
		<p>4894984o8p</p>
		<h5>header55555</h5>
		<p>ndfjsjio;dfsaji;fads</p>
		<p>dfs78oyfeaw</p>
		<h6>header66666</h6>
		<p>asfhjfds</p>
		<p>fdsaa99999</p>
		`,
		// <p>test abc  sss</p>
		// 		`,
		// syncTab: true,
		iframe: true,
		height: '600px',
		type: 'document:header,page',
		iframe_cssFileName: ['suneditor', 'katex'],
		copyFormatKeepOn: true,
		// 		value: `<figure>
		//     <img src="https://blog.kakaocdn.net/dn/0QCnX/btqU7cMuFOZ/uVPVj1aIBNqINLQZGkuwa0/img.png" alt="">
		//     <figcaption>Home Edge Logo</figcaption>
		// </figure>`,
		// value: `<p><span style="color: #ff5e00;"><del><strong>fdsfdsafa</strong></del></span><br></p>`,
		plugins: plugins,
		allowedClassName: '.+',
		// toolbar_container: '#root_toolbar_container',
		attributeWhitelist: { '*': 'class' },
		// statusbar_container: '#root_statusbar_container',
		// shortcutsHint: false,
		/** codemirror6 -- */
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
		/** -- codemirror6 */
		/** codemirror5 -- */
		// codeMirror: {
		// 	src: Codemirror5
		// },
		/** -- codemirror5 */
		// iframe: true,
		// defaultLine: 'p',
		// __defaultFormatLine: 'H[1-6]|LI|TH|TD|DETAILS',
		retainStyleMode: 'repeat', // repeat, always, none
		toolbar_sticky: 0,
		lineAttrReset: 'id',
		// height: '600px',
		// charCounter_max: 1400,
		buttonList: bl,
		// buttonList: [
		// 	['newDocument', 'selectAll', 'undo', 'redo', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak'],
		// 	'|',
		// 	[':문단&글꼴-default.more_paragraph', 'font', 'fontSize', 'formatBlock', '|', 'paragraphStyle', 'blockquote'],
		// 	'|',
		// 	[':글자 스타일-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'backgroundColor', 'textStyle', 'copyFormat', 'removeFormat'],
		// 	'|',
		// 	[':리스트&라인-default.more_horizontal', 'outdent', 'indent', 'align', 'hr', 'list_numbered', 'list_bulleted', 'lineHeight'],
		// 	'|',
		// 	[':테이블&미디어-default.more_plus', 'table', 'link', 'image', 'video', 'fileUpload', 'anchor'],
		// 	'|',
		// 	['save'],
		// 	'|',
		// 	[':기타-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'math', 'exportPdf', 'print'],
		// 	'|'
		// ],
		iframe: true,
		subToolbar: {
			buttonList: [['bold', 'dir', 'dir_ltr', 'dir_rtl', 'save']],
			width: 'auto',
			mode: 'balloon' // balloon, balloon-always, balloon-block
		},
		keepStyleOnDelete: true,
		shortcuts: {
			// bold: ['s75', 'K'],
			italic: [],
			image: ['73', 'I'],
			list: ['76', 'L']
		},
		// theme: 'dark',
		math: {
			// katex: {
			// 	src: Katex
			// },
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
		// autoLinkify: false,
		// autoStyleify: [],
		// componentAutoSelect: true,
		link: {
			uploadUrl: 'http://localhost:3000/editor/files/upload',
			relList: ['alternate', 'author', 'external', 'help', 'license', 'next', 'follow', 'nofollow', 'noreferrer', 'noopener', 'prev', 'search', 'tag'],
			defaultRel: 'tag'
		},
		video: {
			uploadUrl: 'http://localhost:3000/editor/upload',
			createFileInput: true
		},
		imageGallery: {
			url: 'https://etyswjpn79.execute-api.ap-northeast-1.amazonaws.com/suneditor-demo'
		},
		image: {
			uploadUrl: 'http://localhost:3000/editor/upload',
			linkEnableFileUpload: true,
			allowMultiple: true,
			useFormatType: true,
			defaultFormatType: 'block'
		},
		audio: {
			uploadUrl: 'http://localhost:3000/editor/upload',
			createFileInput: true
		},
		table: {
			scrollType: 'x'
			// cellControllerPosition: 'cell'
		},
		fontColor: {
			disableHEXInput: true,
			items: [{ name: 'red', value: '#ff0000' }, '#ff5e00', '#ffe400', '#abf200', '#00d8ff', '#0055ff', '#6600ff', '#ff00dd', '#000000']
		},
		fileUpload: {
			uploadUrl: 'http://localhost:3000/editor/files/upload',
			// as: 'link',
			allowMultiple: true
		},
		exportPdf: {
			apiUrl: 'http://localhost:3000/editor/download-pdf'
		},
		fontSize: {
			// showIncDecControls: true
			// disableInput: true,
			// sizeUnit: 'text',
			// showDefaultSizeLabel:true
		},
		mention: {
			apiUrl: 'https://74iuojmw16.execute-api.ap-northeast-1.amazonaws.com/suneditor-demo/SunEditor-sample-mention/{ key }?limit={limitSize}',
			useCachingFieldData: true
		},
		drawing: {
			// size: 22,
			// outputFormat: 'svg'
			// lineReconnect: true,
			// lineCap: 'square',  // butt, round, square
			// modalSizeWidth: '750px',
			// modalSizeHeight: '50vh'
		},
		externalLibs: {
			// math
			// katex: {
			// 	src: Katex
			// },
			mathjax: {
				src: mathjax,
				TeX,
				CHTML,
				browserAdaptor,
				RegisterHTMLHandler
			},
			// perfectFreehand: PerfectFreehand,
			html2canvas: html2canvas,
			jsPDF: jsPDF
			// codemirror
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
		},
		events: {
			// onFileAction: (data) => {
			// 	// console.log('fileaa', data);
			// },
			onVideoUploadBefore: ({ handler, info, files, file, url }) => {
				console.log('urlurl', files);
				return true;
			},
			onBlur() {
				console.log('blur');
			},
			onFocus() {
				console.log('focus');
			},
			onExportPdfBefore(params) {
				console.log('pdfbefore', params);
			},
			onImageAction(data) {
				console.log('ima', data);
			},
			onFontActionBefore(data) {
				console.log('fontbefore', data);
			}
			// onPaste(params) {
			// 	console.log('paste', params);
			// 	return params.editor.html.filter(params.html, { validate: (el) => {
			// 		console.log('el-----------------------------', el);
			// 		if (el.nodeName === 'SPAN') {
			// 			if (el.className.includes('katex')) {
			// 				return;
			// 			}
			// 			return el.innerHTML;
			// 		}
			// 	} })
			// },
			// onFileDeleteBefore(arg) {
			// 	console.log('delete file', arg);
			// 	return false;
			// },
			// onImageDeleteBefore(arg) {
			// 	console.log('delete image', arg);
			// 	return false;
			// },
			// onAudioDeleteBefore(arg) {
			// 	console.log('delete audio', arg);
			// 	return false;
			// },
			// onVideoDeleteBefore(arg) {
			// 	console.log('delete video', arg);
			// 	return false;
			// },
		}
	}
);

window.countEventListeners = function () {
	const elements = document.querySelectorAll('*');
	let totalListeners = 0;

	elements.forEach((element) => {
		const listeners = getEventListeners(element);
		for (let type in listeners) {
			totalListeners += listeners[type].length;
		}
	});

	return totalListeners;
};

editor_root.onload = () => {
	// editor_root.events.onFileAction = () => {
	// 	console.log('arguems', arguments);
	// };
};

window.aaa = function () {
	editor_root.html.insert('<p>aaaaaaaaa</p>');
};
window.create = function () {
	window.editor_root = suneditor.create(document.querySelector('#multi_editor_1'));
};
window.destroy = function () {
	editor_root.destroy();
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
		// editor_root.plugins.image._register(info, JSON.parse(xmlHttp.response));
	};
	window.editor_root.events.onImageUploadBefore = async (info) => {
		await delayedFunction();
		console.log('info', info);
		info.handler();
	};
	window.editor_root.events.onImageUpload = async ({ handler, info, files, file, url }) => {
		await delayedFunction();
		handler('http://suneditor.com/docs/cat.jpg');
	};
	window.editor_root.events.onImageUploadError = async (params) => {
		await delayedFunction();
		return 'aaa';
	};
	// window.editor_root.events.onBlur = async (e) => {
	// 	console.log('blurrrr', e.event);
	// };
	// window.editor_root.events.onFocus = async () => {
	// 	console.log('onFocusonFocusonFocus');
	// };
}

editor_root.events.onload = () => {
	// loadEvent();
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
