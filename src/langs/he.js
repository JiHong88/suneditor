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
		code: 'he',
		default: 'ברירת מחדל',
		save: 'שמור',
		font: 'גופן',
		formats: 'עיצוב',
		fontSize: 'גודל',
		bold: 'מודגש',
		underline: 'קו תחתון',
		italic: 'נטוי',
		strike: 'קו חוצה',
		subscript: 'עילי',
		superscript: 'תחתי',
		removeFormat: 'הסר עיצוב',
		fontColor: 'צבע גופן',
		backgroundColor: 'צבע קו תחתון',
		indent: 'הגדל כניסה',
		outdent: 'הקטן כניסה',
		align: 'יישור',
		alignLeft: 'יישר לשמאל',
		alignRight: 'יישר לימין',
		alignCenter: 'מרכז',
		alignJustify: 'יישר לשני הצדדים',
		list: 'רשימה',
		orderList: 'מספור',
		unorderList: 'תבליטים',
		horizontalLine: 'קו אופקי',
		hr_solid: 'קו',
		hr_dotted: 'נקודות',
		hr_dashed: 'מקפים',
		table: 'טבלה',
		link: 'קישור',
		math: 'מתמטיקה',
		image: 'תמונה',
		video: 'חוזי',
		audio: 'שמע',
		fullScreen: 'מסך מלא',
		showBlocks: 'הצג גושים',
		codeView: 'הצג קוד',
		undo: 'בטל',
		redo: 'חזור',
		preview: 'תצוגה מקדימה',
		print: 'הדפס',
		tag_p: 'פסקה',
		tag_div: 'רגילה (DIV)',
		tag_h: 'כותרת',
		tag_blockquote: 'ציטוט',
		tag_pre: 'קוד',
		template: 'תבנית',
		lineHeight: 'גובה השורה',
		paragraphStyle: 'סגנון פסקה',
		textStyle: 'סגנון גופן',
		imageGallery: 'גלרית תמונות',
		dir_ltr: 'משמאל לימין',
		dir_rtl: 'מימין לשמאל',
		mention: 'הזכר',
		tags: 'תג',
		search: 'חפש',
		caption: 'הכנס תיאור',
		close: 'סגור',
		submitButton: 'שלח',
		revertButton: 'בטל',
		proportion: 'שמר יחס',
		basic: 'בסיסי',
		left: 'שמאל',
		right: 'ימין',
		center: 'מרכז',
		width: 'רוחב',
		height: 'גובה',
		size: 'גודל',
		ratio: 'יחס',
		edit: 'ערוך',
		unlink: 'הסר קישורים',
		remove: 'הסר',
        link_modal_title: 'הכנס קשור',
		link_modal_url: 'כתובת קשור',
		link_modal_text: 'תיאור',
		link_modal_newWindowCheck: 'פתח בחלון חדש',
		link_modal_downloadLinkCheck: 'קישור להורדה',
		link_modal_bookmark: 'סמניה',
		math_modal_title: 'נוסחה',
		math_modal_inputLabel: 'סימנים מתמטים',
		math_modal_fontSizeLabel: 'גודל גופן',
		math_modal_previewLabel: 'תצוגה מקדימה',
		image_modal_title: 'הכנס תמונה',
		image_modal_file: 'בחר מקובץ',
		image_modal_url: 'כתובת URL תמונה',
		image_modal_altText: 'תיאור (תגית alt)',
		video_modal_title: 'הכנס סרטון',
		video_modal_file: 'בחר מקובץ',
		video_modal_url: 'כתובת הטמעה YouTube/Vimeo',
		audio_modal_title: 'הכנס שמע',
		audio_modal_file: 'בחר מקובץ',
		audio_modal_url: 'כתובת URL שמע',
		insertRowAbove: 'הכנס שורה מעל',
		insertRowBelow: 'הכנס שורה מתחת',
		deleteRow: 'מחק שורה',
		insertColumnBefore: 'הכנס עמודה לפני',
		insertColumnAfter: 'הכנס עמודה אחרי',
		deleteColumn: 'מחק עמודה',
		fixedColumnWidth: 'קבע רוחב עמודות',
		resize100: 'ללא הקטנה',
		resize75: 'הקטן 75%',
		resize50: 'הקטן 50%',
		resize25: 'הקטן 25%',
		autoSize: 'הקטן אוטומטית',
		mirrorHorizontal: 'הפוך לרוחב',
		mirrorVertical: 'הפוך לגובה',
		rotateLeft: 'סובב שמאלה',
		rotateRight: 'סובב ימינה',
		maxSize: 'גודל מרבי',
		minSize: 'גודל מזערי',
		tableHeader: 'כותרת טבלה',
		mergeCells: 'מזג תאים',
		splitCells: 'פצל תא',
		horizontalSplit: 'פצל לגובה',
		verticalSplit: 'פצל לרוחב',
		menu_spaced: 'מרווח',
		menu_bordered: 'בעל מיתאר',
		menu_neon: 'זוהר',
		menu_translucent: 'שקוף למחצה',
		menu_shadow: 'צל',
		menu_code: 'קוד'
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

		Object.defineProperty(window.SUNEDITOR_LANG, 'he', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});
