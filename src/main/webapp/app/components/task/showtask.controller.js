(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('ShowTaskController', ShowTaskController);

    ShowTaskController.$inject = ['$scope'];

    function ShowTaskController($scope) {
        var vm = this;
        var tasks = $scope.tasks;
        vm.activeTask;
        vm.showText = false;
        vm.getNextTask = getNextTask;
        vm.changeShowText = changeShowText;

        function init() {
            vm.activeTask = findFirstTask();
        }

        function getNextTask() {
            vm.showText = false;
            return tasks.find(function(element) {
                return vm.activeTask.nextTaskId == element.id;
            })
        }

        function changeShowText() {
            vm.showText = !vm.showText;
        }

        function findFirstTask() {
            if (tasks.length == 1) {
                return tasks[0];
            }
            var lastTask = tasks.find(function(element) {
                if (element.nextTaskId) {
                    return false;
                } else {
                    return true;
                }
            });
            return recursiveFindFirst(lastTask);
        }

        function recursiveFindFirst(task) {
            var previousTask = getPreviousTask(task);
            if (previousTask) {
                return recursiveFindFirst(previousTask);
            } else {
                return task;
            }
        }

        function getPreviousTask(task) {
            var previousTask = tasks.find(function(element) {
                return element.nextTaskId == task.id;
            });
            return previousTask;
        }
        init();
    }
})();