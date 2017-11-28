(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('showtask', showTask);

    function showTask() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/task/showtask.html',
            scope: {
                tasks: '='
            },
            controllerAs: 'vm',
            controller: 'ShowTaskController'
        };

        return directive;
    }

})();