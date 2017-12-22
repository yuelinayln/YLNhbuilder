;
 (function(window){

    var bridge = window.plus.bridge;
    var tools = window.plus.tools;

    var _CAMERAF ="Camera";
    var _sharedCamera;
    
    function Camera() {
        this.__busy__ = false;
        this.supportedImageResolutions=[];
        this.supportedVideoResolutions=[];
        this.supportedImageFormats = [];
        this.supportedVideoFormats = [];
    };

    Camera.prototype.captureImage = function ( successCB, errorCB, option ) {
        var me = this;
        if ( this.__busy__ ) {
            return;
        }
        var success = typeof successCB !== 'function' ? null : function(path) {
            me.__busy__ = false;
            successCB(path);
        };
        var fail = typeof errorCB !== 'function' ? null : function( error ) {
            me.__busy__ = false;
            errorCB( error );
        };
        var callbackId =  bridge.callbackId( success, fail );
        bridge.exec( _CAMERAF, "captureImage", [callbackId, option]);
    };

    Camera.prototype.startVideoCapture = function ( successCB, errorCB, option ) {
        var me = this;
        if ( this.__busy__ ) {
            return;
        }
        var success = typeof successCB !== 'function' ? null : function(path) {
            me.__busy__ = false;
            successCB(path);
        };
        var fail = typeof errorCB !== 'function' ? null : function( error ) {
            me.__busy__ = false;
            errorCB(error);
        };
        var callbackId =  bridge.callbackId( success, fail );
        bridge.exec( _CAMERAF, "startVideoCapture", [callbackId, option] );
    };

    Camera.prototype.stopVideoCapture = function () {
        bridge.exec( _CAMERAF, "stopVideoCapture", [] );
    };

    var camera =  {
        getCamera : function( index ) {
            if ( _sharedCamera )  {
                return _sharedCamera;
            }
            _sharedCamera = new Camera();
            var result = bridge.execSync( _CAMERAF, 'getCamera', [_sharedCamera.__UUID__, index]);
            if ( result ) {
                _sharedCamera.supportedImageFormats = result.supportedImageFormats;
                _sharedCamera.supportedVideoFormats = result.supportedVideoFormats;
                _sharedCamera.supportedImageResolutions = result.supportedImageResolutions;
                _sharedCamera.supportedVideoResolutions = result.supportedVideoResolutions;
            } else {
                _sharedCamera.supportedImageFormats = ['png', 'jpg'];
                _sharedCamera.supportedVideoFormats = ['mp4'];
            }
            return _sharedCamera;
        }
    };
     window.plus.camera = navigator.plus.camera = camera;
})(window);