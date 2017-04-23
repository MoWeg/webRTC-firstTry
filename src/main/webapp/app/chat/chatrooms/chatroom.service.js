(function() {
    'use strict';
    /* globals SockJS, Stomp */

    angular
        .module('simpleWebrtcServerApp')
        .factory('ChatRoomService', ChatRoomService);

    ChatRoomService.$inject = [ 'AvailibilityService', '$stateParams', '$rootScope'];

    function ChatRoomService ( AvailibilityService, $stateParams, $rootScope) {
      var service = {
        getAllAvailable: getAllAvailable,
        addUser: addUser,
        removeUser: removeUser
      };
      return service;

      function getAllAvailable(){
         AvailibilityService.get({login : $stateParams.login}, onSuccess, onError);
         function onSuccess(data, headers) {
              console.log("got availability from Server");
              return data;
         }
         function onError(error) {
             AlertService.error(error.data.message);
         }
      }

      function addUser() {
        updateAvailability(true);
      }
      function removeUser() {
        updateAvailability(false);
      }

      function updateAvailability(availability){
        AvailibilityService.post({login : $stateParams.login}, {userName: $rootScope.myName, chatId: $rootScope.myIdForChat, isAvailability: availability });
      }
    }
})();
