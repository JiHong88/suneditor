/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

import util from './lib/util';
import core from './lib/core';
import _Constructor from './lib/constructor';
import _Context from './lib/context';
import _defaultLang from './lang/en'


const SUNEDITOR = {
    util,
    core,
    _Constructor,
    _Context,
    _defaultLang,
    /**
     * @description Create the suneditor
     * @param {string} elementId - textarea Id
     * @param {json} options - user options
     * @returns {{save: save, getContent: getContent, setContent: setContent, appendContent: appendContent, disabled: disabled, enabled: enabled, show: show, hide: hide, destroy: destroy}}
     */
    create: function (idOrElement, options) {
        const element = typeof idOrElement === 'string' ? document.getElementById(idOrElement) : idOrElement;

        if (!element) {
            if (typeof idOrElement === 'string') {
                throw Error('[SUNEDITOR.create.fail] The element for that id was not found (ID:"' + idOrElement + '")');
            }

            throw Error('[SUNEDITOR.create.fail] suneditor requires textarea\'s element or id value');
        }

        const cons = this._Constructor.init(element, options, (options.lang || this._defaultLang));

        if (document.getElementById(cons.constructed._top.id)) {
            throw Error('[SUNEDITOR.create.fail] The ID of the suneditor you are trying to create already exists (ID:"' + cons.constructed._top.id + '")');
        }

        element.style.display = 'none';
        cons.constructed._top.style.display = 'block';

        /** Create to sibling node */
        if (typeof element.nextElementSibling === 'object') {
            element.parentNode.insertBefore(cons.constructed._top, element.nextElementSibling);
        } else {
            element.parentNode.appendChild(cons.constructed._top);
        }

        return this.core(this._Context(element, cons.constructed, cons.options), this.util, cons.modules, cons.plugins, cons.lang);
    }
};

export default SUNEDITOR;