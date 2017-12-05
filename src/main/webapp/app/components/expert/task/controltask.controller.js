(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('ControlTaskController', ControlTaskController);

    ControlTaskController.$inject = ['$scope', '$rootScope', 'TaskFinderService'];

    function ControlTaskController($scope, $rootScope, TaskFinderService) {
        var vm = this;
        vm.switchToNext = switchToNext;
        vm.switchToPrevious = switchToPrevious;
        vm.changeTask = changeTask;
        vm.isActive = isActive;

        TaskFinderService.initTasksForScenarioId($scope.scenarioid).$promise.then(function(result) {
            vm.tasks = result
            var firstTask = TaskFinderService.findFirstTask(vm.tasks);
            changeTask(firstTask);
        });

        function isActive(task) {
            if (task == vm.activeTask) {
                return "active";
            }
        }

        function switchToNext() {
            var task = TaskFinderService.getNextTask(vm.activeTask, vm.tasks);
            changeTask(task);
        }

        function switchToPrevious() {
            var task = TaskFinderService.getPreviousTask(vm.activeTask, vm.tasks);
            changeTask(task);
        }

        function changeTask(task) {
            if (task) {
                vm.hasPrevious = TaskFinderService.hasPreviousTask(vm.activeTask, vm.tasks);
                vm.activeTask = task;
                vm.hasNext = TaskFinderService.hasNextTask(vm.activeTask, vm.tasks);
                notifyTaskChange();
                var message = {
                    goal: 'task',
                    content: task.id
                }
                sendMessage(message);
            }
        }

        function notifyTaskChange() {
            $rootScope.$broadcast('active-task-changed', vm.activeTask);
        }

        function sendMessage(message) {
            $rootScope.$broadcast('send-message', message);
        }
    }
})();