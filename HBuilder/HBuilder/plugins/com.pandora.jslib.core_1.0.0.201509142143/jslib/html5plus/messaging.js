window.plus.messaging = navigator.plus.messaging = (function(window){
    var bridge = window.plus.bridge;
	var _PLUSNAME = 'Messaging';
	function Message( type ) {
        this.__hasPendingOperation__ = false;
		this.to = [];
		this.cc = [];
		this.bcc = [];
		this.subject = '';
		this.body = '';
		this.type = type;
	}
    return {
        createMessage : function( type) {
        	               return new Message( type );
                        },
        sendMessage: function ( message, successCB, errorCB ) {
                        if ( message instanceof Message ) {
                            var success = typeof successCB !== 'function' ? null : function() {
                                message.__hasPendingOperation__ = false;
                                successCB();
                            };
                            var fail = typeof errorCB !== 'function' ? null : function( error ) {
                                message.__hasPendingOperation__ = false;
                                errorCB(error);
                            };

                            if ( message.__hasPendingOperation__ ) {
                                fail({code:2, message:'sending'});
                                return;
                            }
                            message.__hasPendingOperation__ = true;

                            var callbackId =  bridge.callbackId( success, fail );
                            bridge.exec(_PLUSNAME, 'sendMessage', [ callbackId, message] );
                        }
                    },
        TYPE_SMS : 1,
        TYPE_MMS : 2,
        TYPE_EMAIL : 3
    };
})(window);