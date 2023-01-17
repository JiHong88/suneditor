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
		default: 'Predefinita',
		save: 'Salva',
		font: 'Font',
		formats: 'Formato',
		fontSize: 'Grandezza',
		bold: 'Grassetto',
		underline: 'Sottolineato',
		italic: 'Corsivo',
		strike: 'Barrato',
		subscript: 'Apice',
		superscript: 'Pedice',
		removeFormat: 'Rimuovi formattazione',
		fontColor: 'Colore testo',
		backgroundColor: 'Colore sottolineatura',
		indent: 'Aumenta rientro',
		outdent: 'Riduci rientro',
		align: 'Allinea',
		alignLeft: 'Allinea a sinistra',
		alignRight: 'Allinea a destra',
		alignCenter: 'Allinea al centro',
		alignJustify: 'Giustifica testo',
		list: 'Elenco',
		orderList: 'Elenco numerato',
		unorderList: 'Elenco puntato',
		horizontalLine: 'Linea orizzontale',
		hr_solid: 'Linea continua',
		hr_dotted: 'Puntini',
		hr_dashed: 'Trattini',
		table: 'Tabella',
		link: 'Collegamento ipertestuale',
		math: 'Formula matematica',
		image: 'Immagine',
		video: 'Video',
		audio: 'Audio',
		fullScreen: 'A tutto schermo',
		showBlocks: 'Visualizza blocchi',
		codeView: 'Visualizza codice',
		undo: 'Annulla',
		redo: 'Ripristina',
		preview: 'Anteprima',
		print: 'Stampa',
		tag_p: 'Paragrafo',
		tag_div: 'Normale (DIV)',
		tag_h: 'Titolo',
		tag_blockquote: 'Citazione',
		tag_pre: 'Codice',
		template: 'Modello',
		lineHeight: 'Interlinea',
		paragraphStyle: 'Stile paragrafo',
		textStyle: 'Stile testo',
		imageGallery: 'Galleria di immagini',
		dir_ltr: 'Da sinistra a destra',
		dir_rtl: 'Da destra a sinistra',
		mention: 'Menzione',
		tags: 'tag',
		search: 'Ricerca',
		caption: 'Inserisci didascalia',
		close: 'Chiudi',
		submitButton: 'Invia',
		revertButton: 'Annulla',
		proportion: 'Proporzionale',
		basic: 'Da impostazione',
		left: 'Sinistra',
		right: 'Destra',
		center: 'Centrato',
		width: 'Larghezza',
		height: 'Altezza',
		size: 'Dimensioni',
		ratio: 'Rapporto',
		edit: 'Modifica',
		unlink: 'Elimina link',
		remove: 'Rimuovi',
		link_modal_title: 'Inserisci un link',
		link_modal_url: 'Indirizzo',
		link_modal_text: 'Testo da visualizzare',
		link_modal_newWindowCheck: 'Apri in una nuova finestra',
		link_modal_downloadLinkCheck: 'Link per scaricare',
		link_modal_bookmark: 'Segnalibro',
		math_modal_title: 'Matematica',
		math_modal_inputLabel: 'Notazione matematica',
		math_modal_fontSizeLabel: 'Grandezza testo',
		math_modal_previewLabel: 'Anteprima',
		image_modal_title: 'Inserisci immagine',
		image_modal_file: 'Seleziona da file',
		image_modal_url: 'Indirizzo immagine',
		image_modal_altText: 'Testo alternativo (ALT)',
		video_modal_title: 'Inserisci video',
		video_modal_file: 'Seleziona da file',
		video_modal_url: 'Indirizzo video di embed, YouTube/Vimeo',
		audio_modal_title: 'Inserisci audio',
		audio_modal_file: 'Seleziona da file',
		audio_modal_url: 'Indirizzo audio',
		insertRowAbove: 'Inserisci riga sopra',
		insertRowBelow: 'Inserisci riga sotto',
		deleteRow: 'Cancella riga',
		insertColumnBefore: 'Inserisci colonna prima',
		insertColumnAfter: 'Inserisci colonna dopo',
		deleteColumn: 'Cancella colonna',
		fixedColumnWidth: 'Larghezza delle colonne fissa',
		resize100: 'Ridimensiona 100%',
		resize75: 'Ridimensiona 75%',
		resize50: 'Ridimensiona 50%',
		resize25: 'Ridimensiona 25%',
		autoSize: 'Ridimensione automatica',
		mirrorHorizontal: 'Capovolgi orizzontalmente',
		mirrorVertical: 'Capovolgi verticalmente',
		rotateLeft: 'Ruota a sinistra',
		rotateRight: 'Ruota a destra',
		maxSize: 'Dimensione massima',
		minSize: 'Dimensione minima',
		tableHeader: 'Intestazione tabella',
		mergeCells: 'Unisci celle',
		splitCells: 'Dividi celle',
		horizontalSplit: 'Separa orizontalmente',
		verticalSplit: 'Separa verticalmente',
		menu_spaced: 'Spaziato',
		menu_bordered: 'Bordato',
		menu_neon: 'Luminoso',
		menu_translucent: 'Traslucido',
		menu_shadow: 'Ombra',
		menu_code: 'Codice'
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
