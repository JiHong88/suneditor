/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

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
}(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
	const lang = {
		code: 'es',
		toolbar: {
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
			hiliteColor: 'Color de resaltado',
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
			horizontalRule: 'Horizontal line',
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
			mention: 'Mencionar'
		},
		dialogBox: {
			linkBox: {
				title: 'Insertar Link',
				url: '¿Hacia que URL lleva el link?',
				text: 'Texto para mostrar',
				newWindowCheck: 'Abrir en una nueva ventana',
				downloadLinkCheck: 'Enlace de descarga',
                bookmark: 'Marcador'
			},
			mathBox: {
                title: 'Matemáticas',
                inputLabel: 'Notación Matemática',
                fontSizeLabel: 'Tamaño de fuente',
                previewLabel: 'Vista previa'
            },
			imageBox: {
				title: 'Insertar imagen',
				file: 'Seleccionar desde los archivos',
				url: 'URL de la imagen',
				altText: 'Texto alternativo'
			},
			videoBox: {
				title: 'Insertar Video',
				file: 'Seleccionar desde los archivos',
				url: '¿URL del vídeo? Youtube/Vimeo'
			},
			audioBox: {
                title: 'Insertar Audio',
                file: 'Seleccionar desde los archivos',
                url: 'URL de la audio'
            },
            browser: {
                tags: 'Etiquetas',
                search: 'Buscar',
            },
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
			ratio: 'Proporción'
		},
		controller: {
			edit: 'Editar',
			unlink: 'Desvincular',
			remove: 'RemoveQuitar',
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
			HorizontalSplit: 'División horizontal',
			VerticalSplit: 'División vertical'
		},
		menu: {
			spaced: 'Espaciado',
			bordered: 'Bordeado',
			neon: 'Neón',
			translucent: 'Translúcido',
			shadow: 'Sombreado',
            code: 'Código'
		}
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
}));