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
		code: 'es',
		default: 'Valor por defecto',
		save: 'Guardar',
		font: 'Fuente',
		formats: 'Formato',
		fontSize: 'Tamaño de fuente',
		bold: 'Negrita',
		underline: 'Subrayado',
		italic: 'Cursiva',
		strike: 'Tachado',
		subscript: 'Subíndice',
		superscript: 'Superíndice',
		removeFormat: 'Eliminar formato',
		fontColor: 'Color de fuente',
		backgroundColor: 'Color de resaltado',
		indent: 'Más tabulación',
		outdent: 'Menos tabulación',
		align: 'Alinear',
		alignLeft: 'Alinear a la izquierda',
		alignRight: 'Alinear a la derecha',
		alignCenter: 'Alinear al centro',
		alignJustify: 'Justificar',
		list: 'Lista',
		orderList: 'Lista ordenada',
		unorderList: 'Lista desordenada',
		horizontalLine: 'Horizontal line',
		hr_solid: 'Línea horizontal solida',
		hr_dotted: 'Línea horizontal punteada',
		hr_dashed: 'Línea horizontal discontinua',
		table: 'Tabla',
		link: 'Link',
		math: 'Matemáticas',
		image: 'Imagen',
		video: 'Video',
		audio: 'Audio',
		fullScreen: 'Pantalla completa',
		showBlocks: 'Ver bloques',
		codeView: 'Ver código fuente',
		undo: 'UndoDeshacer última acción',
		redo: 'Rehacer última acción',
		preview: 'Vista previa',
		print: 'Imprimir',
		tag_p: 'Párrafo',
		tag_div: 'Normal (DIV)',
		tag_h: 'Header',
		tag_blockquote: 'Cita',
		tag_pre: 'Código',
		template: 'Plantilla',
		lineHeight: 'Altura de la línea',
		paragraphStyle: 'Estilo del parrafo',
		textStyle: 'Estilo del texto',
		imageGallery: 'Galería de imágenes',
		dir_ltr: 'De izquierda a derecha',
		dir_rtl: 'De derecha a izquierda',
		mention: 'Mencionar',
		tags: 'Etiquetas',
		search: 'Buscar',
		caption: 'Insertar descripción',
		close: 'Cerrar',
		submitButton: 'Enviar',
		revertButton: 'revertir',
		proportion: 'Restringir las proporciones',
		basic: 'Basico',
		left: 'Izquierda',
		right: 'derecha',
		center: 'Centro',
		width: 'Ancho',
		height: 'Alto',
		size: 'Tamaño',
		ratio: 'Proporción',
		edit: 'Editar',
		unlink: 'Desvincular',
		remove: 'RemoveQuitar',
		link_modal_title: 'Insertar Link',
		link_modal_url: '¿Hacia que URL lleva el link?',
		link_modal_text: 'Texto para mostrar',
		link_modal_newWindowCheck: 'Abrir en una nueva ventana',
		link_modal_downloadLinkCheck: 'Enlace de descarga',
		link_modal_bookmark: 'Marcador',
		math_modal_title: 'Matemáticas',
		math_modal_inputLabel: 'Notación Matemática',
		math_modal_fontSizeLabel: 'Tamaño de fuente',
		math_modal_previewLabel: 'Vista previa',
		image_modal_title: 'Insertar imagen',
		image_modal_file: 'Seleccionar desde los archivos',
		image_modal_url: 'URL de la imagen',
		image_modal_altText: 'Texto alternativo',
		video_modal_title: 'Insertar Video',
		video_modal_file: 'Seleccionar desde los archivos',
		video_modal_url: '¿URL del vídeo? Youtube/Vimeo',
		audio_modal_title: 'Insertar Audio',
		audio_modal_file: 'Seleccionar desde los archivos',
		audio_modal_url: 'URL de la audio',
		insertRowAbove: 'Insertar fila arriba',
		insertRowBelow: 'Insertar fila debajo',
		deleteRow: 'Eliminar fila',
		insertColumnBefore: 'Insertar columna antes',
		insertColumnAfter: 'Insertar columna después',
		deleteColumn: 'Eliminar columna',
		fixedColumnWidth: 'Ancho de columna fijo',
		resize100: 'Redimensionar 100%',
		resize75: 'Redimensionar 75%',
		resize50: 'Redimensionar 50%',
		resize25: 'Redimensionar 25%',
		autoSize: 'Tamaño automático',
		mirrorHorizontal: 'Espejo, Horizontal',
		mirrorVertical: 'Espejo, Vertical',
		rotateLeft: 'Girar a la izquierda',
		rotateRight: 'Girar a la derecha',
		maxSize: 'Tamaño máximo',
		minSize: 'Tamaño minímo',
		tableHeader: 'Encabezado de tabla',
		mergeCells: 'Combinar celdas',
		splitCells: 'Dividir celdas',
		horizontalSplit: 'División horizontal',
		verticalSplit: 'División vertical',
		menu_spaced: 'Espaciado',
		menu_bordered: 'Bordeado',
		menu_neon: 'Neón',
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

		Object.defineProperty(window.SUNEDITOR_LANG, 'es', {
			enumerable: true,
			writable: true,
			configurable: true,
			value: lang
		});
	}

	return lang;
});
