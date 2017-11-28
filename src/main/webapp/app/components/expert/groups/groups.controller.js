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
        vm.activeTask = TaskFinderService.findFirstTask(tasks);
        vm.activeGroup;

        init();

        function init() {
            angular.forEach(tasks, function(task) {
                task.groups = [];
                task.groups.push(createGroup());
            });
            setActive(vm.activeTask.groups[0]);
        }

        function addGroup() {
            var newGroup = createGroup();
            vm.activeTask.groups.push(newGroup);
        }

        function createGroup() {
            var groupId = Math.round((Math.random() * 1000000) * 10);
            var newGroup = new Group(groupId, false);
            newGroup.objects.push(plane);
            return newGroup;
        }

        function setActive(group) {
            angular.forEach(vm.activeTask.groups, function(value, key) {
                value.active = false;
            });
            group.active = true;
            vm.activeGroup = group;
            $rootScope.$broadcast('active-group-changed', group);
        }

        vm.addGroup = addGroup;

        vm.setActive = setActive;

        vm.setVisible = function(group) {
            group.visible = !group.visible;
            animate();
        }
        vm.setVisibleForUser = function(group) {
            group.visibleForUser = !group.visibleForUser;
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
            if (vm.activeTask.groups.length == 0) {
                vm.addGroup();
                vm.activeTask.groups[0].visible = true;
                vm.setActive(vm.activeTask.groups[0]);
            }
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