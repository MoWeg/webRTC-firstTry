(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('ControlTaskController', ControlTaskController);

    ControlTaskController.$inject = ['$scope', '$rootScope', 'TaskFinderService'];

    function ControlTaskController($scope, $rootScope, TaskFinderService) {
        var vm = this;
        vm.tasks = $scope.tasks;
        vm.switchToNext = switchToNext;
        vm.switchToPrevious = switchToPrevious;
        vm.changeTask = changeTask;
        vm.isActive = isActive;

        function init() {
            vm.hasPrevious = false;
            vm.activeTask = TaskFinderService.findFirstTask(vm.tasks);
            vm.hasNext = TaskFinderService.hasNextTask(vm.activeTask, vm.tasks);
        }

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
            }
        }

        function notifyTaskChange() {
            $rootScope.$broadcast('active-task-changed', vm.activeTask);
        }
        init();
    }
})();