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
        JhiTrackerService.sendSimpleMessageToUser(vm.receivedUsers[index].content, $rootScope.myIdForChat);
        $rootScope.partnerIdForChat = vm.receivedUsers[index].content;
        //$state.go('simplechatroom');
        $state.go('simple1on1');
      }

      JhiTrackerService.receiveInvite().then(null, null, function(invite){
        $rootScope.partnerIdForChat = invite.content;
        $state.go('simple1on1');
      });
    }
})();
