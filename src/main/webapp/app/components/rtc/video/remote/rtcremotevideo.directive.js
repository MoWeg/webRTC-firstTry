(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('rtcremotevideo', rtcremotevideo);

    function rtcremotevideo() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/rtc/video/rtcvideo.html',
            scope: {
                ngif: '='
            },
            controllerAs: 'vm',
            controller: 'RtcRemoteVideoController'
        };

        return directive;
    }

})();