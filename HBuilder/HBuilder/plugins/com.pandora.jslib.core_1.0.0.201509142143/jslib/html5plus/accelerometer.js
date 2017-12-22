;
(function(window){
    var bridge = window.plus.bridge;
    var tools = window.plus.tools;

    var service = "Accelerometer";
    // Is the accel sensor running?
    var running = false;

    // Keeps reference to watchAcceleration calls.
    var timers = {};

    // Array of listeners; used to keep track of when we should call start and stop.
    var listeners = [];

    // Last returned acceleration object from native
    var accel = null;

    var Acceleration = function(x, y, z) {
        this.xAxis = x;
        this.yAxis = y;
        this.zAxis = z;
    };

    // Tells native to start.
    function start(frequency) {
        var callbackid = bridge.callbackId(function(a) {
            var tempListeners = listeners.slice(0);
            accel = new Acceleration(a.x, a.y, a.z);
            for (var i = 0, l = tempListeners.length; i < l; i++) {
                tempListeners[i].win(accel);
            }
        }, function(e) {
            var tempListeners = listeners.slice(0);
            for (var i = 0, l = tempListeners.length; i < l; i++) {
                tempListeners[i].fail(e);
            }
        });
        bridge.exec(service, "start", [callbackid,frequency]);
        running = true;
    }

    // Tells native to stop.
    function stop() {
        bridge.exec(service, "stop", []);
        running = false;
    }

    // Adds a callback pair to the listeners array
    function createCallbackPair(win, fail) {
        return {win:win, fail:fail};
    }

    // Removes a win/fail listener pair from the listeners array
    function removeListeners(l) {
        var idx = listeners.indexOf(l);
        if (idx > -1) {
            listeners.splice(idx, 1);
            if (listeners.length === 0) {
                stop();
            }
        }
    }

    var accelerometer = {
        /**
         * Asynchronously acquires the current acceleration.
         *
         * @param {Function} successCallback    The function to call when the acceleration data is available
         * @param {Function} errorCallback      The function to call when there is an error getting the acceleration data. (OPTIONAL)
         * @param {AccelerationOptions} options The options for getting the accelerometer data such as timeout. (OPTIONAL)
         */
        getCurrentAcceleration: function(successCallback, errorCallback, options) {
            var p;
            var win = function(a) {
                removeListeners(p);
                successCallback(a);
            };
            var fail = function(e) {
                removeListeners(p);
                errorCallback && errorCallback(e);
            };

            p = createCallbackPair(win, fail);
            listeners.push(p);

            if (!running) {
                start(-1);
            }
        },

        /**
        * Asynchronously acquires the acceleration repeatedly at a given interval.
        *
         * @param {Function} successCallback    The function to call each time the acceleration data is available
         * @param {Function} errorCallback      The function to call when there is an error getting the acceleration data. (OPTIONAL)
         * @param {AccelerationOptions} options The options for getting the accelerometer data such as timeout. (OPTIONAL)
         * @return String                       The watch id that must be passed to #clearWatch to stop watching.
         */
        watchAcceleration: function(successCallback, errorCallback, options) {
            // Default interval (10 sec)
            var frequency = (options && options.frequency && typeof options.frequency == 'number') ? options.frequency : 500;

            // Keep reference to watch id, and report accel readings as often as defined in frequency
            var id = tools.UUID('watch');

            var p = createCallbackPair(function(){}, function(e) {
                removeListeners(p);
                errorCallback && errorCallback(e);
            });
            listeners.push(p);

            timers[id] = {
                timer:window.setInterval(function() {
                    if (accel) {
                        successCallback(accel);
                    }
                }, frequency),
                listeners:p
            };

            if (running) {
                // If we're already running then immediately invoke the success callback
                // but only if we have retrieved a value, sample code does not check for null ...
                if (accel) {
                    successCallback(accel);
                }
            } else {
                start(frequency);
            }

            return id;
        },

        /**
        * Clears the specified accelerometer watch.
        *
        * @param {String} id       The id of the watch returned from #watchAcceleration.
        */
        clearWatch: function(id) {
            // Stop javascript timer & remove from timer list
            if (id && timers[id]) {
                window.clearInterval(timers[id].timer);
                removeListeners(timers[id].listeners);
                delete timers[id];
            }
        }
    };

    window.plus.accelerometer = navigator.plus.accelerometer = accelerometer;
})(window);