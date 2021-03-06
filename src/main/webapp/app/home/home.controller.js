(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', 'Principal', 'LoginService', '$state', '$rootScope'];

    function HomeController($scope, Principal, LoginService, $state, $rootScope) {
        var vm = this;

        vm.account = null;
        vm.isAuthenticated = null;
        vm.login = LoginService.open;
        vm.register = register;
        $scope.$on('authenticationSuccess', function() {
            getAccount();
        });

        getAccount();

        function getAccount() {
            Principal.identity().then(function(account) {
                vm.account = account;
                vm.isAuthenticated = Principal.isAuthenticated;
                if (vm.isAuthenticated) {
                    if (vm.account.authorities.find(isExpert)) {
                        $state.go('home-expert', {
                            id: vm.account.id,
                            expert: true
                        });
                    } else if (vm.account.authorities.find(isAgent)) {
                        $state.go('home-agent', {
                            id: vm.account.id,
                            expert: false
                        });
                    }
                }
            });
        }

        function isExpert(authority) {
            return authority == 'ROLE_EXPERT';
        }

        function isAgent(authority) {
            return authority == 'ROLE_AGENT';
        }

        function register() {
            $state.go('register');
        }
    }
})();