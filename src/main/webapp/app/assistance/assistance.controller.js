(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('AssistanceController', AssistanceController);

    AssistanceController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'JhiTrackerService', 'SdpService', 'OrientationCalculator', 'ThreejsSceneService', 'AnnotationToolService'];

    function AssistanceController($rootScope, $scope, $state, $stateParams, JhiTrackerService, SdpService, OrientationCalculator, ThreejsSceneService, AnnotationToolService) {
        var vm = this;
        vm.isinitiator = $stateParams.isInitiator;
        var tools;
        var lastGroup;
        var groups = [];
        var scene;

        function init() {
            vm.scenarioid = $stateParams.scenario.id;
            var toolRequest = createToolRequestFor($stateParams.scenario);
            AnnotationToolService.initAnnotationTools(toolRequest);
            if (vm.isinitiator) {
                window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);
                // window.addEventListener('devicemotion', onDeviceMotionChangeEvent, false);
                tools = AnnotationToolService.getAnnotationTools();
                scene = ThreejsSceneService.getScene();
            }
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
            sendMessage(message);
        });
        $scope.$on('$destroy', function() {
            $rootScope.$broadcast('rtc-hangup');
            $rootScope.$broadcast('reset-3d');
            if (vm.isinitiator) {
                window.removeEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);
                // window.removeEventListener('devicemotion', onDeviceMotionChangeEvent, false);
            }
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

        function onDeviceMotionChangeEvent(event) {
            var acceleration = getAccelerationInfo(event);
            setCameraPosition(acceleration);
            sendCameraPositionUpdate(acceleration);
        }

        function sendCameraPositionUpdate(accelerationEvent) {
            var message = {
                goal: '3d',
                content: 'camera',
                type: 'position',
                acceleration: accelerationEvent
            };
            sendMessage(message);
        }

        function getAccelerationInfo(deviceEvent) {
            return {
                'x': deviceEvent.acceleration.x,
                'y': deviceEvent.acceleration.y,
                'z': deviceEvent.acceleration.z,
                'interval': deviceEvent.interval
            }
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
                type: 'orientation',
                orientation: newOrientation
            };
            sendMessage(message);
        }
        /// handle 3D messages
        function handleMessageWith3dGoal(message) {
            var foundGroup;

            if (lastGroup) {
                if (lastGroup.id == message.group.id) {
                    foundGroup = lastGroup;
                }
            }
            if (!foundGroup) {
                foundGroup = groups.find(function(group) {
                    group.id == message.group.id;
                });
            }
            if (foundGroup) {
                if (message.content == 'visibility') {
                    foundGroup.visibleForUser = message.group.visibleForUser;
                } else if (message.content == 'discard') {
                    discardGroup(foundGroup);
                } else {
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
            var toolFilter = new ToolFilter(type, location);
            var tool = tools.find(toolFilter.execute);
            if (tool) {
                tool.actionManager.handleInsert(voxelDtos, scene, group);
            }
        }

        function ToolFilter(type, location) {
            var toolType = type;
            var toolSpriteLocation = location;

            this.execute = function(tool) {
                var result = tool.type == toolType;
                if (toolSpriteLocation) {
                    var hasSamelocation = tool.location == toolSpriteLocation;
                    result = result && hasSamelocation;
                }
                return result;
            }
        }

        function animate() {
            $rootScope.$broadcast('request-animation', groups);
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