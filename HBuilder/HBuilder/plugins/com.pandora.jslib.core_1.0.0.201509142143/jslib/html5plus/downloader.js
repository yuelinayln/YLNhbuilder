;
window.plus.downloader = navigator.plus.downloader = (function(window){
    var bridge = window.plus.bridge;
    var tools = window.plus.tools;
    var downloaderExport;
    var helper = {};

    helper.server = 'Downloader';
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

    function Download(url, options, evt) {
        var me = this;
        this.__UUID__ = tools.UUID('downloadtask');
        this.url = helper.getValue(url, '');
        //this.state = 0;
        this.downloadedSize = 0;
        this.totalSize = 0;
        this.options = options || {};
        this.filename = helper.getValue(this.options.filename, '');
        this.method = helper.getValue(this.options.method, 'GET');
        this.timeout = helper.getValue(this.options.timeout, 120);
        this.retry = helper.getValue(this.options.retry, 3);
        this.priority = helper.getValue(this.options.priority, 1);
        this.onCompleted = evt || null;
        this.eventHandlers = {};
    }

    Download.prototype.getFileName = function() {
        return this.filename;
    };

    Download.prototype.start = function() {
        bridge.exec(helper.server, 'start', [this.__UUID__]);
    };

    Download.prototype.pause = function() {
        bridge.exec(helper.server, 'pause', [this.__UUID__]);
    };

    Download.prototype.resume = function() {
        bridge.exec(helper.server, 'resume', [this.__UUID__]);
    };

    Download.prototype.abort = function() {
        bridge.exec(helper.server, 'abort', [this.__UUID__]);
    };

    Download.prototype.addEventListener = function(type, listener, capture ) {
        if ( 'string' == typeof(type) && 'function' == typeof(listener)) {
            var e = type.toLowerCase();
            if ( undefined ===  this.eventHandlers[e]) {
                this.eventHandlers[e] = new EvtPool(type, listener, capture);
            } else {
                this.eventHandlers[e].handles.push(listener);
            }
        }
    };

    Download.prototype.__handlerEvt__ = function (args) {
        //args = {state:0,status:200,filename:'filename'}
        var me = this;
        me.filename = helper.getValue(args.filename, me.filename);
        me.state = helper.getValue(args.state, me.state);
        me.downloadedSize = helper.getValue(args.downloadedSize, me.downloadedSize);
        me.totalSize = helper.getValue(args.totalSize, me.totalSize);

        if ( 4 == me.state && typeof me.onCompleted === "function" ) {
            me.onCompleted(me, args.status || null);
        }
        var evt = this.eventHandlers['statechanged'];
        if ( evt  ) {
            evt.fire(me, args.status || null);
        }
    };

    function Downloader(){
        this.__taskList__ = {};
    };

    Downloader.prototype.createDownload = function(url, options, evt){
        if ( 'string' ==  typeof(url) ) {
            var download = new Download(url, options, evt);
            this.__taskList__[download.__UUID__] = download;
            bridge.exec(helper.server, 'createDownload', [download]);
            return download;
        }
        return null;
    };

    Downloader.prototype.enumerate = function (callback, state) {
        var me = this;
        var taskList = me.__taskList__;
        var callbackid = bridge.callbackId( function(args){
            var toCall = [];
            for (var i = 0; i < args.length; i++) {
                var taskData = args[i];
                if ( taskData && taskData.uuid ) {
                    var task = taskList[taskData.uuid];
                    if ( task ) { } else {
                        task = new Download();
                        task.__UUID__ = taskData.uuid;
                        taskList[task.__UUID__] = task;
                    }
                    task.state = helper.getValue(taskData.state, task.state);
                    task.options = helper.getValue(taskData.options, task.options);;
                    task.filename = helper.getValue(taskData.filename, task.filename);
                    task.url = helper.getValue(taskData.url, task.url);
                    task.downloadedSize = helper.getValue(taskData.downloadedSize, task.downloadedSize);
                    task.totalSize = helper.getValue(taskData.totalSize, task.totalSize);
                    toCall.push(task);
                }
            }

            if ( 'function' == typeof(callback) ) {
                callback(toCall);
            }
        });
        bridge.exec(helper.server, 'enumerate', [callbackid, state]);
    };

    Downloader.prototype.clear = function (processState) {
        var state = 4;
        if ( 'number' == typeof(processState)
            || processState instanceof Number ) {
            state = processState;
        }
        bridge.exec(helper.server, 'clear', [state]);
    };

    Downloader.prototype.startAll = function () {
        bridge.exec(helper.server, 'startAll', [0]);
    };

    Downloader.prototype.__handlerEvt__ = function (uuid, args) {
        var task = this.__taskList__[uuid];
        if (task) {
            if ( 6 == args.state ) {
                delete this.__taskList__[uuid];
            }
            task.__handlerEvt__(args);
        }
    };
    return (downloaderExport = (downloaderExport || new Downloader()));
})(window);

