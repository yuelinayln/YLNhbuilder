;
window.plus.net = navigator.plus.net = (function(window){

    var bridge = window.plus.bridge;
    var tools = window.plus.tools;

    function XMLHttpRequest(){
        this.__init__();
        this.__UUID__ = tools.UUID('xhr');
    }

    XMLHttpRequest.Uninitialized = 0;
    XMLHttpRequest.Open = 1;
    XMLHttpRequest.Sent = 2;
    XMLHttpRequest.Receiving = 3;
    XMLHttpRequest.Loaded = 4;
    XMLHttpRequest.__F__ = 'XMLHttpRequest';

    XMLHttpRequest.prototype.__init__ = function() {
        this.readyState = XMLHttpRequest.Uninitialized;
        this.responseText = '';
        this.responseXML = null;
        this.status = XMLHttpRequest.Uninitialized;
        this.statusText = null;
        this.onreadystatechange;
        this.__noParseResponseHeader__ = null;
        this.__requestHeaders__ = {};
        this.__responseHeaders__ = {};
        this.__cacheReponseHeaders__ = {};
    };

    XMLHttpRequest.prototype.abort = function() {
        if ( this.readyState > XMLHttpRequest.Uninitialized ) {
            this.__init__();
            bridge.exec(XMLHttpRequest.__F__, 'abort', [this.__UUID__]);
            if (typeof this.onreadystatechange === 'function') {
                this.onreadystatechange();
            }
        }
    };

    XMLHttpRequest.prototype.getAllResponseHeaders = function() {
        if ( this.readyState >= XMLHttpRequest.Receiving ) {
            if ( this.__noParseResponseHeader__ ) {
                return this.__noParseResponseHeader__;
            }
            var header = '';
            for (var p in this.__responseHeaders__ ) {
                header = header + p + ' : ' + this.__responseHeaders__[p] + '\r\n';
            }
            this.__noParseResponseHeader__ = header;
            return this.__noParseResponseHeader__;
        }
        return null;
    };

    XMLHttpRequest.prototype.getResponseHeader = function( headerName ) {
        if ( 'string' == typeof(headerName) 
            && this.readyState >= XMLHttpRequest.Receiving ) {
            var headerValue = null;
            headerName = headerName.toLowerCase();
            headerValue = this.__cacheReponseHeaders__[headerName];
            if ( headerValue ) {
                return headerValue;
            } else {
                for (var p in this.__responseHeaders__ ) {
                    var value = this.__responseHeaders__[p];
                    p = p.toLowerCase();
                    if ( headerName  === p ) {
                        if ( headerValue ) {
                            headerValue =  headerValue + ', ' + value;
                        } else {
                            headerValue = value;
                        }
                    }   
                }
                this.__cacheReponseHeaders__[headerName] = headerValue;
                return headerValue;
            }
        }
        return null;
    };

    XMLHttpRequest.prototype.setRequestHeader = function( headerName, headerValue ) {
        if ( 'string' == typeof(headerName) 
            &&  'string' == typeof(headerValue) 
            && XMLHttpRequest.Open == this.readyState ) {
            var srcValue = this.__requestHeaders__[headerName];
            if ( srcValue ) {
                this.__requestHeaders__[headerName] = srcValue+', '+headerValue;
            } else {
                this.__requestHeaders__[headerName] = headerValue;
            }
        }
    };

    XMLHttpRequest.prototype.open = function( method, url, username, password ) {
        if ( XMLHttpRequest.Open == this.readyState 
            || XMLHttpRequest.Loaded == this.readyState ) {
            this.__init__();
        } 
                                        
        if ( XMLHttpRequest.Uninitialized == this.readyState ) {
            this.readyState = XMLHttpRequest.Open;
            bridge.exec(XMLHttpRequest.__F__, 'open', [this.__UUID__, method, url, username, password]);
            if (typeof this.onreadystatechange === 'function') {
                this.onreadystatechange();
            }
        }
    };

    XMLHttpRequest.prototype.send = function( body ) {
        var me = this;
        if ( XMLHttpRequest.Open == this.readyState ) {
            this.readyState = XMLHttpRequest.Sent;
            var callbackid = bridge.callbackId( function(args){
                if ( XMLHttpRequest.Receiving == args.readyState ) {
                    if ( XMLHttpRequest.Sent == me.readyState ) {
                        me.readyState = XMLHttpRequest.Receiving;
                        me.status = args.status;
                        me.statusText = args.statusText;
                        me.__responseHeaders__ = args.header;
                    } else if (XMLHttpRequest.Receiving == me.readyState ) {
                        me.responseText = args.responseText;
                    }
                } else if ( XMLHttpRequest.Loaded == args.readyState ) {
                    me.readyState = XMLHttpRequest.Loaded;
                    try {
                        if ( me.responseText ) {
                            var parser= new DOMParser();
                            me.responseXML = parser.parseFromString(me.responseText,"text/xml");
                        }
                    } catch ( e ){
                    }
                }

                if (typeof me.onreadystatechange === 'function') {
                    me.onreadystatechange();
                }
            });
            bridge.exec(XMLHttpRequest.__F__, 'send', [this.__UUID__, callbackid, body, this.__requestHeaders__]);
            if (typeof this.onreadystatechange === 'function') {
                this.onreadystatechange();
            }
            return;
        }
        throw new Error("XMLHttpRequest not open");
    };

    return {
        XMLHttpRequest : XMLHttpRequest
    };
})(window);

