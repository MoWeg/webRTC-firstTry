(function() {
    'use strict';
    /* globals SockJS, Stomp */

    angular
        .module('simpleWebrtcServerApp')
        .factory('TaskFinderService', TaskFinderService);

    TaskFinderService.$inject = ['Task'];

    function TaskFinderService(Task) {

        var service = {
            getNextTask: getNextTask,
            getPreviousTask: getPreviousTask,
            findFirstTask: findFirstTask,
            initTasksForScenarioId: initTasksForScenarioId
        };
        return service;

        function getNextTask(task, tasks) {
            return tasks.find(function(element) {
                return task.nextTaskId == element.id;
            });
        }

        function getPreviousTask(task, tasks) {
            return tasks.find(function(element) {
                return element.nextTaskId == task.id;
            });
        }

        function findFirstTask(tasks) {
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
            return recursiveFindFirst(lastTask, tasks);
        }

        function recursiveFindFirst(task, tasks) {
            var previousTask = getPreviousTask(task, tasks);
            if (previousTask) {
                return recursiveFindFirst(previousTask, tasks);
            } else {
                return task;
            }
        }

        function initTasksForScenarioId(scenarioId) {
            var tasks = Task.query({
                scenarioId: scenarioId
            });
            return tasks;
        }
    }
})();