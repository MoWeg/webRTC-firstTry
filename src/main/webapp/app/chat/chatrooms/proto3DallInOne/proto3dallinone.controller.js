(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('Proto3dallInOnetController', Proto3dallInOnetController);

    Proto3dallInOnetController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'JhiTrackerService', 'SdpService', 'OrientationCalculator', 'ThreejsSceneService', 'AnnotationToolService'];

    function Proto3dallInOnetController($rootScope, $scope, $state, $stateParams, JhiTrackerService, SdpService, OrientationCalculator, ThreejsSceneService, AnnotationToolService) {
        var vm = this;
        vm.expertCam;
        vm.userCam;
        vm.isinitiator = $stateParams.isInitiator;
        var tools;
        var lastGroup;

        function init() {
            if (vm.isinitiator) {
                window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);

                var toolRequest = [];
                toolRequest.push({
                    name: 'insert box',
                    type: 'box',
                    spriteLocation: null
                });
                toolRequest.push({
                    name: 'insert arrow',
                    type: 'arrow',
                    spriteLocation: null
                });
                toolRequest.push({
                    name: 'insert jHipster',
                    type: 'sprite',
                    spriteLocation: 'content/images/logo-jhipster.png'
                });
                tools = AnnotationToolService.getAnnotationTools(toolRequest);
            } else {
                vm.expertCam = ThreejsSceneService.getExpertCamera();
            }
            vm.userCam = ThreejsSceneService.getUserCamera();
        }

        function sendMessage(message) {
            JhiTrackerService.sendSimpleMessageToJsonUser($stateParams.partnerId, message);
        }

        JhiTrackerService.receiveInvite().then(null, null, function(received) {
            handleContent(received);
        });
        $scope.$on('send-message', function(event, message) {
            sendMessage(message);
        });
        $scope.$on('$destroy', function() {
            $rootScope.$broadcast('rtc-hangup');
        });
        $scope.$on('rtc-hung-up', function() {
            $state.go('chooseroom');
        });

        function handleContent(message) {
            if (message.goal == '3d') {
                if (message.content == 'camera') {
                    setCamera(message.orientation);
                } else {
                    handleMessageWith3dGoal(message);
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

        function notifyRtc(message) {
            $rootScope.$broadcast('rtc-message', message)
        }

        function init3D() {
            window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);

            var toolRequest = [];
            toolRequest.push({
                name: 'insert box',
                type: 'box',
                spriteLocation: null
            });
            toolRequest.push({
                name: 'insert arrow',
                type: 'arrow',
                spriteLocation: null
            });
            toolRequest.push({
                name: 'insert jHipster',
                type: 'sprite',
                spriteLocation: 'content/images/logo-jhipster.png'
            });
            tools = AnnotationToolService.getAnnotationTools(toolRequest);
        }

        //handle orientation and resize
        function onDeviceOrientationChangeEvent(deviceEvent) {
            sendOrientation(createDeviceOrientationDto(deviceEvent));
            setCamera(deviceEvent);
        }

        function createDeviceOrientationDto(event) {
            return {
                'alpha': event.alpha,
                'beta': event.beta,
                'gamma': event.gamma
            };
        }

        function sendOrientation(newOrientation) {
            var message = {
                goal: '3d',
                content: 'camera',
                orientation: newOrientation
            };
            sendMessage(message);
        }
        /// handle 3D messages
        function handleMessageWith3dGoal(message) {
            var foundGroup

            if (lastGroup) {
                if (lastGroup.id == message.group.id) {
                    foundGroup = lastGroup;
                }
            }

            if (!foundGroup) {
                angular.forEach(groups, function(group) {
                    if (group.id == message.group.id) {
                        foundGroup = group;
                    }
                });
            }
            if (foundGroup) {
                switch (message.content) {
                    case 'visiblity':
                        foundGroup.visibleForUser = message.group.visibleForUser;
                        break;
                    case 'discard':
                        discardGroup(foundGroup);
                        break;
                    default:
                        insertWithTool([message.voxel, message.endPoint], scene, lastGroup, message.content, message.type);
                }
                lastGroup = foundGroup;
                animate();
            } else {
                var group = new Group(message.group);
                groups.push(group);
                lastGroup = group;
                if (message.content != 'insert') {
                    handleMessageWith3dGoal(message);
                }
            }
        }

        function insertWithTool(voxelDtos, scene, group, type, location) {
            angular.forEach(tools, function(tool) {
                if (tool.type == type && tool.location == location) {
                    tool.actionManager.handleInsert(voxelDtos, scene, group);
                }
            });
        }

        function discardGroup(group) {
            ThreejsSceneService.removeGroupFromScene(group);
            var index = groups.indexOf(group);
            groups.splice(index, 1);
        }

        function Group(groupDto) {
            this.id = groupDto.id;
            this.visibleForUser = groupDto.visibleForUser;
            this.objects = [];
            this.sprites = [];
        }
        init();
    }
})();