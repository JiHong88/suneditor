/**
 * @fileoverview Shortcuts class
 * @author JiHong Lee.
 */
 "use strict";

 import CoreInterface from "../../interface/_core";
 
 function Shortcuts(editor) {
     CoreInterface.call(this, editor);
 }

 Shortcuts.prototype = {
     constructor: Shortcuts
 }

 export default Shortcuts;