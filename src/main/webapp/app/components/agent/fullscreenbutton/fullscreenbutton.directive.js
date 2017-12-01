(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('fullscreenbutton', FullscreenButton);

    function FullscreenButton() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/agent/fullscreenbutton/fullscreenbutton.html',
            controllerAs: 'vm',
            controller: 'FullscreenButtonController'
        };

        return directive;
    }

})();