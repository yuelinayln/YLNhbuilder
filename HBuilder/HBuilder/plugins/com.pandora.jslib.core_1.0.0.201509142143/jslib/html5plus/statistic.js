;
(function(window){
    var bridge = window.plus.bridge;
    var F = 'Statistic';
    var statistic = {
        eventTrig : function(id, label) {
            bridge.exec(F, 'eventTrig', [id, label]);
        },
        eventStart : function(id, label) {
            bridge.exec(F, 'eventStart', [id, label]);
        },
        eventEnd : function(id, label) {
            bridge.exec(F, 'eventEnd', [id, label]);
        },
        eventDuration : function(id, duration, label) {
            bridge.exec(F, 'eventDuration', [id, duration, label]);
        }
    };
    window.plus.statistic = navigator.plus.statistic = statistic;
})(window);        