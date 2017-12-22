;
window.plus.audio = navigator.plus.audio = (function(window)
{
    var bridge = window.plus.bridge;
    var tools = window.plus.tools;
    var _Audio__ = "Audio";
    var _RecExecMethod = "RecorderExecMethod";
    var _AudioExecMethod="AudioExecMethod";
    var _AudioSyncExecMethod = "AudioSyncExecMethod";
    return {
        getRecorder:function()
        {
            var AudioRecorder =
            {
                _Audio_UUID__:tools.UUID('Record'),
                supportedFormats:['amr','3gp'],
                supportedSamplerates:[8000,16000,44100],
                record:function(RecordOption, successCallback, failCallback)
                {
                    var callBackID = bridge.callbackId(successCallback, failCallback);
                    bridge.exec(_Audio__, _RecExecMethod, ['record',[this._Audio_UUID__, callBackID , RecordOption]]);
                }, 
                stop:function()
                {
                    bridge.exec(_Audio__, _RecExecMethod, ['stop',[this._Audio_UUID__]]);
                },
                pause:function()
                {
                    bridge.exec(_Audio__, _RecExecMethod, ['pause',[this._Audio_UUID__]]);
                } 
            };
            if ( tools.IOS == tools.platform ) {
                AudioRecorder.supportedFormats = ['wav', 'aac'];    
            };
            return AudioRecorder;
        }, 
        createPlayer:function(filePath)
        {
            var AudioPlayer = 
            {
                _Player_FilePath : filePath,
                _Audio_Player_UUID_:tools.UUID('Player'),
                                            
                play:function(  successCallBack, failCallback )
                {
                    var CallBackID = bridge.callbackId(successCallBack, failCallback);
                    bridge.exec(_Audio__, _AudioExecMethod, ['play', [this._Audio_Player_UUID_, CallBackID]]);
                },
                pause:function()
                {
                    bridge.exec(_Audio__, _AudioExecMethod, ['pause', [this._Audio_Player_UUID_]]);
                },
                resume:function()
                {
                    bridge.exec(_Audio__, _AudioExecMethod, ['resume', [this._Audio_Player_UUID_]]);
                },
                stop:function()
                {
                    bridge.exec(_Audio__, _AudioExecMethod, ['stop', [this._Audio_Player_UUID_]]);
                },
                seekTo:function(position)
                {
                    bridge.exec(_Audio__, _AudioExecMethod, ['seekTo', [this._Audio_Player_UUID_, position]]);
                },
                getDuration:function()
                {
                    return bridge.execSync(_Audio__, _AudioSyncExecMethod, ['getDuration', [this._Audio_Player_UUID_]]);
                },
                getPosition:function()
                {
                    return bridge.execSync(_Audio__, _AudioSyncExecMethod, ['getPosition', [this._Audio_Player_UUID_]]);
                },

               //
            };
            bridge.execSync(_Audio__, _AudioSyncExecMethod, ['CreatePlayer', [AudioPlayer._Audio_Player_UUID_, AudioPlayer._Player_FilePath]]);
            return AudioPlayer;
        }      
    };

})(window);