
window.plus.ui = navigator.plus.ui = (function(mkey){   
    var _PLUSNAME = 'UI';
    var _ExecMethod = 'execMethod';
    var _Sync_ExecMethod = 'syncExecMethod';
    var _NWindow_Stack = new Array;//使用key - value 保存uuid - nwindow
    var __JSON_Window_Stack = {};
    var bridge = plus.bridge;
    var tools = plus.tools;
    function __pushWindow__(nwindow){
        __JSON_Window_Stack[nwindow.__uuid__] = nwindow;
        _NWindow_Stack.push(nwindow);
    }
    function __popWindow__(nwindow){
        _NWindow_Stack.pop(nwindow);
        for(var i in __JSON_Window_Stack){
            if(__JSON_Window_Stack[i] === nwindow){
                delete __JSON_Window_Stack[i];
                break;
            }
        }
    }
    function alert( message, alertCB, title, ButtonCapture) {
    	var callBackID;
        if ( typeof message !== 'string' ) {
            return;
        };
    	if(alertCB){
	        callBackID = bridge.callbackId(function (args){
	        	alertCB(args);
	        });
    	}
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'alert', [window.__HtMl_Id__, [message, callBackID, title, ButtonCapture]]]);
    }

    function toast( message, options ){
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'toast', [window.__HtMl_Id__, [message, options]]]);
    }
    function confirm(message, confirmCB, title, buttons) {
       var callBackID;
        if ( typeof message !== 'string' ) {
            return;
        };
    	if(confirmCB){
    		callBackID = bridge.callbackId(function (args){
	        	confirmCB(args);
	        });
    	}
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'confirm', [window.__HtMl_Id__, [message, callBackID, title, buttons]]]);
    }
    function prompt(message, promptCB, title, tip, buttons)
    {
        var callBackID ;
        if(promptCB){
        	callBackID = bridge.callbackId(function (args){
	        	promptCB(args.index,args.message);
	        });
        }
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME, 'prompt', [window.__HtMl_Id__, [message, callBackID, title, tip, buttons]]]);
    }

    function pickDate( successCallback, errorCallback, options ) {
        var nativeOptions = {};
        if ( options ) {
            if ( options.minDate instanceof Date ) { 
                nativeOptions.startYear = options.minDate.getFullYear();
                nativeOptions.startMonth = options.minDate.getMonth()+1;
                nativeOptions.startDay= options.minDate.getDate();
            } else if ( tools.isNumber(options.startYear) ) {
                nativeOptions.startYear = options.startYear;
                nativeOptions.startMonth = 1;
                nativeOptions.startDay= 1;
            } 
            if ( options.maxDate instanceof Date ) { 
                nativeOptions.endYear = options.maxDate.getFullYear();
                nativeOptions.endMonth = options.maxDate.getMonth()+1;
                nativeOptions.endDay= options.minDate.getDate();
            } else if ( tools.isNumber(options.endYear) ) {
                nativeOptions.endYear = options.endYear;
                nativeOptions.endMonth = 12;
                nativeOptions.endDay= 31;
            } 

            if ( options.date instanceof Date ) { 
                nativeOptions.setYear = options.date.getFullYear();
                nativeOptions.setMonth = options.date.getMonth()+1;
                nativeOptions.setDay = options.date.getDate();
            }

            nativeOptions.popover = options.popover;
            nativeOptions.title = options.title;
        }

        var success = typeof successCallback !== 'function' ? null : function(time) {
            var date = (typeof time != 'undefined'?new Date(time):null);
            successCallback(date);
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(code);
        };
        var callBackID = bridge.callbackId(success, fail);
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME, 'pickDate', [window.__HtMl_Id__, [callBackID, nativeOptions]]]);
    }
                                      
    function pickTime( successCallback, errorCallback, options ) {
        var success = typeof successCallback !== 'function' ? null : function(time) {
            var date = (typeof time != 'undefined'?new Date(time):null);
            successCallback(date);
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(code);
        };
        var callBackID = bridge.callbackId(success, fail);
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME, 'pickTime', [window.__HtMl_Id__, [callBackID,options]]]);
    }

    function createWindow(url, options )
    {
        var nWin = new plus.ui.NWindow(url, options );
        return nWin;
    }
    var __nviews__ = {};
    function register(identity,fun){
        __nviews__[identity] = fun;
    }
    function createView(identity,options){
        var ret = new __nviews__[identity](options);
        if (options) {                             
           ret.id = options.id;
        }
                                     
        mkey.exec(_PLUSNAME,_ExecMethod,[_PLUSNAME,'createView',[window.__HtMl_Id__,[identity,ret.__uuid__,options,ret.__callback_id__]]]);
        //mkey.exec(_PLUSNAME,_ExecMethod,[identity, ret.__uuid__,'createView',options]);
        return ret;
    }

    function closeWindow (pWin, aniType)
    {
        if(pWin){
            pWin.close(aniType);                  
        }
    }
    function enumWindow ()
    {
        var _json_windows_ = mkey.execSync(_PLUSNAME, _Sync_ExecMethod, [_PLUSNAME,'enumWindow', [window.__HtMl_Id__]]);
        var _stack_ = [];
        var _json_stack_ = {};
        if(_NWindow_Stack.length != _json_windows_.length)
        {//对比js层页面栈数据与native层数据是否一致
            for(var i = 0;i < _json_windows_.length; i++)
            {
                var _json_window_ = _json_windows_[i];//json 格式
                var _window = __JSON_Window_Stack[_json_window_.uuid];//从json栈获取指定uuid的nwindow
                
                if(_window == null || _window === undefined)
                {//当前js页面栈没有新创建的NWindow                    
                     _window  = new plus.ui.NWindow(null,null,true);
                     _window.__uuid__ = _json_window_.uuid;
                    mkey.exec(_PLUSNAME,_ExecMethod,[_PLUSNAME,'setcallbackid',[_window.__uuid__,[_window.__callback_id__]]]);
                }
                _stack_.push(_window);
                _json_stack_[_window.__uuid__] = _window;
            }
            _NWindow_Stack = _stack_;
            __JSON_Window_Stack = _json_stack_;
        }
        return _NWindow_Stack;
    }
    function findWindowByName(_name)
    {
        var _json_window_ = mkey.execSync(_PLUSNAME, _Sync_ExecMethod, [_PLUSNAME,'findWindowByName',[window.__HtMl_Id__,[_name]]] );
                                      
        if(_json_window_)
        {
            var _window = __JSON_Window_Stack[_json_window_.uuid];
            if(_window == null){
                _window  = new plus.ui.NWindow(null, null,true);
                _window.__uuid__ = _json_window_.uuid;
            }
            return _window;
        }
    }
    function getSelfWindow()
    {     
        var __window__ = __JSON_Window_Stack[window.__HtMl_Id__];  
        if(__window__ == null || __window__ === undefined)
        {
               __window__  = new plus.ui.NWindow(null,null,true);
               __window__.__uuid__ = window.__HtMl_Id__;
               _NWindow_Stack.push(__window__);
               __JSON_Window_Stack[__window__.__uuid__] = __window__;
               mkey.exec(_PLUSNAME,_ExecMethod,[_PLUSNAME,'setcallbackid',[__window__.__uuid__,[__window__.__callback_id__]]]);
            
        }
       return __window__;              
    }
    
    function closeSplashscreen(){
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'closeSplashscreen', [0]]);
    }

    function exec(nview,action,actionArgs){
        mkey.exec(_PLUSNAME, _ExecMethod, [nview.__IDENTITY__,action,[nview.__uuid__, actionArgs]]);
    }

    function execSync(nview,action,actionArgs){
        return mkey.execSync(_PLUSNAME, _Sync_ExecMethod, [nview.__IDENTITY__,action,[ nview.__uuid__,actionArgs]]);
    }
    
    function WaitingView( title, options ){
    	this.__uuid__ = window.plus.tools.UUID('WaitingView');
    	this.onclose = null;
    	var me = this;
    	var oncloseCallbackId = bridge.callbackId(function (){
        		if( typeof me.onclose === 'function' ){
        			me.onclose();
        		}
        	});
    	mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'WaitingView', [this.__uuid__,[title, options,oncloseCallbackId]]]);
    }
    WaitingView.prototype.close = function  () {
     	mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'WaitingView_close', [this.__uuid__]]);
    }
    WaitingView.prototype.setTitle = function  (title) {
     	mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'WaitingView_setTitle', [this.__uuid__,[title]]]);
    }
    function createWaiting( title, options ){
        return new WaitingView( title, options );
    }

    return{
        createWaiting:createWaiting,
        pickTime:pickTime,
        pickDate:pickDate,
        alert:alert,
        confirm:confirm,
        prompt:prompt,
        toast:toast,
        findWindowByName:findWindowByName,
        closeWindow:closeWindow,
        createWindow:createWindow,
        getSelfWindow:getSelfWindow,
        enumWindow:enumWindow,
        register:register,
        createView:createView,
        exec:exec,
        execSync:execSync,
        closeSplashscreen:closeSplashscreen,
        __pushWindow__:__pushWindow__,
        __popWindow__:__popWindow__,
        __nviews__:__nviews__,
    };
})(window.plus.bridge);

window.plus.ui.NView = navigator.plus.ui.NView = (function(ui){
    var bridge = plus.bridge;
    function NView(type){
        this.__IDENTITY__ = type;
        this.__uuid__ = window.plus.tools.UUID(type);
        this.id;
    }
    NView.prototype.getMetrics = function(callback){
        var callBackID;
        if(callback){
        	callBackID = bridge.callbackId(function (args){
        		callback(args);
        	});
            ui.exec(this, 'getMetrics',[callBackID, window.__HtMl_Id__] );
        }
    }
    return NView;
})(plus.ui);

window.plus.ui.NWindow = navigator.plus.ui.NWindow = (function(ui){
    var IDENTITY = 'NWindow';
    function NWindow(url, options ,capture)
    {
        this.__view_array__ = new Array;
        ui.NView.prototype.constructor.apply(this, [IDENTITY]);
        plus.obj.Callback.prototype.constructor.apply(this);
        ui.__pushWindow__(this);
        if(!capture){//是否调用到native层
            ui.exec( this, IDENTITY,[url, options,this.__callback_id__] );    
        }
    }
    plus.tools.extend(NWindow.prototype,ui.NView.prototype);
    plus.tools.extend(NWindow.prototype,plus.obj.Callback.prototype);
    NWindow.prototype.constructor = NWindow;
    NWindow.prototype.onCallback = function (fun,evt,args) {
    	fun(args);
    }
    NWindow.prototype.show = function(aniShow,duration,assWin)
    {
        ui.exec(this, 'show',[aniShow,duration,assWin] );
    }
    NWindow.prototype.close = function(aniType,duration)
    {
		plus.bridge.callbackFromNative(this.__callback_id__,{status:plus.bridge.OK,message:{evt:'close'},keepCallback:true});//执行close事件
        ui.__popWindow__(this);
        ui.exec(this, 'close', [aniType,duration]);
    };
    NWindow.prototype.setOption = function( pOptions )
    { 
       ui.exec(this, 'setOption',[pOptions] );
    };
    NWindow.prototype.setVisible = function(bVisable)
    {
        ui.exec(this, 'setVisible', [bVisable]);
    }
    NWindow.prototype.getOption = function()
    { 
        return ui.execSync(this, 'getOption');
    };
    NWindow.prototype.load = function(url)
    {
        ui.exec(this, 'load', [url]);
    };
    NWindow.prototype.evalJS = function(script)
    {
        ui.exec(this, 'evalJS',[script] );
    };
    NWindow.prototype.addEventListener = function(eventType, callback,capture)
    {
    	var notice = plus.obj.Callback.prototype.addEventListener.apply(this,[eventType, callback,capture]);
    	if(notice){
	        var args = [eventType, window.__HtMl_Id__];
	        ui.exec(this,'addEventListener',args );
    	}
    };
    NWindow.prototype.removeEventListener = function(eventType, callback)
    {
    	var notice = plus.obj.Callback.prototype.removeEventListener.apply(this,[eventType, callback]);
    	if(notice){
	        var args = [eventType, window.__HtMl_Id__];
	        ui.exec(this,'removeEventListener',args );
    	}
    };
    NWindow.prototype.append = function(extView){
        this.__view_array__.push(extView);
        ui.exec(this,'append',[extView.__IDENTITY__,extView.__uuid__]);
    }
    NWindow.prototype.setPullToRefresh = function(options,refreshCB){
        var callbackId ;
        if(refreshCB){
           callbackId = plus.bridge.callbackId(refreshCB);
        }
        ui.exec(this,'setPullToRefresh',[options,callbackId]);
    }
    NWindow.prototype.endPullToRefresh = function(){
        ui.exec(this,'endPullToRefresh',[]);
    }
    NWindow.prototype.findViewById = function(id){
        var size = this.__view_array__.length;
        for(var i = size - 1; i >= 0; i--){
            var view = this.__view_array__[i];
            if(id == view.id){
                return view;
            }
        }
        var viewJson = ui.execSync(this,'findViewById',[id] );
        var identity = viewJson.identity;
        var options = viewJson.option;
        var uuid = viewJson.uuid;
        var ret = new plus.ui.__nviews__[identity](options);
        ret.__uuid__ = viewJson.uuid;
        this.__view_array__.push(ret);
        return ret;
    }
    return NWindow;
})(plus.ui);
