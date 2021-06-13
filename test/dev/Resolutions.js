export default {
    // @Required @Unique
    // plugin name
    name: 'Resolutions',

    // @Required
    // data display
    display: 'submenu',

    // @Options
    title: 'Custom plugin of the submenu', 
    buttonClass: '', 
    innerHTML: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>',

    // @Required
    // add function - It is called only once when the plugin is first run.
    // This function generates HTML to append and register the event.
    // arguments - (core : core object, targetElement : clicked button element)
    add: function (core, targetElement) {

        // @Required
        // Registering a namespace for caching as a plugin name in the context object
        const context = core.context;
        context.customSubmenu = {
            targetButton: targetElement,
            textElement: null,
            currentSpan: null
        };

        // Generate submenu HTML
        // Always bind "core" when calling a plugin function
        let listDiv = this.setSubmenu(core);

        // Input tag caching
        context.customSubmenu.textElement = listDiv.querySelector('input');

        // You must bind "core" object when registering an event.
        /** add event listeners */
        listDiv.querySelector('.se-btn-primary').addEventListener('click', this.onClick.bind(core));
        listDiv.querySelector('.se-btn').addEventListener('click', this.onClickRemove.bind(core));

        // @Required
        // You must add the "submenu" element using the "core.initMenuTarget" method.
        /** append target button menu */
        core.initMenuTarget(this.name, targetElement, listDiv);
    },

    setSubmenu: function (core) {
        const listDiv = core.util.createElement('DIV');
        // @Required
        // A "se-submenu" class is required for the top level element.
        listDiv.className = 'se-submenu se-list-layer';
        listDiv.innerHTML = '' +
            '<div class="se-list-inner">' +
                '<ul class="se-list-basic" style="width: 230px;">' +
                    '<li>' +
                        '<div class="se-form-group">' +
                            '<input class="se-input-form" type="text" placeholder="insert text" style="border: 1px solid #CCC;" />' +
                            '<button type="button" class="se-btn-primary se-tooltip">' +
                                '<strong>OK</strong>' +
                                '<span class="se-tooltip-inner">' +
                                    '<span class="se-tooltip-text">Append span</span>' +
                                '</span>' +
                            '</button>' +
                            '<button type="button" class="se-btn se-tooltip">' +
                                '<strong>X</strong>' +
                                '<span class="se-tooltip-inner">' +
                                    '<span class="se-tooltip-text">Remove</span>' +
                                '</span>' +
                            '</button>' +
                        '</div>' +
                    '</li>' +
                '</ul>' +
            '</div>';

        return listDiv;
    },

    // @Override
    // Plugins with active methods load immediately when the editor loads.
    // Called each time the selection is moved.
    active: function (element) {
        // If no tag matches, the "element" argument is called with a null value.
        if (!element) {
            this.util.removeClass(this.context.customSubmenu.targetButton, 'active');
            this.context.customSubmenu.textElement.value = '';
            this.context.customSubmenu.currentSpan = null;
        } else if (this.util.hasClass(element, 'se-custom-tag')) {
            this.util.addClass(this.context.customSubmenu.targetButton, 'active');
            this.context.customSubmenu.textElement.value = element.textContent;
            this.context.customSubmenu.currentSpan = element;
            return true;
        }
        
        return false;
    },

    // @Override
    // Called after the submenu has been rendered
    on: function () {
        this.context.customSubmenu.textElement.focus();
    },

    onClickRemove: function () {
        const span = this.context.customSubmenu.currentSpan;
        if (span) {
            this.util.removeItem(span);
            this.context.customSubmenu.currentSpan = null;

            this.submenuOff();
            this.focus();
        }
    },

    onClick: function () {
        const value = this.context.customSubmenu.textElement.value.trim();
        if (!value) return;

        const span = this.context.customSubmenu.currentSpan;
        if (span) {
            span.textContent = value;
            this.setRange(span, 1, span, 1);
        } else {
            this.insertHTML('<span class="se-custom-tag">' + value + '</span>');
            this.context.customSubmenu.textElement.value = '';
        }

        this.submenuOff();
    }
};