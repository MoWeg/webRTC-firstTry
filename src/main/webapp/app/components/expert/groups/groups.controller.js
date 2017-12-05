(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('ExpertGroupsController', ExpertGroupsController);

    ExpertGroupsController.$inject = ['$scope', '$rootScope', 'ThreejsSceneService', 'TaskFinderService'];

    function ExpertGroupsController($scope, $rootScope, ThreejsSceneService, TaskFinderService) {
        var vm = this;
        var plane = ThreejsSceneService.getPlane();

        $scope.$on('active-task-changed', function(event, args) {
            if (vm.activeTask) {
                deactivateAllGroups(true);
                animate();
            }
            vm.activeTask = args;
            if (!vm.activeTask.groups) {
                vm.activeTask.groups = [];
            }
            var group = findEditableGroup();
            setActive(group);
        });


        function createGroup() {
            var groupId = Math.round((Math.random() * 1000000) * 10);
            var newGroup = new Group(groupId, false);
            newGroup.objects.push(plane);
            return newGroup;
        }

        function deactivateAllGroups(withVisibility) {
            angular.forEach(vm.activeTask.groups, function(value, key) {
                value.active = false;
                if (withVisibility) {
                    value.visible = false;
                    if (value.visibleForUser) {
                        value.visibleForUser = false;
                        changeVisibilityIfSend(value);
                    }
                }
            });
        }

        function changeVisibilityIfSend(group) {
            if (group.send) {
                var groupDto = {
                    id: group.id,
                    visibleForUser: group.visibleForUser
                };
                var initialMessage = {
                    goal: '3d',
                    content: 'visibility',
                    group: groupDto
                };
                sendMessage(initialMessage);
            }
        }

        function findEditableGroup() {
            var group;
            if (vm.activeTask.groups.length == 0) {
                group = fillIfLast();
            }
            var notYetSendGroup = vm.activeTask.groups.find(function(element) {
                return !element.send;
            })
            if (!notYetSendGroup) {
                group = fillIfLast();
            } else {
                group = notYetSendGroup;
            }
            return group;
        }

        function fillIfLast() {
            var group = createGroup();
            vm.activeTask.groups.push(group)
            return group
        }

        function setActive(group) {
            deactivateAllGroups(false);
            group.visible = true;
            group.active = true;
            $rootScope.$broadcast('active-group-changed', group);
            animate();
        }

        vm.setActive = setActive;

        vm.addGroup = function() {
            var newGroup = createGroup();
            vm.activeTask.groups.push(newGroup);
        };

        vm.setVisible = function(group) {
            group.visible = !group.visible;
            animate();
        }
        vm.setVisibleForUser = function(group) {
            group.visibleForUser = !group.visibleForUser;
            changeVisibilityIfSend(group);
            animate();
        }
        vm.send = function(group) {
            var groupDto = {
                id: group.id,
                visibleForUser: group.visibleForUser
            };
            var initialMessage = {
                goal: '3d',
                content: 'insert',
                group: groupDto
            };
            sendMessage(initialMessage);
            angular.forEach(group.messages, function(message) {
                sendMessage(message);
            });
            group.active = false;
            group.send = true;
            var newActive = findEditableGroup();
            setActive(newActive);
        }
        vm.discard = function(index, group) {
            if (group.send) {
                var groupDto = {
                    id: group.id,
                    visibleForUser: group.visibleForUser
                };
                var initialMessage = {
                    goal: '3d',
                    content: 'discard',
                    group: groupDto
                };
                sendMessage(initialMessage);
            }
            ThreejsSceneService.removeGroupFromScene(group);
            vm.activeTask.groups.splice(index, 1);
            var newActive = findEditableGroup();
            setActive(newActive);
        };

        function Group(groupId, active) {
            this.id = groupId
            this.active = active;
            this.visible = false;
            this.send = false;
            this.visibleForUser = false;
            this.objects = [];
            this.sprites = [];
            this.messages = [];
        }

        function animate() {
            $rootScope.$broadcast('request-animation', vm.activeTask.groups);
        }

        function sendMessage(message) {
            $rootScope.$broadcast('send-message', message);
        }
    }
})();