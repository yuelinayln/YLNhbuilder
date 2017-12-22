;
window.plus.orientation = navigator.plus.orientation = (function(window){
    var bridge = window.plus.bridge;
    var tools = window.plus.tools;

    // Is the accel sensor running?
    var running = false;

    // Keeps reference to watchAcceleration calls.
    var timers = {};

    // Array of listeners; used to keep track of when we should call start and stop.
    var listeners = [];

    // Last returned orientation object from event
    var accel = null;

    var Rotation = function(x, y, z) {
        this.alpha = x;
        this.beta = y;
        this.gamma = z;
    };

    function DeviceOrientationHandle(event){
        var tempListeners = listeners.slice(0);
        accel = new Rotation(event.alpha, event.beta, event.gamma);
        for (var i = 0, l = tempListeners.length; i < l; i++) {
            tempListeners[i].win(accel);
        }
    }

    function start() {
        window.addEventListener("deviceorientation", DeviceOrientationHandle, false);
        running = true;
    }

    function stop() {
        window.removeEventListener("deviceorientation", DeviceOrientationHandle, false);
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

    var orientation = {
        /**
         * Asynchronously acquires the current orientation.
         *
         * @param {Function} successCallback    The function to call when the orientation data is available
         * @param {Function} errorCallback      The function to call when there is an error getting the orientation data. (OPTIONAL)
         * @param {OrientationOptions} options The options for getting the orientation data such as timeout. (OPTIONAL)
         */
        getCurrentOrientation: function(successCallback, errorCallback, options) {
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
                start();
            }
        },

        /**
        * Asynchronously acquires the orientation repeatedly at a given interval.
        *
         * @param {Function} successCallback    The function to call each time the orientation data is available
         * @param {Function} errorCallback      The function to call when there is an error getting the orientation data. (OPTIONAL)
         * @param {OrientationOptions} options The options for getting the orientation data such as timeout. (OPTIONAL)
         * @return String                       The watch id that must be passed to #clearWatch to stop watching.
         */
        watchOrientation: function(successCallback, errorCallback, options) {
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
                start();
            }

            return id;
        },

        /**
        * Clears the specified orientation watch.
        *
        * @param {String} id       The id of the watch returned from #watchOrientation.
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

    return orientation;
})(window);