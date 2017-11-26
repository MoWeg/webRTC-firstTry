(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('HomeAgentOrExpertController', HomeAgentOrExpertController);

    HomeAgentOrExpertController.$inject = ['$state', '$scope', '$stateParams', 'HomeService', 'AlertService', 'JhiTrackerService', 'ChatRoomService', 'AvailibilityService', 'PaginationUtil', 'paginationConstants'];

    function HomeAgentOrExpertController($state, $scope, $stateParams, HomeService, AlertService, JhiTrackerService, ChatRoomService, AvailibilityService, PaginationUtil, paginationConstants) {
        var vm = this;
        var constants = {
            page: {
                value: '1',
                squash: true
            },
            sort: {
                value: 'id,asc',
                squash: true
            },
            search: null
        };

        var isExpert = $stateParams.expert
        var predicate = PaginationUtil.parsePredicate(constants.sort.value);
        var reverse = PaginationUtil.parseAscending(constants.sort.value);
        vm.itemsPerPage = paginationConstants.itemsPerPage;
        vm.page = PaginationUtil.parsePage(constants.page.value);
        vm.id = $stateParams.id;
        vm.receivedUsers;
        vm.transition = transition;
        vm.loadPage = loadPage;
        vm.hasAvailable = hasAvailableExperts;
        vm.callExpert = callExpert;
        var hasExperts = false;
        var hasAgents = false;

        $scope.$on('$destroy', function() {
            JhiTrackerService.unsubscribeToAvailable();
        });
        JhiTrackerService.receiveAvailable().then(null, null, function(received) {
            getUsers();
        });
        JhiTrackerService.receiveInvite().then(null, null, function(invite) {
            if (invite.goal === 'expert') {
                goToCall(invite.content, false);
            }
        });

        function init() {
            JhiTrackerService.subscribeToAvailable();
            JhiTrackerService.subscribeToSelf(vm.id);
            ChatRoomService.setUserAvailable(vm.id);
            var params = getParams(isExpert);
            HomeService.getAllScenariosFor(params, onScenarioQuerySucccess, onError);
            getUsers();
        }

        function getParams(isExpert) {
            var params;
            if (isExpert) {
                params = {
                    expertId: vm.id
                };
            } else {
                params = {
                    agentId: vm.id
                };
            }
            return params;
        }

        function onScenarioQuerySucccess(data, headers) {
            vm.totalItems = headers('X-Total-Count');
            vm.queryCount = vm.totalItems;
            vm.scenarios = data;
        }

        function onError(error) {
            AlertService.error(error.data.message);
        }

        function getUsers() {
            AvailibilityService.get({}, onGetUserSuccess, onError);
        }

        function onGetUserSuccess(data, headers) {
            vm.receivedUsers = data;

            angular.forEach(vm.scenarios, function(scenario) {
                var filter = new FilterByIds(scenario.experts);
                scenario.availableExperts = vm.receivedUsers.filter(filter.execute);

                var filter = new FilterByIds(scenario.agents);
                scenario.availableAgents = vm.receivedUsers.filter(filter.execute);

                if (!scenario.availableAgents) {
                    scenario.availableAgents = [];
                }
            });
            makePositiveAlert(vm.scenarios);
        }

        function FilterByIds(expertsOrAgents) {
            var expertsOrAgentsIds = [];
            angular.forEach(expertsOrAgents, function(user) {
                expertsOrAgentsIds.push(user.id);
            });
            this.execute = function(element) {
                return expertsOrAgentsIds.find(id => id == element.chatId);
            };
        }

        function makePositiveAlert(scenarios) {
            if (isExpert && !hasAgents) {
                if (scenarios.some(hasAvailableAgents)) {
                    hasAgents = true;
                    AlertService.success("Agents Online");
                }
            }
            if (!isExpert && !hasExperts) {
                if (scenarios.some(hasAvailableExperts)) {
                    hasExperts = true;
                    AlertService.success("Experts Online");
                }
            }
        }


        function loadPage(page) {
            vm.page = page;
            vm.transition();
        }

        function transition() {
            $state.transitionTo($state.$current, {
                page: vm.page,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc'),
                search: vm.currentSearch
            });
        }

        function isAvailable(expert) {
            return expert.available;
        }

        function hasAvailableExperts(scenario) {
            if (scenario.availableExperts) {
                return scenario.availableExperts.some(isAvailable);
            }
        }

        function hasAvailableAgents(scenario) {
            if (scenario.availableAgents) {
                return scenario.availableAgents.some(isAvailable);
            }
        }

        function callExpert(availableExperts) {
            var expert = availableExperts.find(isAvailable);
            JhiTrackerService.sendSimpleMessageToUserWithGoal(expert.chatId, 'expert', vm.id);
            goToCall(expert.chatId, true)
        }

        function goToCall(partnerId, isInitiator) {
            ChatRoomService.setUserUnavailable(vm.id);
            $state.go('proto3dallIn1', {
                id: vm.id,
                partnerId: partnerId,
                isInitiator: isInitiator
            });
        }
        init();
    }
})();