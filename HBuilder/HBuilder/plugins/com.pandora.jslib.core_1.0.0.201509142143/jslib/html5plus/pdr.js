if ( typeof(window.plus) == 'undefined' ) {
    window.plus = {};
}

if ( typeof(navigator.plus) == 'undefined' ) {
    navigator.plus = {};
}

(function(window){
    var tools = {};

    tools.__UUID__ = 0;

    tools.UNKNOWN = -1;
    tools.IOS = 0;
    tools.ANDROID = 1;
    tools.WP8 = 2;
    tools.platform = tools.UNKNOWN;
    tools.UUID = function (obj) {
        return obj + ( this.__UUID__++ ) + new Date().valueOf();
    };
    tools.extend = function(destination, source) {
        for (var property in source) { 
            destination[property] = source[property]; 
        } 
    };

    tools.typeName = function(val) {
        return Object.prototype.toString.call(val).slice(8, -1);
    };
    tools.isDate = function(d) {
        return tools.typeName(d) == 'Date';
    };
    tools.isArray = function(a) {
        return tools.typeName(a) == 'Array';
    };
 
    tools.isNumber = function(a) {
        return (typeof a === 'number') || (a instanceof Number);
    };

    tools.clone = function(obj) {
        if(!obj || typeof obj == 'function' || tools.isDate(obj) || typeof obj != 'object') {
            return obj;
        }

        var retVal, i;

        if(tools.isArray(obj)){
            retVal = [];
            for(i = 0; i < obj.length; ++i){
                retVal.push(tools.clone(obj[i]));
            }
            return retVal;
        }

        retVal = {};
        for(i in obj){
            if(!(i in retVal) || retVal[i] != obj[i]) {
                retVal[i] = tools.clone(obj[i]);
            }
        }
        return retVal;
    };

    if(navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/iPad/i) ){
        tools.platform = tools.IOS;
    } else if ( navigator.userAgent.match(/Android/i) ) {
        tools.platform = tools.ANDROID;
	window._entry = _bridge;
    } else if (navigator.userAgent.match(/Windows Phone/i)){
        tools.platform = tools.WP8;
    } else {
    	tools.platform = tools.WP8;
    }
    window.plus.tools = tools;
})(window);

(function(window){

    var htmlid = window.__HtMl_Id__;
    var tools = window.plus.tools;

    function createExecIframe() {
        var iframe = document.createElement("iframe");
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        return iframe;
    }

    function Bridge () {
        this.callbacks = {};
        this.commandQueue = [];
        this.commandQueueFlushing = false;
        this.synExecXhr = null;
        this.execIframe = null;
    }

    Bridge.prototype.NO_RESULT = 0;
    Bridge.prototype.OK = 1;
    Bridge.prototype.CLASS_NOT_FOUND_EXCEPTION = 2;
    Bridge.prototype.ILLEGAL_ACCESS_EXCEPTION = 3;
    Bridge.prototype.INSTANTIATION_EXCEPTION = 4;
    Bridge.prototype.MALFORMED_URL_EXCEPTION = 5;
    Bridge.prototype.IO_EXCEPTION = 6;
    Bridge.prototype.INVALID_ACTION = 7;
    Bridge.prototype.JSON_EXCEPTION = 8;
    Bridge.prototype.ERROR = 9;

    Bridge.prototype.nativecomm = function () {
        var json;
        json = '[' + this.commandQueue.join(',') + ']';
        this.commandQueue.length = 0;
        return json;
    };
	
    Bridge.prototype.exec = function ( service, action, args, callbackid ) {
        if ( tools.IOS == tools.platform ) {
            var ncallbackid = null;
            if ( callbackid ) {
                ncallbackid = callbackid;
            }
            var command = [window.__HtMl_Id__, service, action, ncallbackid, args];
            this.commandQueue.push(JSON.stringify(command));
            if ( this.commandQueue.length == 1 && !this.commandQueueFlushing ) {
                this.execIframe = this.execIframe || createExecIframe();
                this.execIframe.src = "plus://command";
            }
        } else if ( tools.ANDROID == tools.platform ) {
            window._entry.prompt(JSON.stringify(args),'pdr:'+JSON.stringify([service,action,true]));
        }
        else if (tools.WP8 == tools.platform)
        {
             var command ={json:[htmlid,service, action, args]};
             //同步执行
             var json = JSON.stringify(command);
             window.external.notify(json); 
        }
    }

    Bridge.prototype.execSync = function ( service, action, args ) {
        if ( tools.IOS == tools.platform ) {
            var command = [[window.__HtMl_Id__, service, action, null, args]];
            var json = JSON.stringify(command);
            this.synExecXhr = this.synExecXhr || new XMLHttpRequest();
            this.synExecXhr.open( 'post', "http://localhost:13131/cmds", false );
            this.synExecXhr.setRequestHeader( "Content-Type", 'multipart/form-data' );
            this.synExecXhr.setRequestHeader( "Content-Length", json.length );
            this.synExecXhr.send( json );
            return window.eval( this.synExecXhr.responseText );
        } else if ( tools.ANDROID == tools.platform ) {
            js = window._entry.prompt(JSON.stringify(args),'pdr:'+JSON.stringify([service,action,false]));
            return eval(js);
        }
        else if (tools.WP8 == tools.platform)
        {
             var command ={json:[htmlid,service, action, args]};
             //同步执行
             var json = JSON.stringify(command);
             window.external.notify(json); 
        }
    }

    Bridge.prototype.callbackFromNative = function ( callbackId, playload ) {
        var fun = this.callbacks[callbackId];
        if ( fun ) {
            if ( playload.status == this.OK ) {
                if ( fun.success ) {
                    fun.success( playload.message );
                }
            } else {
                if ( fun.fail ) {
                    fun.fail( playload.message );
                }
            }
            if ( !playload.keepCallback ) {
                delete this.callbacks[callbackId];
            }
        }
    }

    Bridge.prototype.callbackId = function ( successCallback, failCallback ) {
        var callbackId = tools.UUID('plus');
        this.callbacks[callbackId] = { success:successCallback, fail:failCallback };
        return callbackId;
    }

    window.plus.bridge = new Bridge();
})(window);

plus.obj = plus.obj || {};
plus.obj.Callback = (function(){
        function Callback(){
            this.__callbacks__ = {};
            var __me__ = this;
            this.__callback_id__ = plus.bridge.callbackId(function(args){
                var _evt = args.evt;
                var _args = args.args;
                var _arr = __me__.__callbacks__[_evt];
                if(_arr){
                    for(var i = 0; i < _arr.length; i++){
                        __me__.onCallback(_arr[i],_evt,_args);
                    }
                }
            });
        }
        function onCallback(fun,evt,args){
           //抛异常
           throw new Execption("Please override the function of 'Callback.onCallback'");
        }
        
        
        Callback.prototype.addEventListener = function(evtType,fun,capture){
        	var notice = false;
	        if(fun){
	            if(!this.__callbacks__[evtType]){
	            	this.__callbacks__[evtType]=[];
	            	notice = true;
	            }
	            this.__callbacks__[evtType].push(fun);
	        }
	        return notice;
        }
        
        Callback.prototype.removeEventListener = function(evtType,fun){
        	var notice = false;
            if(this.__callbacks__[evtType]){
                this.__callbacks__[evtType].pop(fun);
                notice = (this.__callbacks__[evtType].length === 0);
                if(notice)
                	this.__callbacks__[evtType] = null;
            }
            return notice;
        }       
        return Callback;
   })()

if (navigator.userAgent.match(/Android/i)) {
    eval(prompt('', 'pdr:' + JSON.stringify(['core', 'deviceinit_', false])));
    window.__HtMl_Id__ = plus.bridge.execSync('core', '__Get_Hash_Code__', []);
} else {
    //var json = '__mkey__init__';
    //var initExecXhr = new XMLHttpRequest();
    //initExecXhr.open('post', "http://localhost:13131/cmds", false);
    //initExecXhr.setRequestHeader("Content-Type", 'multipart/form-data');
    //initExecXhr.setRequestHeader("Content-Length", json.length);
    //initExecXhr.send(json);
    //window.eval(initExecXhr.responseText);
}