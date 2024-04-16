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
		code: 'fa',
		align: 'چیدمان',
		alignCenter: 'وسط‌چین',
		alignJustify: 'همتراز از هر دو سمت',
		alignLeft: 'چپ‌چین',
		alignRight: 'راست‌چین',
		audio: 'درج صوت',
		audio_modal_file: 'انتخاب فایل',
		audio_modal_title: 'درج صوت',
		audio_modal_url: 'آدرس Url',
		autoSize: 'اندازه‌ی خودکار',
		backgroundColor: 'رنگ پس‌زمینه',
		basic: 'چیدمان پیش فرض',
		bold: 'پررنگ کردن',
		bulletedList: 'لیست گلوله‌ای',
		caption: 'توضیح',
		center: 'وسط',
		close: 'بستن',
		codeView: 'مشاهده‌ی کُد HTML',
		default: 'پیش فرض',
		deleteColumn: 'حذف ستون',
		deleteRow: 'حذف سطر',
		dir_ltr: 'چپ به راست',
		dir_rtl: 'راست به چپ',
		edit: 'ویرایش',
		fixedColumnWidth: 'اندازه ستون ثابت',
		font: 'فونت',
		fontColor: 'رنگ پیش زمینه',
		fontSize: 'اندازه‌ی فونت',
		formats: 'قالب‌ها',
		fullScreen: 'تمام صفحه',
		height: 'ارتفاع',
		horizontalLine: 'درج خط افقی',
		horizontalSplit: 'تقسیم در جهت افقی',
		hr_solid: 'تو پر',
		hr_dotted: 'نقطه‌چین',
		hr_dashed: 'خط تیره',
		image: 'درج تصویر',
		imageGallery: 'گالری تصاویر',
		image_modal_altText: 'متن جایگزین',
		image_modal_file: 'انتخاب فایل',
		image_modal_title: 'درج تصویر',
		image_modal_url: 'آدرس Url',
		indent: 'جلو بردن',
		insertColumnAfter: 'درج یک ستون در جلو',
		insertColumnBefore: 'درج یک ستون به عقب',
		insertRowAbove: 'درج سطر در بالا',
		insertRowBelow: 'درج سطر در پایین',
		italic: 'کج کردن',
		left: 'چپ',
		lineHeight: 'ارتفاع خط',
		link: 'درج لینک',
		link_modal_bookmark: 'نشان',
		link_modal_downloadLinkCheck: 'لینک دانلود',
		link_modal_newWindowCheck: 'در پنجره‌ی جدیدی باز شود',
		link_modal_text: 'عنوان لینک',
		link_modal_title: 'درج  لینک',
		link_modal_url: 'آدرس لینک',
		list: 'لیست',
		math: 'درج فرمول ریاضی',
		math_modal_fontSizeLabel: 'اندازه‌ی فونت',
		math_modal_inputLabel: 'تعریف فرمول',
		math_modal_previewLabel: 'پیش نمایش',
		math_modal_title: 'فرمول ریاضی',
		maxSize: 'حداکثر اندازه',
		mention: 'ذکر کردن',
		menu_bordered: 'لبه‌دار',
		menu_code: 'کُد',
		menu_neon: 'نئونی',
		menu_shadow: 'سایه',
		menu_spaced: 'فضادار',
		menu_translucent: 'نیمه شفاف',
		mergeCells: 'ادغام خانه‌ها',
		minSize: 'حداقل اندازه',
		mirrorHorizontal: 'بر عکس کردن در جهت افقی',
		mirrorVertical: 'بر عکس کردن در جهت عمودی',
		numberedList: 'لیست شمارشی',
		outdent: 'عقب بردن',
		paragraphStyle: 'استایل پاراگراف',
		preview: 'پیش نمایش',
		print: 'چاپ',
		proportion: 'محدودیت اندازه',
		ratio: 'نسبت',
		redo: 'تکرار تغییر',
		remove: 'حذف',
		removeFormat: 'حذف قالب',
		resize100: 'اندازه‌ی 100%',
		resize25: 'اندازه‌ی 25%',
		resize50: 'اندازه‌ی 50%',
		resize75: 'اندازه‌ی 75%',
		revert: 'برگرداندن تغییرات',
		right: 'راست',
		rotateLeft: 'دوران به چپ',
		rotateRight: 'دوران به راست',
		save: 'ذخیره',
		search: 'جستجو',
		showBlocks: 'نمایش بلاک‌بندی',
		size: 'اندازه',
		splitCells: 'تقسیم خانه به چند خانه',
		strike: 'خط میان‌دار کردن',
		submitButton: 'درج',
		subscript: 'نوشتن به صورت زیر متن',
		superscript: 'نوشتن به صورت بالای متن',
		table: 'درج جدول',
		tableHeader: 'هدر جدول',
		tags: 'تگ‌ها',
		tag_blockquote: 'نقل قول',
		tag_div: 'عادی (DIV)',
		tag_h: 'هدر',
		tag_p: 'پاراگراف',
		tag_pre: 'کُد',
		template: 'درج محتوا بر اساس الگو',
		textStyle: 'استایل متن',
		underline: 'زیرخطدار کردن',
		undo: 'برگرداندن تغییر',
		unlink: 'حذف لینک',
		verticalSplit: 'تقسیم در جهت عمودی',
		video: 'درج ویدئو',
		video_modal_file: 'انتخاب فایل',
		video_modal_title: 'درج ویدئو',
		video_modal_url: 'آدرس Url ویدئو, YouTube/Vimeo',
		width: 'پهنا'
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

		Object.defineProperty(window.SUNEDITOR_LANG, 'fa', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});
