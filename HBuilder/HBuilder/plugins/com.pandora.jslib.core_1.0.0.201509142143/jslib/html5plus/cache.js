;(function(window){
    var bridge = window.plus.bridge;
    var F = 'Cache';
    var cache = {
		clear : function(clearCB){
            var callbackid = bridge.callbackId( function(args){
            	if ( clearCB ) {clearCB()};
            }, null);
            bridge.exec( F, 'clear', [callbackid] );
	    },
		calculate : function(calculateCB){
            var callbackid = bridge.callbackId( function(args){
            	if ( calculateCB ) {calculateCB(args)};
            }, null);
            bridge.exec( F, 'calculate', [callbackid] );
	    },
        setMaxSize : function (size) {
            bridge.exec( F, 'setMaxSize', [size] );
        }
	};
    window.plus.cache = navigator.plus.cache = cache;
})(window);