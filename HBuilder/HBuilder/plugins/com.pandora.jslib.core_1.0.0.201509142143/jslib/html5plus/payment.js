;
(function(window){
    var _PAYMENT = 'Payment';
    var bridge = window.plus.bridge;
    var tools = window.plus.tools;
    function Channel (){
        this.id = '';
        this.description = '',
        this.serviceReady = true,
        this.installService = function(){
            bridge.exec( _PAYMENT, "installService", [this.id] );
        }
    }
    var payment = {
        Channel : Channel,
        getChannels : function( successCallback, errorCallback ){
            var success = typeof successCallback !== 'function' ? null : function(channels) {
                var ret = [];
                var len = channels.length;
                for(var i = 0; i < len; i++){
                    var channel = new window.plus.payment.Channel();
                    channel.id = channels[i].id;
                    channel.description = channels[i].description;
                    channel.serviceReady = channels[i].serviceReady;
                    ret[i] = channel;
                }
                successCallback(ret);
            };
            var fail = typeof errorCallback !== 'function' ? null : function( error ) {
                var err = {};
                
                errorCallback(error);
            };
            var callbackId =  bridge.callbackId( success, fail );
            
            bridge.exec( _PAYMENT, "getChannels", [callbackId] );
        },
        request : function(channel, statement, successCallback, errorCallback){
            var success = typeof successCallback !== 'function' ? null : function(strings) {
                successCallback(strings);
            };
            var fail = typeof errorCallback !== 'function' ? null : function( error ) {
                errorCallback(error);
            };

            if ( !(channel instanceof Channel)  ) {
                window.setTimeout(fail({code:62000}),0);
                return;
            };

            var callbackId =  bridge.callbackId( success, fail );
            bridge.exec( _PAYMENT, "request", [channel.id,statement,callbackId] );
        }
    };
    window.plus.payment = navigator.plus.payment = payment;
})(window);