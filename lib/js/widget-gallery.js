/*global Handlebars, console, alert, addClass, removeClass, hasClass, asyncLoadScript */

(function ( w, d ) {

    'use strict';

    // @include "helpers.js"

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
    var holder = d.getElementsByClassName( 'widget-gallery' )[0];
    var rollHolder = holder.getElementsByClassName( 'widget-gallery-roll' )[0];
    var loading  = holder.getElementsByClassName( 'widget-gallery-loading' )[0];

    /**
     * [renderPhotosRoll description]
     * @return {[type]} [description]
     */
    var renderPhotosRoll = function () {

        var imagesTmpl = '';

        console.warn( ' rendering photos ', photos );

        for ( var i = 0, iLen = photos.length; i < iLen; i++ ) {

            imagesTmpl += Handlebars.templates.rollImage({
                src  : photos[i].thumb,
                title: photos[i].title,
                pos  : i
            });
        }

        console.log( 'got res', imagesTmpl );

        rollHolder.innerHTML = imagesTmpl;

    };


    /**
     * [parseFlickrData description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    var parseFlickrData = function ( data ) {

        console.log( 'got data ', data );

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

            console.log(111);

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

        var searchInput = holder.getElementsByClassName( 'widget-gallery-search-input' ) [0];

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

            if ( evt.target.nodeName === 'IMG' ) {

                var pos = evt.target.getAttribute('data-position');
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
            photoHolder.innerHTML = '<img src="' + url + '" >';

            // removeClass( photoHolder, 'hidden' );

            addClass( photoHolder, 'widget-gallery-imgbig-live' );

        };

        _i.src = url;



    };

    handleSearch();
    //loadPhoto( 'http://farm9.staticflickr.com/8376/8557596740_74e1ca6c96_h.jpg' );
    //loadPhoto('http://farm8.staticflickr.com/7027/6493463267_1bffc54c20_b.jpg');
    loadPhoto( 'http://farm4.staticflickr.com/3275/5750603734_975dbe64ea_b.jpg' );

    performSearch( 'cherry' );

    w.widgetsgallerycb = parseFlickrData;

}( window, document ));