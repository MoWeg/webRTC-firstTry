(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .directive('agenthandler', AgentHandler);

    function AgentHandler() {
        var directive = {
            restrict: 'E',
            controllerAs: 'vm',
            controller: 'AgentHandlerController'
        };

        return directive;
    }

})();