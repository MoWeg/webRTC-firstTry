(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('rtcvideo', rtcvideo);

    function rtcvideo() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/rtc/video/rtcvideo.html',
            scope: {
                isinitiator: '='
            },
            controllerAs: 'vm',
            controller: 'RtcVideoController'
        };

        return directive;
    }

})();