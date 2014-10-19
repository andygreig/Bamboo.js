/*
* Bamboo.js - minimal responsive javascript framework
* Author: Andrew Greig
* Copyright (c) 2013 Andrew Greig
* Dual MIT/BSD license
*/

var Bamboo = (function (window, document) {

	var

	// objects
	openButton = $('.open'),
	container = $('#container'),
	cover = null,
	open = false,
	
	// Browser checks
	hasTouch = testTouch(),
	offset = testOffset(),
	has3d = has3d(),
	// Helpers
	translateZ = has3d ? ' translateZ(0)' : '',
	
	// Events
	resizeEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize',

	Bamboo = function (opts) {
		
		this.options = {
		    menu: true,
		    swipeToOpen: true,
		    breakpoint: 768,
		    menuWidth: 265,
		    headerHeight: 50,
		    snapThreshold: null,
		    resize: null
		};


		// Options from user
		for (i in opts) this.options[i] = opts[i];

		this.resizeSite();

		// add required html
		cover = $('<div id="cover" />');
		container.find('#scroller').append(cover);

		// resize listeners
		$(window).on(resizeEvent, this.resizeSite.bind(this) );
		this._bindEvents();
	}

	Bamboo.prototype = {

		info : {},

		x : 0,		// starting point
	    dx : 0,		// distance moved
	    ox : null,	// original X
	    tgt: null,	// menu tap target
	    desktop: false, 
	    isTouch: false, // check for touch in start events

	    // returns page dimensions in array [ width, height ]
	    dimensions: function(){
	    	return [this.info.docWidth, this.info.docHeight];
	    },
	    // returns the iOS header offset
	    // read more about this further down the document
	    offset: function(){
	    	return offset;
	    },
	    //returns true or false if the device has touch capabilites	
	    hastouch: function(){
	    	return hasTouch;
	    },

	    // function to resize site
	    resizeSite: function() {
			// get page sizes	
			this.info.docHeight = $(window).height();
			this.info.docWidth = $(window).width();
			this.layout();
			// snap
			this.snapThreshold = this.options.snapThreshold === null ?
				Math.round(this.info.docWidth * 0.25) :
				/%/.test(this.options.snapThreshold) ?
					Math.round(this.info.docWidth * this.options.snapThreshold.replace('%', '') / 100) :
					this.options.snapThreshold;
			// resize callback
			if (this.options.resize) {
				this.options.resize();
			}		
	    },

	    // set layout sizes
	    layout: function(){
	    	// mobile / tablet
	    	if (this.info.docWidth < this.options.breakpoint) {
	    		this.desktop = false;
				// container
	    		container.css({ width : this.info.docWidth, height : 'auto' });
		    	// scoller height
				container.find('#scroller').css({ height : this.info.docHeight + offset - this.options.headerHeight });
	    	// desktop
	    	} else {
	    		this.desktop = true;
	    		// container
	    		container.css({ 
	    			width : this.info.docWidth - this.options.menuWidth, 
	    			height : this.info.docHeight + offset
	    		});
	    		// scoller height
				container.find('#scroller').css({ height : 'auto' });
	    	}
			// hide address bar
			this.hideAddressBar();
		},

		// hide the ios address bar
	    hideAddressBar: function() {
			setTimeout( function(){ window.scrollTo(0, 1); }, 50 );
		},

	    /**
		* Pseudo private methods
		*/

		_bindEvents: function(){
			var _this = this,
                $body = $('body');

            // .bmboo defines the namespace for the event

            // Start event biding
            container.on('touchstart mousedown', function(e) {
            	_this._start(e);
            	// move
                $body.on('touchmove.bmboo mousemove.bmboo', function(e) {
                    _this._move(e);
                });
                // end
                $body.on('touchend.bmboo mouseup.bmboo', function(e) {
                    _this._end(e);
                    // clear the move and end events
                    $body.off('.bmboo');
                });
            });
		},

		_start: function(e) {
			if (this.initiated) return;	// if already started
			if (this.desktop || !this.options.menu) return; // if menu not applicable
			isTouch = /touch/.test(e.type);

			var point = isTouch ? e.originalEvent.touches[0] : e;
			
			this.initiated = true;
			this.pointX = point.pageX;
			this.pointY = point.pageY;
			this.stepsX = 0;
			this.stepsY = 0;
			this.directionLocked = false;

			this.x = container.offset().left;
			this.ox = -this.x + this.pointX;
			this.tgt = $(e.target);
			container.css({ 'transition-duration' : '0s' });
		},

		_move: function(e) {
			if (!this.initiated) return;
			if (isTouch !== /touch/.test(e.type)) return;
			if (this.desktop || !this.options.menu || !this.options.swipeToOpen) return; // if menu not applicable

			var point = isTouch ? e.originalEvent.touches[0] : e;
			
			this.stepsX += Math.abs(point.pageX - this.pointX);
			this.stepsY += Math.abs(point.pageY - this.pointY);

			// Prevent Left Swipe
			if (point.pageX < this.pointX && !open) {
				this.initiated = false;
				return;
			};

			// We take a 10px buffer to figure out the direction of the swipe
			if (this.stepsX < 10 && this.stepsY < 10) {
				this.initiated = false;
				return;
			}

			// We are scrolling vertically, so skip SwipeView and give the control back to the browser
			if (!this.directionLocked && this.stepsY > this.stepsX) {
				this.initiated = false;
				return;
			}

			e.preventDefault();
			this.directionLocked = true;

			if(this.ox){
				var nx = parseInt(point.pageX) - this.ox;
				this.dx = nx - this.x;
				this.x = nx;
				this._moveContainer(nx);
			}

		},

		_end: function(e) {
			if (!this.initiated) return;
			if (isTouch !== /touch/.test(e.type)) return;
			if (this.desktop || !this.options.menu) return; // if menu not applicable
			
			var point = isTouch ? e.originalEvent.changedTouches[0] : e,
				nx = parseInt(point.pageX) - this.ox;

			// choose direction based on dx	
			if (this.dx <= 0) {
				open = false;
				this._animateTo(nx, 0);
			} else {
				open = true;
				this._animateTo(nx, this.options.menuWidth);
			}

			// open button
			if (this.dx === 0 && nx === 0 && this.tgt.is('.open')) {
				this._animateTo(this.options.menuWidth, this.options.menuWidth);
				open = !open;
			}

			this.ox = null;
			this.dx = 0;
			this.initiated = false;

		},

		_animateTo: function(x,to){
			container.css({
				'transition-duration' : Math.floor(100 * x / this.snapThreshold) + 'ms',
				'transform' : 'translate(' + to + 'px,0)' + translateZ
			});
			// hide / show cover
			//this._toggleCover(to);
		},

		_moveContainer: function(x){
			container.css({
				'transform' : 'translate(' + x + 'px,0)' + translateZ
			})
		},

		_toggleCover: function(to){
			if (to > this.options.menuWidth - 50) {
				cover.show();
			} else {
				cover.hide();
			}
		}

	};

	/**
	* Feature Tests
	*/

	// test for touch deveices - from Modernizr
	function testTouch(){
		var bool = false;
		if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
			bool = true;
			$('html').addClass('touch');
		} else {
			$('html').addClass('pointer');
		}
		return bool;
	}

	// if mobile safari - figure out thee address bar height offset
	// read the Question here: http://forum.jquery.com/topic/window-height-mobile-safari-and-the-iphone-address-bar
	// this is the answer to the issue
	function testOffset(){
		var offset = 0;
		// if safari on ios or ipod but not chrome
		if (navigator.userAgent.match(/(iPhone|iPod)/i)) {
			if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('CriOS') == -1) {
				offset = 60;
			}	
		}
		// if in safari fullscreen mode
		if(("standalone" in window.navigator) && window.navigator.standalone){
			offset = 0;
		}
		return offset;
	}

	// 3d check
	function has3d() {
	    var el = document.createElement('p'), 
	        has3d,
	        transforms = {
	            'webkitTransform':'-webkit-transform',
	            'OTransform':'-o-transform',
	            'msTransform':'-ms-transform',
	            'MozTransform':'-moz-transform',
	            'transform':'transform'
	        };
	    // Add it to the body to get the computed style.
	    document.body.insertBefore(el, null);
	    for (var t in transforms) {
	        if (el.style[t] !== undefined) {
	            el.style[t] = "translate3d(1px,1px,1px)";
	            has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
	        }
	    }
	    document.body.removeChild(el);
	    return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
	}

	return Bamboo;

})(window, document);		
