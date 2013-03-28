/*

Copyright (C) 2011 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

// lib/handlebars/browser-prefix.js
var Handlebars = {};

(function(Handlebars, undefined) {
;
// lib/handlebars/base.js

Handlebars.VERSION = "1.0.0-rc.3";
Handlebars.COMPILER_REVISION = 2;

Handlebars.REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '>= 1.0.0-rc.3'
};

Handlebars.helpers  = {};
Handlebars.partials = {};

Handlebars.registerHelper = function(name, fn, inverse) {
  if(inverse) { fn.not = inverse; }
  this.helpers[name] = fn;
};

Handlebars.registerPartial = function(name, str) {
  this.partials[name] = str;
};

Handlebars.registerHelper('helperMissing', function(arg) {
  if(arguments.length === 2) {
    return undefined;
  } else {
    throw new Error("Could not find property '" + arg + "'");
  }
});

var toString = Object.prototype.toString, functionType = "[object Function]";

Handlebars.registerHelper('blockHelperMissing', function(context, options) {
  var inverse = options.inverse || function() {}, fn = options.fn;

  var type = toString.call(context);

  if(type === functionType) { context = context.call(this); }

  if(context === true) {
    return fn(this);
  } else if(context === false || context == null) {
    return inverse(this);
  } else if(type === "[object Array]") {
    if(context.length > 0) {
      return Handlebars.helpers.each(context, options);
    } else {
      return inverse(this);
    }
  } else {
    return fn(context);
  }
});

Handlebars.K = function() {};

Handlebars.createFrame = Object.create || function(object) {
  Handlebars.K.prototype = object;
  var obj = new Handlebars.K();
  Handlebars.K.prototype = null;
  return obj;
};

Handlebars.logger = {
  DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, level: 3,

  methodMap: {0: 'debug', 1: 'info', 2: 'warn', 3: 'error'},

  // can be overridden in the host environment
  log: function(level, obj) {
    if (Handlebars.logger.level <= level) {
      var method = Handlebars.logger.methodMap[level];
      if (typeof console !== 'undefined' && console[method]) {
        console[method].call(console, obj);
      }
    }
  }
};

Handlebars.log = function(level, obj) { Handlebars.logger.log(level, obj); };

Handlebars.registerHelper('each', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  var i = 0, ret = "", data;

  if (options.data) {
    data = Handlebars.createFrame(options.data);
  }

  if(context && typeof context === 'object') {
    if(context instanceof Array){
      for(var j = context.length; i<j; i++) {
        if (data) { data.index = i; }
        ret = ret + fn(context[i], { data: data });
      }
    } else {
      for(var key in context) {
        if(context.hasOwnProperty(key)) {
          if(data) { data.key = key; }
          ret = ret + fn(context[key], {data: data});
          i++;
        }
      }
    }
  }

  if(i === 0){
    ret = inverse(this);
  }

  return ret;
});

Handlebars.registerHelper('if', function(context, options) {
  var type = toString.call(context);
  if(type === functionType) { context = context.call(this); }

  if(!context || Handlebars.Utils.isEmpty(context)) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

Handlebars.registerHelper('unless', function(context, options) {
  return Handlebars.helpers['if'].call(this, context, {fn: options.inverse, inverse: options.fn});
});

Handlebars.registerHelper('with', function(context, options) {
  return options.fn(context);
});

Handlebars.registerHelper('log', function(context, options) {
  var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
  Handlebars.log(level, context);
});
;
// lib/handlebars/utils.js

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

Handlebars.Exception = function(message) {
  var tmp = Error.prototype.constructor.apply(this, arguments);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }
};
Handlebars.Exception.prototype = new Error();

// Build out our basic SafeString type
Handlebars.SafeString = function(string) {
  this.string = string;
};
Handlebars.SafeString.prototype.toString = function() {
  return this.string.toString();
};

var escape = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "`": "&#x60;"
};

var badChars = /[&<>"'`]/g;
var possible = /[&<>"'`]/;

var escapeChar = function(chr) {
  return escape[chr] || "&amp;";
};

Handlebars.Utils = {
  escapeExpression: function(string) {
    // don't escape SafeStrings, since they're already safe
    if (string instanceof Handlebars.SafeString) {
      return string.toString();
    } else if (string == null || string === false) {
      return "";
    }

    if(!possible.test(string)) { return string; }
    return string.replace(badChars, escapeChar);
  },

  isEmpty: function(value) {
    if (!value && value !== 0) {
      return true;
    } else if(toString.call(value) === "[object Array]" && value.length === 0) {
      return true;
    } else {
      return false;
    }
  }
};
;
// lib/handlebars/runtime.js

Handlebars.VM = {
  template: function(templateSpec) {
    // Just add water
    var container = {
      escapeExpression: Handlebars.Utils.escapeExpression,
      invokePartial: Handlebars.VM.invokePartial,
      programs: [],
      program: function(i, fn, data) {
        var programWrapper = this.programs[i];
        if(data) {
          return Handlebars.VM.program(fn, data);
        } else if(programWrapper) {
          return programWrapper;
        } else {
          programWrapper = this.programs[i] = Handlebars.VM.program(fn);
          return programWrapper;
        }
      },
      programWithDepth: Handlebars.VM.programWithDepth,
      noop: Handlebars.VM.noop,
      compilerInfo: null
    };

    return function(context, options) {
      options = options || {};
      var result = templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);

      var compilerInfo = container.compilerInfo || [],
          compilerRevision = compilerInfo[0] || 1,
          currentRevision = Handlebars.COMPILER_REVISION;

      if (compilerRevision !== currentRevision) {
        if (compilerRevision < currentRevision) {
          var runtimeVersions = Handlebars.REVISION_CHANGES[currentRevision],
              compilerVersions = Handlebars.REVISION_CHANGES[compilerRevision];
          throw "Template was precompiled with an older version of Handlebars than the current runtime. "+
                "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").";
        } else {
          // Use the embedded version info since the runtime doesn't know about this revision yet
          throw "Template was precompiled with a newer version of Handlebars than the current runtime. "+
                "Please update your runtime to a newer version ("+compilerInfo[1]+").";
        }
      }

      return result;
    };
  },

  programWithDepth: function(fn, data, $depth) {
    var args = Array.prototype.slice.call(arguments, 2);

    return function(context, options) {
      options = options || {};

      return fn.apply(this, [context, options.data || data].concat(args));
    };
  },
  program: function(fn, data) {
    return function(context, options) {
      options = options || {};

      return fn(context, options.data || data);
    };
  },
  noop: function() { return ""; },
  invokePartial: function(partial, name, context, helpers, partials, data) {
    var options = { helpers: helpers, partials: partials, data: data };

    if(partial === undefined) {
      throw new Handlebars.Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    } else if (!Handlebars.compile) {
      throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    } else {
      partials[name] = Handlebars.compile(partial, {data: data !== undefined});
      return partials[name](context, options);
    }
  }
};

Handlebars.template = Handlebars.VM.template;
;
// lib/handlebars/browser-suffix.js
})(Handlebars);
;

(function(){var a=Handlebars.template,b=Handlebars.templates=Handlebars.templates||{};b.rollImage=a(function(a,b,c,d,e){this.compilerInfo=[2,">= 1.0.0-rc.3"],c=c||a.helpers,e=e||{};var f="",g,h,i="function",j=this.escapeExpression;f+='<div class="widget-gallery-img"><img src="',h=(g=b.src,typeof g===i?g.apply(b):g);if(h||h===0)f+=h;return f+='" title="'+j((g=b.title,typeof g===i?g.apply(b):g))+'" data-position="'+j((g=b.pos,typeof g===i?g.apply(b):g))+'" /></div>',f})})()
;

/*global Handlebars, console, alert, addClass, removeClass, hasClass, asyncLoadScript, touchHandlers, Hammer */

(function ( w, d ) {

    // 'use strict';

/* Begin: lib/js/helpers.js */
var hasClass = function ( el, cl ) {

    var re = new RegExp( cl );
    return el && re.test( el.className );
};

var addClass = function ( el, cl ) {

    if ( el && ! hasClass( el, cl ) ) {
        el.className += ' ' + cl;
    }
};

var removeClass = function ( el, cl ) {

    if ( ! el ) {
        return;
    }
    var re = new RegExp( cl );
    el.className = el.className.replace( re, '' ).trim();
};

/**
 * Asynchronius script loading
 *
 * @param  {String}   url
 * @param  {Function} [callback]
 * @param  {Number}   [timeout]
 */
var asyncLoadScript = function( url, callback, timeout ) {

    var script = d.createElement("script");
    var done = 0;

    // Default error timeout to 10sec
    timeout = ( typeof timeout !== "undefined" ) ? timeout : 1e4;

    script.src   = url;
    script.async = true;
    script.type  = "text/javascript";

    if ( typeof callback === "function" ) {

        script.onreadystatechange = script.onload = function () {

            var rs = script.readyState;

            if ( ! done && (! rs ||
                            rs === "loaded" ||
                            rs === "complete" ||
                            rs === "uninitialized")) {

                // Set done to prevent this function from being called twice.
                done = 1;
                callback();

                // Handle memory leak in IE
                script.onload = script.onreadystatechange = null;
            }
        };
    }

    // 404 Fallback
    setTimeout(function() {

        if ( ! done ) {

            done = 1;

            // Might as well pass in an error-state if we fire the 404 fallback
            if ( typeof callback === "function" ) {
                callback();
            }
        }
    }, timeout );

    // injecting script into document
    var firstScript = d.getElementsByTagName( "script" )[0];
    firstScript.parentNode.insertBefore( script, firstScript );

};

/* End: lib/js/helpers.js */
    // include "hammer.js"
    //
/* Begin: lib/js/touch-ugly.js */
// TOUCH-EVENTS SINGLE-FINGER SWIPE-SENSING JAVASCRIPT
// Courtesy of PADILICIOUS.COM and MACOSXAUTOMATION.COM
// this script can be used with one or more page elements to perform actions based on them being swiped with a single finger

// small ammends by Anton Kudris

var touchHandlers = ( function (){

    var triggerElementID = null; // this variable is used to identity the triggering element
    var fingerCount      = 0;
    var startX           = 0;
    var startY           = 0;
    var curX             = 0;
    var curY             = 0;
    var deltaX           = 0;
    var deltaY           = 0;
    var horzDiff         = 0;
    var vertDiff         = 0;
    var minLength        = 72; // the shortest distance the user may swipe
    var swipeLength      = 0;
    var swipeAngle       = null;

    // The 4 Touch Event Handlers

    // NOTE: the touchStart handler should also receive the ID of the triggering element
    // make sure its ID is passed in the event call placed in the element declaration, like:
    // <div id="picture-frame" ontouchstart="touchStart(event,'picture-frame');"  ontouchend="touchEnd(event);" ontouchmove="touchMove(event);" ontouchcancel="touchCancel(event);">

    function touchStart(event,passedName) {
        // disable the standard ability to select the touched object
        // event.preventDefault();
        // get the total number of fingers touching the screen
        fingerCount = event.touches.length;
        // since we're looking for a swipe (single finger) and not a gesture (multiple fingers),
        // check that only one finger was used
        if ( fingerCount == 1 ) {
            // get the coordinates of the touch
            startX = event.touches[0].pageX;
            startY = event.touches[0].pageY;
            // store the triggering element ID
            triggerElementID = passedName;
        } else {
            // more than one finger touched so cancel
            touchCancel(event);
        }
    }

    function touchMove( evt ) {

        evt.preventDefault();

        if ( evt.touches.length == 1 ) {
            curX = evt.touches[0].pageX;
            curY = evt.touches[0].pageY;
        } else {
            touchCancel( evt );
        }
    }

    var touchEnd = function( evt, cb ) {


        // check to see if more than one finger was used and that there is an ending coordinate
        if ( fingerCount === 1 && curX !== 0 ) {

            // evt.preventDefault();

            // use the Distance Formula to determine the length of the swipe
            swipeLength = Math.round(Math.sqrt(Math.pow(curX - startX,2) + Math.pow(curY - startY,2)));
            // if the user swiped more than the minimum length, perform the appropriate action
            if ( swipeLength >= minLength ) {

                caluculateAngle();
                touchCancel( evt ); // reset the variables

                if ( typeof cb === 'function' ) {
                    cb( getSwipeDirection() );
                }

            } else {
                touchCancel( evt );
            }
        } else {
            touchCancel( evt );
        }
    };

    function touchCancel(event) {
        // reset the variables back to default values
        fingerCount      = 0;
        startX           = 0;
        startY           = 0;
        curX             = 0;
        curY             = 0;
        deltaX           = 0;
        deltaY           = 0;
        horzDiff         = 0;
        vertDiff         = 0;
        swipeLength      = 0;
        swipeAngle       = null;
        triggerElementID = null;
    }

    function caluculateAngle() {
        var X = startX-curX;
        var Y = curY-startY;
        var Z = Math.round(Math.sqrt(Math.pow(X,2)+Math.pow(Y,2))); //the distance - rounded - in pixels
        var r = Math.atan2(Y,X); //angle in radians (Cartesian system)
        swipeAngle = Math.round(r*180/Math.PI); //angle in degrees
        if ( swipeAngle < 0 ) { swipeAngle =  360 - Math.abs(swipeAngle); }
    }

    function getSwipeDirection() {

        var swipeDirection   = null;

        if ( (swipeAngle <= 45) && (swipeAngle >= 0) ) {
            swipeDirection = 'left';
        } else if ( (swipeAngle <= 360) && (swipeAngle >= 315) ) {
            swipeDirection = 'left';
        } else if ( (swipeAngle >= 135) && (swipeAngle <= 225) ) {
            swipeDirection = 'right';
        } else if ( (swipeAngle > 45) && (swipeAngle < 135) ) {
            swipeDirection = 'down';
        } else {
            swipeDirection = 'up';
        }

        return swipeDirection;
    }

    return {
        onTouchStart : touchStart,
        onTouchEnd   : touchEnd,
        onTouchMove  : touchMove,
        onTouchCancel: touchCancel
    };


}());
/* End: lib/js/touch-ugly.js */

    var flickrParams = {
        api_key     : 'e6cf2c857f282eb1128b88f9e9e47fdf',
        method      : 'flickr.photos.search',
        format      : 'json',
        jsoncallback: 'widgetsgallerycb',
        sort        : 'interestingness-desc',
        per_page    : 50,
        extras      : 'url_l'
    };

    var flickrSearchURL = 'http://api.flickr.com/services/rest/?';

    for ( var p in flickrParams ) {
        if ( flickrParams.hasOwnProperty( p ) ) {
            flickrSearchURL += '&' + p + '=' + flickrParams[ p ];
        }
    }

    flickrSearchURL += '&text=';

    var photos = [];

    var holder       = d.getElementsByClassName( 'widget-gallery' )[0];
    var rollHolder   = holder.getElementsByClassName( 'widget-gallery-roll' )[0];
    var loading      = holder.getElementsByClassName( 'widget-gallery-loading' )[0];
    var searchHolder = holder.getElementsByClassName( 'widget-gallery-search' )[0];
    var searchInput  = searchHolder.getElementsByClassName( 'widget-gallery-search-input' )[0];

    var currentImage = null;


    var changeImage = function ( direction ) {


        currentImage = currentImage || 0;
        console.log(' got swipe direction = ', direction , ' currentImage', currentImage);

        if ( direction === 'prev' ) {

            if ( currentImage > 0 ) {
                currentImage--;
            } else {
                return;
            }

        } else {

            if ( currentImage < photos.length ) {
                currentImage++;
            } else {
                return;
            }
        }

        var current = rollHolder.getElementsByClassName( 'current-photo' )[0];
        if ( current ) {
            removeClass( current, 'current-photo' );
        }

        loadPhoto( photos[ currentImage ].url );

    };

    /**
     * [renderPhotosRoll description]
     * @return {[type]} [description]
     */
    var renderPhotosRoll = function () {

        var imagesTmpl = '';

        // console.warn( ' rendering photos ', photos );

        for ( var i = 0, iLen = photos.length; i < iLen; i++ ) {

            imagesTmpl += Handlebars.templates.rollImage({
                src  : photos[i].thumb,
                title: photos[i].title,
                pos  : i
            });
        }

        // console.log( 'got res', imagesTmpl );

        rollHolder.innerHTML = imagesTmpl;
        addClass( rollHolder, 'roll-visible' );

    };


    /**
     * [parseFlickrData description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    var parseFlickrData = function ( data ) {

        // console.log( 'got data ', data );

        addClass( loading, 'hidden' );

        photos = [];

        if ( data && data.stat === 'ok' ) {

            for ( var i = 0, iLen = data.photos.photo.length; i < iLen; i++ ) {

                if ( data.photos.photo[ i ]. url_l ) {

                    photos.push({
                       thumb: data.photos.photo[ i ].url_l.replace( /_b.jpg/, '_s.jpg' ),
                       url  : data.photos.photo[ i ].url_l,
                       title: data.photos.photo[ i ].title
                    });

                }
            }

            renderPhotosRoll();
        } else {
            alert(' no results ');
        }

    };


    var performSearch = function ( term ) {

        removeClass( loading, 'hidden' );
        asyncLoadScript( flickrSearchURL + term );

    };

    /**
     * [handleSearch description]
     * @return {[type]} [description]
     */
    var handleSearch = function () {

        // binding Enter key
        searchInput.addEventListener( 'keyup', function ( evt ) {

            if ( evt.which === 13 ) {

                var val = searchInput.value && searchInput.value.trim() || '';

                if ( val !== '' ) {

                    console.log('searching for ', val );
                    performSearch( val );

                }

            }

        });


        rollHolder.addEventListener( 'click', function ( evt ) {

            if ( evt.target.nodeName.toUpperCase() === 'IMG' ) {

                var pos = evt.target.getAttribute('data-position');

                console.log(' ~~> loading image position ', pos );
                loadPhoto( photos[ pos ].url );
            }

        });

    };

    /**
     * [loadPhoto description]
     * @param  {[type]} url [description]
     * @return {[type]}     [description]
     */
    var loadPhoto = function ( url ) {

        removeClass( loading, 'hidden' );

        var imgHolder = holder.getElementsByClassName( 'widget-gallery-photo' )[0];

        var _i = new Image();

        _i.onload = function () {

            console.log('image loaded ');
            // addClass( imgHolder, 'widget-gallery-photo-live' );

            imgHolder.style.backgroundImage = "url(" + url + ")";
            imgHolder.style.opacity = 1;

            addClass( loading, 'hidden' );

            var photoHolder = holder.getElementsByClassName( 'widget-gallery-imgbig' )[0];
            photoHolder.innerHTML = '<img src="' + url + '" />';

            // removeClass( photoHolder, 'hidden' );

            addClass( photoHolder, 'widget-gallery-imgbig-live' );

        };

        _i.src = url;

        rollHolder.focus();

    };

    var rollTimeout = null;

    var previewHolder = holder.getElementsByClassName( 'widget-gallery-preview' )[0];

    var handleRollVisibility = function ( evt ) {

        console.log(' --> got click');

        if ( ! rollTimeout ) {
            addClass( rollHolder, 'roll-visible' );
            addClass( searchHolder, 'search-visible' );
            rollTimeout = true;
        } else {
            removeClass( rollHolder, 'roll-visible' );
            removeClass( searchHolder, 'search-visible' );
            rollTimeout = false;
        }
    };

    // those are for touch-ugly
    previewHolder.addEventListener( 'touchstart', touchHandlers.onTouchStart );
    previewHolder.addEventListener( 'touchmove', touchHandlers.onTouchMove );
    previewHolder.addEventListener( 'touchcancel', touchHandlers.onTouchCancel );
    previewHolder.addEventListener( 'touchend', function ( evt ) {

        touchHandlers.onTouchEnd( evt, function processTouchEnd( swipe ) {
            console.log( '=== swipe direction', swipe );

            if ( swipe === 'left' ) {
                changeImage('next');
            } else {
                changeImage('prev');
            }
        });

    } );

    previewHolder.addEventListener( 'click', handleRollVisibility );
    previewHolder.addEventListener( 'dblclick', handleRollVisibility );


    // ontouchstart="touchStart(event,'swipeBox');"  ontouchend="touchEnd(event);" ontouchmove="touchMove(event);" ontouchcancel="touchCancel(event);"

    // var hammertime = Hammer( previewHolder ).on( 'doubletap', handleRollVisibility );

    // new Hammer( previewHolder ).on( 'swipeleft', function ( evt ) {
    //     changeImage('next');
    // } );

    // new Hammer( previewHolder ).on( 'swiperight', function ( evt ) {
    //     changeImage('prev');
    // } );

    handleSearch();
    loadPhoto( 'http://farm4.staticflickr.com/3275/5750603734_975dbe64ea_b.jpg' );

    performSearch( 'cherry' );

    w.widgetsgallerycb = parseFlickrData;

}( window, document ));