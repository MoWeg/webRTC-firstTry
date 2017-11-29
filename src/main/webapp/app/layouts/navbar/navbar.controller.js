(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('NavbarController', NavbarController);

    NavbarController.$inject = ['$state', '$scope', 'Auth', 'Principal', 'ProfileService', 'LoginService'];

    function NavbarController($state, $scope, Auth, Principal, ProfileService, LoginService) {
        var vm = this;

        vm.isNavbarCollapsed = true;
        vm.isAuthenticated = Principal.isAuthenticated;

        ProfileService.getProfileInfo().then(function(response) {
            vm.inProduction = response.inProduction;
            vm.swaggerEnabled = response.swaggerEnabled;
        });

        vm.login = login;
        vm.logout = logout;
        vm.toggleNavbar = toggleNavbar;
        vm.collapseNavbar = collapseNavbar;
        vm.$state = $state;
        vm.wantsNavBar = wantsNavBar;
        var showNav = true;

        $scope.$on('remove-navbar', function(event, args) {
            console.warn("remove navbar");
            showNav = false;
        });
        $scope.$on('show-navbar', function(event, args) {
            showNav = true;
        });

        function wantsNavBar() {
            return showNav;
        }

        function login() {
            collapseNavbar();
            LoginService.open();
        }

        function logout() {
            collapseNavbar();
            Auth.logout();
            $state.go('home');
        }

        function toggleNavbar() {
            vm.isNavbarCollapsed = !vm.isNavbarCollapsed;
        }

        function collapseNavbar() {
            vm.isNavbarCollapsed = true;
        }
    }
})();