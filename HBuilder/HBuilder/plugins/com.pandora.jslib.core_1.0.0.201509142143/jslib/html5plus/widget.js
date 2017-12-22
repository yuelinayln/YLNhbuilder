window.plus.widget = navigator.plus.widget = (function(window){
    var bridge = window.plus.bridge;
    var _PLUSNAME = 'SUSF';
  	
  	return {
  		restart:function(){
  			mkey.exec(_PLUSNAME,'restart',[]);
  		},
  		install:function(SusFilePath,widgetOptions,SuccessCallback,ErrorCallback)
        {
  			var callbackid = mkey.helper.callbackid(SuccessCallback,ErrorCallback);
  			mkey.exec(_PLUSNAME,'install',[SusFilePath,callbackid,widgetOptions]);
  		},
  		getProperty:function(appid,propertyCallback){
  			var funId = mkey.helper.callbackid(propertyCallback);
  			mkey.exec(_PLUSNAME,'getProperty',[appid,funId]);
  		}
  	};
})(window);
