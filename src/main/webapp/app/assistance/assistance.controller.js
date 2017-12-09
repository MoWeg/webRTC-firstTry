(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('AssistanceController', AssistanceController);

    AssistanceController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'JhiTrackerService', 'AnnotationToolService'];

    function AssistanceController($rootScope, $scope, $state, $stateParams, JhiTrackerService, AnnotationToolService) {
        var vm = this;
        vm.isinitiator = $stateParams.isInitiator;

        function init() {
            vm.scenarioid = $stateParams.scenario.id;
            var toolRequest = createToolRequestFor($stateParams.scenario);
            AnnotationToolService.initAnnotationTools(toolRequest);
        }

        function createToolRequestFor(scenario) {
            var toolRequest = [];
            toolRequest.push({
                name: 'insert Marker',
                type: 'Box',
                spriteLocation: null
            });
            toolRequest.push({
                name: 'insert arrow',
                type: 'Arrow',
                spriteLocation: null
            });
            angular.forEach(scenario.annotationAsPictures, function(annotation) {
                toolRequest.push({
                    name: annotation.name,
                    type: annotation.toolName,
                    spriteLocation: 'content/images/annotations/' + annotation.folder + '/' + annotation.fileName
                });
            });
            return toolRequest;
        }

        function sendMessage(message) {
            JhiTrackerService.sendSimpleMessageToJsonUser($stateParams.partnerId, message);
        }

        JhiTrackerService.receiveInvite().then(null, null, function(received) {
            handleContent(received);
        });
        $scope.$on('send-message', function(event, message) {
            if (message.content == 'camera' && message.type == 'orientation') {
                setCamera(message.orientation);
            }
            sendMessage(message);
        });
        $scope.$on('$destroy', function() {
            $rootScope.$broadcast('rtc-hangup');
            $rootScope.$broadcast('reset-3d');
        });
        $scope.$on('rtc-hung-up', function() {
            $state.go('home');
        });

        function handleContent(message) {
            if (message.goal == '3d') {
                if (message.content == 'camera') {
                    if (message.type == 'orientation') {
                        setCamera(message.orientation);
                    } else if (message.type == 'position') {
                        setCameraPosition(message.acceleration)
                    }
                } else {
                    handleMessageWith3dGoal(message);
                }
            } else if (message.goal == 'task') {
                if (message.content == 'click') {
                    nofityTaskClick();
                } else {
                    notifyTaskChange(message);
                }
            } else {
                notifyRtc(message);
            }
        }

        function setCamera(deviceEvent) {
            $rootScope.$broadcast('set-camera-and-resize', {
                deviceEvent: deviceEvent,
                size: null
            });
            $rootScope.$broadcast('check-resize');
        }

        function setCameraPosition(acceleration) {
            $rootScope.$broadcast('update-camera-position', acceleration);
        }

        function notifyRtc(message) {
            $rootScope.$broadcast('rtc-message', message);
        }

        function notifyTaskChange(message) {
            var taskId = message.content;
            if (taskId) {
                $rootScope.$broadcast('active-task-changed', taskId);
            }
        }

        function nofityTaskClick() {
            $rootScope.$broadcast('show-task-text');
        }

        function handleMessageWith3dGoal(message) {
            $rootScope.$broadcast('new-3d-message', message);
        }
        init();
    }
})();