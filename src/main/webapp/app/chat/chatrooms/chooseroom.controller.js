(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('ChooseRoomController', ChooseRoomController);

    ChooseRoomController.$inject = ['$state','$rootScope', '$cookies', '$http','JhiTrackerService', 'ChatRoomService','AvailibilityService'];

    function ChooseRoomController($state, $rootScope, $cookies, $http, JhiTrackerService, ChatRoomService, AvailibilityService) {
      var vm = this;

      vm.receivedUsers = [];
      vm.chatWith = chatWith;
      vm.videochatWith = videochatWith;
      vm.drawWith = drawWith;
      vm.callExpert = callExpert;

      if($rootScope.myIdForChat === null || angular.isUndefined($rootScope.myIdForChat)){
        $rootScope.myIdForChat = Math.round((Math.random() * 1000000) * 10);
        JhiTrackerService.subscriberToSelf();
      }
      ChatRoomService.setUserAvailable();
      getUsers();

      JhiTrackerService.receiveAvailable().then(null, null, function(received) {
      //    receiveUser(received);
          getUsers();
      });

      function getUsers(){
        AvailibilityService.get({}, onGetSuccess, onGetError);
        function onGetSuccess(data, headers) {
             console.log("got availability from Server");
             angular.forEach(data, function(user, i){
               if(user.chatId !=  $rootScope.myIdForChat){
                 console.log("userid: " + user.chatId + " is not equal to " + $rootScope.myIdForChat)
                 angular.forEach(vm.receivedUsers, function(alreadyReceivedUser, i){
                     if(user.userName == alreadyReceivedUser.userName){
                       vm.receivedUsers.splice(i, 1);
                     }
                  });
                  vm.receivedUsers.push(user);
                  if(vm.receivedUsers.length >= data.length){
                    angular.forEach(vm.receivedUsers, function(alreadyReceivedUser, i){
                        foundInData = false;
                        angular.forEach(data, function(user, index){
                          if(user.userName == alreadyReceivedUser.userName){
                            foundInData = true;
                          }
                        });
                        if(!foundInData){
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

      function receiveUser(receivedUser){
        if(receivedUser.content !== $rootScope.myIdForChat){
          vm.receivedUsers.push(receivedUser);
        }
      }

      function chatWith(index) {
        JhiTrackerService.sendSimpleMessageToUserWithGoal(vm.receivedUsers[index].chatId, 'chat', $rootScope.myIdForChat);
        $rootScope.partnerIdForChat = vm.receivedUsers[index].chatId;
        ChatRoomService.setUserUnavailable();
        $state.go('simplechatroom');
        //$state.go('simple1on1');
      }

      function drawWith(index) {
        JhiTrackerService.sendSimpleMessageToUserWithGoal(vm.receivedUsers[index].chatId, 'draw', $rootScope.myIdForChat);
        $rootScope.partnerIdForChat = vm.receivedUsers[index].chatId;
        ChatRoomService.setUserUnavailable();
        $state.go('simpledraw');
        //$state.go('simple1on1');
      }

      function videochatWith(index) {
        console.log('Client pressed videochatWith');
        JhiTrackerService.sendSimpleMessageToUserWithGoal(vm.receivedUsers[index].chatId, 'video', $rootScope.myIdForChat);
        $rootScope.partnerIdForChat = vm.receivedUsers[index].chatId;
        $rootScope.isInitiator = true;
        ChatRoomService.setUserUnavailable();
        $state.go('simple1on1');
      }

      function callExpert(index) {
        console.log('Client pressed videochatWith');
        JhiTrackerService.sendSimpleMessageToUserWithGoal(vm.receivedUsers[index].chatId, 'expert', $rootScope.myIdForChat);
        $rootScope.partnerIdForChat = vm.receivedUsers[index].chatId;
        $rootScope.isInitiator = true;
        ChatRoomService.setUserUnavailable();
        //$state.go('proto1on1');
        $state.go('proto3d1on1');
      }

      JhiTrackerService.receiveInvite().then(null, null, function(invite){
        ChatRoomService.setUserUnavailable();
        if(invite.goal === 'video'){
          $rootScope.partnerIdForChat = invite.content;
          $rootScope.isInitiator = false;
          $state.go('simple1on1');
        }
        if(invite.goal === 'chat'){
          $rootScope.partnerIdForChat = invite.content;
          $state.go('simplechatroom');
        }
        if(invite.goal === 'draw'){
          $rootScope.partnerIdForChat = invite.content;
          $state.go('simpledraw');
        }
        if(invite.goal === 'expert'){
          $rootScope.partnerIdForChat = invite.content;
          //$state.go('proto1on1expert');
          $state.go('proto3d1on1expert');
        }
      });
    }
})();
