(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('expert3dgrouptable', groupTable);

    function groupTable () {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/expertControls/expert3DGroupTable/expert3DGroupTable.html',
            scope: {
              threejsgroups: '='
            },
            controllerAs: 'vm',
            controller: 'Expert3DGroupTableController'
        };

        return directive;
    }

})();
