;
window.plus.storage = navigator.plus.storage = (function(){
    var bridge = window.plus.bridge;

    var _STORAGEF = 'Storage';
    var Storage = {};
    Storage.getLength = function() {
        return bridge.execSync(_STORAGEF, 'getLength', [null]);
    };

    Storage.getItem = function (key){
        if ( typeof(key) == 'string' ) {
            return bridge.execSync(_STORAGEF, 'getItem', [key]);
        }
        return false;
    };

    Storage.setItem = function (key, value){
        if ( typeof(key) == 'string' && typeof(value) == 'string' ) {
            return bridge.execSync(_STORAGEF, 'setItem', [key, value]);
        }
        return false;
    };

    Storage.removeItem = function (key){
        if ( typeof(key) == 'string' ) {
            return bridge.execSync(_STORAGEF, 'removeItem', [key]);
        }
        return false;
    };

    Storage.clear = function(){
        return bridge.execSync(_STORAGEF, 'clear', [null]);
    };

    Storage.key = function(index){
        if ( typeof(index) == 'number' ) {
            return bridge.execSync(_STORAGEF, 'key', [index]);
        }
        return false;
    };
    return Storage;
})(window);