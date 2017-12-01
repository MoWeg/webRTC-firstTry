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
            initTasksForScenarioId: initTasksForScenarioId,
            hasNextTask: hasNextTask,
            hasPreviousTask: hasPreviousTask,
            findById: findById
        };
        return service;

        function findById(taskId, tasks) {
            return tasks.find(function(element) {
                return taskId == element.id;
            });
        }

        function getNextTask(task, tasks) {
            return tasks.find(function(element) {
                return task.nextTaskId == element.id;
            });
        }

        function getPreviousTask(task, tasks) {
            return tasks.find(function(element) {
                return task.id == element.nextTaskId;
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

        function hasNextTask(task, tasks) {
            if (!task || !tasks) {
                return false;
            }
            if (!task.nextTaskId) {
                return false;
            }
            if (tasks.lenth == 1 || tasks.length == 0) {
                return false;
            }
            return tasks.some(function(element) {
                return task.nextTaskId == element.id;
            });
        }

        function hasPreviousTask(task, tasks) {
            if (!task || !tasks) {
                return false;
            }
            if (tasks.lenth == 1 || tasks.length == 0) {
                return false;
            }
            return tasks.some(function(element) {
                return task.id == element.nextTaskId;
            });
        }
    }
})();