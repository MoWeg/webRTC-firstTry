(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('ExpertGroupsController', ExpertGroupsController);

    ExpertGroupsController.$inject = ['$scope', '$rootScope', 'ThreejsSceneService', 'TaskFinderService'];

    function ExpertGroupsController($scope, $rootScope, ThreejsSceneService, TaskFinderService) {
        var vm = this;
        var plane = ThreejsSceneService.getPlane();
        var tasks = $scope.tasks;

        $scope.$on('active-task-changed', function(event, args) {
            deactivateAllGroups(true);
            vm.activeTask = args;
            findEditableGroup();
            animate();
        });

        init();

        function init() {
            angular.forEach(tasks, function(task) {
                task.groups = [];
                task.groups.push(createGroup());
            });
            vm.activeTask = TaskFinderService.findFirstTask(tasks);
            vm.activeTask.groups[0].visible = true;
            setActive(vm.activeTask.groups[0]);
        }

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
            animate();
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
            if (vm.activeTask.groups.length == 0) {
                fillIfLast();
            }
            var notYetSendGroup = vm.activeTask.groups.find(function(element) {
                return !element.send;
            })
            if (!notYetSendGroup) {
                fillIfLast();
            } else {
                setActive(notYetSendGroup);
            }
        }

        function fillIfLast() {
            var group = createGroup();
            vm.activeTask.groups.push(group)
            setActive(group);
        }

        function setActive(group) {
            deactivateAllGroups(false);
            group.visible = true;
            group.active = true;
            $rootScope.$broadcast('active-group-changed', group);
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
            findEditableGroup();
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
            findEditableGroup();
            animate();
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

        function animate(groups) {
            if (!groups) {
                groups = vm.activeTask.groups;
            }
            $rootScope.$broadcast('request-animation', groups);
        }

        function sendMessage(message) {
            $rootScope.$broadcast('send-message', message);
        }
    }
})();