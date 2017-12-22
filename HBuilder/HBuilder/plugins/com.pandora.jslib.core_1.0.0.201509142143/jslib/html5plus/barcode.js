;
(function(window){
    var _BARCODE = 'barcode';
    var bridge = window.plus.bridge;
    var tools = window.plus.tools;

    function Barcode(id){
        this.onmarked = null;
        this.onerror = null;
        var me = this;
        var callbackId = bridge.callbackId( function(args){
            if( typeof me.onmarked === 'function' ){
                me.onmarked(args.type, args.message);
            }
        }, function(code){
            if ( typeof me.onerror === 'function' ) {
                me.onerror(code);
            }
        });
        var div = document.getElementById(id);
        div.addEventListener("resize", function(){
            var args = [div.offsetLeft, div.offsetTop,div.offsetWidth,div.offsetHeight];
            bridge.exec( _BARCODE, "resize", [callbackId,args]);
        }, false);
        var args = [div.offsetLeft, div.offsetTop, div.offsetWidth, div.offsetHeight];
        bridge.exec( _BARCODE, "Barcode", [callbackId,args] );
    };

    Barcode.prototype.start = function() {
        bridge.exec( _BARCODE, "start", [] );
    };

    Barcode.prototype.setFlash = function(open) {
        bridge.exec( _BARCODE, "setFlash", [open] );
    };

    Barcode.prototype.cancel = function() {
        bridge.exec( _BARCODE, "cancel", [] );
    };

    var barcode = {
    Barcode : Barcode,
    scan : function (path, successCallback, errorCallback) {
            var success = typeof successCallback !== 'function' ? null : function(args) {
                successCallback(args.type, args.message);
            };
            var fail = typeof errorCallback !== 'function' ? null : function(code) {
                errorCallback(code);
            };
            var callbackID = bridge.callbackId(success, fail);
            bridge.exec(_BARCODE, "scan", [callbackID, path]);
        }
    };
    window.plus.barcode = navigator.plus.barcode = barcode;
 })(window);