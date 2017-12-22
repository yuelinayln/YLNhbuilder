;
window.plus.zip = navigator.plus.zip = (function(window){
    var bridge = window.plus.bridge;
    var _ZIPG = "Zip";
    return {
         decompress:function(zipfile, targetPath, successCallback, failCallback) {
            var callBackID = bridge.callbackId(successCallback, failCallback);
            bridge.exec(_ZIPG, 'decompress', [zipfile, targetPath, callBackID]);
        }, 
        compress:function(srcPath, zipFile, successCallback, failCallback)
        {
            var callBackID = bridge.callbackId(successCallback, failCallback);
            bridge.exec(_ZIPG, 'compress', [srcPath, zipFile, callBackID]);
        }        
    };
})(window);