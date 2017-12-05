(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('controltask', ControlTask);

    function ControlTask() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/expert/task/controltask.html',
            scope: {
                scenarioid: '='
            },
            controllerAs: 'vm',
            controller: 'ControlTaskController'
        };

        return directive;
    }

})();