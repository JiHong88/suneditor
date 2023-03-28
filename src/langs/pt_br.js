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
		code: 'pt_br',
		default: 'Padrão',
		save: 'Salvar',
		font: 'Fonte',
		formats: 'Formatos',
		fontSize: 'Tamanho',
		bold: 'Negrito',
		underline: 'Sublinhado',
		italic: 'Itálico',
		strike: 'Riscado',
		subscript: 'Subescrito',
		superscript: 'Sobrescrito',
		removeFormat: 'Remover Formatação',
		fontColor: 'Cor da Fonte',
		backgroundColor: 'Cor de destaque',
		indent: 'Recuo',
		outdent: 'Avançar',
		align: 'Alinhar',
		alignLeft: 'Alinhar à esquerda',
		alignRight: 'Alinhar à direita',
		alignCenter: 'Centralizar',
		alignJustify: 'Justificar',
		list: 'Lista',
		orderList: 'Lista ordenada',
		unorderList: 'Lista desordenada',
		horizontalLine: 'Linha horizontal',
		hr_solid: 'sólida',
		hr_dotted: 'pontilhada',
		hr_dashed: 'tracejada',
		table: 'Tabela',
		link: 'Link',
		math: 'Matemática',
		image: 'Imagem',
		video: 'Vídeo',
		audio: 'Áudio',
		fullScreen: 'Tela cheia',
		showBlocks: 'Mostrar blocos',
		codeView: 'Mostrar códigos',
		undo: 'Voltar',
		redo: 'Refazer',
		preview: 'Prever',
		print: 'Imprimir',
		tag_p: 'Paragráfo',
		tag_div: '(DIV) Normal',
		tag_h: 'Cabeçalho',
		tag_blockquote: 'Citar',
		tag_pre: 'Código',
		template: 'Modelo',
		lineHeight: 'Altura da linha',
		paragraphStyle: 'Estilo do parágrafo',
		textStyle: 'Estilo do texto',
		imageGallery: 'Galeria de imagens',
		dir_ltr: 'Esquerda para direita',
		dir_rtl: 'Direita para esquerda',
		mention: 'Menção',
		tags: 'Tag',
		search: 'Procurar',
		caption: 'Inserir descrição',
		close: 'Fechar',
		submitButton: 'Enviar',
		revertButton: 'Reverter',
		proportion: 'Restringir proporções',
		basic: 'Básico',
		left: 'Esquerda',
		right: 'Direita',
		center: 'Centro',
		width: 'Largura',
		height: 'Altura',
		size: 'Tamanho',
		ratio: 'Proporções',
		edit: 'Editar',
		unlink: 'Remover link',
		remove: 'Remover',
		link_modal_title: 'Inserir link',
		link_modal_url: 'URL para link',
		link_modal_text: 'Texto a mostrar',
		link_modal_newWindowCheck: 'Abrir em nova guia',
		link_modal_downloadLinkCheck: 'Link para Download',
		link_modal_bookmark: 'marcar páginas',
		math_modal_title: 'Matemática',
		math_modal_inputLabel: 'Notação matemática',
		math_modal_fontSizeLabel: 'Tamanho',
		math_modal_previewLabel: 'Prever',
		image_modal_title: 'Inserir imagens',
		image_modal_file: 'Selecionar arquivos',
		image_modal_url: 'URL da imagem',
		image_modal_altText: 'Texto alternativo',
		video_modal_title: 'Inserir vídeo',
		video_modal_file: 'Selecionar arquivos',
		video_modal_url: 'URL do YouTube/Vimeo',
		audio_modal_title: 'Inserir áudio',
		audio_modal_file: 'Selecionar arquivos',
		audio_modal_url: 'URL da áudio',
		insertRowAbove: 'Inserir linha acima',
		insertRowBelow: 'Inserir linha abaixo',
		deleteRow: 'Deletar linha',
		insertColumnBefore: 'Inserir coluna antes',
		insertColumnAfter: 'Inserir coluna depois',
		deleteColumn: 'Deletar coluna',
		fixedColumnWidth: 'Largura fixa da coluna',
		resize100: 'Redimensionar para 100%',
		resize75: 'Redimensionar para 75%',
		resize50: 'Redimensionar para 50%',
		resize25: 'Redimensionar para 25%',
		autoSize: 'Tamanho automático',
		mirrorHorizontal: 'Espelho, Horizontal',
		mirrorVertical: 'Espelho, Vertical',
		rotateLeft: 'Girar para esquerda',
		rotateRight: 'Girar para direita',
		maxSize: 'Tam máx',
		minSize: 'Tam mín',
		tableHeader: 'Cabeçalho da tabela',
		mergeCells: 'Mesclar células',
		splitCells: 'Dividir células',
		horizontalSplit: 'Divisão horizontal',
		verticalSplit: 'Divisão vertical',
		menu_spaced: 'Espaçado',
		menu_bordered: 'Com borda',
		menu_neon: 'Neon',
		menu_translucent: 'Translúcido',
		menu_shadow: 'Sombreado',
		menu_code: 'Código'
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