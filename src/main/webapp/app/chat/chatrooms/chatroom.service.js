(function() {
    'use strict';
    /* globals SockJS, Stomp */

    angular
        .module('simpleWebrtcServerApp')
        .factory('ChatRoomService', ChatRoomService);

    ChatRoomService.$inject = [ '$window', '$cookies', '$http', '$q'];

    function ChatRoomService ( $window, $cookies, $http, $q) {
        var stompClient = null;
        var connected = $q.defer();
        var alreadyConnectedOnce = false;

        var subscriberToAvailable = null;
        var listenerToAvailable = $q.defer();

        var subscriberToSelf = null;
        var listenerToSelf = $q.defer();

        var subscriberToUser = null;
        var listenerToUser = $q.defer();

        var service = {
            connect: connect,
            disconnect: disconnect,
            sendSimpleMessageToUser: sendSimpleMessageToUser,

            subscribeToAvailable: subscribeToAvailable,
            receiveAvailable: receiveAvailable,
            notifyEntry: notifyEntry,

            subscribeToSelf: subscribeToSelf,
            receiveInvite: receiveInvite,

            subscribeToUser: subscribeToUser,
            reveiceFromUser: receiveFromUser,

            unsubscribe: unsubscribe
        };

        return service;

        function connect () {
            //stompClient = MySocketService.getStompClient;
            var loc = $window.location;
            var url = '//' + loc.host + loc.pathname + 'websocket/tracker';
            var socket = new SockJS(url);
            stompClient = Stomp.over(socket);
            var stateChangeStart;
            var headers = {};
            headers[$http.defaults.xsrfHeaderName] = $cookies.get($http.defaults.xsrfCookieName);
            stompClient.connect(headers, function() {
                connected.resolve('success');
            });
        }

        function disconnect () {
            if (stompClient !== null) {
                stompClient.disconnect();
                stompClient = null;
            }
        }

        function sendSimpleMessageToUser(message, user) {
            if (stompClient !== null && stompClient.connected) {
                stompClient
                    .send('/topic/rooms/'+user,
                    {},
                    angular.toJson({'content': message}));
            }
        }
        function notifyEntry(){
          if (stompClient !== null && stompClient.connected) {
              stompClient
                  .send('/topic/rooms',
                  {},
                  angular.toJson({'content': 'hallo'}));
          }
        }

        function subscribeToAvailable(){
          if (stompClient == null) {
              connect();
          }
          connected.promise.then(function() {
              subscriberToAvailable = stompClient.subscribe('/topic/rooms', function(data) {
                  listenerToAvailable.notify(angular.fromJson(data.body));
              });
          }, null, null);
        }

        function receiveAvailable(){
          return listenerToAvailable.promise;
        }

        function subscribeToSelf(user){
          if (stompClient == null) {
              connect();
          }
          connected.promise.then(function() {
              subscriberToSelf = stompClient.subscribe('/topic/rooms/'+user, function(data) {
                  listenerToSelf.notify(angular.fromJson(data.body));
              });
          }, null, null);
        }

        function receiveInvite(){
          return listenerToSelf.promise;
        }

        function subscribeToUser (user) {
            if (stompClient == null) {
                connect();
            }
            connected.promise.then(function() {
                subscriberToUser = stompClient.subscribe('/topic/rooms/'+user, function(data) {
                    listenerToUser.notify(angular.fromJson(data.body));
                });
            }, null, null);
        }

        function receiveFromUser(){
          return listenerToUser.promise;
        }

        function unsubscribe () {
            if (subscriberToAvailable !== null) {
                subscriberToAvailable.unsubscribe();
            }
            if (subscriberToSelf !== null) {
                subscriberToSelf.unsubscribe();
            }
            if (subscriberToUser !== null) {
                subscriberToUser.unsubscribe();
            }
            listenerToAvailable = $q.defer();
            listenerToSelf = $q.defer();
            listenerToUser = $q.defer();
        }
    }
})();
