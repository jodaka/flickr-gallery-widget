/*global Handlebars, console, alert, addClass, removeClass, hasClass, asyncLoadScript, touchHandlers, Hammer */

(function ( w, d ) {

    // 'use strict';

    // @include "helpers.js"
    // include "hammer.js"
    //
    // @include "touch-ugly.js"

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