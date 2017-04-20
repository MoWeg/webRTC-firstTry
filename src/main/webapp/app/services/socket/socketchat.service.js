(function() {
    'use strict';
    /* globals SockJS, Stomp */

    angular
        .module('simpleWebrtcServerApp')
        .factory('SocketChatService', SocketChatService);

    SocketChatService.$inject = ['$rootScope', '$q', 'MySocketService']

    function SocketChatService($rootScope, $q, MySocketService){
      var stompClient = MySocketService.getStompClient;
      var connected = MySocketService.getConnected;

      var subscriberToAvailable = null;
      var listenerToAvailable = $q.defer();

      var subscriberToSelf = null;
      var listenerToSelf = $q.defer();

      var subscriberToUser = null;
      var listenerToUser = $q.defer();

      var service = {
        sendSimpleMessageToJsonUser: sendSimpleMessageToJsonUser,
        sendSimpleMessageToUserWithGoal: sendSimpleMessageToUserWithGoal,

        subscribeToAvailable: subscribeToAvailable,
        receiveAvailable: receiveAvailable,

        subscribeToSelf: subscribeToSelf,
        receiveInvite: receiveInvite,

        subscribeToUser: subscribeToUser,
        subscribeToPartner: subscribeToPartner,
        reveiceFromUser: receiveFromUser,

        unsubscribeChatRooms: unsubscribeChatRooms
      };

      return service;

      function connect () {
          //building absolute path so that websocket doesnt fail when deploying with a context path
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

      function sendSimpleMessageToUser(user, message) {
          if (stompClient !== null && stompClient.connected) {
              stompClient
                  .send('/topic/rooms/send/'+user,
                  {},
                  angular.toJson({'content': message}));
          }
      }
      function sendSimpleMessageToJsonUser(user, messageJson) {
          if (stompClient !== null && stompClient.connected) {
              stompClient
                  .send('/topic/rooms/send/'+user,
                  {},
                  angular.toJson(messageJson));
          }
      }
      function sendSimpleMessageToUserWithGoal(user, goal, message) {
          if (stompClient !== null && stompClient.connected) {
              stompClient
                  .send('/topic/rooms/send/'+user,
                  {},
                  angular.toJson({'content': message, 'goal':goal}));
          }
      }
      function subscribeToAvailable(){
        if (stompClient == null) {
            connect();
        }
        connected.promise.then(function() {
            subscriberToAvailable = stompClient.subscribe('/topic/rooms/receive', function(data) {
                listenerToAvailable.notify(angular.fromJson(data.body));
            });
        }, null, null);
      }

      function receiveAvailable(){
        return listenerToAvailable.promise;
      }

      function subscribeToSelf(){
        if (stompClient == null) {
            connect();
        }
        connected.promise.then(function() {
            subscriberToSelf = stompClient.subscribe('/topic/rooms/receive/'+$rootScope.myIdForChat, function(data) {
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
              subscriberToUser = stompClient.subscribe('/topic/rooms/receive/'+user, function(data) {
                  listenerToUser.notify(angular.fromJson(data.body));
              });
          }, null, null);
      }

      function subscribeToPartner(){
        subscribeToUser($rootScope.partnerIdForChat);
      }

      function receiveFromUser(){
        return listenerToUser.promise;
      }

      function unsubscribeChatRooms () {
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
