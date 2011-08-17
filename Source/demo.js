/*
---
description: accessible accordion based on plugin in mootools more
 
license: MIT-style
 
authors:
- Christian Merz
 
requires:
- core/1.3: '*'
- more/1.2.4: Fx.Accordion
 
provides: Accessible Accordion

version: 1.0
...
*/
window.addEvent('domready', function(){

    //create our Accordion instance
    var myAccordion = new Fx.Accordion(document.id('accordion'), 'h3.toggler', 'div.element', {
        opacity: false,
        onActive: function(toggler, element){
            toggler.addClass('active');
        },
        onBackground: function(toggler, element){
            toggler.removeClass('active');
        }
    });
    
});
