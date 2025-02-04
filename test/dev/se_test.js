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
// import imageGallery from '../../src/plugins/browser/imageGallery';
import plugins, { audio, exportPDF } from '../../src/plugins';

const bl = [
	['anchor', 'newDocument', 'selectAll', 'undo', 'redo', 'drawing', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak', 'dir'],
	['dir_ltr', 'dir_rtl'],
	['font', 'fontSize', 'formatBlock'],
	['paragraphStyle', 'blockquote'],
	['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
	['fontColor', 'backgroundColor', 'textStyle'],
	['copyFormat', 'removeFormat'],
	'/',
	['outdent', 'indent'],
	['align', 'hr', 'list', 'list_numbered', 'list_bulleted', 'lineHeight'],
	['table', 'link', 'image', 'video', 'embed', 'audio', 'math'],
	['imageGallery', 'videoGallery', 'audioGallery', 'fileGallery', 'fileBrowser'],
	['fullScreen', 'showBlocks', 'codeView'],
	['preview', 'print'],
	['save', 'template', 'layout', 'fileUpload', 'exportPDF', 'mention'],
	// (min-width: 1565)
	[
		'%1565',
		[
			['anchor', 'newDocument', 'selectAll', 'undo', 'redo', 'drawing', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak'],
			['font', 'fontSize', 'formatBlock'],
			['paragraphStyle', 'blockquote'],
			['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
			['fontColor', 'backgroundColor', 'textStyle'],
			['copyFormat', 'removeFormat'],
			['outdent', 'indent'],
			['align', 'hr', 'list', 'list_numbered', 'list_bulleted', 'lineHeight'],
			['table', 'link', 'image', 'video', 'embed', 'audio', 'math'],
			['imageGallery', 'videoGallery', 'audioGallery', 'fileGallery', 'fileBrowser'],
			['fullScreen', 'showBlocks', 'codeView'],
			['-right', ':More Misc-default.more_vertical', 'preview', 'print', 'save', 'template', 'layout', 'fileUpload', 'exportPDF', 'mention']
		]
	],
	// (min-width: 1455)
	[
		'%1455',
		[
			['anchor', 'newDocument', 'selectAll', 'undo', 'redo', 'drawing', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak'],
			['font', 'fontSize', 'formatBlock'],
			['paragraphStyle', 'blockquote'],
			['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
			['fontColor', 'backgroundColor', 'textStyle'],
			['copyFormat', 'removeFormat'],
			['outdent', 'indent'],
			['align', 'hr', 'list', 'list_numbered', 'list_bulleted', 'lineHeight'],
			['table', 'link', 'image', 'video', 'embed', 'audio', 'math'],
			['imageGallery', 'videoGallery', 'audioGallery', 'fileGallery', 'fileBrowser'],
			['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout', 'fileUpload', 'exportPDF', 'mention']
		]
	],
	// (min-width: 1326)
	[
		'%1326',
		[
			['anchor', 'newDocument', 'selectAll', 'undo', 'redo', 'drawing', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak'],
			['font', 'fontSize', 'formatBlock'],
			['paragraphStyle', 'blockquote'],
			['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
			['fontColor', 'backgroundColor', 'textStyle'],
			['copyFormat', 'removeFormat'],
			['outdent', 'indent'],
			['align', 'hr', 'list', 'list_numbered', 'list_bulleted', 'lineHeight'],
			['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout', 'fileUpload', 'exportPDF', 'mention'],
			['-right', ':More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'embed', 'audio', 'math', 'imageGallery', 'videoGallery', 'audioGallery', 'fileGallery', 'fileBrowser']
		]
	],
	// (min-width: 1123)
	[
		'%1123',
		[
			['anchor', 'newDocument', 'selectAll', 'undo', 'redo', 'drawing', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak'],
			[':More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
			['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
			['fontColor', 'backgroundColor', 'textStyle'],
			['copyFormat', 'removeFormat'],
			['outdent', 'indent'],
			['align', 'hr', 'list', 'list_numbered', 'list_bulleted', 'lineHeight'],
			['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout', 'fileUpload', 'exportPDF', 'mention'],
			['-right', ':More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'embed', 'audio', 'math', 'imageGallery', 'videoGallery', 'audioGallery', 'fileGallery', 'fileBrowser']
		]
	],
	// (min-width: 817)
	[
		'%817',
		[
			['anchor', 'newDocument', 'selectAll', 'undo', 'redo', 'drawing', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak'],
			[':More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
			['bold', 'underline', 'italic', 'strike'],
			[':More Text-default.more_text', 'subscript', 'superscript', 'fontColor', 'backgroundColor', 'textStyle'],
			['copyFormat', 'removeFormat'],
			['outdent', 'indent'],
			['align', 'hr', 'list', 'list_numbered', 'list_bulleted', 'lineHeight'],
			['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout', 'fileUpload', 'exportPDF', 'mention'],
			['-right', ':More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'embed', 'audio', 'math', 'imageGallery', 'videoGallery', 'audioGallery', 'fileGallery', 'fileBrowser']
		]
	],
	// (min-width: 673)
	[
		'%673',
		[
			['anchor', 'newDocument', 'selectAll', 'undo', 'redo', 'drawing', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak'],
			[':More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
			[':More Text-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'backgroundColor', 'textStyle'],
			['copyFormat', 'removeFormat'],
			['outdent', 'indent'],
			['align', 'hr', 'list', 'list_numbered', 'list_bulleted', 'lineHeight'],
			[':More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'embed', 'audio', 'math', 'imageGallery', 'videoGallery', 'audioGallery', 'fileGallery', 'fileBrowser'],
			['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout', 'fileUpload', 'exportPDF', 'mention']
		]
	],
	// (min-width: 525)
	[
		'%525',
		[
			['anchor', 'newDocument', 'selectAll', 'undo', 'redo', 'drawing', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak'],
			[':More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
			[':More Text-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'backgroundColor', 'textStyle'],
			['copyFormat', 'removeFormat'],
			['outdent', 'indent'],
			[':More Line-default.more_horizontal', 'align', 'hr', 'list', 'list_numbered', 'list_bulleted', 'lineHeight'],
			[':More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'embed', 'audio', 'math', 'imageGallery', 'videoGallery', 'audioGallery', 'fileGallery', 'fileBrowser'],
			['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout', 'fileUpload', 'exportPDF', 'mention']
		]
	],
	// (min-width: 420)
	[
		'%420',
		[
			['anchor', 'newDocument', 'selectAll', 'undo', 'redo', 'drawing', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak'],
			[':lang.test-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
			[':More Text-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'backgroundColor', 'textStyle', 'copyFormat', 'removeFormat'],
			[':More Line-default.more_horizontal', 'outdent', 'indent', 'align', 'hr', 'list', 'list_numbered', 'list_bulleted', 'lineHeight'],
			[':More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'embed', 'audio', 'math', 'imageGallery', 'videoGallery', 'audioGallery', 'fileGallery', 'fileBrowser'],
			['-right', ':More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template', 'layout', 'fileUpload', 'exportPDF', 'mention']
		]
	]
];

const bb = [
	['anchor', 'newDocument', 'selectAll', 'undo', 'redo', 'drawing', '|', 'pageUp', 'pageDown', 'pageNavigator', 'pageBreak', 'dir'],
	['dir_ltr', 'dir_rtl'],
	['font', 'fontSize', 'formatBlock'],
	['paragraphStyle', 'blockquote'],
	['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
	['fontColor', 'backgroundColor', 'textStyle'],
	['copyFormat', 'removeFormat'],
	'/',
	['outdent', 'indent'],
	['align', 'hr', 'list', 'list_numbered', 'list_bulleted', 'lineHeight'],
	['table', 'link', 'image', 'video', 'embed', 'audio', 'math'],
	['imageGallery', 'videoGallery', 'audioGallery', 'fileGallery', 'fileBrowser'],
	['fullScreen', 'showBlocks', 'codeView'],
	['preview', 'print'],
	['save', 'template', 'layout', 'fileUpload', 'exportPDF', 'mention']
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
		// strictMode: false,
		// lang: langs.ko,
		// value: `<figure class="se-flex-component se-scroll-figure-x"><table class="se-size-100 se-table-layout-auto" ><colgroup><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"><col style="width: 10%;"></colgroup><tbody><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td colspan="2" rowspan="2"><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td colspan="1" rowspan="4"><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td colspan="2" rowspan="1"><div><br></div></td><td colspan="1" rowspan="2"><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td colspan="2" rowspan="1"><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr></tbody></table></figure>`,
		// value: `<p>sadas1<span class="__se__katex katex" data-se-value="l;l;;l" data-se-type="1em" style="font-size: 1em;"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>l</mi><mo separator="true">;</mo><mi>l</mi><mo separator="true">;</mo><mo separator="true">;</mo><mi>l</mi></mrow><annotation encoding="application/x-tex">l;l;;l</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mpunct">;;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span></span></span></span>​​<br></p><p>sadas2</p><figure class="se-flex-component"><table style=""><colgroup><col style="width: 33%;"><col style="width: 33%;"><col style="width: 33%;"></colgroup><tbody><tr><td><div>sdd<br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr></tbody></table></figure><div class="se-component se-file-figure se-flex-component"><figure><a href="https://link.testfile.org/30MB" title="document.pdf" download="document.pdf" data-se-file-download="" data-se-non-link="true" data-se-file-name="document.pdf" data-se-file-size="124826" data-se-size="auto,auto" contenteditable="false">document.pdf</a></figure></div><p>sadas3<br></p><p>sadas4<br></p><p>sadas5<br></p><p>sadas6<br></p><p>dsads<a href="http://localhost:3000/public/files/d5d13802a01dd4dea399c912f7b31e5e.png" download="1571311368279.png" name="1571311368279.png">1571311368279.png</a>​<br></p><div class="se-component se-image-container __se__float-none"><figure><img src="http://suneditor.com/docs/welsh Corgi.jpg" alt="Welsh Corgi" data-se-file-name="welsh%20Corgi.jpg" data-se-file-size="0" data-se-size="auto,auto" style="" data-se-index="0"></figure></div><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p><p>sadas<br></p>`,
		// value: `<p>sadas1<span class="__se__katex katex" data-se-value="l;l;;l" data-se-type="1em" style="font-size: 1em;"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>l</mi><mo separator="true">;</mo><mi>l</mi><mo separator="true">;</mo><mo separator="true">;</mo><mi>l</mi></mrow><annotation encoding="application/x-tex">l;l;;l</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mpunct">;;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span></span></span></span>​​<br></p><p>sadas2</p><figure class="se-flex-component"><table style=""><colgroup><col style="width: 33%;"><col style="width: 33%;"><col style="width: 33%;"></colgroup><tbody><tr><td><div>sdd<br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr></tbody></table></figure><div class="se-component se-file-figure se-flex-component"><figure><a href="http://localhost:3000/editor/files/download/public/files/d31ed6f9e11d1661406efe5ed34328e5.pdf" title="document.pdf" download="document.pdf" data-se-file-download="" data-se-non-link="true" data-se-file-name="document.pdf" data-se-file-size="124826" data-se-index="0" data-se-size="auto,auto" contenteditable="false">document.pdf</a></figure></div><div class="se-component se-image-container __se__float-none"><figure><img src="http://suneditor.com/docs/welsh Corgi.jpg" alt="Welsh Corgi" data-se-file-name="welsh%20Corgi.jpg" data-se-file-size="0" data-se-size="auto,auto" style="" data-se-index="0"></figure></div>`,
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
		<div class="se-component se-image-container __se__float-none se-component-selected"><figure style="" class="se-figure-over-selected se-figure-selected"><img src="http://suneditor.com/docs/welsh Corgi.jpg" alt="Welsh Corgi" style="" width="auto" height="auto" data-se-size="auto,auto" data-se-file-name="Welsh Corgi" data-se-file-size="0" data-se-index="0"></figure></div>
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
		value: `<h1>Header~1</h1><p>test fdste text</p><div class="se-component se-image-container __se__float-none"><figure><img src="http://suneditor.com/docs/welsh Corgi.jpg" alt="Welsh Corgi" data-se-size="auto,auto" data-se-file-name="Welsh Corgi" data-se-file-size="0" style="" data-se-index="0"></figure></div><h2>header 22222</h2><p>2222222</p><p>2222222aa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><h3>header33333</h3><p>33333</p><p>aafffff</p><h4>hdaedde444</h4><figure class="se-flex-component se-input-component se-scroll-figure-x" style="width: 100%;"><table class="se-table-layout-auto" style=""><colgroup><col style="width: 13%;"><col style="width: 13%;"><col style="width: 13%;"><col style="width: 13%;"><col style="width: 13%;"><col style="width: 13%;"><col style="width: 13%;"><col style="width: 13%;"></colgroup><tbody><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr><tr><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td><td><div><br></div></td></tr></tbody></table></figure><p>4894984o8p</p><p>4894984o8p</p><p>4894984o8p</p><p>4894984o8p</p><h5>header55555</h5><p>ndfjsjio;dfsaji;fads</p><p>dfs78oyfeaw</p><h6>header66666</h6><p>asfhjfds</p><p>fdsaa99999</p><h1>Header~1</h1><p>test fdste text</p><h2>header 22222</h2><p>2222222</p><p>2222222aa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><h3>header33333</h3><p>33333</p><p>aafffff</p><h4>hdaedde444</h4><p>4894984o8p</p><p>4894984o8p</p><p>4894984o8p</p><p>4894984o8p</p><h5>header55555</h5><p>ndfjsjio;dfsaji;fads</p><p>dfs78oyfeaw</p><h6>header66666</h6><p>asfhjfds</p><p>fdsaa99999</p><h1>Header~1</h1><p>test fdste text</p><h2>header 22222</h2><p>2222222</p><p>2222222aa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><h3>header33333</h3><p>33333</p><p>aafffff</p><h4>hdaedde444</h4><p>4894984o8p</p><p>4894984o8p</p><p>4894984o8p</p><p>4894984o8p</p><h5>header55555</h5><p>ndfjsjio;dfsaji;fads</p><p>dfs78oyfeaw</p><h6>header66666</h6><p>asfhjfds</p><p>fdsaa99999</p><h1>Header~1</h1><p>test fdste text</p><h2>header 22222</h2><p>2222222</p><p>2222222aa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><p>2222222sadsa</p><h3>header33333</h3><p>33333</p><p>aafffff</p><h4>hdaedde444</h4><p>4894984o8p</p><p>4894984o8p</p><p>4894984o8p</p><p>4894984o8p</p><h5>header55555</h5><p>ndfjsjio;dfsaji;fads</p><p>dfs78oyfeaw</p><h6>header66666</h6><p>asfhjfds</p><p>fdsaa99999</p>`,
		// 		value: `<div class="se-component se-video-container __se__float-none" style="width: 100%;">
		//   <figure style="width: 100%; height: 56.25%; padding-bottom: 56.25%;" class="">
		//     <video controls="true" src="http://localhost:3000/public/files/d55bddf8d62910879ed9f605522149a8.mp4" width="100%" height="56.25%" data-se-size="100%,56.25%" data-se-file-name="SampleVideo_1280x720_1mb.mp4" data-se-file-size="1055736" data-se-index="0" style="width: 100%; height: 100%;"></video>
		//   </figure>
		// </div>
		// <p><br>
		// </p>
		// `,
		// <p>test abc  sss</p>
		// 		`,
		// syncTabIndent: true,
		// iframe: true,
		// height: '600px',
		// maxWidth: '1000px',
		// value: `<div class="wrap_800 article_type_1"><br />
		// 	<div class="section section_01">
		// 		<div class="detail_cont_box">
		// 			<h3 class="first_h3">
		// 				<img class="emoji like_pin" alt="📍" src="https://s.w.org/images/core/emoji/15.0.3/svg/1f4cd.svg" />

		// 				"상큼한 레몬수로 건강하고 활기찬 일상 시작하기!"
		// 			</h3>
		// 			<div class="img_box">
		// 				<img src="https://i.imgur.com/hfHHulc.png" alt="레몬수" title="컵에 담긴 레몬수 사진" />

		// 			</div>
		// 			<div class="text_box">
		// 				<span>
		// 					레몬수가 요즘 핫한 웰빙 트렌드로 자리 잡고 있습니다.
		// 					새콤달콤한 레몬으로 만든 시원한 음료 한 잔이 더위를 날려줄 뿐만 아니라, 건강까지 챙길 수 있다면?<br />
		// 					오늘은 레몬수의 놀라운 효능과 함께, 레몬을 다양하게 활용할 수 있는 레몬큐브 만드는 법을 소개합니다.<br />
		// 					또한, 모든 과정에서 최고의 성능을 자랑하는 테팔 블렌드포스 믹서기의 활용법까지! 건강과 맛을 모두 잡는 방법, 지금부터
		// 					만나보세요.
		// 				</span>
		// 			</div>

		// 		</div>
		// 		<hr />
		// 		<div class="detail_cont_box">
		// 			<h3>이 아티클은 이런 분들에게 유용합니다!</h3>
		// 			<div class="text_box">
		// 				<span class="contain_img"><img class="emoji_chk" alt="✅" src="https://s.w.org/images/core/emoji/15.0.3/svg/2705.svg" /> 새로운 주방용품 구입을 고민하는 분들</span>
		// 				<span class="contain_img"><img class="emoji_chk" alt="✅" src="https://s.w.org/images/core/emoji/15.0.3/svg/2705.svg" /> 품질 좋은 주방용품을 오랫동안 사용하고 싶은 분들</span>
		// 				<span class="contain_img"><img class="emoji_chk" alt="✅" src="https://s.w.org/images/core/emoji/15.0.3/svg/2705.svg" /> 환경보호를 생각하며 지속 가능한 소비를 추구하는 분들</span>

		// 			</div>

		// 		</div>
		// 		<hr />
		// 		<div class="detail_cont_box">
		// 			<h3>레몬수를 왜 먹을까요? 효능에 대한 모든 것!</h3>
		// 			<div class="text_box">
		// 				<span>레몬수는 단순히 상큼한 맛을 즐기기 위한 음료가 아닙니다.</span>
		// 				<span>하루 한 잔의 레몬수는 피부부터 신장까지 관리할 수 있는 '마법의 음료'라 불리는 이유가 따로 있죠.</span>
		// 				<span>그 안에 숨겨진 놀라운 건강 효능을 살펴보겠습니다. 레몬수를 마시면 어떤 효과를 기대할 수 있을까요?</span>
		// 			</div>

		// 		</div>
		// 	</div>
		// 	<div class="section section_02">
		// 		<div class="img_box">
		// 			<img src="https://i.imgur.com/Z4gQNYt.png" alt="레몬수" title="컵에 레몬수를 따르는 사진" />

		// 		</div>
		// 		<div class="text_box">
		// 			<span class="mini_title">1. 비타민 C 폭탄! 피부와 면역력을 동시에</span>
		// 			<span>레몬수 한 잔에 담긴 비타민 C는 피로 해소는 물론, 피부를 더욱 맑고 투명하게 가꿔줍니다.</span>
		// 			<span>하루 한 잔의 레몬수가 우리 몸의 항산화 작용을 촉진하고, 스트레스와 노화를 예방해 줍니다.</span>
		// 			<span>일상의 활력을 채워주는 비타민 C 폭탄을 경험해 보세요.</span>
		// 		</div>
		// 		<div class="text_box">
		// 			<span class="mini_title">2. 다이어트의 비밀, 체중 감소와 소화 개선</span>
		// 			<span>다이어트를 하고 있다면 레몬수를 절대 놓치지 마세요!</span>
		// 			<span>레몬수는 소화를 돕고 장운동을 촉진해 복부 팽만감을 해소해 줍니다.</span>
		// 			<span>또한, 칼륨이 나트륨을 조절해 부기를 완화해 주므로, 규칙적인 섭취로 체중 감소의 효과까지 기대할 수 있습니다..</span>
		// 		</div>
		// 		<div class="text_box">
		// 			<span class="mini_title">3. 심혈관 건강을 지키는 든든한 수호자</span>
		// 			<span>레몬에는 혈관을 강화해 주는 펙틴과 몸속 노폐물을 제거하는 구연산이 풍부합니다.</span>
		// 			<span>이러한 성분들은 혈압을 낮추고 심혈관 질환을 예방하는 데 탁월한 효과가 있어,</span>
		// 			<span>레몬수를 매일 마시는 것만으로도 심장 건강을 챙길 수 있습니다.</span>
		// 		</div>
		// 		<div class="text_box">
		// 			<span class="mini_title">4. 신장 결석 예방, 상큼한 디톡스 효과</span>
		// 			<span>신장 결석을 예방하고 싶은 분들에게도 레몬수는 훌륭한 해결책입니다.</span>
		// 			<span>레몬에 함유된 구연산이 체액을 증가시켜 소변을 중화하고, 요로에 노폐물이 쌓이지 않도록 도와줍니다.</span>
		// 			<span>간단하게 레몬수로 디톡스 하세요!</span>
		// 		</div>
		// 	</div>
		// 	<div class="section section_03">
		// 		<div class="img_box">
		// 			<img src="https://i.imgur.com/GKQEJZP.png" alt="대용량 레몬즙, 레몬즙 스틱, 직접 레몬즙 착즙하기" />

		// 		</div>
		// 		<hr />
		// 		<div class="text_box">
		// 			<h3>레몬수는 어떻게 음용할 수 있을까요? 간편하게 즐기는 레몬수 섭취 방법!</h3>
		// 			<div class="h3_des">
		// 				<span>레몬수는 상쾌한 맛과 함께 건강 효과를 제공하는 훌륭한 음료이지만, 매일 꾸준히 마시는 게 생각보다 어려울 수 있죠.</span>
		// 				<span>그렇다면 여러분의 라이프스타일에 맞는 섭취 방법을 찾아보세요!</span>
		// 				<span>오늘은 레몬수를 즐길 수 있는 세 가지 간편한 음용 방식을 소개해 드리겠습니다.</span>
		// 				<span>어떤 방법이 여러분에게 가장 잘 맞을까요?</span>
		// 			</div>
		// 		</div>
		// 		<div class="text_box">
		// 			<span class="mini_title">1. 레몬즙 스틱: 언제 어디서나 간편하게!</span>
		// 			<span>레몬즙 스틱은 바쁜 일상에서도 쉽게 레몬수를 섭취할 수 있는 최고의 방법입니다. 출근길이나 여행 중에도 물만 있으면 상쾌한 레몬수를 빠르게 만들 수 있어 휴대가 간편하고 위생적이죠. 언제 어디서나 빠르고 간편하게 레몬수를 즐길 수 있습니다.</span>
		// 		</div>
		// 		<div class="text_box">
		// 			<span class="mini_title">2. 대용량 레몬즙 통: 자유로운 양 조절과 경제성!</span>
		// 			<span>레몬수를 자주 마시거나 요리에도 활용하고 싶다면 대용량 레몬즙이 좋은 선택입니다. 자유롭게 양을 조절할 수 있어 다용도로 활용할 수 있으며, 경제적인 면에서도 유리합니다. 보관 시 신선도를 유지하기에 어려움이 있지만, 꾸준히 섭취하고자 하신다면 효율적인 선택입니다.</span>
		// 		</div>
		// 		<div class="text_box">
		// 			<span class="mini_title">3. 직접 레몬즙 착즙하기: 신선함은 그대로!</span>
		// 			<span>가장 신선하고 건강한 방법을 찾고 있다면, 직접 레몬을 착즙해 섭취하는 것이 답입니다. 방부제나 첨가물 없이 레몬 본연의 영양을 그대로 섭취할 수 있죠. 시간과 노력이 들어가지만, 최고의 신선함을 원한다면 직접 착즙이 가장 좋은 방법입니다.</span>
		// 		</div>
		// 	</div>
		// 	<div class="section section_04">
		// 		<div class="img_box">
		// 			<img src="https://i.imgur.com/IU0cWFV.png" alt="테팔 블렌드포스 믹서기" />

		// 		</div>
		// 		<hr />
		// 		<div class="detail_cont_box">
		// 			<h3>테팔 블렌드포스 믹서기로 일상을 더 편리하게 만드는 이유!”</h3>
		// 			<div class="text_box">
		// 				<span class="mini_title contain_img"><img class="emoji_rhombus" alt="🔸" src="https://s.w.org/images/core/emoji/15.0.3/svg/1f538.svg" /> 강력한 성능과 간편한 사용성</span>
		// 				<span>테팔 블렌드포스 믹서기는 강력한 22000RPM 모터와 파워엘릭스 기술로 단단한 재료도 손쉽게 분쇄합니다.
		// 					편리하게 분리할 수 있는 칼날 덕분에 세척이 간편하며, 1.75L 대용량 내열 유리 용기로 많은 양을 한 번에 블렌딩할 수 있어
		// 					요리에 더욱 유용합니다.
		// 				</span>
		// 			</div>
		// 			<div class="text_box">
		// 				<span class="mini_title contain_img"><img class="emoji_rhombus" alt="🔸" src="https://s.w.org/images/core/emoji/15.0.3/svg/1f538.svg" /> 이중 잠금으로 안전하게</span>
		// 				<span>스마트 잠금 방식으로 안전하게 사용할 수 있어, 언제나 안심하고 요리할 수 있습니다. 안전을 고려한 설계로, 블렌딩이 더욱 즐거워집니다.</span>

		// 			</div>

		// 		</div>
		// 		<hr />
		// 		<div class="text_box">
		// 			<h3>레몬수와 레몬큐브로 매일 상쾌하고 건강하게 살아가는 법!</h3>
		// 			<span>레몬수와 레몬큐브는 단순한 음료를 넘어, 상큼함과 건강을 동시에 잡을 수 있는 최고의 아이템입니다.</span>
		// 			<span>특히 테팔 블렌드포스 믹서기를 사용하면 간편하게 레몬큐브를 만들어 매일매일 신선한 맛과 영양을 즐길 수 있습니다.</span>
		// 			<span>이제부터는 매일 아침 상큼한 레몬수로 건강을 챙기고, 레몬큐브로 다양한 요리에 생기를 불어넣어 보세요.</span>
		// 			<span>이 작은 변화가 당신의 하루를 얼마나 상쾌하고 특별하게 만들지 기대해 보세요!</span>
		// 		</div>
		// 	</div>
		// </div>`,
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
		// 	[':테이블&미디어-default.more_plus', 'table', 'link', 'image', 'video', 'embed', 'fileUpload', 'anchor'],
		// 	'|',
		// 	['save'],
		// 	'|',
		// 	[':기타-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'math', 'exportPDF', 'print'],
		// 	'|'
		// ],
		// iframe: true,
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
		// strictMode: false,
		// freeCodeViewMode: true,
		value: `<div class="wrap_800 article_type_1"><br />
			<div class="section section_01">
				<div class="detail_cont_box">
					<h3 class="first_h3">
						<img class="emoji like_pin" alt="📍" src="https://s.w.org/images/core/emoji/15.0.3/svg/1f4cd.svg" />
						
						"상큼한 레몬수로 건강하고 활기찬 일상 시작하기!"
					</h3>
					<div class="img_box">
						<img src="https://i.imgur.com/hfHHulc.png" alt="레몬수" title="컵에 담긴 레몬수 사진" />
						
					</div>
					<div class="text_box">
						<span>
							레몬수가 요즘 핫한 웰빙 트렌드로 자리 잡고 있습니다.
							새콤달콤한 레몬으로 만든 시원한 음료 한 잔이 더위를 날려줄 뿐만 아니라, 건강까지 챙길 수 있다면?<br />
							오늘은 레몬수의 놀라운 효능과 함께, 레몬을 다양하게 활용할 수 있는 레몬큐브 만드는 법을 소개합니다.<br />
							또한, 모든 과정에서 최고의 성능을 자랑하는 테팔 블렌드포스 믹서기의 활용법까지! 건강과 맛을 모두 잡는 방법, 지금부터
							만나보세요.
						</span>
					</div>
				
				</div>
				<hr />
				<div class="detail_cont_box">
					<h3>이 아티클은 이런 분들에게 유용합니다!</h3>
					<div class="text_box">
						<span class="contain_img"><img class="emoji_chk" alt="✅" src="https://s.w.org/images/core/emoji/15.0.3/svg/2705.svg" /> 새로운 주방용품 구입을 고민하는 분들</span>
						<span class="contain_img"><img class="emoji_chk" alt="✅" src="https://s.w.org/images/core/emoji/15.0.3/svg/2705.svg" /> 품질 좋은 주방용품을 오랫동안 사용하고 싶은 분들</span>
						<span class="contain_img"><img class="emoji_chk" alt="✅" src="https://s.w.org/images/core/emoji/15.0.3/svg/2705.svg" /> 환경보호를 생각하며 지속 가능한 소비를 추구하는 분들</span>
						
					</div>
				
				</div>
				<hr />
				<div class="detail_cont_box">
					<h3>레몬수를 왜 먹을까요? 효능에 대한 모든 것!</h3>
					<div class="text_box">
						<span>레몬수는 단순히 상큼한 맛을 즐기기 위한 음료가 아닙니다.</span>
						<span>하루 한 잔의 레몬수는 피부부터 신장까지 관리할 수 있는 '마법의 음료'라 불리는 이유가 따로 있죠.</span>
						<span>그 안에 숨겨진 놀라운 건강 효능을 살펴보겠습니다. 레몬수를 마시면 어떤 효과를 기대할 수 있을까요?</span>
					</div>
				
				</div>
			</div>
			<div class="section section_02">
				<div class="img_box">
					<img src="https://i.imgur.com/Z4gQNYt.png" alt="레몬수" title="컵에 레몬수를 따르는 사진" />
					
				</div>
				<div class="text_box">
					<span class="mini_title">1. 비타민 C 폭탄! 피부와 면역력을 동시에</span>
					<span>레몬수 한 잔에 담긴 비타민 C는 피로 해소는 물론, 피부를 더욱 맑고 투명하게 가꿔줍니다.</span>
					<span>하루 한 잔의 레몬수가 우리 몸의 항산화 작용을 촉진하고, 스트레스와 노화를 예방해 줍니다.</span>
					<span>일상의 활력을 채워주는 비타민 C 폭탄을 경험해 보세요.</span>
				</div>
				<div class="text_box">
					<span class="mini_title">2. 다이어트의 비밀, 체중 감소와 소화 개선</span>
					<span>다이어트를 하고 있다면 레몬수를 절대 놓치지 마세요!</span>
					<span>레몬수는 소화를 돕고 장운동을 촉진해 복부 팽만감을 해소해 줍니다.</span>
					<span>또한, 칼륨이 나트륨을 조절해 부기를 완화해 주므로, 규칙적인 섭취로 체중 감소의 효과까지 기대할 수 있습니다..</span>
				</div>
				<div class="text_box">
					<span class="mini_title">3. 심혈관 건강을 지키는 든든한 수호자</span>
					<span>레몬에는 혈관을 강화해 주는 펙틴과 몸속 노폐물을 제거하는 구연산이 풍부합니다.</span>
					<span>이러한 성분들은 혈압을 낮추고 심혈관 질환을 예방하는 데 탁월한 효과가 있어,</span>
					<span>레몬수를 매일 마시는 것만으로도 심장 건강을 챙길 수 있습니다.</span>
				</div>
				<div class="text_box">
					<span class="mini_title">4. 신장 결석 예방, 상큼한 디톡스 효과</span>
					<span>신장 결석을 예방하고 싶은 분들에게도 레몬수는 훌륭한 해결책입니다.</span>
					<span>레몬에 함유된 구연산이 체액을 증가시켜 소변을 중화하고, 요로에 노폐물이 쌓이지 않도록 도와줍니다.</span>
					<span>간단하게 레몬수로 디톡스 하세요!</span>
				</div>
			</div>
			<div class="section section_03">
				<div class="img_box">
					<img src="https://i.imgur.com/GKQEJZP.png" alt="대용량 레몬즙, 레몬즙 스틱, 직접 레몬즙 착즙하기" />
					
				</div>
				<hr />
				<div class="text_box">
					<h3>레몬수는 어떻게 음용할 수 있을까요? 간편하게 즐기는 레몬수 섭취 방법!</h3>
					<div class="h3_des">
						<span>레몬수는 상쾌한 맛과 함께 건강 효과를 제공하는 훌륭한 음료이지만, 매일 꾸준히 마시는 게 생각보다 어려울 수 있죠.</span>
						<span>그렇다면 여러분의 라이프스타일에 맞는 섭취 방법을 찾아보세요!</span>
						<span>오늘은 레몬수를 즐길 수 있는 세 가지 간편한 음용 방식을 소개해 드리겠습니다.</span>
						<span>어떤 방법이 여러분에게 가장 잘 맞을까요?</span>
					</div>
				</div>
				<div class="text_box">
					<span class="mini_title">1. 레몬즙 스틱: 언제 어디서나 간편하게!</span>
					<span>레몬즙 스틱은 바쁜 일상에서도 쉽게 레몬수를 섭취할 수 있는 최고의 방법입니다. 출근길이나 여행 중에도 물만 있으면 상쾌한 레몬수를 빠르게 만들 수 있어 휴대가 간편하고 위생적이죠. 언제 어디서나 빠르고 간편하게 레몬수를 즐길 수 있습니다.</span>
				</div>
				<div class="text_box">
					<span class="mini_title">2. 대용량 레몬즙 통: 자유로운 양 조절과 경제성!</span>
					<span>레몬수를 자주 마시거나 요리에도 활용하고 싶다면 대용량 레몬즙이 좋은 선택입니다. 자유롭게 양을 조절할 수 있어 다용도로 활용할 수 있으며, 경제적인 면에서도 유리합니다. 보관 시 신선도를 유지하기에 어려움이 있지만, 꾸준히 섭취하고자 하신다면 효율적인 선택입니다.</span>
				</div>
				<div class="text_box">
					<span class="mini_title">3. 직접 레몬즙 착즙하기: 신선함은 그대로!</span>
					<span>가장 신선하고 건강한 방법을 찾고 있다면, 직접 레몬을 착즙해 섭취하는 것이 답입니다. 방부제나 첨가물 없이 레몬 본연의 영양을 그대로 섭취할 수 있죠. 시간과 노력이 들어가지만, 최고의 신선함을 원한다면 직접 착즙이 가장 좋은 방법입니다.</span>
				</div>
			</div>
			<div class="section section_04">
				<div class="img_box">
					<img src="https://i.imgur.com/IU0cWFV.png" alt="테팔 블렌드포스 믹서기" />
					
				</div>
				<hr />
				<div class="detail_cont_box">
					<h3>테팔 블렌드포스 믹서기로 일상을 더 편리하게 만드는 이유!”</h3>
					<div class="text_box">
						<span class="mini_title contain_img"><img class="emoji_rhombus" alt="🔸" src="https://s.w.org/images/core/emoji/15.0.3/svg/1f538.svg" /> 강력한 성능과 간편한 사용성</span>
						<span>테팔 블렌드포스 믹서기는 강력한 22000RPM 모터와 파워엘릭스 기술로 단단한 재료도 손쉽게 분쇄합니다.
							편리하게 분리할 수 있는 칼날 덕분에 세척이 간편하며, 1.75L 대용량 내열 유리 용기로 많은 양을 한 번에 블렌딩할 수 있어
							요리에 더욱 유용합니다.
						</span>
					</div>
					<div class="text_box">
						<span class="mini_title contain_img"><img class="emoji_rhombus" alt="🔸" src="https://s.w.org/images/core/emoji/15.0.3/svg/1f538.svg" /> 이중 잠금으로 안전하게</span>
						<span>스마트 잠금 방식으로 안전하게 사용할 수 있어, 언제나 안심하고 요리할 수 있습니다. 안전을 고려한 설계로, 블렌딩이 더욱 즐거워집니다.</span>
						
					</div>
				
				</div>				
				<hr />
				<div class="text_box">
					<h3>레몬수와 레몬큐브로 매일 상쾌하고 건강하게 살아가는 법!</h3>
					<span>레몬수와 레몬큐브는 단순한 음료를 넘어, 상큼함과 건강을 동시에 잡을 수 있는 최고의 아이템입니다.</span>
					<span>특히 테팔 블렌드포스 믹서기를 사용하면 간편하게 레몬큐브를 만들어 매일매일 신선한 맛과 영양을 즐길 수 있습니다.</span>
					<span>이제부터는 매일 아침 상큼한 레몬수로 건강을 챙기고, 레몬큐브로 다양한 요리에 생기를 불어넣어 보세요.</span>
					<span>이 작은 변화가 당신의 하루를 얼마나 상쾌하고 특별하게 만들지 기대해 보세요!</span>
				</div>
			</div>
		</div>`,
		value: `
<p>dsa</p>

<figure class="se-flex-component se-input-component se-scroll-figure-x">
  <table class="se-table-layout-auto" style="">
    <colgroup><col style="width: 10%;"><col style="width: 10%;"><col style="width: 17%;"><col style="width:33%"><col style="width: 10%;"><col style="width: 10%;"></colgroup>
    <tbody>
      <tr>
        <td class="">
          <div>312<br>
          </div>
        </td>
        <td class="">
          <div>312<br>
          </div>
        </td>
        <td class="">
          <div>fdsaf<br>
          </div>
        </td>
        <td class="">
          <div>dfsa<br>
          </div>
        </td>
        <td class="">
          <div>fdsa<br>
          </div>
        </td>
        <td class="">
          <div>31<br>
          </div>
        </td>
      </tr>
      <tr>
        <td class="">
          <div>312<br>
          </div>
        </td>
        <td class="" colspan="1" rowspan="2">
          <div>312<br>
          </div>
        </td>
        <td class="" colspan="2" rowspan="3">
          <div>fddadsa</div>
        </td>
        <td class="" colspan="1" rowspan="2">
          <div>fdsa<br>
          </div>
        </td>
        <td class="">
          <div>fdsa<br>
          </div>
        </td>
      </tr>
      <tr>
        <td class="">
          <div>312<br>
          </div>
        </td>
        <td class="">
          <div>fdsa<br>
          </div>
        </td>
      </tr>
      <tr>
        <td class="">
          <div>312<br>
          </div>
        </td>
        <td class="">
          <div>321<br>
          </div>
        </td>
        <td class="">
          <div>231<br>
          </div>
        </td>
        <td class="">
          <div>312<br>
          </div>
        </td>
      </tr>
      <tr>
        <td class="">
          <div>312<br>
          </div>
        </td>
        <td class="">
          <div>312<br>
          </div>
        </td>
        <td class="">
          <div>321<br>
          </div>
        </td>
        <td class="">
          <div>321<br>
          </div>
        </td>
        <td class="">
          <div>312<br>
          </div>
        </td>
        <td class="">
          <div>321<br>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</figure>

<p><br>
</p>

<div class="se-component se-file-figure se-flex-component">
  <figure class="">
    <a href="http://localhost:3000/editor/files/download/public/files/d41d8cd98f00b204e9800998ecf8427e.html" title="xsOiDurC.html" download="xsOiDurC.html" data-se-file-download="" contenteditable="false" data-se-non-focus="true" data-se-non-link="true" data-se-file-name="xsOiDurC.html" data-se-file-size="0" name="xsOiDurC.html" data-se-index="0">xsOiDurC.html</a>
  </figure>
</div>

`,
		link: {
			uploadUrl: 'http://localhost:3000/editor/files/upload',
			relList: ['alternate', 'author', 'external', 'help', 'license', 'next', 'follow', 'nofollow', 'noreferrer', 'noopener', 'prev', 'search', 'tag'],
			defaultRel: 'tag'
		},
		video: {
			uploadUrl: 'http://localhost:3000/editor/upload',
			createFileInput: true
		},
		videoGallery: {
			url: 'http://localhost:3000/editor/gallery/video'
		},
		embed: {},
		imageGallery: {
			data: [
				{
					src: 'http://suneditor.com/docs/cat.jpg',
					name: 'Tabby',
					alt: 'Tabby',
					tag: 'Cat'
				},
				{
					src: 'http://suneditor.com/docs/cat1.jpg',
					name: 'Cat paw',
					alt: 'Cat paw',
					tag: 'Cat'
				},
				{
					src: 'http://suneditor.com/docs/cat2.jpg',
					name: 'Cat',
					alt: 'Cat',
					tag: 'Cat'
				}
			],
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
		audioGallery: {
			url: 'http://localhost:3000/editor/gallery/audio'
		},
		fileGallery: {
			url: 'http://localhost:3000/editor/gallery/file'
		},
		fileBrowser: {
			url: 'http://localhost:3000/editor/filebrowser'
		},
		table: {
			scrollType: 'x'
			// cellControllerPosition: 'cell'
		},
		fontColor: {
			// disableHEXInput: true,
			items: [{ name: 'red', value: '#ff0000' }, '#ff5e00', '#ffe400', '#abf200', '#00d8ff', '#0055ff', '#6600ff', '#ff00dd', '#000000']
		},
		fileUpload: {
			uploadUrl: 'http://localhost:3000/editor/files/upload',
			// as: 'link',
			allowMultiple: true
		},
		exportPDF: {
			apiUrl: 'http://localhost:3000/editor/download-pdf'
		},
		fontSize: {
			// showIncDecControls: true
			// disableInput: true,
			// sizeUnit: 'text',
			// showDefaultSizeLabel:true
		},
		mention: {
			data: [{"key":"rwhilnj","name":"Riley White (Product Manager)","url":"https://74iuojmw16.execute-api.ap-northeast-1.amazonaws.com/suneditor-demo/SunEditor-sample-mention/rwhilnj/info"},{"key":"mwil298","name":"Morgan Wilson (Project Manager)","url":"https://74iuojmw16.execute-api.ap-northeast-1.amazonaws.com/suneditor-demo/SunEditor-sample-mention/mwil298/info"},{"key":"eand3d1","name":"Elliott Anderson (UX Designer)","url":"https://74iuojmw16.execute-api.ap-northeast-1.amazonaws.com/suneditor-demo/SunEditor-sample-mention/eand3d1/info"},{"key":"ztaya65","name":"Zane Taylor (Project Manager)","url":"https://74iuojmw16.execute-api.ap-northeast-1.amazonaws.com/suneditor-demo/SunEditor-sample-mention/ztaya65/info"},{"key":"stho9wt","name":"Sawyer Thomas (Product Manager)","url":"https://74iuojmw16.execute-api.ap-northeast-1.amazonaws.com/suneditor-demo/SunEditor-sample-mention/stho9wt/info"}],
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
			}
			// perfectFreehand: PerfectFreehand,
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
			onExportPDFBefore(params) {
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
