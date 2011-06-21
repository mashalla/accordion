/*
 ---
 script: Fx.Accordion.js
 description: An Fx.Elements extension which allows you to easily create accordion type controls.
 license: MIT-style license
 authors:
 - Valerio Proietti
 requires:
 - core:1.2.4/Element.Event
 - /Fx.Elements
 provides: [Fx.Accordion]
 ...
 */
Fx.Accordion = new Class({

    Extends: Fx.Elements,
    
    options: {
        /*
         onActive: $empty(toggler, section),
         onBackground: $empty(toggler, section),
         fixedHeight: false,
         fixedWidth: false,
         */
        display: 0,
        show: false,
        height: true,
        width: false,
        opacity: true,
        // ########## START: CHANGE ##########
        //alwaysHide: false,
        alwaysHide: true,
        // ########## END: CHANGE ##########
        // ########## START: EXTEND ##########
        // additional variables
        // prefix used for IDs
        prefix: 'acc_tab_',
        // a flag, that shows if CTRL is pressed or not
        ctrl: false,
        // the current index of added sections
        index: 0,
        // the class name of the accordion headers
        className: '',
        // the current element with the focus 
        elementWithFocus: null,
        // the index of the currently selected element
        currentIndex: 0,
        // ########## END: EXTEND ##########
        trigger: 'click',
        initialDisplayFx: true,
        returnHeightToAuto: true
    },
    
    initialize: function(){
        var params = Array.link(arguments, {
            'container': Element.type, //deprecated
            'options': Object.type,
            'togglers': $defined,
            'elements': $defined
        });
        this.parent(params.elements, params.options);
        this.togglers = $$(params.togglers);
        // ########## START: EXTEND ##########
        //set focus on first accordion header
        this.togglers[0].setProperty('tabindex', 0);
        this.className = $$(params.togglers)[0].getProperty('class');
        // ########## END: EXTEND ##########
        this.previous = -1;
        this.internalChain = new Chain();
        if (this.options.alwaysHide) 
            this.options.wait = true;
        if ($chk(this.options.show)) {
            this.options.display = false;
            this.previous = this.options.show;
        }
        if (this.options.start) {
            this.options.display = false;
            this.options.show = false;
        }
        this.effects = {};
        if (this.options.opacity) 
            this.effects.opacity = 'fullOpacity';
        if (this.options.width) 
            this.effects.width = this.options.fixedWidth ? 'fullWidth' : 'offsetWidth';
        if (this.options.height) 
            this.effects.height = this.options.fixedHeight ? 'fullHeight' : 'scrollHeight';
        for (var i = 0, l = this.togglers.length; i < l; i++) 
            this.addSection(this.togglers[i], this.elements[i]);
        this.elements.each(function(el, i){
            if (this.options.show === i) {
                this.fireEvent('active', [this.togglers[i], el]);
            }
            else {
                //console.log("initialize - SET STYLE: ");
                //console.log(el);
                for (var fx in this.effects) 
                    el.setStyle(fx, 0);
            }
        }, this);
        // ########## START: CHANGE ##########
        // Comment this line for being all Tabs collapsed on startup by default.
        //if ($chk(this.options.display) || this.options.initialDisplayFx === false) this.display(this.options.display, this.options.initialDisplayFx);
        // ########## END: CHANGE ##########
        if (this.options.fixedHeight !== false) 
            this.options.returnHeightToAuto = false;
        this.addEvent('complete', this.internalChain.callChain.bind(this.internalChain));
        // ########## START: EXTEND ##########
        //element, which has currently focus:
        this.options.elementWithFocus = null;
        
        //f�ge allen Elementen, die den Fokus haben k�nnen, die Events "focus" und "blur" hinzu:
        this.togglers.each(function(el){
        
            el.addEvents({
                focus: function(){
                    //lege das Element fest, das aktuell den Fokus hat:
                    this.options.elementWithFocus = el;
                    el.setProperty('aria-selected', 'true');
                    
                }
.bind(this)                ,
                blur: function(){
                    this.options.elementWithFocus = null;
                    el.setProperty('aria-selected', 'false');
                }
.bind(this)
            });
        }
.bind(this));
        
        // add Role and State for ARIA
        $(document.body).getElements('#accordion').setProperty('role', 'tablist');
        $(document.body).getElements('#accordion').setProperty('aria-multiselectable', 'true'); //false
        //elements should not be able to reach with tabbing when they are closed:
        //for(var i=0, l = this.elements.length; i<l; i++) this.elements[i].setProperty('tabindex', -1);
        // ########## END: EXTEND ##########		
    
    },
    
    addSection: function(toggler, element){
        toggler = document.id(toggler);
        element = document.id(element);
        var test = this.togglers.contains(toggler);
        this.togglers.include(toggler);
        this.elements.include(element);
        var idx = this.togglers.indexOf(toggler);
        var displayer = this.display.bind(this, idx);
        toggler.store('accordion:display', displayer);
        toggler.addEvent(this.options.trigger, displayer);
        element.addEvent(this.options.trigger, function(event){
            this.setObjects(event)
        }
.bind(this));
        //console.log('add section1');
        /*if(element != null){
         //console.log('added without problems');
         }
         else{
         //console.log('PROBLEMs with adding');
         }
         //console.log('add section2');
         //console.log('addSection - SET STYLE: ');
         //console.log(element);
         if (this.options.height) element.setStyles({'padding-top': 0, 'border-top': 'block', 'padding-bottom': 0, 'border-bottom': 'block'});
         if (this.options.width) element.setStyles({'padding-left': 0, 'border-left': 'block', 'padding-right': 0, 'border-right': 'block'});*/
        if (this.options.height) 
            element.setStyles({
                'padding-top': 0,
                'border-top': 'none',
                'padding-bottom': 0,
                'border-bottom': 'none'
            });
        if (this.options.width) 
            element.setStyles({
                'padding-left': 0,
                'border-left': 'none',
                'padding-right': 0,
                'border-right': 'none'
            });
        element.fullOpacity = 1;
        if (this.options.fixedWidth) 
            element.fullWidth = this.options.fixedWidth;
        if (this.options.fixedHeight) 
            element.fullHeight = this.options.fixedHeight;
        element.setStyle('overflow', 'hidden');
        if (!test) {
            for (var fx in this.effects) 
                element.setStyle(fx, 0);
        }
        // ########## START: EXTEND ##########		
        //console.log('add section');
        if (toggler.getProperty('tabindex') != 0) 
            toggler.setProperty('tabindex', -1);
        // set ARIA Roles and Properties
        toggler.setProperty('aria-expanded', 'false');
        toggler.setProperty('role', 'tab');
        // set id
        toggler.setProperty('id', this.options.prefix + this.options.index);
        // add Key-Eventlistener
        toggler.addEvent('keydown', this.onKeyDown.bindWithEvent(this));
        toggler.addEvent('keyup', this.onKeyUp.bindWithEvent(this));
        
        // set ARIA Roles and Properties
        element.setProperty('aria-labelledby', this.options.prefix + this.options.index);
        element.setProperty('aria-hidden', 'true');
        element.setProperty('role', 'tabpanel');
        //set tabindex to panel EVA
        element.setProperty('tabindex', -1);
        // set visibility
        element.style.visibility = 'hidden';
        // add Key-Eventlistener
        element.addEvent('keydown', this.onKeyDown.bindWithEvent(this));
        element.addEvent('keyup', this.onKeyUp.bindWithEvent(this));
        // increment index
        this.options.index++;
        // allocate new IDs to each Accordion header and adjust the aria-labelledby attribute 
        // in the corresponding panel
        $$('.' + this.className).each(function(element, index){
            element.setProperty('id', this.options.prefix + index);
            var panel = element.getNext('div[role=tabpanel]');
            if (panel != null) 
                panel.setProperty('aria-labelledby', this.options.prefix + index);
        }
.bind(this));
        // ########## END: EXTEND ##########
        return this;
    },
    
    detach: function(){
        this.togglers.each(function(toggler){
            toggler.removeEvent(this.options.trigger, toggler.retrieve('accordion:display'));
        }, this);
    },
    
    display: function(index, useFx){
        if (!this.check(index, useFx)) 
            return this;
		this.options.currentIndex = index;
        useFx = $pick(useFx, true);
        if (this.options.returnHeightToAuto) {
            var prev = this.elements[this.previous];
            if (prev && !this.selfHidden) {
                for (var fx in this.effects) {
                    //console.log('display - SETSTYLE: ');
                    //console.log(prev);
                    prev.setStyle(fx, prev[this.effects[fx]]);
                }
            }
        }
        index = ($type(index) == 'element') ? this.elements.indexOf(index) : index;
        if ((this.timer && this.options.wait) || (index === this.previous && !this.options.alwaysHide)) 
            return this;
        this.previous = index;
        var obj = {};
        this.elements.each(function(el, i){
            obj[i] = {};
            var hide;
            if (i != index) {
                hide = true;
            }
            else 
                if (this.options.alwaysHide && ((el.offsetHeight > 0 && this.options.height) || el.offsetWidth > 0 && this.options.width)) {
                    hide = true;
                    this.selfHidden = true;
                }
            this.fireEvent(hide ? 'background' : 'active', [this.togglers[i], el]);
            for (var fx in this.effects) 
                obj[i][fx] = hide ? 0 : el[this.effects[fx]];
        }, this);
        this.internalChain.chain(function(){
            if (this.options.returnHeightToAuto && !this.selfHidden) {
                var el = this.elements[index];
                //console.log('SET STYLE: ');
                //console.log(el);
                if (el) 
                    el.setStyle('height', 'auto');
            };
                    }
.bind(this));
        // ########## START: EXTEND ##########
        // change attributes when panel gets expanded/collapsed
        var from = {}, to = {};
        for (var i in obj) {
            var iProps = obj[i], iFrom = from[i] = {}, iTo = to[i] = {};
            for (var p in iProps) {
                if (p == 'height') {
                    if (iProps[p] == 0) {
                        this.togglers[i].setProperty('aria-expanded', false);
                        this.elements[i].style.visibility = 'hidden';
                        this.elements[i].setProperty('aria-hidden', true);
                        this.elements[i].setProperty('tabindex', -1);
                    }
                    else 
                        if (iProps[p] > 0) {
                            this.togglers[i].setProperty('aria-expanded', true);
                            this.togglers[i].setProperty('tabindex', 0);
                            this.elements[i].style.visibility = 'visible';
                            this.elements[i].setProperty('aria-hidden', false);
                            this.elements[i].setProperty('tabindex', 0);
                        }
                }
            }
        }
        // ########## END: EXTEND ##########
        return useFx ? this.start(obj) : this.set(obj);
    }    // ########## START: EXTEND ##########
    // Keyevents- and listeners
    ,
    keys: {
        KEY_ENTER: 13,
        KEY_CTRL: 17,
        KEY_SPACE: 32,
        KEY_PAGEUP: 33,
        KEY_PAGEDOWN: 34,
        KEY_END: 35,
        KEY_HOME: 36,
        KEY_LEFT: 37,
        KEY_UP: 38,
        KEY_RIGHT: 39,
        KEY_DOWN: 40
    },
    
    getKeyCode: function(event){
        var keyCode;
        // works in IE 8 and FF 3
        if (window.event) {
            keyCode = window.event.keyCode;
        }
        else {
            keyCode = event.code;
        }
        return keyCode;
    },
    
    onKeyDown: function(event){
        var keyCode = this.getKeyCode(event);
        if (this.options.elementWithFocus != null) {
            this.options.currentIndex = parseInt(event.target.id.replace(this.options.prefix, ''));
        }
        
        var first = this.togglers[0];
        var last = this.togglers[this.togglers.length - 1];
        var next = this.togglers[this.options.currentIndex + 1];
        var previous = this.togglers[this.options.currentIndex - 1];
        var thiz = this.togglers[this.options.currentIndex];
        
        // NOTE: use the setTimeout-method to call the focus()-method slightly later due to a
        // known IE-bug where focus is not rendered correctly.
        // NOTE: Use 'break' to prevent the code from running into the next case automatically.
        
        switch (keyCode) {
            case this.keys.KEY_LEFT:
                
                if (this.options.elementWithFocus != null) {
                    if (this.options.ctrl) 
                        break;
                    else {
                        event.stop();
                        if (previous == null) {
                            setTimeout(function(){
                                last.focus();
                            }, 0);
                            next.setProperty('tabindex', 0);
                        }
                        else {
                            setTimeout(function(){
                                previous.focus();
                            }, 0);
                            previous.setProperty('tabindex', 0);
                        }
                        
                        if (thiz != null) {
                            thiz.setProperty('tabindex', -1);
                        }
                        
                        break;
                    }
                }
                break;
            case this.keys.KEY_UP:
                if (this.options.ctrl) {
                    if (thiz != null) {
                        setTimeout(function(){
                            thiz.focus();
                        }
.bind(this), 0);
                    }
                    break;
                }
                else {
                    if (this.options.elementWithFocus != null) {
                        event.stop();
                        if (previous == null) {
                            setTimeout(function(){
                                last.focus();
                            }, 0);
                            next.setProperty('tabindex', 0);
                        }
                        else {
                            setTimeout(function(){
                                previous.focus();
                            }, 0);
                            previous.setProperty('tabindex', 0);
                        }
                        if (thiz != null) {
                            thiz.setProperty('tabindex', -1);
                        }
                        break;
                    }
                }
                break;
            case this.keys.KEY_DOWN:
            case this.keys.KEY_RIGHT:
                
                if (this.options.elementWithFocus != null) {
                    if (this.options.ctrl) {
                        break;
                    }
                    else {
                        event.stop();
                        if (next == null) {
                            setTimeout(function(){
                                first.focus();
                            }, 0);
                            first.setProperty('tabindex', 0);
                        }
                        else {
                            setTimeout(function(){
                                next.focus();
                            }, 0);
                            next.setProperty('tabindex', 0);
                        }
                        if (thiz != null) {
                            thiz.setProperty('tabindex', -1);
                        }
                        break;
                    }
                }
                break;
                
            case this.keys.KEY_SPACE:
                
            case this.keys.KEY_ENTER:
                
                if (this.options.elementWithFocus != null) {
                    if (this.options.ctrl) {
                        break;
                    }
                    event.target.fireEvent('click');
                    break;
                }
                break;
            case this.keys.KEY_HOME:
                
                if (this.options.elementWithFocus != null) {
                    if (this.options.ctrl) {
                        break;
                    }
                    if (first != null) {
                        event.stop();
                        setTimeout(function(){
                            first.focus();
                        }, 0);
                        first.setProperty('tabindex', 0);
                    }
                    if (thiz != null) 
                        thiz.setProperty('tabindex', -1);
                    break;
                }
                break;
            case this.keys.KEY_END:
                
                if (this.options.elementWithFocus != null) {
                    if (this.options.ctrl) {
                        break;
                    }
                    if (last != null) {
                        event.stop();
                        setTimeout(function(){
                            last.focus();
                        }, 0);
                        last.setProperty('tabindex', 0);
                    }
                    if (thiz != null) {
                        thiz.setProperty('tabindex', -1);
                    }
                    break;
                }
                break;
            case this.keys.KEY_PAGEUP:
                if (this.options.ctrl) {
                    if (previous == null) {
                        setTimeout(function(){
                            last.focus();
                        }, 0);
                        last.setProperty('tabindex', 0);
                    }
                    else {
                        setTimeout(function(){
                            previous.focus();
                        }, 0);
                        previous.setProperty('tabindex', 0);
                    }
                    if (thiz != null) 
                        thiz.setProperty('tabindex', -1);
                }
                break;
                
            case this.keys.KEY_PAGEDOWN:
                if (this.options.ctrl) {
                    if (next == null) {
                        setTimeout(function(){
                            first.focus();
                        }, 0);
                        first.setProperty('tabindex', 0);
                    }
                    else {
                        setTimeout(function(){
                            next.focus();
                        }, 0);
                        next.setProperty('tabindex', 0);
                    }
                    if (thiz != null) 
                        thiz.setProperty('tabindex', -1);
                    
                }
                break;
                
            case this.keys.KEY_CTRL:
                this.options.ctrl = true;
                break;
        }
    },
    
    onKeyUp: function(event){
        var keyCode = this.getKeyCode(event);
        
        if (keyCode == this.keys.KEY_CTRL) {
            this.options.ctrl = false;
            return;
        }
    },
    setObjects: function(event){
if (this.options.elementWithFocus != null) {
            this.options.currentIndex = parseInt(event.target.id.replace(this.options.prefix, ''));
        }
    }
    // ########## END: EXTEND ##########

});

/*
 Compatibility with 1.2.0
 */
var Accordion = new Class({

    Extends: Fx.Accordion,
    
    initialize: function(){
        this.parent.apply(this, arguments);
        var params = Array.link(arguments, {
            'container': Element.type
        });
        this.container = params.container;
    },
    
    addSection: function(toggler, element, pos){
        toggler = document.id(toggler);
        element = document.id(element);
        var test = this.togglers.contains(toggler);
        var len = this.togglers.length;
        if (len && (!test || pos)) {
            pos = $pick(pos, len - 1);
            toggler.inject(this.togglers[pos], 'before');
            
            // ########## START: EXTEND ##########
            // set tabindex to added section
            this.togglers.each(function(toggler){
                toggler.setProperty('tabindex', -1);
            }, this);
            toggler.setProperty('tabindex', 0);
            // ########## END: EXTEND ##########
            
            element.inject(toggler, 'after');
        }
        else 
            if (this.container && !test) {
                toggler.inject(this.container);
                element.inject(this.container);
            }
        return this.parent.apply(this, arguments);
    }
    
});
