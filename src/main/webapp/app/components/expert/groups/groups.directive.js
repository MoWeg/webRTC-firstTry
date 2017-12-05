(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('expertgroups', Expertgroups);

    function Expertgroups() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/expert/groups/groups.html',
            controllerAs: 'vm',
            controller: 'ExpertGroupsController'
        };

        return directive;
    }

})();