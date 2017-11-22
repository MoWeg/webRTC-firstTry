(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('display3dplayground', playground);

    function playground () {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/threejs/display3d/display3d.html',
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
