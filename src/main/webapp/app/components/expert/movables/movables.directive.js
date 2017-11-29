(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('expertmovables', ExpertMovables);

    function ExpertMovables() {
        var directive = {
            restrict: 'E',
            scope: {
                expertcam: '='
            },
            templateUrl: 'app/components/expert/movables/movables.html',
            controllerAs: 'vm',
            controller: 'ExpertMovablesController'
        };

        return directive;
    }

})();