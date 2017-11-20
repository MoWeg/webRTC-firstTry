(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('expert3dtools', tools);

    function tools () {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/expertControls/expert3DTools/expert3DTools.html',
            scope: {
              activegroup: '=',
              scene: '=',
              raycaster: '=',
              rollovermesh: '=',
              gridhelper: '=',
              expertcamera: '='
            },
            controllerAs: 'vm',
            controller: 'Expert3DToolsController'
        };

        return directive;
    }

})();
