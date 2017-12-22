;
(function(window){
    var bridge = window.plus.bridge;

    var _LOGF = 'Console';
    var winConsole = window.console;
    var console = {};
    var Timers = {};

    function formatted(object)  {
        if ((object === null) || (object === undefined)) {
            return Object.prototype.toString.call(object);
        }

        if ( object.toString ) {
            return object.toString();
        }

        try {
            return JSON.stringify(object);
        } catch (e) {
            return "error JSON.stringify()ing argument: " + e;
        }
        return '';
    }

    vformat = function vformat (args) {
        var numargs = args.length;
        var result  = [];
        for (var i =0 ; i < numargs; i++ ) {
            var description = formatted(args[i]);
            result.push(description);
        }
        return result.join('');
    }

    function logWithArgs(level, args) {
        var message = vformat(args);
        bridge.exec(_LOGF,'logLevel', [level, message]);
        // log to the console
        switch (level) 
        {
            case 'LOG':   winConsole.log(message); break;
            case 'ERROR': winConsole.log("ERROR: " + message); break;
            case 'WARN':  winConsole.log("WARN: "  + message); break;
            case 'INFO':  winConsole.log("INFO: "  + message); break;
            case 'ASSERT': winConsole.log("ASSERT: " + message); break;
        }
    }

    console.log = function() {
        logWithArgs('LOG', arguments);
    };

    console.info = function() {
        logWithArgs('INFO', arguments);
    };

    console.warn = function() {
        logWithArgs('WARN', arguments);
    };

    console.error = function() {
        logWithArgs('ERROR', arguments);
    };

    console.assert = function(expression) {
        if (expression) return;
        //var message = vformat( arguments[1], [].slice.call(arguments, 2) );
        var message = vformat([].slice.call(arguments, 1) );
        console.log("ASSERT:"+message);
        throw new Error(message);
    };

    console.clear = function() {
        bridge.exec(_LOGF,'clear', 0);
    };

    console.time = function(name) {
        Timers[name] = new Date().valueOf();
    };

    console.timeEnd = function(name) {
        var timeStart = Timers[name];
        if (!timeStart)
        { return; }
        var timeElapsed = new Date().valueOf() - timeStart;
        console.log("Timer [" + name + ": " + timeElapsed + "ms]");
    };
    window.plus.console = navigator.plus.console = console;
})(window);