(function (global, factory) {
	if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = global.document
			? factory(global, true)
			: function (w) {
					if (!w.document) {
						throw new Error('SUNEDITOR_LANG a window with a document');
					}
					return factory(w);
			  };
	} else {
		factory(global);
	}
})(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
	const lang = {
		code: 'en',
		default: 'Default',
		save: 'Save',
		font: 'Font',
		formats: 'Formats',
		fontSize: 'Size',
		bold: 'Bold',
		underline: 'Underline',
		italic: 'Italic',
		strike: 'Strike',
		subscript: 'Subscript',
		superscript: 'Superscript',
		removeFormat: 'Remove Format',
		fontColor: 'Font Color',
		backgroundColor: 'Highlight Color',
		indent: 'Indent',
		outdent: 'Outdent',
		align: 'Align',
		alignLeft: 'Align left',
		alignRight: 'Align right',
		alignCenter: 'Align center',
		alignJustify: 'Align justify',
		list: 'List',
		orderList: 'Ordered list',
		unorderList: 'Unordered list',
		horizontalLine: 'Horizontal line',
		hr_solid: 'Solid',
		hr_dotted: 'Dotted',
		hr_dashed: 'Dashed',
		table: 'Table',
		link: 'Link',
		math: 'Math',
		image: 'Image',
		video: 'Video',
		audio: 'Audio',
		fullScreen: 'Full screen',
		showBlocks: 'Show blocks',
		codeView: 'Code view',
		undo: 'Undo',
		redo: 'Redo',
		preview: 'Preview',
		print: 'print',
		tag_p: 'Paragraph',
		tag_div: 'Normal (DIV)',
		tag_h: 'Header',
		tag_blockquote: 'Quote',
		tag_pre: 'Code',
		template: 'Template',
		layout: 'Layout',
		lineHeight: 'Line height',
		paragraphStyle: 'Paragraph style',
		textStyle: 'Text style',
		imageGallery: 'Image gallery',
		dir_ltr: 'Left to right',
		dir_rtl: 'Right to left',
		mention: 'Mention',
		tags: 'Tags',
		search: 'Search',
		caption: 'Insert description',
		close: 'Close',
		submitButton: 'Submit',
		revertButton: 'Revert',
		proportion: 'Constrain proportions',
		basic: 'Basic',
		left: 'Left',
		right: 'Right',
		center: 'Center',
		width: 'Width',
		height: 'Height',
		size: 'Size',
		ratio: 'Ratio',
		edit: 'Edit',
		unlink: 'Unlink',
		remove: 'Remove',
		title: 'Title',
		link_modal_title: 'Insert Link',
		link_modal_url: 'URL to link',
		link_modal_text: 'Text to display',
		link_modal_newWindowCheck: 'Open in new window',
		link_modal_downloadLinkCheck: 'Download link',
		link_modal_bookmark: 'Bookmark',
		math_modal_title: 'Math',
		math_modal_inputLabel: 'Mathematical Notation',
		math_modal_fontSizeLabel: 'Font Size',
		math_modal_previewLabel: 'Preview',
		image_modal_title: 'Insert image',
		image_modal_file: 'Select from files',
		image_modal_url: 'Image URL',
		image_modal_altText: 'Alternative text',
		video_modal_title: 'Insert Video',
		video_modal_file: 'Select from files',
		video_modal_url: 'Media embed URL, YouTube/Vimeo',
		audio_modal_title: 'Insert Audio',
		audio_modal_file: 'Select from files',
		audio_modal_url: 'Audio URL',
		insertRowAbove: 'Insert row above',
		insertRowBelow: 'Insert row below',
		deleteRow: 'Delete row',
		insertColumnBefore: 'Insert column before',
		insertColumnAfter: 'Insert column after',
		deleteColumn: 'Delete column',
		fixedColumnWidth: 'Fixed column width',
		resize100: 'Resize 100%',
		resize75: 'Resize 75%',
		resize50: 'Resize 50%',
		resize25: 'Resize 25%',
		autoSize: 'Auto size',
		mirrorHorizontal: 'Mirror, Horizontal',
		mirrorVertical: 'Mirror, Vertical',
		rotateLeft: 'Rotate left',
		rotateRight: 'Rotate right',
		maxSize: 'Max size',
		minSize: 'Min size',
		tableHeader: 'Table header',
		mergeCells: 'Merge cells',
		splitCells: 'Split Cells',
		horizontalSplit: 'Horizontal split',
		verticalSplit: 'Vertical split',
		menu_spaced: 'Spaced',
		menu_bordered: 'Bordered',
		menu_neon: 'Neon',
		menu_translucent: 'Translucent',
		menu_shadow: 'Shadow',
		menu_code: 'Code'
	};

	if (typeof noGlobal === typeof undefined) {
		if (!window.SUNEDITOR_LANG) {
			Object.defineProperty(window, 'SUNEDITOR_LANG', {
				enumerable: true,
				writable: false,
				configurable: false,
				value: {}
			});
		}

		Object.defineProperty(window.SUNEDITOR_LANG, 'en', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});
