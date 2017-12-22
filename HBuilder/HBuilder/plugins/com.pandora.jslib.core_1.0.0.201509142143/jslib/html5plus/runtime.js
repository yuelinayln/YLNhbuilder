(function(window){
    var bridge = window.plus.bridge;
    var tools = window.plus.tools;
    var _PLUSNAME = 'Runtime';
  	var runtime = {
        arguments:null,
        version:null,
        innerVersion:null,
  		restart:function(){
            bridge.exec(_PLUSNAME,'restart',[]);
  		},
  		install:function(SusFilePath,widgetOptions,SuccessCallback,ErrorCallback)
        {
  			var callbackid = bridge.callbackId(SuccessCallback,ErrorCallback);
            bridge.exec(_PLUSNAME,'install',[SusFilePath,callbackid,widgetOptions]);
  		},
  		getProperty:function(appid,propertyCallback){
  			var callbackid = bridge.callbackId( propertyCallback );
        bridge.exec( _PLUSNAME, 'getProperty', [appid,callbackid] );
  		},
      quit : function(){    
        bridge.exec(_PLUSNAME,'quit',[]);
      },
      openURL : function (url, identity)
              {
                bridge.exec(_PLUSNAME, 'openURL', [url, identity] );
              },
      launchApplication : function (appInf, errorCB)
              {
                var callbackid = bridge.callbackId( null,function(code){
                      if( 'function' === typeof(errorCB)){
                        errorCB(code);
                      }
                });
                bridge.exec(_PLUSNAME, 'launchApplication', [appInf, callbackid] );
              },
      setBadgeNumber: function(badgeNumber){
              if ('number' == typeof(badgeNumber)) {
                  bridge.exec(_PLUSNAME, 'setBadgeNumber', [badgeNumber] );
              }
            },
      openFile: function(filepath,options,errorCB){
              var callbackid = bridge.callbackId( null,function(code){
                      if( 'function' === typeof(errorCB)){
                        errorCB(code);
                      }
                });
               bridge.exec(_PLUSNAME, 'openFile', [filepath,options,callbackid] );
            },
  	};
    window.plus.runtime = navigator.plus.runtime = runtime;
})(window);
