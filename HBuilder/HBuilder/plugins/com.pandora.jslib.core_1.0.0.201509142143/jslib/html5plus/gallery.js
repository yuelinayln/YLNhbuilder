;
window.plus.gallery = navigator.plus.gallery = (function(window){
    var bridge = window.plus.bridge;
    var tools = window.plus.tools;
    var _GALLERYF ="Gallery";

    var GallaryStatus = {
        Ready : 0,
        Busy :1
    };

    function GallaryError(error) {
        this.code = error || null;
    };

    GallaryError.BUSY = 1;

    var shareGallery = {};

    shareGallery.__galleryStatus = GallaryStatus.Ready;
    shareGallery.onPickImageFinished = null;

    shareGallery.pickImage = function(successCB, errorCB, option){
        if ( GallaryStatus.Busy == this.__galleryStatus  ) {
            window.setTimeout(function(){
                if ( 'function' == typeof(errorCB) ) {
                    errorCB(new GallaryError(GallaryError.BUSY));
                }
            }, 0);
            return;
        }
        this.__galleryStatus = GallaryStatus.Busy;
        var callbackid = bridge.callbackId( function(path){
            if ( 'function' == typeof(successCB) ) {
                successCB(path);
            }
            shareGallery.__galleryStatus = GallaryStatus.Ready;
        } , function(code){
            if ( 'function' == typeof(errorCB) ) {
                 errorCB(new GallaryError(code));
            }
            shareGallery.__galleryStatus = GallaryStatus.Ready;
        });
        bridge.exec(_GALLERYF, 'pickImage', [callbackid, option] );
    };

    shareGallery.saveImage = function(path){
        if ( 'string' == typeof(path) ) {
            bridge.exec(_GALLERYF, 'saveImage', path );
            return true;
        }
        return false;
    };

    return shareGallery;
})(window);