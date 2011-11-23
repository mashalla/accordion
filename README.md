Accessible Accordion
===========

The Fx.Accordion class creates a group of Elements that are toggled when their handles are clicked. When one Element toggles into view, the others toggle out.
Widget based on original Accordion plugin of Mootools More!

![Screenshot](http://www.accessiblemootoolsdemo.iao.fraunhofer.de/Mootools_Widgets/WidgetThumbs/Accordion.png)

How to use
----------

Create a new accordion by using this

	#HTML
	var myAccordion = new Fx.Accordion(togglers, elements[, options]);

An example instance would be this

	#HTML
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

The corresponding HTML could be something like this

	#HTML
	<div id="accordion">
        <h3 class="toggler">History</h3>
        <div class="element">
		...
        </div>
        <h3 class="toggler">Evidence of universal common descent</h3>
        <div class="element">
		...
        </div>
        <h3 class="toggler">Examples of common descent</h3>
        <div class="element">
		...
        </div>
	</div>