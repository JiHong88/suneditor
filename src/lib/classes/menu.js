/**
 * @fileoverview Menu class
 * @author JiHong Lee.
 */

import CoreInterface from "../../interface/_core";
import { domUtils } from "../../helper";

const Menu = function (editor) {
    CoreInterface.call(this, editor);
    this._menuTrayMap = {};
    this._dropdownName = "";
    this._bindedDropdownOff = null;
    this._bindControllersOff = null;
    this.dropdownMenu = null;
    this.dropdownActiveButton = null;
};

Menu.prototype = {
    /**
     * @description Method for managing dropdown element.
     * You must add the "dropdown" element using the this method at custom plugin.
     * @param {Element|null} target Target button
     * @param {Element} menu Dropdown element
     */
    initTarget: function (target, menu) {
        if (target) {
            this.context.element._menuTray.appendChild(menu);
            this._menuTrayMap[target.getAttribute("data-command")] = menu;
        }
    },

    /**
     * @description Enable dropdown
     * @param {Element} element Dropdown's button element to call
     */
    dropdownOn: function (element) {
        if (this._bindedDropdownOff) this._bindedDropdownOff();
        if (this._bindControllersOff) this.controllerOff();

        const dropdownName = this._dropdownName = element.getAttribute('data-command');
        const menu = this.dropdownMenu = this._menuTrayMap[dropdownName];
        this.dropdownActiveButton = element;
        this._setMenuPosition(element, menu);

        this._bindedDropdownOff = this.dropdownOff.bind(this);
        this.__core.eventManager.addGlobalEvent('mousedown', this._bindedDropdownOff, false);

        if (this.plugins[dropdownName].on) this.plugins[dropdownName].on();
        this._antiBlur = true;
    },

    /**
     * @description Disable dropdown
     */
    dropdownOff: function () {
        this.__core.__core.eventManager.removeGlobalEvent('mousedown', this._bindedDropdownOff);
        this._bindedDropdownOff = null;

        if (this.dropdownMenu) {
            this._dropdownName = '';
            this.dropdown.style.display = 'none';
            this.dropdownMenu = null;
            domUtils.removeClass(this.dropdownActiveButton, 'on');
            this.dropdownActiveButton = null;
            this._notHideToolbar = false;
        }

        this._antiBlur = false;
    },

    /**
     * @description Enabled container
     * @param {Element} element Container's button element to call
     */
    containerOn: function (element) {
        if (this._bindedContainerOff) this._bindedContainerOff();

        const containerName = this._containerName = element.getAttribute('data-command');
        const menu = this.container = this._menuTrayMap[containerName];
        this.containerActiveButton = element;
        this._setMenuPosition(element, menu);

        this._bindedContainerOff = this.containerOff.bind(this);
        this.__core.eventManager.addGlobalEvent('mousedown', this._bindedContainerOff, false);

        if (this.plugins[containerName].on) this.plugins[containerName].on();
        this._antiBlur = true;
    },

    /**
     * @description Disable container
     */
    containerOff: function () {
        this.__core.eventManager.removeGlobalEvent('mousedown', this._bindedContainerOff);
        this._bindedContainerOff = null;

        if (this.container) {
            this._containerName = '';
            this.container.style.display = 'none';
            this.container = null;
            domUtils.removeClass(this.containerActiveButton, 'on');
            this.containerActiveButton = null;
            this._notHideToolbar = false;
        }

        this._antiBlur = false;
    },

    /**
     * @description Set the menu position. (dropdown, container)
     * @param {*} element Button element
     * @param {*} menu Menu element
     * @private
     */
    _setMenuPosition: function (element, menu) {
        menu.style.visibility = 'hidden';
        menu.style.display = 'block';
        menu.style.height = '';
        domUtils.addClass(element, 'on');

        const toolbar = this.context.element.toolbar;
        const toolbarW = toolbar.offsetWidth;
        const toolbarOffset = this.offset.getGlobal(this.context.element.toolbar);
        const menuW = menu.offsetWidth;
        const l = element.parentElement.offsetLeft + 3;

        // rtl
        if (this.options.rtl) {
            const elementW = element.offsetWidth;
            const rtlW = menuW > elementW ? menuW - elementW : 0;
            const rtlL = rtlW > 0 ? 0 : elementW - menuW;
            menu.style.left = (l - rtlW + rtlL) + 'px';
            if (toolbarOffset.left > this.offset.getGlobal(menu).left) {
                menu.style.left = '0px';
            }
        } else {
            const overLeft = toolbarW <= menuW ? 0 : toolbarW - (l + menuW);
            if (overLeft < 0) menu.style.left = (l + overLeft) + 'px';
            else menu.style.left = l + 'px';
        }

        // get element top
        let t = 0;
        let offsetEl = element;
        while (offsetEl && offsetEl !== toolbar) {
            t += offsetEl.offsetTop;
            offsetEl = offsetEl.offsetParent;
        }

        const bt = t;
        if (this._isBalloon) {
            t += toolbar.offsetTop + element.offsetHeight;
        } else {
            t -= element.offsetHeight;
        }

        // set menu position
        const toolbarTop = toolbarOffset.top;
        const menuHeight = menu.offsetHeight;
        const scrollTop = this.offset.getGlobalScroll().top;

        const menuHeight_bottom = this._w.innerHeight - (toolbarTop - scrollTop + bt + element.parentElement.offsetHeight);
        if (menuHeight_bottom < menuHeight) {
            let menuTop = -1 * (menuHeight - bt + 3);
            const insTop = toolbarTop - scrollTop + menuTop;
            const menuHeight_top = menuHeight + (insTop < 0 ? insTop : 0);

            if (menuHeight_top > menuHeight_bottom) {
                menu.style.height = menuHeight_top + 'px';
                menuTop = -1 * (menuHeight_top - bt + 3);
            } else {
                menu.style.height = menuHeight_bottom + 'px';
                menuTop = bt + element.parentElement.offsetHeight;
            }

            menu.style.top = menuTop + 'px';
        } else {
            menu.style.top = (bt + element.parentElement.offsetHeight) + 'px';
        }

        menu.style.visibility = '';
    },

    moreLayerOn: function () {

    },

    /**
     * @description Disable more layer
     */
    moreLayerOff: function () {
        if (this._moreLayerActiveButton) {
            const layer = this.context.element.toolbar.querySelector('.' + this._moreLayerActiveButton.getAttribute('data-command'));
            layer.style.display = 'none';
            domUtils.removeClass(this._moreLayerActiveButton, 'on');
            this._moreLayerActiveButton = null;
        }
    },

    /**
     * @description Show controller at editor area (controller elements, function, "controller target element(@Required)", "controller name(@Required)", etc..)
     * @param {any} arguments controller elements, function..
     */
    controllerOn: function () {
        if (this._bindControllersOff) this._bindControllersOff();
        this.controllerArray = [];

        for (let i = 0, arg; i < arguments.length; i++) {
            arg = arguments[i];
            if (!arg) continue;

            if (typeof arg === 'string') {
                this.currentControllerName = arg;
                continue;
            }
            if (typeof arg === 'function') {
                this.controllerArray.push(arg);
                continue;
            }
            if (!domUtils.hasClass(arg, 'se-controller')) {
                this.currentControllerTarget = arg;
                this.currentFileComponentInfo = this.component.get(arg);
                continue;
            }
            if (arg.style) {
                arg.style.display = 'block';
                if (this._shadowRoot && this._shadowRootControllerEventTarget.indexOf(arg) === -1) {
                    arg.addEventListener('mousedown', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    });
                    this._shadowRootControllerEventTarget.push(arg);
                }
            }
            this.controllerArray.push(arg);
        }

        this._bindControllersOff = this.controllerOff.bind(this);
        this.__core.eventManager.addGlobalEvent('mousedown', this._bindControllersOff, false);
        this.__core.eventManager.addGlobalEvent('keydown', this._bindControllersOff, false);
        this._antiBlur = true;

        if (typeof this.events.showController === 'function') this.events.showController(this.currentControllerName, this.controllerArray);
    },

    /**
     * @description Hide controller at editor area (link button, image resize button..)
     * @param {KeyboardEvent|MouseEvent|null} e Event object when called from mousedown and keydown events registered in "core.controllerOn"
     */
    controllerOff: function (e) {
        this._lineBreaker.style.display = 'none';
        const len = this.controllerArray.length;

        if (e && e.target && len > 0) {
            for (let i = 0; i < len; i++) {
                if (typeof this.controllerArray[i].contains === 'function' && this.controllerArray[i].contains(e.target)) return;
            }
        }

        if (this._fileManager.pluginRegExp.test(this.currentControllerName) && e && e.type === 'keydown' && e.keyCode !== 27) return;
        this.context.element.lineBreaker_t.style.display = this.context.element.lineBreaker_b.style.display = 'none';
        this.status._lineBreakComp = null;

        this.currentControllerName = '';
        this.currentControllerTarget = null;
        this.currentFileComponentInfo = null;
        this.effectNode = null;
        if (!this._bindControllersOff) return;

        this.__core.eventManager.removeGlobalEvent('mousedown', this._bindControllersOff);
        this.__core.eventManager.removeGlobalEvent('keydown', this._bindControllersOff);
        this._bindControllersOff = null;

        if (len > 0) {
            for (let i = 0; i < len; i++) {
                if (typeof this.controllerArray[i] === 'function') this.controllerArray[i]();
                else this.controllerArray[i].style.display = 'none';
            }

            this.controllerArray = [];
        }

        this._antiBlur = false;
    },

    /**
     * @description Specify the position of the controller.
     * @param {Element} controller Controller element.
     * @param {Element} referEl Element that is the basis of the controller's position.
     * @param {string} position Type of position ("top" | "bottom")
     * When using the "top" position, there should not be an arrow on the controller.
     * When using the "bottom" position there should be an arrow on the controller.
     * @param {Object} addOffset These are the left and top values that need to be added specially. 
     * This argument is required. - {left: 0, top: 0}
     * Please enter the value based on ltr mode.
     * Calculated automatically in rtl mode.
     */
    setControllerPosition: function (controller, referEl, position, addOffset) {
        if (this.options.rtl) addOffset.left *= -1;

        const offset = this.offset.get(referEl);
        controller.style.visibility = 'hidden';
        controller.style.display = 'block';

        // Height value of the arrow element is 11px
        const topMargin = position === 'top' ? -(controller.offsetHeight + 2) : (referEl.offsetHeight + 12);
        controller.style.top = (offset.top + topMargin + addOffset.top) + 'px';

        const l = offset.left - this.context.element.wysiwygFrame.scrollLeft + addOffset.left;
        const controllerW = controller.offsetWidth;
        const referElW = referEl.offsetWidth;

        const allow = domUtils.hasClass(controller.firstElementChild, 'se-arrow') ? controller.firstElementChild : null;

        // rtl (Width value of the arrow element is 22px)
        if (this.options.rtl) {
            const rtlW = (controllerW > referElW) ? controllerW - referElW : 0;
            const rtlL = rtlW > 0 ? 0 : referElW - controllerW;
            controller.style.left = (l - rtlW + rtlL) + 'px';

            if (rtlW > 0) {
                if (allow) allow.style.left = ((controllerW - 14 < 10 + rtlW) ? (controllerW - 14) : (10 + rtlW)) + 'px';
            }

            const overSize = this.context.element.wysiwygFrame.offsetLeft - controller.offsetLeft;
            if (overSize > 0) {
                controller.style.left = '0px';
                if (allow) allow.style.left = overSize + 'px';
            }
        } else {
            controller.style.left = l + 'px';

            const overSize = this.context.element.wysiwygFrame.offsetWidth - (controller.offsetLeft + controllerW);
            if (overSize < 0) {
                controller.style.left = (controller.offsetLeft + overSize) + 'px';
                if (allow) allow.style.left = (20 - overSize) + 'px';
            } else {
                if (allow) allow.style.left = '20px';
            }
        }

        controller.style.visibility = '';
    },
}

export default Menu;