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
		code: 'ua',
		default: 'По замовчуванням',
		save: 'Зберегти',
		font: 'Шрифт',
		formats: 'Стиль абзацу',
		fontSize: 'Розмір шрифту',
		bold: 'Жирний',
		underline: 'Підкреслений',
		italic: 'Курсив',
		strike: 'Перекреслити',
		subscript: 'Нижній індекс',
		superscript: 'Верхній індекс',
		removeFormat: 'Очистити форматування',
		fontColor: 'Колір тексту',
		backgroundColor: 'Колір виділення',
		indent: 'Збільшити відступ',
		outdent: 'Зменшити відступ',
		align: 'Вирівнювання',
		alignLeft: 'За лівим краєм',
		alignRight: 'За правим краєм',
		alignCenter: 'По центру',
		alignJustify: 'За шириною',
		list: 'Список',
		orderList: 'Нумерований',
		unorderList: 'Маркований',
		horizontalLine: 'Горизонтальна лінія',
		hr_solid: 'Суцільна',
		hr_dotted: 'Пунктирна',
		hr_dashed: 'Штрихова',
		table: 'Таблиця',
		link: 'Посилання',
		math: 'Формула',
		image: 'Зображення',
		video: 'Відео',
		audio: 'Аудіо',
		fullScreen: 'Повний екран',
		showBlocks: 'Показати блоки',
		codeView: 'Редагувати як HTML',
		undo: 'Скасувати',
		redo: 'Виконати знову',
		preview: 'Попередній перегляд',
		print: 'Друк',
		tag_p: 'Абзац',
		tag_div: 'Базовий',
		tag_h: 'Заголовок',
		tag_blockquote: 'Цитата',
		tag_pre: 'Код',
		template: 'Шаблон',
		lineHeight: 'Висота лінії',
		paragraphStyle: 'Стиль абзацу',
		textStyle: 'Стиль тексту',
		imageGallery: 'Галерея',
		dir_ltr: 'Зліва направо',
		dir_rtl: 'Справа наліво',
		mention: 'Згадати',
		tags: 'Теги',
		search: 'Пошук',
		caption: 'Додати підпис',
		close: 'Закрити',
		submitButton: 'Підтвердити',
		revertButton: 'Скинути',
		proportion: 'Зберегти пропорції',
		basic: 'Без обтікання',
		left: 'Зліва',
		right: 'Справа',
		center: 'По центру',
		width: 'Ширина',
		height: 'Висота',
		size: 'Розмір',
		ratio: 'Співвідношення',
		edit: 'Змінити',
		unlink: 'Прибрати посилання',
		remove: 'Видалити',
		link_modal_title: 'Вставити посилання',
		link_modal_url: 'Посилання',
		link_modal_text: 'Текст',
		link_modal_newWindowCheck: 'Відкривати в новому вікні',
		link_modal_downloadLinkCheck: 'Посилання для завантаження',
		link_modal_bookmark: 'Закладка',
		math_modal_title: 'Формула',
		math_modal_inputLabel: 'Математична запис',
		math_modal_fontSizeLabel: 'Розмір шрифту',
		math_modal_previewLabel: 'Попередній перегляд',
		image_modal_title: 'Вставити зображення',
		image_modal_file: 'Виберіть файл',
		image_modal_url: 'Посилання на зображення',
		image_modal_altText: 'Текстовий опис зображення',
		video_modal_title: 'Вставити відео',
		video_modal_file: 'Виберіть файл',
		video_modal_url: 'Посилання на відео, Youtube, Vimeo',
		audio_modal_title: 'Вставити аудіо',
		audio_modal_file: 'Виберіть файл',
		audio_modal_url: 'Посилання на аудіо',
		insertRowAbove: 'Вставити рядок вище',
		insertRowBelow: 'Вставити рядок нижче',
		deleteRow: 'Видалити рядок',
		insertColumnBefore: 'Вставити стовпець зліва',
		insertColumnAfter: 'Вставити стовпець справа',
		deleteColumn: 'Видалити стовпець',
		fixedColumnWidth: 'Фіксована ширина стовпця',
		resize100: 'Розмір 100%',
		resize75: 'Розмір 75%',
		resize50: 'Розмір 50%',
		resize25: 'Розмір 25%',
		autoSize: 'Авто розмір',
		mirrorHorizontal: 'Відобразити по горизонталі',
		mirrorVertical: 'Відобразити по вертикалі',
		rotateLeft: 'Повернути проти годинникової стрілки',
		rotateRight: 'Повернути за годинниковою стрілкою',
		maxSize: 'Ширина за розміром сторінки',
		minSize: 'Ширина за вмістом',
		tableHeader: 'Заголовок таблиці',
		mergeCells: "Об'єднати клітинки",
		splitCells: 'Розділити клітинку',
		horizontalSplit: 'Розділити горизонтально',
		verticalSplit: 'Розділити вертикально',
		menu_spaced: 'Інтервал',
		menu_bordered: 'З лініями',
		menu_neon: 'Неон',
		menu_translucent: 'Напівпрозорий',
		menu_shadow: 'Тінь',
		menu_code: 'Код'
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
