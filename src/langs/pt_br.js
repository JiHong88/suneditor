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
		code: 'pt_br',
		align: 'Alinhar',
		alignCenter: 'Centralizar',
		alignJustify: 'Justificar',
		alignLeft: 'Alinhar à esquerda',
		alignRight: 'Alinhar à direita',
		audio: 'Áudio',
		audio_modal_file: 'Selecionar arquivos',
		audio_modal_title: 'Inserir áudio',
		audio_modal_url: 'URL da áudio',
		autoSize: 'Tamanho automático',
		backgroundColor: 'Cor de destaque',
		basic: 'Básico',
		bold: 'Negrito',
		caption: 'Inserir descrição',
		center: 'Centro',
		close: 'Fechar',
		codeView: 'Mostrar códigos',
		default: 'Padrão',
		deleteColumn: 'Deletar coluna',
		deleteRow: 'Deletar linha',
		dir_ltr: 'Esquerda para direita',
		dir_rtl: 'Direita para esquerda',
		edit: 'Editar',
		fixedColumnWidth: 'Largura fixa da coluna',
		font: 'Fonte',
		fontColor: 'Cor da Fonte',
		fontSize: 'Tamanho',
		formats: 'Formatos',
		fullScreen: 'Tela cheia',
		height: 'Altura',
		horizontalLine: 'Linha horizontal',
		horizontalSplit: 'Divisão horizontal',
		hr_dashed: 'tracejada',
		hr_dotted: 'pontilhada',
		hr_solid: 'sólida',
		image: 'Imagem',
		imageGallery: 'Galeria de imagens',
		image_modal_altText: 'Texto alternativo',
		image_modal_file: 'Selecionar arquivos',
		image_modal_title: 'Inserir imagens',
		image_modal_url: 'URL da imagem',
		indent: 'Recuo',
		insertColumnAfter: 'Inserir coluna depois',
		insertColumnBefore: 'Inserir coluna antes',
		insertRowAbove: 'Inserir linha acima',
		insertRowBelow: 'Inserir linha abaixo',
		italic: 'Itálico',
		layout: 'Layout',
		left: 'Esquerda',
		lineHeight: 'Altura da linha',
		link: 'Link',
		link_modal_bookmark: 'marcar páginas',
		link_modal_downloadLinkCheck: 'Link para Download',
		link_modal_newWindowCheck: 'Abrir em nova guia',
		link_modal_text: 'Texto a mostrar',
		link_modal_title: 'Inserir link',
		link_modal_url: 'URL para o link',
		list: 'Lista',
		math: 'Matemática',
		math_modal_fontSizeLabel: 'Tamanho',
		math_modal_inputLabel: 'Notação matemática',
		math_modal_previewLabel: 'Prever',
		math_modal_title: 'Matemática',
		maxSize: 'Tam máx',
		mention: 'Menção',
		menu_bordered: 'Com borda',
		menu_code: 'Código'
		menu_neon: 'Neon',
		menu_shadow: 'Sombreado',
		menu_spaced: 'Espaçado',
		menu_translucent: 'Translúcido',
		mergeCells: 'Mesclar células',
		minSize: 'Tam mín',
		mirrorHorizontal: 'Espelho, Horizontal',
		mirrorVertical: 'Espelho, Vertical',
		orderList: 'Lista ordenada',
		outdent: 'Avançar',
		paragraphStyle: 'Estilo do parágrafo',
		preview: 'Prever',
		print: 'Imprimir',
		proportion: 'Restringir proporções',
		ratio: 'Proporções',
		redo: 'Refazer',
		remove: 'Remover',
		removeFormat: 'Remover Formatação',
		resize100: 'Zoom 100%',
		resize25: 'Zoom 25%',
		resize50: 'Zoom 50%',
		resize75: 'Zoom 75%',
		resize: 'Redimensionar',
		revertButton: 'Reverter',
		right: 'Direita',
		rotateLeft: 'Girar para esquerda',
		rotateRight: 'Girar para direita',
		save: 'Salvar',
		search: 'Procurar',
		showBlocks: 'Mostrar blocos',
		size: 'Tamanho',
		splitCells: 'Dividir células',
		strike: 'Riscado',
		submitButton: 'Enviar',
		subscript: 'Subescrito',
		superscript: 'Sobrescrito',
		table: 'Tabela',
		tableHeader: 'Cabeçalho da tabela',
		tags: 'Tag',
		tag_blockquote: 'Citar',
		tag_div: '(DIV) Normal',
		tag_h: 'Cabeçalho',
		tag_p: 'Paragráfo',
		tag_pre: 'Código',
		template: 'Modelo',
		textStyle: 'Estilo do texto',
		title: 'Título',
		underline: 'Sublinhado',
		undo: 'Voltar',
		unlink: 'Remover link',
		unorderList: 'Lista desordenada',
		verticalSplit: 'Divisão vertical',
		video: 'Vídeo',
		video_modal_file: 'Selecionar arquivos',
		video_modal_title: 'Inserir vídeo',
		video_modal_url: 'URL do YouTube/Vimeo',
		width: 'Largura',
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

		Object.defineProperty(window.SUNEDITOR_LANG, 'pt_br', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});