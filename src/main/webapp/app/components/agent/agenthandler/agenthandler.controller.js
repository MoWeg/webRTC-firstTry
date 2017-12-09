(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('AgentHandlerController', AgentHandlerController);

    AgentHandlerController.$inject = ['$rootScope', '$scope', 'OrientationCalculator', 'ThreejsSceneService', 'AnnotationToolService'];

    function AgentHandlerController($rootScope, $scope, OrientationCalculator, ThreejsSceneService, AnnotationToolService) {
        var vm = this;
        var tools;
        var lastGroup;
        var groups = [];
        var scene;

        $scope.$on('$destroy', function() {
            window.removeEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);
            // window.removeEventListener('devicemotion', onDeviceMotionChangeEvent, false);
        });
        $scope.$on('new-3d-message', function(event, message) {
            handleMessageWith3dGoal(message);
        });

        init();

        function init() {
            window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);
            // window.addEventListener('devicemotion', onDeviceMotionChangeEvent, false);
            tools = AnnotationToolService.getAnnotationTools();
            scene = ThreejsSceneService.getScene();
        }

        function onDeviceMotionChangeEvent(event) {
            var acceleration = getAccelerationInfo(event);
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
            $rootScope.$broadcast('request-animation', vm.activeTask.groups);
        }

        function sendMessage(message) {
            $rootScope.$broadcast('send-message', message);
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
    }
})();