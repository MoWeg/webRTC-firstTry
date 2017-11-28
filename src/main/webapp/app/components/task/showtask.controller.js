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
        vm.changeShowText = changeShowText;

        $scope.$on('active-task-changed', function(event, args) {
            vm.activeTask = args;
        });

        function init() {
            vm.activeTask = TaskFinderService.findFirstTask(tasks);
        }

        function changeShowText() {
            vm.showText = !vm.showText;
        }
        init();
    }
})();