(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('playground', playground);

    function playground () {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/threejs/display3d/playground/playground.html',
            scope: {
              reqclass: '@',
              primarycam: '=',
              secondarycam: '='
            },
            controllerAs: 'vm',
            controller: 'PlaygroundController'
        };

        return directive;
    }

})();
