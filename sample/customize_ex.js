// import '../src/assets/css/suneditor.css'
// import '../src/assets/css/suneditor-contents.css'

import suneditor from '../src/suneditor'
import custom_plugin_submenu from '../test/custom_plugin_submenu'

suneditor.create(document.getElementById('ex_submenu'), {
    plugins: [
        custom_plugin_submenu
    ],
    buttonList: [
        ['undo', 'redo'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['preview', {
                // plugin's name attribute
                name: 'custom_plugin_submenu', 
                // name of the plugin to be recognized by the toolbar.
                // It must be the same as the name attribute of the plugin 
                dataCommand: 'custom_plugin_submenu',
                // button's class ("btn_editor" class is registered, basic button click css is applied.)
                buttonClass:'btn_editor', 
                // HTML title attribute
                title:'Custom plugin of the submenu', 
                // 'submenu' or 'dialog' or '' (command button)
                dataDisplay:'submenu',
                // 'full' or '' (Only applies to dialog plugin.)
                displayOption:'',
                // HTML to be append to button
                innerHTML:'<div class="icon-map-pin"></div>'
            }
        ]
    ]
});