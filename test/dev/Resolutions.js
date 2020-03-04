// Plugin to append resolution contents to the WYSIWYG editor
export default {
    // plugin name
    name: 'Resolutions',
    command: 'submenu',

    // add function - It is called only once when the plugin is first run.
    // This function generates HTML to append and register the event.
    // arguments - (core : core object, targetElement : clicked button element)
    add: function (core, targetElement) {

        // Registering a namespace for caching as a plugin name in the context object
        const context = core.context;
        context.custom = {
            textElement: null
        };

        // Generate submenu HTML
        // Always bind "core" when calling a plugin function
        let listDiv = this.setSubmenu.call(core);

        // Input tag caching
        context.custom.textElement = listDiv.getElementsByTagName('TEXTAREA')[0];

        // You must bind "core" object when registering an event.
        /** add event listeners */
        listDiv.getElementsByTagName('BUTTON')[0].addEventListener('click', this.onClick.bind(core));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);
    },

    setSubmenu: function () {
        const listDiv = this.util.createElement('DIV');

        listDiv.className = 'se-list-layer';
        listDiv.innerHTML = '' +
            '<div class="se-list-inner se-list-align" style="width: auto;">' + 
            '   <form class="se-submenu-form-group">' + 
            '   <ul class="se-list-basic">' +
            '       <li><div class="form-group form-material floating" data-plugin="formMaterial" style="margin: auto 2px;"><label class="form-control-label">Agenda item resolutions</label><textarea class="form-control" style="width: 500px; height: 90px;"></textarea></div></li>' +
            '       <li><button type="button" class="se-btn se-tooltip">' +
            '           <span>Done</span>' +
            '           <span class="se-tooltip-inner">' +
            '               <span class="se-tooltip-text">Append resolution(s)</span>' +
            '           </span>' +
            '       </button></li>' +
            '   </ul>' +
            '   </form>' + 
            '</div>';

        return listDiv;
    },

    // Called after the submenu has been rendered
    on: function () {
        this.context.custom.textElement.focus();
    },

    onClick: function () {
        this.history.push(true);

        const initialEditorContent = this.getContents();
        const title = initialEditorContent.search('Resolutions') === -1 ? '<h4><u>Resolutions</u></h4>' : '';

        if(this.context.custom.textElement.value.length > 0) {
            // Get Input value
            let value = title;
            const lines = this.context.custom.textElement.value.split('\n');
            for (let i = 0, len = lines.length; i < len; i++) {
                value += '<p>' + lines[i] + '</p>';
            }

            // rendering
            const template = this.util.createElement('DIV');
            template.innerHTML = value;
            
            // insert
            const children = template.children;
            let after, child;
            while (children[0]) {
                child = children[0];
                this.insertNode(child, after);
                after = child;
            }

            // set range (It is not necessary this code in the next version)
            // this.setRange(after, 1, after, 1);
            
            // clear content
            this.context.custom.textElement.value = null;
        }

        // submenu off
        this.submenuOff();

        // focus
        this.focus();
    }
};