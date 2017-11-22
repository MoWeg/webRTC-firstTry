(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('expertcontrols', expertcontrols);

    function expertcontrols () {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/expertControls/expertcontrols.html',
            scope: {
              expertcam: '='
            },
            controllerAs: 'vm',
            controller: 'ExpertControlsController'
        };

        return directive;
    }

})();
