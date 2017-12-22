;
window.plus.io = navigator.plus.io = (function(window){

    var bridge = window.plus.bridge;
    var tools = window.plus.tools;

    var __file_system__ = [];
    var Tool = {
        NATIVEF : 'File',
        exec : function (success, fail, action, args){
                var callbackId = bridge.callbackId( success, fail );
                bridge.exec(Tool.NATIVEF, action, [callbackId, args]);
            }
    };

    function FileError(error) {
        this.code = error.code || null;
        this.message = error.message || '';
    };
    // file error codes
    // Found in DOMException
    FileError.NOT_FOUND_ERR = 1;
    FileError.SECURITY_ERR = 2;
    FileError.ABORT_ERR = 3;

    FileError.NOT_READABLE_ERR = 4;
    FileError.ENCODING_ERR = 5;
    FileError.NO_MODIFICATION_ALLOWED_ERR = 6;
    FileError.INVALID_STATE_ERR = 7;
    FileError.SYNTAX_ERR = 8;
    FileError.INVALID_MODIFICATION_ERR = 9;
    FileError.QUOTA_EXCEEDED_ERR = 10;
    FileError.TYPE_MISMATCH_ERR = 11;
    FileError.PATH_EXISTS_ERR = 12;

    function newError(code) {
        var message = '未知错误';
        switch (code) {
        case FileError.NOT_FOUND_ERR: message = "文件没有发现"; break;
        case FileError.SECURITY_ERR: message = "没有获得授权"; break;
        case FileError.ABORT_ERR: message = "取消"; break;
        case FileError.NOT_READABLE_ERR: message = "不允许读"; break;
        case FileError.ENCODING_ERR: message = "编码错误"; break;
        case FileError.NO_MODIFICATION_ALLOWED_ERR: message = "不允许修改"; break;
        case FileError.INVALID_STATE_ERR : message = "无效的状态"; break;
        case FileError.SYNTAX_ERR: message = "语法错误"; break;
        case FileError.INVALID_MODIFICATION_ERR: message = "无效的修改"; break;
        case FileError.QUOTA_EXCEEDED_ERR: message = "执行出错"; break;
        case FileError.TYPE_MISMATCH_ERR: message = "类型不匹配"; break;
        case FileError.PATH_EXISTS_ERR: message = "路径存在"; break;
        default:
            break;
        }
        return {
            code :code,
            message : message
        };
    }

    function ProgressEvent(type, dict) {
        this.type = type;
        this.bubbles = false;
        this.cancelBubble = false;
        this.cancelable = false;
        this.lengthComputable = false;
        this.loaded = dict && dict.loaded ? dict.loaded : 0;
        this.total = dict && dict.total ? dict.total : 0;
        this.target = dict && dict.target ? dict.target : null;
    };

    function File(name, fullPath, type, lastModifiedDate, size){
        this.size = size || 0;
        this.type = type || null;
        this.name = name || '';
        this.lastModifiedDate = new Date(lastModifiedDate) || null;
        this.fullPath = fullPath || null;
    };

    File.prototype.slice = function(start, end, contentType) {
        var size = this.end - this.start;
        var newStart = 0;
        var newEnd = size;
        if (arguments.length) {
            if (start < 0) {
                newStart = Math.max(size + start, 0);
            } else {
                newStart = Math.min(size, start);
            }
        }

        if (arguments.length >= 2) {
            if (end < 0) {
                newEnd = Math.max(size + end, 0);
            } else {
                newEnd = Math.min(end, size);
            }
        }

        var newFile = new File(this.name, this.fullPath, this.type, this.lastModifiedData, this.size);
        newFile.start = this.start + newStart;
        newFile.end = this.start + newEnd;
        return newFile;
    };

    File.prototype.close = function() {
    };

    function Metadata(time) {
        this.modificationTime = (typeof time != 'undefined'?new Date(time):null);
        this.size = 0;
        this.directoryCount = 0;
        this.fileCount = 0;
    };

    function Entry(isFile, isDirectory, name, fullPath, fileSystem, remoteURL) {
        this.isFile = (typeof isFile != 'undefined'?isFile:false);
        this.isDirectory = (typeof isDirectory != 'undefined'?isDirectory:false);
        this.name = name || '';
        this.fullPath = fullPath || '';
        this.fileSystem = fileSystem || null;
        this.__PURL__ = remoteURL?remoteURL:'';
        this.__remoteURL__ = remoteURL? 'http://localhost:13131/' +remoteURL:'';
    };
    Entry.prototype.getMetadata = function(successCallback, errorCallback,recursive) {
        var success = typeof successCallback !== 'function' ? null : function(args) {
            var metadata = new Metadata(args.lastModified);
            metadata.size = args.size;
            metadata.directoryCount = args.directoryCount;
            metadata.fileCount = args.fileCount;
            successCallback(metadata);
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(new FileError(code));
        };
        Tool.exec(success, fail, "getMetadata", [this.fullPath,recursive]);
    };

    Entry.prototype.setMetadata = function(successCallback, errorCallback, metadataObject) {
        Tool.exec(successCallback, errorCallback, "setMetadata", [this.fullPath, metadataObject]);
    };

    Entry.prototype.moveTo = function(parent, newName, successCallback, errorCallback) {
        var me = this;
        var fail = function(code) {
            if (typeof errorCallback === 'function') {
                errorCallback(new FileError(code));
            }
        };
        if (!parent) {
            fail(newError(FileError.NOT_FOUND_ERR));
            return;
        }
        var srcPath = this.fullPath,
            name = newName || this.name,
            success = function(entry) {
                if (entry) {
                    if (typeof successCallback === 'function') {
                        var result = (entry.isDirectory) ? new DirectoryEntry(entry.name, entry.fullPath, me.fileSystem, entry.remoteURL) : new FileEntry(entry.name, entry.fullPath, me.fileSystem, entry.remoteURL);
                        try {
                            successCallback(result);
                        }
                        catch (e) {
                        }
                    }
                }
                else {
                    fail(newError(FileError.NOT_FOUND_ERR));
                }
            };
            Tool.exec(success, fail, "moveTo", [srcPath, parent.fullPath, name]);
    };

    Entry.prototype.copyTo = function(parent, newName, successCallback, errorCallback) {
        var me = this;
        var fail = function(code) {
            if (typeof errorCallback === 'function') {
                errorCallback(new FileError(code));
            }
        };
        if (!parent) {
            fail(newError(FileError.NOT_FOUND_ERR));
            return;
        }
        var srcPath = this.fullPath,
        name = newName || this.name,
        success = function(entry) {
            if (entry) {
                if (typeof successCallback === 'function') {
                    var result = (entry.isDirectory) ? new DirectoryEntry(entry.name, entry.fullPath, entry.fileSystem, me.remoteURL) : new FileEntry(entry.name, entry.fullPath, me.fileSystem, entry.remoteURL);
                    try {
                        successCallback(result);
                    }
                    catch (e) {
                    }
                }
            }
            else {
                fail(newError(FileError.NOT_FOUND_ERR));
            }
        };
        Tool.exec(success, fail, "copyTo", [srcPath, parent.fullPath, name]);
    };

    Entry.prototype.remove = function(successCallback, errorCallback) {
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(new FileError(code));
        };
        Tool.exec(successCallback, fail, "remove", [this.fullPath]);
    };

    Entry.prototype.toURL = function() {
        return this.__PURL__;
        //return "file://localhost"+this.fullPath;
    };

    Entry.prototype.toLocalURL = function() {
        return "file://"+this.fullPath;
        //return this.toURL();
    };

    Entry.prototype.toRemoteURL = function() {
        return this.__remoteURL__;
    };

    Entry.prototype.getParent = function(successCallback, errorCallback) {
        var me = this;
        var win = typeof successCallback !== 'function' ? null : function(result) {
            var entry = new DirectoryEntry(result.name, result.fullPath, me.fileSystem, result.remoteURL);
            successCallback(entry);
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(new FileError(code));
        };
        Tool.exec(win, fail, "getParent", [this.fullPath]);
    };

    function FileEntry (name, fullPath, fileSystem, remoteURL) {
        Entry.prototype.constructor.apply(this, [true, false, name, fullPath, fileSystem, remoteURL]);
    };

    FileEntry.prototype = new Entry();
    FileEntry.prototype.constructor = FileEntry;

    FileEntry.prototype.createWriter = function(successCallback, errorCallback) {
        this.file(function(filePointer) {
            var writer = new FileWriter(filePointer);
            if (writer.fileName === null || writer.fileName === "") {
                if (typeof errorCallback === "function") {
                    errorCallback(new FileError(newError(FileError.INVALID_STATE_ERR)));
                }
            } else {
                if (typeof successCallback === "function") {
                    successCallback(writer);
                }
            }
        }, errorCallback);
    };

    FileEntry.prototype.file = function(successCallback, errorCallback) {
        var win = typeof successCallback !== 'function' ? null : function(f) {
            var file = new File(f.name, f.fullPath, f.type, f.lastModifiedDate, f.size);
            successCallback(file);
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(new FileError(code));
        };
        Tool.exec(win, fail, "getFileMetadata", [this.fullPath]);
    };

    function DirectoryEntry (name, fullPath, fileSystem, remoteURL) {
        Entry.prototype.constructor.apply(this, [false, true, name, fullPath, fileSystem, remoteURL]);
    };
    
    DirectoryEntry.prototype = new Entry();
    DirectoryEntry.prototype.constructor = DirectoryEntry;

    DirectoryEntry.prototype.createReader = function() {
        return new DirectoryReader(this.fullPath, this.fileSystem);
    };

    DirectoryEntry.prototype.getDirectory = function(path, options, successCallback, errorCallback) {
        var me = this;
        var win = typeof successCallback !== 'function' ? null : function(result) {
            var entry = new DirectoryEntry(result.name, result.fullPath, me.fileSystem, result.remoteURL);
            successCallback(entry);
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(new FileError(code));
        };
        Tool.exec(win, fail, "getDirectory", [this.fullPath, path, options]);
    };

    DirectoryEntry.prototype.removeRecursively = function(successCallback, errorCallback) {
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(new FileError(code));
        };
        Tool.exec(successCallback, fail, "removeRecursively", [this.fullPath]);
    };

    DirectoryEntry.prototype.getFile = function(path, options, successCallback, errorCallback) {
        var me = this;
        var win = typeof successCallback !== 'function' ? null : function(result) {
            var entry = new FileEntry(result.name, result.fullPath, me.fileSystem, result.remoteURL);
            successCallback(entry);
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(new FileError(code));
        };
        Tool.exec(win, fail, "getFile", [this.fullPath, path, options]);
    };

    /**
    * 列出目录中的所有文件和目录
    */
    function DirectoryReader(path, fileSystem) {
        this.path = path || null;
        this.__fileSystem__ = fileSystem || null;
    };

    DirectoryReader.prototype.readEntries = function(successCallback, errorCallback) {
        var me = this;
        var win = typeof successCallback !== 'function' ? null : function(result) {
            var retVal = [];
            for (var i=0; i<result.length; i++) {
                var entry = null;
                if (result[i].isDirectory) {
                    entry = new DirectoryEntry(result[i].name, result[i].fullPath, me.__fileSystem__, result[i].remoteURL);
                }
                else if (result[i].isFile) {
                    entry = new FileEntry(result[i].name, result[i].fullPath, me.__fileSystem__, result[i].remoteURL);
                }
                retVal.push(entry);
            }
            successCallback(retVal);
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(new FileError(code));
        };
        Tool.exec(win, fail, "readEntries", [this.path]);
    };

    

    function FileReader () {
        this.fileName = "";
        this.readyState = 0; // FileReader.EMPTY
        // File data
        this.result = null;
        // Error
        this.error = null;
        // Event handlers
        this.onloadstart = null;
        this.onprogress = null;
        this.onload = null;
        this.onabort = null;
        this.onerror = null;
        this.onloadend = null;
    };

    // States
    FileReader.EMPTY = 0;
    FileReader.LOADING = 1;
    FileReader.DONE = 2;

    FileReader.prototype.abort = function() {
        this.result = null;
        if (this.readyState == FileReader.DONE || this.readyState == FileReader.EMPTY) {
            return;
        }
        this.readyState = FileReader.DONE;
        if (typeof this.onabort === 'function') {
            this.onabort(new ProgressEvent('abort', {target:this}));
        }
        if (typeof this.onloadend === 'function') {
            this.onloadend(new ProgressEvent('loadend', {target:this}));
        }
    };

    FileReader.prototype.readAsText = function(file, encoding) {
        this.fileName = '';
        if (typeof file.fullPath === 'undefined') {
            this.fileName = file;
        } else {
            this.fileName = file.fullPath;
        }
        if (this.readyState == FileReader.LOADING) {
            throw new FileError(FileError.INVALID_STATE_ERR);
        }
        this.readyState = FileReader.LOADING;
        if (typeof this.onloadstart === "function") {
            this.onloadstart(new ProgressEvent("loadstart", {target:this}));
        }
        // Default encoding is UTF-8
        var enc = encoding ? encoding : "UTF-8";

        var me = this;
        Tool.exec(
            // Success callback
            function(r) {
                if (me.readyState === FileReader.DONE) {
                    return;
                }
                me.result = r;
                if (typeof me.onload === "function") {
                    me.onload(new ProgressEvent("load", {target:me}));
                }
                // DONE state
                me.readyState = FileReader.DONE;
                if (typeof me.onloadend === "function") {
                    me.onloadend(new ProgressEvent("loadend", {target:me}));
                }
            },
            // Error callback
            function(e) {
                if (me.readyState === FileReader.DONE) {
                    return;
                }
                me.readyState = FileReader.DONE;
                me.result = null;
                me.error = new FileError(e);
                // If onerror callback
                if (typeof me.onerror === "function") {
                    me.onerror(new ProgressEvent("error", {target:me}));
                }
                // If onloadend callback
                if (typeof me.onloadend === "function") {
                    me.onloadend(new ProgressEvent("loadend", {target:me}));
                }
            }, "readAsText", [this.fileName, enc]);
    };

    FileReader.prototype.readAsDataURL = function(file) {
        this.fileName = "";
        if (typeof file.fullPath === "undefined") {
            this.fileName = file;
        } else {
            this.fileName = file.fullPath;
        }
        if (this.readyState == FileReader.LOADING) {
            throw new FileError(FileError.INVALID_STATE_ERR);
        }
        this.readyState = FileReader.LOADING;
        if (typeof this.onloadstart === "function") {
            this.onloadstart(new ProgressEvent("loadstart", {target:this}));
        }

        var me = this;
        Tool.exec(
            // Success callback
            function(r) {
                if (me.readyState === FileReader.DONE) {
                    return;
                }
                me.readyState = FileReader.DONE;
                me.result = r;
                if (typeof me.onload === "function") {
                    me.onload(new ProgressEvent("load", {target:me}));
                }
                if (typeof me.onloadend === "function") {
                    me.onloadend(new ProgressEvent("loadend", {target:me}));
                }
            },
            // Error callback
            function(e) {
                if (me.readyState === FileReader.DONE) {
                    return;
                }

                me.readyState = FileReader.DONE;
                me.result = null;
                me.error = new FileError(e);
                if (typeof me.onerror === "function") {
                    me.onerror(new ProgressEvent("error", {target:me}));
                }
                if (typeof me.onloadend === "function") {
                    me.onloadend(new ProgressEvent("loadend", {target:me}));
                }
            }, "readAsDataURL", [this.fileName]);
    };

    FileReader.prototype.readAsArrayBuffer = function(file) {
    };

    function FileWriter(file) {
        this.fileName = "";
        this.readyState = 0; // EMPTY
        this.result = null;
        this.length = 0;
        if (file) {
            this.fileName = file.fullPath || file;
            this.length = file.size || 0;
        }
        // default is to write at the beginning of the file
        this.position = 0;
        // Error
        this.error = null;

        // Event handlers
        this.onwritestart = null;   // 写入开始
        this.onprogress = null;     // 写入数据的进度
        this.onwrite = null;        // 写入完成
        this.onabort = null;        // 写入取消
        this.onsuccess = null;      // 写入成功
        this.onerror = null;        // 写入错误
        this.onwriteend = null;     
    };

    // States
    FileWriter.INIT = 0;
    FileWriter.WRITING = 1;
    FileWriter.DONE = 2;

    FileWriter.prototype.abort = function() {
        // check for invalid state
        if (this.readyState === FileWriter.DONE || this.readyState === FileWriter.INIT) {
            throw new FileError(newError(FileError.INVALID_STATE_ERR));
        }

        this.error = new FileError(newError(FileError.ABORT_ERR));

        this.readyState = FileWriter.DONE;
        if (typeof this.onabort === "function") {
            this.onabort(new ProgressEvent("abort", {"target":this}));
        }
        if (typeof this.onwriteend === "function") {
            this.onwriteend(new ProgressEvent("writeend", {"target":this}));
        }
    };

    FileWriter.prototype.write = function(text) {
        if (this.readyState === FileWriter.WRITING) {
            throw new FileError(FileError.INVALID_STATE_ERR);
        }
        this.readyState = FileWriter.WRITING;

        var me = this;
        if (typeof me.onwritestart === "function") {
            me.onwritestart(new ProgressEvent("writestart", {"target":me}));
        }
        Tool.exec(
            // Success callback
            function(r) {
                if (me.readyState === FileWriter.DONE) {
                    return;
                }
                me.position += r;
                me.length += r; //me.position;
                me.readyState = FileWriter.DONE;
                if (typeof me.onwrite === "function") {
                    me.onwrite(new ProgressEvent("write", {"target":me}));
                }
                if (typeof me.onsuccess === "function") {
                    me.onsuccess(new ProgressEvent("success", {"target":me}));
                }
                if (typeof me.onwriteend === "function") {
                    me.onwriteend(new ProgressEvent("writeend", {"target":me}));
                }
            },
            function(e) {
                if (me.readyState === FileWriter.DONE) {
                    return;
                }
                me.readyState = FileWriter.DONE;
                me.error = new FileError(e);
                if (typeof me.onerror === "function") {
                    me.onerror(new ProgressEvent("error", {"target":me}));
                }
                if (typeof me.onwriteend === "function") {
                    me.onwriteend(new ProgressEvent("writeend", {"target":me}));
                }
            }, "write", [this.fileName, text, this.position]);
    };

    FileWriter.prototype.seek = function(offset) {
        if (this.readyState === FileWriter.WRITING) {
            throw new FileError(FileError.INVALID_STATE_ERR);
        }

        if (!offset && offset !== 0) {
            return;
        }

        if (offset < 0) {
            this.position = Math.max(offset + this.length, 0);
        } else if (offset > this.length) {
            this.position = this.length;
        } else {
            this.position = offset;
        }
    };

    FileWriter.prototype.truncate = function(size) {
        if (this.readyState === FileWriter.WRITING) {
            throw new FileError(FileError.INVALID_STATE_ERR);
        }

        this.readyState = FileWriter.WRITING;

        var me = this;
        if (typeof me.onwritestart === "function") {
            me.onwritestart(new ProgressEvent("writestart", {"target":this}));
        }
        Tool.exec(
            // Success callback
            function(r) {
                if (me.readyState === FileWriter.DONE) {
                    return;
                }
                me.readyState = FileWriter.DONE;
                me.length = r;
                me.position = Math.min(me.position, r);
                if (typeof me.onwrite === "function") {
                    me.onwrite(new ProgressEvent("write", {"target":me}));
                }
                if (typeof me.onwriteend === "function") {
                    me.onwriteend(new ProgressEvent("writeend", {"target":me}));
                }
            },
        // Error callback
            function(e) {
                if (me.readyState === FileWriter.DONE) {
                    return;
                }
                me.readyState = FileWriter.DONE;
                me.error = new FileError(e);
                if (typeof me.onerror === "function") {
                    me.onerror(new ProgressEvent("error", {"target":me}));
                }
                if (typeof me.onwriteend === "function") {
                    me.onwriteend(new ProgressEvent("writeend", {"target":me}));
                }   
            },  "truncate", [this.fileName, size]);
    };

    function FileSystem (name, root) {
        this.name = name || null;
        this.root = null;
        if (root) {
            this.root = new DirectoryEntry(root.name, root.fullPath, this, root.remoteURL);
        }
    }

    function requestFileSystem (type, successCallback, errorCallback) {
        var fail = function(code) {
            if (typeof errorCallback === 'function') {
                errorCallback(new FileError(code));
            }
        };

        if (type < 1 || type > 4) {
            fail(newError(FileError.SYNTAX_ERR));
        } else {
            var retFileSystem = __file_system__[type];
            // if successful, return a FileSystem object
            var success = function(file_system) {
                if ( file_system ) {
                    if (typeof successCallback === 'function') {
                        if ( retFileSystem ) {
                        } else {
                            // grab the name and root from the file system object
                            retFileSystem = new FileSystem(file_system.name, file_system.root);
                            __file_system__[type] = retFileSystem;
                        }
                        successCallback(retFileSystem);
                    }
                } else {
                    // no FileSystem object returned
                    fail(newError(FileError.NOT_FOUND_ERR));
                }
            };//end of var success = function(file_system) {
            if ( retFileSystem ) {
                window.setTimeout(success(retFileSystem), 0);
            } else {
                Tool.exec(success, fail, "requestFileSystem", [type]);
            }
        }//end of (type < 0 || type > 3)
    }

    function resolveLocalFileSystemURL (uri, successCallback, errorCallback){
        var fail = function(error) {
            errorCallback && errorCallback(new FileError(error));
        };

        if( typeof uri !== 'string' ) {
            setTimeout( function() {
                fail(newError(FileError.ENCODING_ERR));
            },0);
            return;
        }
        // if successful, return either a file or directory entry
        var success = function(entry) {
            var result;
            if (entry) {
                if (successCallback) {
                    var retFileSystem = __file_system__[entry.type];
                    if ( !retFileSystem ) {
                        retFileSystem = new FileSystem(entry.fsName, entry.fsRoot);
                        __file_system__[entry.type] = retFileSystem;
                    }
                    // create appropriate Entry object
                    result = (entry.isDirectory) ? new DirectoryEntry(entry.name, entry.fullPath, retFileSystem, entry.remoteURL) : new FileEntry(entry.name, entry.fullPath,retFileSystem, entry.remoteURL);
                    successCallback(result);
                }
            }
            else {
                // no Entry object returned
                fail(newError(FileError.NOT_FOUND_ERR));
            }
        };

        Tool.exec(success, fail, "resolveLocalFileSystemURL", [uri]);
    }

    return{
        FileSystem : FileSystem,
        DirectoryEntry : DirectoryEntry,
        DirectoryReader : DirectoryReader,
        FileReader : FileReader,
        FileWriter : FileWriter,
        requestFileSystem : requestFileSystem,
        resolveLocalFileSystemURL : resolveLocalFileSystemURL,
        PRIVATE_WWW : 1,
        PRIVATE_DOCUMENTS :2,
        PUBLIC_DOCUMENTS : 3,
        PUBLIC_DOWNLOADS : 4
    }
})(window);