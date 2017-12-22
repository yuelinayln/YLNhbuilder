;
window.plus.uploader = navigator.plus.uploader = (function(window){
    var bridge = window.plus.bridge;
    var uploaderExport;
    var helper = {};
    helper.UUID = function (){
        return bridge.UUID('uploader');
    };
    
    helper.server = 'Uploader';

    helper.getValue = function (value, defaultValue) {
        return value === undefined ? defaultValue : value;
    };

    function EvtPool(type, listener, capture){
        this.type = helper.getValue(type, '');
        this.handles = [];
        this.capture = helper.getValue(capture, false);
        if ( 'function' == typeof(listener) ) {
            this.handles.push(listener);
        }
    }

   EvtPool.prototype.fire = function(e) {
        for (var i = 0; i < this.handles.length; ++i) {
            this.handles[i].apply(this, arguments);
        }
    };

    function Upload(url, options, evt) {                              
        this.__UUID__ = helper.UUID();
        this.url = helper.getValue(url, '');
        this.state = 0;
        this.options = options || {};
        this.uploadedSize = 0;
        this.totalSize = 0;
        this.responseText = '';
        this.method = helper.getValue(this.options.method, 'GET');
        this.timeout = helper.getValue(this.options.timeout, 120);
        this.retry = helper.getValue(this.options.retry, 3);
        this.priority = helper.getValue(this.options.priority, 1);
        this.onCompleted = evt || null;
        this.eventHandlers = {};
    }

    Upload.prototype.addFile = function(path, options) {
        if ( 'string' == typeof(path) && 'object' == typeof(options)) {
            bridge.exec(helper.server, 'addFile', [this.__UUID__, path, options]);
            return true;
        }
        return false;
    };

    Upload.prototype.addData = function(key, value) {
        if ( 'string' == typeof(key) && 'string' == typeof(value)) {
            bridge.exec(helper.server, 'addData', [this.__UUID__, key, value]);
            return true;
        }
        return false;
    };

    Upload.prototype.start = function() {
        bridge.exec(helper.server, 'start', [this.__UUID__]);
    };

    Upload.prototype.pause = function() {
        bridge.exec(helper.server, 'pause', [this.__UUID__]);
    };

    Upload.prototype.resume = function() {
        bridge.exec(helper.server, 'resume', [this.__UUID__]);
    };

    Upload.prototype.abort = function() {
        bridge.exec(helper.server, 'abort', [this.__UUID__]);
    };
                                                     
    Upload.prototype.addEventListener = function(type, listener, capture ) {                                          
        if ( 'string' == typeof(type) && 'function' == typeof(listener)) {
            var e = type.toLowerCase();
            if ( undefined ===  this.eventHandlers[e]) {
                this.eventHandlers[e] = new EvtPool(type, listener, capture);
            } else {
                this.eventHandlers[e].handles.push(listener);
            }
        }
    };

    Upload.prototype.__handlerEvt__ = function (args) {
        //args = {state:0,status:200,filename:'filename'}
        var me = this;
        me.state = helper.getValue(args.state, me.state);
        me.uploadedSize = helper.getValue(args.uploadedSize, me.uploadedSize);
        me.totalSize = helper.getValue(args.totalSize, me.totalSize);
        
        if ( 4 == me.state && typeof me.onCompleted === "function" ) {
            me.responseText = helper.getValue(args.responseText, me.responseText);
            me.onCompleted(me, args.status || null);
        }
        var evt = this.eventHandlers['statechanged'];
        if ( evt  ) {
            evt.fire(me, args.status || null);
        }
    };

    function Uploader(){
        this.__taskList__ = {};
    };
    
    Uploader.prototype.createUpload = function(url, options, evt){
        if ( 'string' ==  typeof(url) ) {
            var upload = new Upload(url, options, evt);
            this.__taskList__[upload.__UUID__] = upload;
            bridge.exec(helper.server, 'createUpload', [upload]);
            return upload;
        }
        return null; 
    };

    Uploader.prototype.enumerate = function (callback, state) {
        var me = this;
        var taskList = me.__taskList__;
        var callbackid = bridge.callbackId( function(args){
            for (var i = 0; i < args.length; i++) {
                var taskData = args[i];       
                if ( taskData && taskData.uuid ) {                             
                    var task = taskList[taskData.uuid];                          
                    if ( task ) { } else {                    
                        task = new Upload();
                        task.__UUID__ = taskData.uuid;              
                        taskList[task.__UUID__] = task;
                    }
                    task.state = helper.getValue(taskData.state, task.state);
                    task.options = helper.getValue(taskData.options, task.options);;
                    task.url = helper.getValue(taskData.url, task.url);
                    task.uploadedSize = helper.getValue(taskData.uploadedSize, task.uploadedSize);
                    task.totalSize = helper.getValue(taskData.totalSize, task.totalSize);
                    task.responseText = helper.getValue(taskData.responseText, task.responseText);
                }
            }

            var toCall = [];
            for (var item in taskList ) {
                toCall.push(taskList[item]);
            }

            if ( 'function' == typeof(callback) ) {
                callback(toCall);
            }
        });
        bridge.exec(helper.server, 'enumerate', [callbackid]);
    };

    Uploader.prototype.clear = function (processState) {
        var state = 4;
        if ( 'number' == typeof(processState) ) {
            state = processState; 
        }
        bridge.exec(helper.server, 'clear', [state]);
    };

    Uploader.prototype.startAll = function () {
        bridge.exec(helper.server, 'startAll', [0]);
    };

    Uploader.prototype.__handlerEvt__ = function (uuid, args) {
        var task = this.__taskList__[uuid];
        if (task) {
            task.__handlerEvt__(args);
        }
    };
    return (uploaderExport = (uploaderExport || new Uploader()));
})(window);

