(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('ShowTaskController', ShowTaskController);

    ShowTaskController.$inject = ['$scope', 'TaskFinderService'];

    function ShowTaskController($scope, TaskFinderService) {
        var vm = this;
        var tasks = $scope.tasks;
        vm.activeTask;
        vm.showText = false;

        function init() {
            vm.activeTask = TaskFinderService.findFirstTask(tasks);
        }

        function changeShowText() {
            vm.showText = !vm.showText;
        }

        function setNextTaskActive() {
            vm.activeTask = TaskFinderService.getNextTask(vm.activeTask, tasks);
        }

        function setPreviousTaskActive(task) {
            vm.activeTask = TaskFinderService.getPreviousTask(vm.activeTask, tasks);
        }
        init();
    }
})();