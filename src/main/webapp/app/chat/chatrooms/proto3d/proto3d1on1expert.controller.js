(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('Proto3D1on1ExpertController', Proto3D1on1ExpertController);

    Proto3D1on1ExpertController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'JhiTrackerService', 'SdpService', 'OrientationCalculator', 'ThreejsSceneService'];

    function Proto3D1on1ExpertController($rootScope, $scope, $state, $stateParams, JhiTrackerService, SdpService, OrientationCalculator, ThreejsSceneService) {
        var vm = this;
        vm.expertCam = ThreejsSceneService.getExpertCamera();
        vm.userCam = ThreejsSceneService.getUserCamera();

        function sendMessage(message) {
            JhiTrackerService.sendSimpleMessageToJsonUser($stateParams.partnerId, message);
        }

        JhiTrackerService.receiveInvite().then(null, null, function(received) {
            handleContent(received);
        });
        $scope.$on('send-message', function(event, message) {
            sendMessage(message);
        });

        function handleContent(message) {
            if (message.goal == '3d') {
                if (message.content == 'camera') {
                    setCamera(message.orientation);
                }
            } else {
                notifyRtc(message);
            }
        }

        function setCamera(deviceEvent) {
            $rootScope.$broadcast('set-camera-and-resize', {
                deviceEvent: deviceEvent,
                size: null
            })
        }

        function notifyRtc(message) {
            $rootScope.$broadcast('rtc-message', message)
        }
    }
})();