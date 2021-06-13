import $ from 'jquery';
import 'jquery-ui/themes/base/all.css';
import 'jquery-ui/ui/widgets/datepicker'

export default {
    name: 'subLib',
    display: 'submenu',
    innerHTML: 'C',
    add: function (core, targetElement) {

        // Registering a namespace for caching as a plugin name in the context object
        const context = core.context;
        context.custom = {
            textElement: null
        };

        // Generate submenu HTML
        // Always bind "core" when calling a plugin function
        let listDiv = this.setSubmenu(core);

        // Input tag caching
        context.custom.textElement = [...listDiv.getElementsByTagName('INPUT'), listDiv.getElementsByTagName('SELECT')[0]];

        // You must bind "core" object when registering an event.
        /** add event listeners */
        listDiv.getElementsByTagName('BUTTON')[0].addEventListener('click', this.onClick.bind(core));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);

        $(function() {
            $("#datepicker").datepicker({
                onSelect: date => listDiv.querySelector('#duedate').value = date,
                dateFormat: 'DD, d MM, yy',
                changeMonth: true,
                changeYear: true
            });
        });
    },

    setSubmenu: function (core) {
        const listDiv = core.util.createElement('DIV');

        let userOptions = '';
        const assigneables = [{name: 'JiHong'}, {name: 'Henry'}]
        assigneables.map(user => userOptions += `<option value="${user.name}">${user.name}</option>`);

        listDiv.className = 'se-list-layer se-list-align';
        listDiv.innerHTML = '' + 
            `<div class="se-list-inner" style="width: auto;">
               <form class="se-form-group">
               <ul class="se-list-basic">
                   <li><div class="form-group form-material floating" data-plugin="formMaterial"><label class="form-control-label">Action</label><input class="form-control" type="text" style="width: 250px; border-bottom: none; text-transform: none;" /></div></li>
                   <li><div class="form-group form-material" data-plugin="formMaterial"><label class="form-control-label">Assignee</label><select class="form-control" style="width: 250px; border-bottom: none;">${userOptions}</select></div></li>
                   <li><div class="form-group form-material" data-plugin="formMaterial"><label class="form-control-label">Due date</label><input class="form-control" type="text" id="duedate" style="width: 250px; border-bottom: none; text-transform: none;" disabled /><div id="datepicker" style="margin: 5px;"></div></div></li>
                   <li><button type="button" class="se-btn se-tooltip" style="margin-top: 10px;">
                       <span>Done</span>
                       <span class="se-tooltip-inner">
                           <span class="se-tooltip-text">Append item</span>
                       </span>
                   </button></li>
               </ul> 
               </form>
            </div>`;

        return listDiv;
    },

    onClick: function () {
        this.history.push(true);
        const initialEditorContent = this.getContents();
    
        const title = initialEditorContent.search('Action points') === -1 ? '<h4><u>Action points</u></h4>' : '';

        const value = [];

        this.context.custom.textElement.map(e => {
            value.push(e.value);
            return e.value = null;
        });

        const action = `\n<b>Action:</b> ${value[0]}\n`;
        const assingee = `\n<b>Assignee:</b> ${value[2]}\n`;
        const due = `\n<b>Due:</b> ${value[1]}\n`;

        // Get Input value
        const pluginData = action.concat(assingee, due);

        if(value[0].length > 0 && value[1].length > 0) {
            // Get Input value
            let data = title;
            const lines = pluginData.split('\n');
            for (let i = 0, len = lines.length; i < len; i++) {
                data += '<p>' + lines[i] + '</p>';
            }
        
            // rendering
            // const template = this.util.createElement('DIV');
            // template.innerHTML = data;
            
            // // insert
            // const children = template.children;
            // let after, child;
            // while (children[0]) {
            //     child = children[0];
            //     this.insertNode(child, after);
            //     after = child;
            // }
            // this.setRange(after, 1, after, 1);
            this.insertHTML(data)
            
            // clear content
            this.context.custom.textElement.value = null;
        }

        // submenu off
        this.submenuOff();

        // focus
        this.focus();
    }
}