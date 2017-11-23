(function() {
    'use strict';
    /* globals SockJS, Stomp */

    angular
        .module('simpleWebrtcServerApp')
        .factory('ChatRoomService', ChatRoomService);

    ChatRoomService.$inject = [ 'AvailibilityService', 'JhiTrackerService', '$stateParams', '$rootScope'];

    function ChatRoomService ( AvailibilityService, JhiTrackerService, $stateParams, $rootScope) {
      var service = {
        getAllAvailable: getAllAvailable,
        setUserAvailable: setUserAvailable,
        setUserUnavailable: setUserUnavailable,
        removeUser: removeUser
      };
      return service;

      // $stateParams.login
      function getAllAvailable(){
         var users = null;
         AvailibilityService.get({}, onGetSuccess, onGetError);
         function onGetSuccess(data, headers) {
              console.log("got availability from Server");
              users = data;
         }
         function onGetError(error) {
             AlertService.error(error.data.message);
         }
         console.log("users: "+users);
         return users;
      }

      function setUserAvailable(id) {
        updateAvailability(id, true);
      }
      function setUserUnavailable(id) {
        updateAvailability(id, false);
      }
      function removeUser(id) {
        AvailibilityService.delete({},{ chatId: id});
      }

      function updateAvailability(id, availability){
        AvailibilityService.post({}, {chatId: id, available: availability }, onPostSuccess, onPostError);
        function onPostSuccess(){
          console.log("Post was successful");
          JhiTrackerService.sendToAvailable();
        }
        function onPostError(errorResult){
          console.log("Error: "+errorResult);
        }
      }
    }
})();
