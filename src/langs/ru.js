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
		code: 'ru',
		default: 'По умолчанию',
		save: 'Сохранить',
		font: 'Шрифт',
		formats: 'Стиль абзаца',
		fontSize: 'Размер шрифта',
		bold: 'Полужирный',
		underline: 'Подчёркнутый',
		italic: 'Курсив',
		strike: 'Зачеркнутый',
		subscript: 'Нижний индекс',
		superscript: 'Верхний индекс',
		removeFormat: 'Очистить форматирование',
		fontColor: 'Цвет текста',
		backgroundColor: 'Цвет фона',
		indent: 'Увеличить отступ',
		outdent: 'Уменьшить отступ',
		align: 'Выравнивание',
		alignLeft: 'Слева',
		alignRight: 'Справа',
		alignCenter: 'По центру',
		alignJustify: 'По ширине',
		list: 'Списки',
		orderList: 'Нумерованный',
		unorderList: 'Маркированный',
		horizontalLine: 'Горизонтальная линия',
		hr_solid: 'Сплошная',
		hr_dotted: 'Пунктир',
		hr_dashed: 'Штриховая',
		table: 'Таблица',
		link: 'Ссылка',
		math: 'математический',
		image: 'Изображение',
		video: 'Видео',
		audio: 'Аудио',
		fullScreen: 'Полный экран',
		showBlocks: 'Блочный вид',
		codeView: 'Редактировать HTML',
		undo: 'Отменить',
		redo: 'Вернуть',
		preview: 'Предварительный просмотр',
		print: 'Печать',
		tag_p: 'Текст',
		tag_div: 'Базовый',
		tag_h: 'Заголовок',
		tag_blockquote: 'Цитата',
		tag_pre: 'Код',
		template: 'Шаблон',
		lineHeight: 'Высота линии',
		paragraphStyle: 'Стиль абзаца',
		textStyle: 'Стиль текста',
		imageGallery: 'Галерея',
		dir_ltr: 'Слева направо',
		dir_rtl: 'Справа налево',
		mention: 'Упоминание',
		tags: 'Теги',
		search: 'Поиск',
		caption: 'Добавить подпись',
		close: 'Закрыть',
		submitButton: 'Подтвердить',
		revertButton: 'Сбросить',
		proportion: 'Сохранить пропорции',
		basic: 'Без обтекания',
		left: 'Слева',
		right: 'Справа',
		center: 'По центру',
		width: 'Ширина',
		height: 'Высота',
		size: 'Размер',
		ratio: 'Соотношение',
		edit: 'Изменить',
		unlink: 'Убрать ссылку',
		remove: 'Удалить',
		link_modal_title: 'Вставить ссылку',
		link_modal_url: 'Ссылка',
		link_modal_text: 'Текст',
		link_modal_newWindowCheck: 'Открывать в новом окне',
		link_modal_downloadLinkCheck: 'Ссылка для скачивания',
		link_modal_bookmark: 'Закладка',
		math_modal_title: 'математический',
		math_modal_inputLabel: 'Математическая запись',
		math_modal_fontSizeLabel: 'Кегль',
		math_modal_previewLabel: 'Предварительный просмотр',
		image_modal_title: 'Вставить изображение',
		image_modal_file: 'Выберите файл',
		image_modal_url: 'Адрес изображения',
		image_modal_altText: 'Текстовое описание изображения',
		video_modal_title: 'Вставить видео',
		video_modal_file: 'Выберите файл',
		video_modal_url: 'Ссылка на видео, Youtube,Vimeo',
		audio_modal_title: 'Вставить аудио',
		audio_modal_file: 'Выберите файл',
		audio_modal_url: 'Адрес аудио',
		insertRowAbove: 'Вставить строку выше',
		insertRowBelow: 'Вставить строку ниже',
		deleteRow: 'Удалить строку',
		insertColumnBefore: 'Вставить столбец слева',
		insertColumnAfter: 'Вставить столбец справа',
		deleteColumn: 'Удалить столбец',
		fixedColumnWidth: 'Фиксированная ширина столбца',
		resize100: 'Размер 100%',
		resize75: 'Размер 75%',
		resize50: 'Размер 50%',
		resize25: 'Размер 25%',
		autoSize: 'Авто размер',
		mirrorHorizontal: 'Отразить по горизонтали',
		mirrorVertical: 'Отразить по вертикали',
		rotateLeft: 'Повернуть против часовой стрелки',
		rotateRight: 'Повернуть по часовой стрелке',
		maxSize: 'Ширина по размеру страницы',
		minSize: 'Ширина по содержимому',
		tableHeader: 'Строка заголовков',
		mergeCells: 'Объединить ячейки',
		splitCells: 'Разделить ячейку',
		horizontalSplit: 'Разделить горизонтально',
		verticalSplit: 'Разделить вертикально',
		menu_spaced: 'интервал',
		menu_bordered: 'Граничная Линия',
		menu_neon: 'неон',
		menu_translucent: 'полупрозрачный',
		menu_shadow: 'Тень',
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

		Object.defineProperty(window.SUNEDITOR_LANG, 'ru', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});
