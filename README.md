Bamboo.js
=========

This is a basic structural framework for responsive Web Apps that require a sliding menu and a fixed header with scrollable content area.

The burger menu button toggles the menu open and close. You can also swipe left or right to interact with the menu.
When the browser is greater than a specified breakpoint (desktop) the menu is permanently visible on the left.

How to use
----------
Include the Bamboo.js Script, CSS file and use the index.html as the base.

    &lt;nav id="main-nav" class="navigation overflow"&gt;
        &lt;ul&gt;
        &lt;li&gt;&lt;a href="#"&gt;Menu item&lt;/a&gt;&lt;/li&gt;
        &lt;li&gt;&lt;a href="#"&gt;Menu item 2&lt;/a&gt;&lt;/li&gt;
    &lt;/ul&gt;
    &lt;/nav&gt;
    &lt;div id="container"&gt;
        &lt;header class="primary"&gt;
            &lt;span class="open icon"&gt;&amp;#9776;&lt;/span&gt;
            &lt;hgroup&gt;&lt;h1&gt;Title&lt;/h1&gt;&lt;/hgroup&gt;
        &lt;/header&gt;
        &lt;section id="scroller" class="overflow"&gt;
            &lt;div id="content"&gt;
                &lt;!-- Content goes in here --&gt;

                &lt;!-- Content ends --&gt;
            &lt;/div&gt;
        &lt;/section&gt;

    &lt;/div&gt;

    &lt;script src="http://code.jquery.com/jquery-2.0.0.min.js"&gt;&lt;/script&gt;
    &lt;script src="js/bamboo.0.1.js"&gt;&lt;/script&gt;

    &lt;script&gt;
        var site = new Bamboo();
    &lt;/script&gt;

You can define the following properties:

menu: true/false
breakpoint: default (768),
menuWidth: default (265),
headerHeight: default (50),
snapThreshold: null or 0-1,
resize: null // function to allow a callback

**Example**
    var site = new Bamboo({
        menu: true,
        breakpoint: 768,
        menuWidth: 265,
        headerHeight: 50,
        resize: function(){
            // function to call on page resize/orientation change
        }
    });

