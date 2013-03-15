/*global Handlebars, console, alert, addClass, removeClass, hasClass, asyncLoadScript */

(function ( w, d ) {

    'use strict';

    var flickr = {
        authKey: 'e6cf2c857f282eb1128b88f9e9e47fdf',
        // authSecret: '8f2eed3aa04adb34',
        apiURL : 'http://api.flickr.com/services/rest/'
    };

    var photos = [];

    flickr.searchURL = flickr.apiURL + '?format=json&method=flickr.photos.search&per_page=25&jsoncallback=widgetsgallerycb&api_key=' + flickr.authKey + '&text=';

    // @include "helpers.js"

    var holder = d.getElementsByClassName( 'widget-gallery' )[0];


    /**
     * [renderPhotosRoll description]
     * @return {[type]} [description]
     */
    var renderPhotosRoll = function () {

    };


    /**
     * [parseFlickrData description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    var parseFlickrData = function ( data ) {

        console.log( 'got data ', data );

        if ( data.photos && data.photos.length > 0 ) {

            for ( var i = 0, iLen = data.photos.length; i < iLen; i++ ) {

                photos.push({
                   id: data.photos[ i ].id,
                   owner: data.photos[ i ].owner,
                   secret: data.photos[ i ].secret,
                   server: data.photos[ i ].server,
                   title: data.photos[ i ].title
                });

            }

            renderPhotosRoll();
        }

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

                    asyncLoadScript( flickr.searchURL + val );

                }

            }

        });


    };


    /**
     * [loadPhoto description]
     * @param  {[type]} url [description]
     * @return {[type]}     [description]
     */
    var loadPhoto = function ( url ) {

        var imgHolder = holder.getElementsByClassName( 'widget-gallery-photo' )[0];

        var _i = new Image();

        _i.onload = function () {

            console.log('image loaded ');
            addClass( imgHolder, 'widget-gallery-photo-live' );

            imgHolder.style.backgroundImage = "url(" + url + ")";
            imgHolder.style.opacity = 1;
        };

        _i.src = url;

    };





    handleSearch();
    loadPhoto( 'http://farm9.staticflickr.com/8471/8121667604_5055361c73_b.jpg' );

    w.widgetsgallerycb = parseFlickrData;

}( window, document ));