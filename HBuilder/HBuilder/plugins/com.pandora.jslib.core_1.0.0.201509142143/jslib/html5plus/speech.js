;
(function(window){
    var _SPEECHF = 'Speech';
    var bridge = window.plus.bridge;
    var tools = window.plus.tools;
    var speech = {
        startRecognize : function( options, successCallback, errorCallback ){
            var success = typeof successCallback !== 'function' ? null : function(strings) {
                successCallback(strings);
            };
            var fail = typeof errorCallback !== 'function' ? null : function( error ) {
                errorCallback(error);
            };
            var callbackId =  bridge.callbackId( success, fail );
            var eventCallbackIds = {};
            
            if(options.onstart){
            	var os = typeof options.onstart !== 'function' ? null : function() {
	                options.onstart();
	            };
            	eventCallbackIds.onstart = bridge.callbackId( os );
            }
            
            if(options.onend){
            	var oe = typeof options.onend !== 'function' ? null : function() {
	                options.onend();
	            };
            	eventCallbackIds.onend = bridge.callbackId( oe );
            }
            bridge.exec( _SPEECHF, "startRecognize", [callbackId, options,eventCallbackIds] );
        },
        stopRecognize : function(){
            bridge.exec( _SPEECHF, "stopRecognize", [] );
        }
    };
    window.plus.speech = navigator.plus.speech = speech;
})(window);