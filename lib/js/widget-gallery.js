/*global Handlebars, console, alert, addClass, removeClass, hasClass, asyncLoadScript */

(function ( w, d ) {

    'use strict';

    var flickr = {
        authKey: 'e6cf2c857f282eb1128b88f9e9e47fdf',
        // authSecret: '8f2eed3aa04adb34',
        apiURL : 'http://api.flickr.com/services/rest/'
    };

    var photos = [];

    flickr.searchURL = flickr.apiURL + '?format=json&sort=interestingness-desc&method=flickr.photos.search&per_page=25&jsoncallback=widgetsgallerycb&api_key=' + flickr.authKey + '&text=';

    // @include "helpers.js"

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
                src: getFlickrUrl( i ),
                title: photos[i].title,
                pos: i
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

                photos.push({
                   id: data.photos.photo[ i ].id,
                   owner: data.photos.photo[ i ].owner,
                   secret: data.photos.photo[ i ].secret,
                   farm: data.photos.photo[ i ].farm,
                   server: data.photos.photo[ i ].server,
                   title: data.photos.photo[ i ].title
                });

            }

            renderPhotosRoll();
        } else {
            alert(' no results ');
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

                    removeClass( loading, 'hidden' );

                    asyncLoadScript( flickr.searchURL + val );

                }

            }

        });


        rollHolder.addEventListener( 'click', function ( evt ) {

            if ( evt.target.nodeName === 'IMG' ) {

                var pos = evt.target.getAttribute('data-position');
                console.log( 'loading', getFlickrUrl( pos, 'b' ) );
                loadPhoto( getFlickrUrl( pos, 'b' ) );
            }

        });

    };

    /**
     * [getFlickrUrl description]
     * @param  {[type]} position [description]
     * @return {[type]}          [description]
     */
    var getFlickrUrl = function ( position, size ) {

        if ( typeof size === "undefined" ) {
            size = 's';
        }
        return "http://farm" + photos[ position ].farm + ".staticflickr.com/" + photos[ position ].server + "/" + photos[ position ].id + "_" + photos[ position ].secret + "_" + size + ".jpg";
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
            addClass( imgHolder, 'widget-gallery-photo-live' );

            imgHolder.style.backgroundImage = "url(" + url + ")";
            imgHolder.style.opacity = 1;

            addClass( loading, 'hidden' );
        };

        _i.src = url;

    };





    handleSearch();
    loadPhoto( 'http://farm9.staticflickr.com/8376/8557596740_74e1ca6c96_h.jpg' );

    w.widgetsgallerycb = parseFlickrData;

}( window, document ));