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

            if ( ! done && (
                            ! rs
                            || rs === "loaded"
                            || rs === "complete"
                            || rs === "uninitialized")) {

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
