(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('ShowTaskController', ShowTaskController);

    ShowTaskController.$inject = ['$scope', '$rootScope', 'TaskFinderService'];

    function ShowTaskController($scope, $rootScope, TaskFinderService) {
        var vm = this;
        var tasks;
        vm.activeTask;
        vm.showText = false;
        vm.changeShowText = changeShowText;
        vm.disabled = !$scope.isagent;

        $scope.$on('active-task-changed', function(event, args) {
            vm.activeTask = args;
        });
        $scope.$on('show-task-text', function(event, args) {
            vm.showText = !vm.showText;
        });

        TaskFinderService.initTasksForScenarioId($scope.scenarioid).$promise.then(function(result) {
            tasks = result;
            vm.activeTask = TaskFinderService.findFirstTask(tasks);
        });

        function changeShowText() {
            vm.showText = !vm.showText;
            if (!vm.disabled) {
                var message = {
                    goal: 'task',
                    content: 'click'
                }
                sendMessage(message);
            }
        }

        function sendMessage(message) {
            $rootScope.$broadcast('send-message', message);
        }
    }
})();