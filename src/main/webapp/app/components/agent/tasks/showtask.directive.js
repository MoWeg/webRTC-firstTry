(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('showtask', showTask);

    function showTask() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/agent/tasks/showtask.html',
            scope: {
                scenarioid: '=',
                isagent: '='
            },
            controllerAs: 'vm',
            controller: 'ShowTaskController'
        };

        return directive;
    }

})();