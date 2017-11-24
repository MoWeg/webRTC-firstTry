(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('rtclocalvideo', rtclocalvideo);

    function rtclocalvideo() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/rtc/video/rtcvideo.html',
            scope: {
                ngif: '='
            },
            controllerAs: 'vm',
            controller: 'RtcLocalVideoController'
        };

        return directive;
    }

})();