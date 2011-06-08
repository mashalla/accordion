window.addEvent('domready', function(){

    //create our Accordion instance
    var myAccordion = new Accordion(document.id('accordion'), 'h3.toggler', 'div.element', {
        opacity: false,
        onActive: function(toggler, element){
            toggler.addClass('active');
        },
        onBackground: function(toggler, element){
            
            toggler.removeClass('active');
        }
    });
    
});
