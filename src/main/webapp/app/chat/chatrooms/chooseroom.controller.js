(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('ChooseRoomController', ChooseRoomController);

    ChooseRoomController.$inject = ['$state','$rootScope', '$cookies', '$http','JhiTrackerService'];

    function ChooseRoomController($state, $rootScope, $cookies, $http, JhiTrackerService) {
      var vm = this;

      vm.receivedUsers = [];
      vm.chatWith = chatWith;
      vm.videochatWith = videochatWith;

      //ChatRoomService.notifyEntry();

      JhiTrackerService.receiveAvailable().then(null, null, function(received) {
          receiveUser(received);
      });

      function receiveUser(receivedUser){
        if(receivedUser.content !== $rootScope.myIdForChat){
          vm.receivedUsers.push(receivedUser);
        }
      }

      function chatWith(index) {
        JhiTrackerService.sendSimpleMessageToUserWithGoal(vm.receivedUsers[index].content, 'chat', $rootScope.myIdForChat);
        $rootScope.partnerIdForChat = vm.receivedUsers[index].content;
        $state.go('simplechatroom');
        //$state.go('simple1on1');
      }
      function videochatWith(index) {
        console.log('Client pressed videochatWith');
        JhiTrackerService.sendSimpleMessageToUserWithGoal(vm.receivedUsers[index].content, 'video', $rootScope.myIdForChat);
        $rootScope.partnerIdForChat = vm.receivedUsers[index].content;
        $rootScope.isInitiator = true;
        $state.go('simple1on1');
      }

      JhiTrackerService.receiveInvite().then(null, null, function(invite){
        if(invite.goal === 'video'){
          $rootScope.partnerIdForChat = invite.content;
          $rootScope.isInitiator = false;
          $state.go('simple1on1');
        }
        if(invite.goal === 'chat'){
          $rootScope.partnerIdForChat = invite.content;
          $state.go('simplechatroom');
        }
      });
    }
})();
