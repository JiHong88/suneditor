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
		default: 'بنه‌ڕه‌ت',
		save: 'پاشه‌كه‌وتكردن',
		font: 'فۆنت',
		formats: 'Formats',
		fontSize: 'قه‌باره‌',
		bold: 'تۆخكردن',
		underline: 'هێڵ به‌ژێردا بێنه‌',
		italic: 'لار',
		strike: 'هێڵ به‌ناودا بێنه‌',
		subscript: 'ژێرسکریپت',
		superscript: 'سەرنووس',
		removeFormat: 'لابردنی فۆرمات',
		fontColor: 'ره‌نگی فۆنت',
		backgroundColor: 'ره‌نگی دیاركراو',
		indent: 'بۆشایی بەجێهێشتن',
		outdent: 'لابردنی بۆشایی',
		align: 'ئاراسته‌',
		alignLeft: 'لای چه‌پ',
		alignRight: 'لای راست',
		alignCenter: 'ناوه‌ند',
		alignJustify: 'به‌رێكی دابه‌ش بكه‌',
		list: 'لیست',
		orderList: 'لیستی ریزكراو',
		unorderList: 'لیستی ریزنه‌كراو',
		horizontalLine: 'هێڵی ئاسۆیی',
		hr_solid: 'پته‌و',
		hr_dotted: 'نوكته‌ نوكته‌',
		hr_dashed: 'داش داش',
		table: 'خشته‌',
		link: 'به‌سته‌ر',
		math: 'بیركاری',
		image: 'وێنه‌',
		video: 'ڤیدیۆ',
		audio: 'ده‌نگ',
		fullScreen: 'پڕ به‌ شاشه‌',
		showBlocks: 'بڵۆك نیشانبده',
		codeView: 'بینینی كۆده‌كان',
		undo: 'وەک خۆی لێ بکەوە',
		redo: 'هەڵگەڕاندنەوە',
		preview: 'پێشبینین',
		print: 'پرینت',
		tag_p: 'په‌ره‌گراف',
		tag_div: 'ی ئاسایی (DIV)',
		tag_h: 'سەرپەڕە',
		tag_blockquote: 'ده‌ق',
		tag_pre: 'كۆد',
		template: 'قاڵب',
		lineHeight: 'بڵندی دێر',
		paragraphStyle: 'ستایلی په‌ره‌گراف',
		textStyle: 'ستایلی نوسین',
		imageGallery: 'گاله‌ری وێنه‌كان',
		dir_ltr: 'من اليسار إلى اليمين',
		dir_rtl: 'من اليمين الى اليسار',
		mention: 'تنويه ب',
		tags: 'تاگه‌كان',
		search: 'گه‌ران',
		caption: 'پێناسه‌یه‌ك دابنێ',
		close: 'داخستن',
		submitButton: 'ناردن',
		revertButton: 'بیگەڕێنەوە سەر باری سەرەتایی',
		proportion: 'رێژه‌كان وه‌ك خۆی بهێڵه‌وه‌',
		basic: 'سه‌ره‌تایی',
		left: 'چه‌پ',
		right: 'راست',
		center: 'ناوەڕاست',
		width: 'پانی',
		height: 'به‌رزی',
		size: 'قه‌باره‌',
		ratio: 'رێژه‌',
		edit: 'دەسکاریکردن',
		unlink: 'سڕینەوەی بەستەر',
		remove: 'سڕینه‌وه‌',
		link_modal_title: 'به‌سته‌ر دابنێ',
		link_modal_url: 'به‌سته‌ر',
		link_modal_text: 'تێكستی به‌سته‌ر',
		link_modal_newWindowCheck: 'له‌ په‌نجه‌ره‌یه‌كی نوێ بكه‌ره‌وه‌',
		link_modal_downloadLinkCheck: 'رابط التحميل',
		link_modal_bookmark: 'المرجعية',
		math_modal_title: 'بیركاری',
		math_modal_inputLabel: 'نیشانه‌كانی بیركاری',
		math_modal_fontSizeLabel: 'قه‌باره‌ی فۆنت',
		math_modal_previewLabel: 'پێشبینین',
		image_modal_title: 'وێنه‌یه‌ك دابنێ',
		image_modal_file: 'فایلێك هه‌ڵبژێره‌',
		image_modal_url: 'به‌سته‌ری وێنه‌',
		image_modal_altText: 'نوسینی جێگره‌وه‌',
		video_modal_title: 'ڤیدیۆیه‌ك دابنێ',
		video_modal_file: 'فایلێك هه‌ڵبژێره‌',
		video_modal_url: 'YouTube/Vimeo به‌سته‌ری له‌ناودانان وه‌ك ',
		audio_modal_title: 'ده‌نگێك دابنێ',
		audio_modal_file: 'فایلێك هه‌ڵبژێره‌',
		audio_modal_url: 'به‌سته‌ری ده‌نگ',
		insertRowAbove: 'ریزك له‌ سه‌ره‌وه‌ زیادبكه‌',
		insertRowBelow: 'ریزێك له‌ خواره‌وه‌ زیادبكه‌',
		deleteRow: 'ریز بسره‌وه‌',
		insertColumnBefore: 'ستونێك له‌ پێشه‌وه‌ زیادبكه‌',
		insertColumnAfter: 'ستونێك له‌ دواوه‌ زیادبكه‌',
		deleteColumn: 'ستونێك بسره‌وه‌',
		fixedColumnWidth: 'پانی ستون نه‌گۆربكه‌',
		resize100: 'قه‌باره‌ بگۆره‌ بۆ ١٠٠%',
		resize75: 'قه‌باره‌ بگۆره‌ بۆ ٧٥%',
		resize50: 'قه‌باره‌ بگۆره‌ بۆ ٥٠%',
		resize25: 'قه‌باره‌ بگۆره‌ بۆ ٢٥%',
		autoSize: 'قه‌باره‌ی خۆكارانه‌',
		mirrorHorizontal: 'هه‌ڵگه‌رێنه‌وه‌ به‌ده‌وری ته‌وه‌ره‌ی ئاسۆیی',
		mirrorVertical: 'هه‌ڵگه‌رێنه‌وه‌ به‌ده‌وری ته‌وه‌ره‌ی ستونی',
		rotateLeft: 'بسوڕێنه‌ به‌لای چه‌پدا',
		rotateRight: 'بسورێنه‌ به‌لای راستدا',
		maxSize: 'گه‌وره‌ترین قه‌باره‌',
		minSize: 'بچوكترین قه‌باره‌',
		tableHeader: 'سه‌ردێری خشته‌ك',
		mergeCells: 'خانه‌كان تێكه‌ڵبكه‌',
		splitCells: 'خانه‌كان لێك جیابكه‌وه‌',
		horizontalSplit: 'جیاكردنه‌وه‌ی ئاسۆیی',
		verticalSplit: 'جیاكردنه‌وه‌ی ستونی',
		menu_spaced: 'بۆشای هه‌بێت',
		menu_bordered: 'لێواری هه‌بێت',
		menu_neon: 'نیۆن',
		menu_translucent: 'كه‌مێك وه‌ك شووشه‌',
		menu_shadow: 'سێبه‌ر',
		menu_code: 'كۆد'
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
