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
		align: 'Justering',
		alignCenter: 'Midterjustering',
		alignJustify: 'Tilpas margin',
		alignLeft: 'Venstrejustering',
		alignRight: 'Højrejustering',
		audio: 'Audio',
		audio_modal_file: 'Indsæt fra fil',
		audio_modal_title: 'Indsæt Audio',
		audio_modal_url: 'Indsæt fra URL',
		autoSize: 'Auto størrelse',
		backgroundColor: 'Baggrundsfarve',
		basic: 'Basis',
		bold: 'Fed',
		caption: 'Indsæt beskrivelse',
		center: 'Center',
		close: 'Luk',
		codeView: 'Vis koder',
		default: 'Default',
		deleteColumn: 'Slet kolonne',
		deleteRow: 'Slet række',
		dir_ltr: 'Venstre til højre',
		dir_rtl: 'Højre til venstre',
		edit: 'Rediger',
		fixedColumnWidth: 'Fast søjlebredde',
		font: 'Skrifttype',
		fontColor: 'Skriftfarve',
		fontSize: 'Skriftstørrelse',
		formats: 'Format',
		fullScreen: 'Fuld skærm',
		height: 'Højde',
		horizontalLine: 'Horisontal linie',
		horizontalSplit: 'Opdel horisontalt',
		hr_dashed: 'Streget',
		hr_dotted: 'Punkteret',
		hr_solid: 'Almindelig',
		image: 'Billede',
		imageGallery: 'Billedgalleri',
		image_modal_altText: 'Alternativ tekst',
		image_modal_file: 'Indsæt fra fil',
		image_modal_title: 'Indsæt billede',
		image_modal_url: 'Indsæt fra URL',
		indent: 'Ryk ind',
		insertColumnAfter: 'Indsæt kolonne efter',
		insertColumnBefore: 'Indsæt kolonne før',
		insertRowAbove: 'Indsæt række foroven',
		insertRowBelow: 'Indsæt række nedenfor',
		italic: 'Skråskrift',
		layout: 'Layout',
		left: 'Venstre',
		lineHeight: 'Linjehøjde',
		link: 'Link',
		link_modal_bookmark: 'Bogmærke',
		link_modal_downloadLinkCheck: 'Download link',
		link_modal_newWindowCheck: 'Åben i nyt faneblad',
		link_modal_text: 'Tekst for link',
		link_modal_title: 'Indsæt link',
		link_modal_url: 'URL til link',
		list: 'Lister',
		math: 'Math',
		math_modal_fontSizeLabel: 'Skriftstørrelse',
		math_modal_inputLabel: 'Matematisk notation',
		math_modal_previewLabel: 'Preview',
		math_modal_title: 'Math',
		maxSize: 'Max størrelse',
		mention: 'Nævne',
		menu_bordered: 'Afgrænsningslinje',
		menu_code: 'Code'
		menu_neon: 'Neon',
		menu_shadow: 'Skygge',
		menu_spaced: 'Brev Afstand',
		menu_translucent: 'Gennemsigtig',
		mergeCells: 'Sammenlæg celler (merge)',
		minSize: 'Min størrelse',
		mirrorHorizontal: 'Spejling, horisontal',
		mirrorVertical: 'Spejling, vertikal',
		orderList: 'Nummereret liste',
		outdent: 'Ryk ud',
		paragraphStyle: 'Afsnitstil',
		preview: 'Preview',
		print: 'Print',
		proportion: 'Bevar proportioner',
		ratio: 'Forhold',
		redo: 'Redo',
		remove: 'Fjern',
		removeFormat: 'Fjern formatering',
		resize100: 'Forstør 100%',
		resize25: 'Forstør 25%',
		resize50: 'Forstør 50%',
		resize75: 'Forstør 75%',
		resize: 'Resize',
		revertButton: 'Gendan',
		right: 'Højre',
		rotateLeft: 'Roter til venstre',
		rotateRight: 'Toter til højre',
		save: 'Gem',
		search: 'Søg',
		showBlocks: 'Vis blokke',
		size: 'Størrelse',
		splitCells: 'Opdel celler',
		strike: 'Overstreget',
		submitButton: 'Gennemfør',
		subscript: 'Sænket skrift',
		superscript: 'Hævet skrift',
		table: 'Tabel',
		tableHeader: 'Tabel overskrift',
		tags: 'Tags',
		tag_blockquote: 'Citer',
		tag_div: 'Normal (DIV)',
		tag_h: 'Overskrift',
		tag_p: 'Paragraph',
		tag_pre: 'Code',
		template: 'Schablone',
		textStyle: 'Tekststil',
		underline: 'Understreget',
		undo: 'Undo',
		unlink: 'Fjern link',
		unorderList: 'Uordnet liste',
		verticalSplit: 'Opdel vertikalt',
		video: 'Video',
		video_modal_file: 'Indsæt fra fil',
		video_modal_title: 'Indsæt Video',
		video_modal_url: 'Indlejr video / YouTube,Vimeo',
		width: 'Bredde',
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
