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
			image: 'Imagen',
			video: 'Video',
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
			textStyle: 'Estilo del texto'
		},
		dialogBox: {
			linkBox: {
				title: 'Insertar Link',
				url: '¿Hacia que URL lleva el link?',
				text: 'Texto para mostrar',
				newWindowCheck: 'Abrir en una nueva ventana'
			},
			imageBox: {
				title: 'Insertar imagen',
				file: 'Seleccionar desde los archivos',
				url: 'URL de la imagen',
				altText: 'Texto alternativo'
			},
			videoBox: {
				title: 'Insertar Video',
				url: '¿URL del vídeo? Youtube'
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
			shadow: 'Sombreado'
		}
	};

	if (typeof noGlobal === typeof undefined) {
		if (!window.SUNEDITOR_LANG) {
			window.SUNEDITOR_LANG = {};
		}

		window.SUNEDITOR_LANG.es = lang;
	}

	return lang;
}));