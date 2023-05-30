(function (global, factory) {
	if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = global.document
			? factory(global, true)
			: function (w) {
					if (!w.document) {
						throw new Error('SUNEDITOR_LANG una finestra con un documento');
					}
					return factory(w);
			  };
	} else {
		factory(global);
	}
})(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
	const lang = {
		code: 'it',
		align: 'Allinea',
		alignCenter: 'Allinea al centro',
		alignJustify: 'Giustifica testo',
		alignLeft: 'Allinea a sinistra',
		alignRight: 'Allinea a destra',
		audio: 'Audio',
		audio_modal_file: 'Seleziona da file',
		audio_modal_title: 'Inserisci audio',
		audio_modal_url: 'Indirizzo audio',
		autoSize: 'Ridimensione automatica',
		backgroundColor: 'Colore sottolineatura',
		basic: 'Da impostazione',
		bold: 'Grassetto',
		caption: 'Inserisci didascalia',
		center: 'Centrato',
		close: 'Chiudi',
		codeView: 'Visualizza codice',
		default: 'Predefinita',
		deleteColumn: 'Cancella colonna',
		deleteRow: 'Cancella riga',
		dir_ltr: 'Da sinistra a destra',
		dir_rtl: 'Da destra a sinistra',
		edit: 'Modifica',
		fixedColumnWidth: 'Larghezza delle colonne fissa',
		font: 'Font',
		fontColor: 'Colore testo',
		fontSize: 'Grandezza',
		formats: 'Formato',
		fullScreen: 'A tutto schermo',
		height: 'Altezza',
		horizontalLine: 'Linea orizzontale',
		horizontalSplit: 'Separa orizontalmente',
		hr_dashed: 'Trattini',
		hr_dotted: 'Puntini',
		hr_solid: 'Linea continua',
		image: 'Immagine',
		imageGallery: 'Galleria di immagini',
		image_modal_altText: 'Testo alternativo (ALT)',
		image_modal_file: 'Seleziona da file',
		image_modal_title: 'Inserisci immagine',
		image_modal_url: 'Indirizzo immagine',
		indent: 'Aumenta rientro',
		insertColumnAfter: 'Inserisci colonna dopo',
		insertColumnBefore: 'Inserisci colonna prima',
		insertRowAbove: 'Inserisci riga sopra',
		insertRowBelow: 'Inserisci riga sotto',
		italic: 'Corsivo',
		layout: 'Modello',
		left: 'Sinistra',
		lineHeight: 'Interlinea',
		link: 'Collegamento ipertestuale',
		link_modal_bookmark: 'Segnalibro',
		link_modal_downloadLinkCheck: 'Link per scaricare',
		link_modal_newWindowCheck: 'Apri in una nuova finestra',
		link_modal_text: 'Testo da visualizzare',
		link_modal_title: 'Inserisci un link',
		link_modal_url: 'Indirizzo',
		list: 'Elenco',
		math: 'Formula matematica',
		math_modal_fontSizeLabel: 'Grandezza testo',
		math_modal_inputLabel: 'Notazione matematica',
		math_modal_previewLabel: 'Anteprima',
		math_modal_title: 'Matematica',
		maxSize: 'Dimensione massima',
		mention: 'Menzione',
		menu_bordered: 'Bordato',
		menu_code: 'Codice'
		menu_neon: 'Luminoso',
		menu_shadow: 'Ombra',
		menu_spaced: 'Spaziato',
		menu_translucent: 'Traslucido',
		mergeCells: 'Unisci celle',
		minSize: 'Dimensione minima',
		mirrorHorizontal: 'Capovolgi orizzontalmente',
		mirrorVertical: 'Capovolgi verticalmente',
		orderList: 'Elenco numerato',
		outdent: 'Riduci rientro',
		paragraphStyle: 'Stile paragrafo',
		preview: 'Anteprima',
		print: 'Stampa',
		proportion: 'Proporzionale',
		ratio: 'Rapporto',
		redo: 'Ripristina',
		remove: 'Rimuovi',
		removeFormat: 'Rimuovi formattazione',
		resize100: 'Ridimensiona 100%',
		resize25: 'Ridimensiona 25%',
		resize50: 'Ridimensiona 50%',
		resize75: 'Ridimensiona 75%',
		resize: 'Ridimensiona',
		revertButton: 'Annulla',
		right: 'Destra',
		rotateLeft: 'Ruota a sinistra',
		rotateRight: 'Ruota a destra',
		save: 'Salva',
		search: 'Ricerca',
		showBlocks: 'Visualizza blocchi',
		size: 'Dimensioni',
		splitCells: 'Dividi celle',
		strike: 'Barrato',
		submitButton: 'Invia',
		subscript: 'Apice',
		superscript: 'Pedice',
		table: 'Tabella',
		tableHeader: 'Intestazione tabella',
		tags: 'tag',
		tag_blockquote: 'Citazione',
		tag_div: 'Normale (DIV)',
		tag_h: 'Titolo',
		tag_p: 'Paragrafo',
		tag_pre: 'Codice',
		template: 'Modello',
		textStyle: 'Stile testo',
		title: 'Titolo',
		underline: 'Sottolineato',
		undo: 'Annulla',
		unlink: 'Elimina link',
		unorderList: 'Elenco puntato',
		verticalSplit: 'Separa verticalmente',
		video: 'Video',
		video_modal_file: 'Seleziona da file',
		video_modal_title: 'Inserisci video',
		video_modal_url: 'Indirizzo video di embed, YouTube/Vimeo',
		width: 'Larghezza',
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

		Object.defineProperty(window.SUNEDITOR_LANG, 'it', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});
