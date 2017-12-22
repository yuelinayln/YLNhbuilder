;
(function(window){
    var bridge = window.plus.bridge;
    var tools = window.plus.tools;
    var shareF = 'Share';
    var services = {};

    function GeoPosition(){
        this.latitude = null;
        this.longitude = null;
    }

    function ShareMessage(){
        this.content = null;
        this.url = [];
        this.pictures = null;
        this.accessToken = null;
        this.geo = null;
    }

    function ShareService(id, description, authenticated, accessToken){
        this.id = id;
        this.description = description;
        this.authenticated = authenticated;
        this.accessToken = accessToken;
        this.nativeClient = false;
    }
    ShareService.prototype.authorize = function(url, successCallback, errorCallback) {
        var me = this;
        var success = typeof successCallback !== 'function' ? null : function(args) {
            me.authenticated = args.authenticated;
            me.accessToken = args.accessToken;
            successCallback(me);
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(code);
        };
        var callbackID = bridge.callbackId(success, fail);
        bridge.exec(shareF, "authorize", [callbackID, this.id, url]);
    };

    ShareService.prototype.forbid = function() {
        this.authenticated = false;
        this.accessToken = null;
        bridge.exec(shareF, "forbid", [this.id]);
    };

    ShareService.prototype.send = function(msg, successCallback, errorCallback) {
        var success = typeof successCallback !== 'function' ? null : function(args) {
            successCallback();
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(code);
        };
        var callbackID = bridge.callbackId(success, fail);
        bridge.exec(shareF, "send", [callbackID, this.id, msg]);
    };

    function Authorize(id,display) {
        var me = this;
        this.__UUID__ = tools.UUID('Authorize');
        this.__componentid__ = id;
        this.display = display;
        this.onloaded = null;
        this.onauthenticated = null;
        this.onerror = null;
        this.__top__ = 0;
        this.__left__ = 0;
        this.__width__ = 0;
        this.__height__ = 0;
        {
            var left = 0, top = 0, width = 0, height = 0;
            var div = document.getElementById(this.__componentid__);
            if (div) {
                this.__left__ = div.offsetLeft; this.__top__ = div.offsetTop;
                this.__width__ = div.offsetWidth; this.__height__ = div.offsetHeight;
            }
            var fail = function(code) {
                if ( typeof me.onerror === 'function' ) {
                    me.onerror(code);
                }
            };
            var success = function(args) {
                if ( 'load' == args.evt ) {
                    if ( typeof me.onloaded === 'function' ) {
                        me.onloaded();
                    }
                } else if ( 'auth' == args.evt ) {
                    if ( typeof me.onauthenticated === 'function' ) {
                        plus.share.getServices(function ( services ){ 
                            for (var i = 0; i < services.length; i++) {
                                var service = services[i];
                                if ( service.id == args.type ) {
                                    service.authenticated = args.authenticated;
                                    service.accessToken = args.accessToken;
                                    me.onauthenticated(service);
                                    break;
                                }
                            };
                        }, function( code){
                            fail(code);
                        });
                    }
                }
            };
            var callbackID = bridge.callbackId(success, fail);
            bridge.exec(shareF, "create", [this.__UUID__,  callbackID, this.display, this.__left__, this.__top__, this.__width__, this.__height__]);
        }
    }

    Authorize.prototype.load = function (id) {
        this.id = id;
        bridge.exec(shareF, "load", [this.__UUID__, id]);
    }

    Authorize.prototype.setVisible = function(visible){
        bridge.exec(shareF, "setVisible", [this.__UUID__, visible]);
    }

    var share = {
        Authorize   : Authorize,
        getServices : function(successCallback, errorCallback) {
            var success = typeof successCallback !== 'function' ? null : function(args) {
                var retServers = [];
                for (var i = 0; i < args.length; i++) {
                    var payload = args[i];
                    if ( payload.id ) {
                        var expSer = services[payload.id];
                        if ( expSer ) {
                        } else {
                            expSer = new ShareService();
                        }
                        expSer.id = payload.id;
                        expSer.description = payload.description;
                        expSer.authenticated = payload.authenticated;
                        expSer.accessToken = payload.accessToken;
                        expSer.nativeClient = payload.nativeClient;
                        services[payload.id] = expSer;
                        retServers.push(expSer);
                    }
                }
                successCallback(retServers);
            };
            var fail = typeof errorCallback !== 'function' ? null : function(code) {
                errorCallback(code);
            };
            var callbackID = bridge.callbackId(success, fail);
            bridge.exec(shareF, "getServices", [callbackID]);
        }
    };
    window.plus.share = navigator.plus.share = share;
})(window);        