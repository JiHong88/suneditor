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
		code: 'ckb',
		align: 'ئاراسته‌',
		alignCenter: 'ناوه‌ند',
		alignJustify: 'به‌رێكی دابه‌ش بكه‌',
		alignLeft: 'لای چه‌پ',
		alignRight: 'لای راست',
		audio: 'ده‌نگ',
		audio_modal_file: 'فایلێك هه‌ڵبژێره‌',
		audio_modal_title: 'ده‌نگێك دابنێ',
		audio_modal_url: 'به‌سته‌ری ده‌نگ',
		autoSize: 'قه‌باره‌ی خۆكارانه‌',
		backgroundColor: 'ره‌نگی دیاركراو',
		basic: 'سه‌ره‌تایی',
		bold: 'تۆخكردن',
		bulletedList: 'لیستی ریزنه‌كراو',
		caption: 'پێناسه‌یه‌ك دابنێ',
		center: 'ناوەڕاست',
		close: 'داخستن',
		codeView: 'بینینی كۆده‌كان',
		default: 'بنه‌ڕه‌ت',
		deleteColumn: 'ستونێك بسره‌وه‌',
		deleteRow: 'ریز بسره‌وه‌',
		dir_ltr: 'من اليسار إلى اليمين',
		dir_rtl: 'من اليمين الى اليسار',
		edit: 'دەسکاریکردن',
		fixedColumnWidth: 'پانی ستون نه‌گۆربكه‌',
		font: 'فۆنت',
		fontColor: 'ره‌نگی فۆنت',
		fontSize: 'قه‌باره‌',
		formats: 'Formats',
		fullScreen: 'پڕ به‌ شاشه‌',
		height: 'به‌رزی',
		horizontalLine: 'هێڵی ئاسۆیی',
		horizontalSplit: 'جیاكردنه‌وه‌ی ئاسۆیی',
		hr_dashed: 'داش داش',
		hr_dotted: 'نوكته‌ نوكته‌',
		hr_solid: 'پته‌و',
		image: 'وێنه‌',
		imageGallery: 'گاله‌ری وێنه‌كان',
		image_modal_altText: 'نوسینی جێگره‌وه‌',
		image_modal_file: 'فایلێك هه‌ڵبژێره‌',
		image_modal_title: 'وێنه‌یه‌ك دابنێ',
		image_modal_url: 'به‌سته‌ری وێنه‌',
		indent: 'بۆشایی بەجێهێشتن',
		insertColumnAfter: 'ستونێك له‌ دواوه‌ زیادبكه‌',
		insertColumnBefore: 'ستونێك له‌ پێشه‌وه‌ زیادبكه‌',
		insertRowAbove: 'ریزك له‌ سه‌ره‌وه‌ زیادبكه‌',
		insertRowBelow: 'ریزێك له‌ خواره‌وه‌ زیادبكه‌',
		italic: 'لار',
		layout: 'Layout',
		left: 'چه‌پ',
		lineHeight: 'بڵندی دێر',
		link: 'به‌سته‌ر',
		link_modal_bookmark: 'المرجعية',
		link_modal_downloadLinkCheck: 'رابط التحميل',
		link_modal_newWindowCheck: 'له‌ په‌نجه‌ره‌یه‌كی نوێ بكه‌ره‌وه‌',
		link_modal_text: 'تێكستی به‌سته‌ر',
		link_modal_title: 'به‌سته‌ر دابنێ',
		link_modal_url: 'به‌سته‌ر',
		list: 'لیست',
		math: 'بیركاری',
		math_modal_fontSizeLabel: 'قه‌باره‌ی فۆنت',
		math_modal_inputLabel: 'نیشانه‌كانی بیركاری',
		math_modal_previewLabel: 'پێشبینین',
		math_modal_title: 'بیركاری',
		maxSize: 'گه‌وره‌ترین قه‌باره‌',
		mention: 'تنويه ب',
		menu_bordered: 'لێواری هه‌بێت',
		menu_code: 'كۆد',
		menu_neon: 'نیۆن',
		menu_shadow: 'سێبه‌ر',
		menu_spaced: 'بۆشای هه‌بێت',
		menu_translucent: 'كه‌مێك وه‌ك شووشه‌',
		mergeCells: 'خانه‌كان تێكه‌ڵبكه‌',
		minSize: 'بچوكترین قه‌باره‌',
		mirrorHorizontal: 'هه‌ڵگه‌رێنه‌وه‌ به‌ده‌وری ته‌وه‌ره‌ی ئاسۆیی',
		mirrorVertical: 'هه‌ڵگه‌رێنه‌وه‌ به‌ده‌وری ته‌وه‌ره‌ی ستونی',
		numberedList: 'لیستی ریزكراو',
		outdent: 'لابردنی بۆشایی',
		paragraphStyle: 'ستایلی په‌ره‌گراف',
		preview: 'پێشبینین',
		print: 'پرینت',
		proportion: 'رێژه‌كان وه‌ك خۆی بهێڵه‌وه‌',
		ratio: 'رێژه‌',
		redo: 'هەڵگەڕاندنەوە',
		remove: 'سڕینه‌وه‌',
		removeFormat: 'لابردنی فۆرمات',
		resize100: 'قه‌باره‌ بگۆره‌ بۆ ١٠٠%',
		resize25: 'قه‌باره‌ بگۆره‌ بۆ ٢٥%',
		resize50: 'قه‌باره‌ بگۆره‌ بۆ ٥٠%',
		resize75: 'قه‌باره‌ بگۆره‌ بۆ ٧٥%',
		resize: 'Resize',
		revert: 'بیگەڕێنەوە سەر باری سەرەتایی',
		right: 'راست',
		rotateLeft: 'بسوڕێنه‌ به‌لای چه‌پدا',
		rotateRight: 'بسورێنه‌ به‌لای راستدا',
		save: 'پاشه‌كه‌وتكردن',
		search: 'گه‌ران',
		showBlocks: 'بڵۆك نیشانبده',
		size: 'قه‌باره‌',
		splitCells: 'خانه‌كان لێك جیابكه‌وه‌',
		strike: 'هێڵ به‌ناودا بێنه‌',
		submitButton: 'ناردن',
		subscript: 'ژێرسکریپت',
		superscript: 'سەرنووس',
		table: 'خشته‌',
		tableHeader: 'سه‌ردێری خشته‌ك',
		tags: 'تاگه‌كان',
		tag_blockquote: 'ده‌ق',
		tag_div: 'ی ئاسایی (DIV)',
		tag_h: 'سەرپەڕە',
		tag_p: 'په‌ره‌گراف',
		tag_pre: 'كۆد',
		template: 'قاڵب',
		textStyle: 'ستایلی نوسین',
		underline: 'هێڵ به‌ژێردا بێنه‌',
		undo: 'وەک خۆی لێ بکەوە',
		unlink: 'سڕینەوەی بەستەر',
		verticalSplit: 'جیاكردنه‌وه‌ی ستونی',
		video: 'ڤیدیۆ',
		video_modal_file: 'فایلێك هه‌ڵبژێره‌',
		video_modal_title: 'ڤیدیۆیه‌ك دابنێ',
		video_modal_url: 'YouTube/Vimeo به‌سته‌ری له‌ناودانان وه‌ك ',
		width: 'پانی'
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

		Object.defineProperty(window.SUNEDITOR_LANG, 'ckb', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});
