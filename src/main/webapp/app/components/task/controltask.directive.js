(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('controltask', ControlTask);

    function ControlTask() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/task/controltask.html',
            scope: {
                tasks: '='
            },
            controllerAs: 'vm',
            controller: 'ControlTaskController'
        };

        return directive;
    }

})();