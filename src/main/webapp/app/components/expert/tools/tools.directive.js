(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('experttools', ExpertTools);

    function ExpertTools() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/expert/tools/tools.html',
            controllerAs: 'vm',
            controller: 'ExpertToolsController'
        };

        return directive;
    }

})();