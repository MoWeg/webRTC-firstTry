(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('ChooseRoomController', ChooseRoomController);

    ChooseRoomController.$inject = ['$state', '$rootScope', '$cookies', '$http', 'JhiTrackerService', 'ChatRoomService', 'AvailibilityService'];

    function ChooseRoomController($state, $rootScope, $cookies, $http, JhiTrackerService, ChatRoomService, AvailibilityService) {
        var vm = this;

        vm.receivedUsers = [];
        vm.chatWith = chatWith;
        vm.videochatWith = videochatWith;
        vm.drawWith = drawWith;
        vm.callExpert = callExpert;
        vm.id = Math.round((Math.random() * 1000000) * 10);
        vm.partnerId;


        JhiTrackerService.subscribeToSelf(vm.id);

        ChatRoomService.setUserAvailable(vm.id);
        getUsers();

        JhiTrackerService.receiveAvailable().then(null, null, function(received) {
            getUsers();
        });

        function getUsers() {
            AvailibilityService.get({}, onGetSuccess, onGetError);

            function onGetSuccess(data, headers) {
                console.log("got availability from Server");
                angular.forEach(data, function(user, i) {
                    if (user.chatId != vm.id) {
                        // console.log("userid: " + user.chatId + " is not equal to " + $rootScope.myIdForChat)
                        angular.forEach(vm.receivedUsers, function(alreadyReceivedUser, i) {
                            if (user.userName == alreadyReceivedUser.userName) {
                                vm.receivedUsers.splice(i, 1);
                            }
                        });
                        vm.receivedUsers.push(user);
                        if (vm.receivedUsers.length >= data.length) {
                            angular.forEach(vm.receivedUsers, function(alreadyReceivedUser, i) {
                                var foundInData = false;
                                angular.forEach(data, function(user, index) {
                                    if (user.userName == alreadyReceivedUser.userName) {
                                        foundInData = true;
                                    }
                                });
                                if (!foundInData) {
                                    vm.receivedUsers.splice(i, 1);
                                }
                            });
                        }
                    }
                });
            }

            function onGetError(error) {
                AlertService.error(error.data.message);
            }
        }

        function receiveUser(receivedUser) {
            if (receivedUser.content !== id) {
                vm.receivedUsers.push(receivedUser);
            }
        }

        function chatWith(index) {
            JhiTrackerService.sendSimpleMessageToUserWithGoal(vm.receivedUsers[index].chatId, 'chat', vm.id);
            $rootScope.partnerIdForChat = vm.receivedUsers[index].chatId;
            ChatRoomService.setUserUnavailable();
            $rootScope.myIdForChat = id;
            $state.go('simplechatroom');
            //$state.go('simple1on1');
        }

        function drawWith(index) {
            JhiTrackerService.sendSimpleMessageToUserWithGoal(vm.receivedUsers[index].chatId, 'draw', vm.id);
            $rootScope.partnerIdForChat = vm.receivedUsers[index].chatId;
            ChatRoomService.setUserUnavailable();
            $rootScope.myIdForChat = id;
            $state.go('simpledraw');
            //$state.go('simple1on1');
        }

        function videochatWith(index) {
            console.log('Client pressed videochatWith');
            JhiTrackerService.sendSimpleMessageToUserWithGoal(vm.receivedUsers[index].chatId, 'video', vm.id);
            $rootScope.partnerIdForChat = vm.receivedUsers[index].chatId;
            $rootScope.isInitiator = true;
            ChatRoomService.setUserUnavailable();
            $rootScope.myIdForChat = id;
            $state.go('simple1on1');
        }

        function callExpert(index) {
            console.log('Client pressed videochatWith');
            JhiTrackerService.sendSimpleMessageToUserWithGoal(vm.receivedUsers[index].chatId, 'expert', vm.id);
            vm.partnerId = vm.receivedUsers[index].chatId;
            $rootScope.isInitiator = true;
            ChatRoomService.setUserUnavailable();
            // $state.go('proto3d1on1',{id:vm.id, partnerId:vm.partnerId});
            $state.go('proto3dallIn1', {
                id: vm.id,
                partnerId: vm.partnerId,
                isInitiator: true
            });
        }

        JhiTrackerService.receiveInvite().then(null, null, function(invite) {
            console.log("receive Invite");
            ChatRoomService.setUserUnavailable(vm.id);
            if (invite.goal === 'video') {
                $rootScope.partnerIdForChat = invite.content;
                $rootScope.isInitiator = false;
                $state.go('simple1on1');
            }
            if (invite.goal === 'chat') {
                $rootScope.partnerIdForChat = invite.content;
                $state.go('simplechatroom');
            }
            if (invite.goal === 'draw') {
                $rootScope.partnerIdForChat = invite.content;
                $state.go('simpledraw');
            }
            if (invite.goal === 'expert') {
                vm.partnerId = invite.content;
                //$state.go('proto1on1expert');
                // $state.go('proto3d1on1expert', {
                //     id: vm.id,
                //     partnerId: vm.partnerId
                // });
                $state.go('proto3dallIn1', {
                    id: vm.id,
                    partnerId: vm.partnerId,
                    isInitiator: false
                });
            }
        });
    }
})();