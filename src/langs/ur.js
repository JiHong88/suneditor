(function (global, factory) {
	if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = global.document ?
			factory(global, true) :
			function (w) {
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
		code: 'ur',
		default: 'طے شدہ',
		save: 'محفوظ کریں',
		font: 'فونٹ',
		formats: 'فارمیٹس',
		fontSize: 'سائز',
		bold: 'بولڈ',
		underline: 'انڈر لائن',
		italic: 'ترچھا',
		strike: 'لکیرہ کردہ',
		subscript: 'ذیلی',
		superscript: 'انتہائی',
		removeFormat: 'فارمیٹ کو حذف دیں',
		fontColor: 'لکھائی کا رنگ',
		hiliteColor: 'نمایاں رنگ',
		indent: 'حاشیہ',
		outdent: 'ہاشیہ واپس',
		align: 'رخ',
		alignLeft: 'بائیں طرف',
		alignRight: 'دائیں طرف',
		alignCenter: 'مرکز میں طرف',
		alignJustify: 'ہر طرف برابر',
		list: 'فہرست',
		orderList: 'ترتیب شدہ فہرست',
		unorderList: 'غیر ترتیب شدہ فہرست',
		horizontalRule: 'لکیر',
		hr_solid: 'ٹھوس',
		hr_dotted: 'نقطے دار',
		hr_dashed: 'ڈیشڈ',
		table: 'میز',
		link: 'لنک',
		math: 'ریاضی',
		image: 'تصویر',
		video: 'ویڈیو',
		audio: 'آواز',
		fullScreen: 'پوری اسکرین',
		showBlocks: 'ڈبے دکھائیں',
		codeView: 'کوڈ کا نظارہ',
		undo: 'واپس کریں',
		redo: 'دوبارہ کریں',
		preview: 'پیشنظر',
		print: 'پرنٹ کریں',
		tag_p: 'پیراگراف',
		tag_div: 'عام (div)',
		tag_h: 'ہیڈر',
		tag_blockquote: 'اقتباس',
		tag_pre: 'کوڈ',
		template: 'سانچہ',
		lineHeight: 'لکیر کی اونچائی',
		paragraphStyle: 'عبارت کا انداز',
		textStyle: 'متن کا انداز',
		imageGallery: 'تصویری نگارخانہ',
		dir_ltr: 'بائیں سے دائیں',
		dir_rtl: 'دائیں سے بائیں',
		mention: 'تذکرہ',
		tags: 'ٹیگز',
		search: 'تلاش کریں',
		caption: 'عنوان',
		close: 'بند کریں',
		submitButton: 'بھیجیں',
		revertButton: 'واپس',
		proportion: 'تناسب کو محدود کریں',
		basic: 'بنیادی',
		left: 'بائیں',
		right: 'دائیں',
		center: 'مرکز',
		width: 'چوڑائی',
		height: 'اونچائی',
		size: 'حجم',
		ratio: 'تناسب',
		edit: 'ترمیم',
		unlink: 'لنک ختم کریں',
		remove: 'حذف',
		link_modal_title: 'لنک داخل کریں',
		link_modal_url: 'لنک کرنے کے لیے URL',
		link_modal_text: 'ظاہر کرنے کے لیے متن',
		link_modal_newWindowCheck: 'نئی ونڈو میں کھولیں',
		link_modal_downloadLinkCheck: 'ڈاؤن لوڈ لنک',
		link_modal_bookmark: 'بک مارک',
		math_modal_title: 'ریاضی',
		math_modal_inputLabel: 'ریاضیاتی اشارے',
		math_modal_fontSizeLabel: 'حرف کا سائز',
		math_modal_previewLabel: 'پیش نظارہ',
		image_modal_title: 'تصویر داخل کریں',
		image_modal_file: 'فائلوں سے منتخب کریں',
		image_modal_url: 'تصویری URL',
		image_modal_altText: 'متبادل متن',
		video_modal_title: 'ویڈیو داخل کریں',
		video_modal_file: 'فائلوں سے منتخب کریں',
		video_modal_url: 'ذرائع ابلاغ کا یو آر ایل، یوٹیوب/ویمیو',
		audio_modal_title: 'آواز داخل کریں',
		audio_modal_file: 'فائلوں سے منتخب کریں',
		audio_modal_url: 'آواز URL',
		insertRowAbove: 'اوپر قطار شامل کریں',
		insertRowBelow: 'نیچے قطار شامل کریں',
		deleteRow: 'قطار کو حذف کریں',
		insertColumnBefore: 'پہلے ستون شامل کریں',
		insertColumnAfter: 'اس کے بعد ستون شامل کریں',
		deleteColumn: 'ستون حذف کریں',
		fixedColumnWidth: 'مقررہ ستون کی چوڑائی',
		resize100: '100% کا حجم تبدیل کریں',
		resize75: '75% کا حجم تبدیل کریں',
		resize50: '50% کا حجم تبدیل کریں',
		resize25: '25% کا حجم تبدیل کریں',
		autoSize: 'ازخود حجم',
		mirrorHorizontal: 'آئینہ، افقی',
		mirrorVertical: 'آئینہ، عمودی',
		rotateLeft: 'بائیں گھومو',
		rotateRight: 'دائیں گھمائیں',
		maxSize: 'زیادہ سے زیادہ سائز',
		minSize: 'کم از کم سائز',
		tableHeader: 'میز کی سرخی',
		mergeCells: 'حجروں کو ضم کریں',
		splitCells: 'حجروں کو علیدہ کرو',
		HorizontalSplit: 'افقی تقسیم',
		VerticalSplit: 'عمودی تقسیم',
		menu_spaced: 'فاصلہ',
		menu_bordered: 'سرحدی',
		menu_neon: 'نیین',
		menu_translucent: 'پارباسی',
		menu_shadow: 'سایہ',
		menu_code: 'کوڈ'
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

		Object.defineProperty(window.SUNEDITOR_LANG, 'ua', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});