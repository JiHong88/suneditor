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
		code: 'da',
		default: 'Default',
		save: 'Gem',
		font: 'Skrifttype',
		formats: 'Format',
		fontSize: 'Skriftstørrelse',
		bold: 'Fed',
		underline: 'Understreget',
		italic: 'Skråskrift',
		strike: 'Overstreget',
		subscript: 'Sænket skrift',
		superscript: 'Hævet skrift',
		removeFormat: 'Fjern formatering',
		fontColor: 'Skriftfarve',
		backgroundColor: 'Baggrundsfarve',
		indent: 'Ryk ind',
		outdent: 'Ryk ud',
		align: 'Justering',
		alignLeft: 'Venstrejustering',
		alignRight: 'Højrejustering',
		alignCenter: 'Midterjustering',
		alignJustify: 'Tilpas margin',
		list: 'Lister',
		orderList: 'Nummereret liste',
		unorderList: 'Uordnet liste',
		horizontalLine: 'Horisontal linie',
		hr_solid: 'Almindelig',
		hr_dotted: 'Punkteret',
		hr_dashed: 'Streget',
		table: 'Tabel',
		link: 'Link',
		math: 'Math',
		image: 'Billede',
		video: 'Video',
		audio: 'Audio',
		fullScreen: 'Fuld skærm',
		showBlocks: 'Vis blokke',
		codeView: 'Vis koder',
		undo: 'Undo',
		redo: 'Redo',
		preview: 'Preview',
		print: 'Print',
		tag_p: 'Paragraph',
		tag_div: 'Normal (DIV)',
		tag_h: 'Overskrift',
		tag_blockquote: 'Citer',
		tag_pre: 'Code',
		template: 'Schablone',
		lineHeight: 'Linjehøjde',
		paragraphStyle: 'Afsnitstil',
		textStyle: 'Tekststil',
		imageGallery: 'Billedgalleri',
		dir_ltr: 'Venstre til højre',
		dir_rtl: 'Højre til venstre',
		mention: 'Nævne',
		tags: 'Tags',
		search: 'Søg',
		caption: 'Indsæt beskrivelse',
		close: 'Luk',
		submitButton: 'Gennemfør',
		revertButton: 'Gendan',
		proportion: 'Bevar proportioner',
		basic: 'Basis',
		left: 'Venstre',
		right: 'Højre',
		center: 'Center',
		width: 'Bredde',
		height: 'Højde',
		size: 'Størrelse',
		ratio: 'Forhold',
		edit: 'Rediger',
		unlink: 'Fjern link',
		remove: 'Fjern',
		link_modal_title: 'Indsæt link',
		link_modal_url: 'URL til link',
		link_modal_text: 'Tekst for link',
		link_modal_newWindowCheck: 'Åben i nyt faneblad',
		link_modal_downloadLinkCheck: 'Download link',
		link_modal_bookmark: 'Bogmærke',
		math_modal_title: 'Math',
		math_modal_inputLabel: 'Matematisk notation',
		math_modal_fontSizeLabel: 'Skriftstørrelse',
		math_modal_previewLabel: 'Preview',
		image_modal_title: 'Indsæt billede',
		image_modal_file: 'Indsæt fra fil',
		image_modal_url: 'Indsæt fra URL',
		image_modal_altText: 'Alternativ tekst',
		video_modal_title: 'Indsæt Video',
		video_modal_file: 'Indsæt fra fil',
		video_modal_url: 'Indlejr video / YouTube,Vimeo',
		audio_modal_title: 'Indsæt Audio',
		audio_modal_file: 'Indsæt fra fil',
		audio_modal_url: 'Indsæt fra URL',
		insertRowAbove: 'Indsæt række foroven',
		insertRowBelow: 'Indsæt række nedenfor',
		deleteRow: 'Slet række',
		insertColumnBefore: 'Indsæt kolonne før',
		insertColumnAfter: 'Indsæt kolonne efter',
		deleteColumn: 'Slet kolonne',
		fixedColumnWidth: 'Fast søjlebredde',
		resize100: 'Forstør 100%',
		resize75: 'Forstør 75%',
		resize50: 'Forstør 50%',
		resize25: 'Forstør 25%',
		autoSize: 'Auto størrelse',
		mirrorHorizontal: 'Spejling, horisontal',
		mirrorVertical: 'Spejling, vertikal',
		rotateLeft: 'Roter til venstre',
		rotateRight: 'Toter til højre',
		maxSize: 'Max størrelse',
		minSize: 'Min størrelse',
		tableHeader: 'Tabel overskrift',
		mergeCells: 'Sammenlæg celler (merge)',
		splitCells: 'Opdel celler',
		horizontalSplit: 'Opdel horisontalt',
		verticalSplit: 'Opdel vertikalt',
		menu_spaced: 'Brev Afstand',
		menu_bordered: 'Afgrænsningslinje',
		menu_neon: 'Neon',
		menu_translucent: 'Gennemsigtig',
		menu_shadow: 'Skygge',
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

		Object.defineProperty(window.SUNEDITOR_LANG, 'da', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});
