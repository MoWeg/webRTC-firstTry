(function() {
    'use strict';
    /* globals SockJS, Stomp */

    angular
        .module('simpleWebrtcServerApp')
        .factory('JhiTrackerService', JhiTrackerService);

    JhiTrackerService.$inject = ['$rootScope', '$window', '$cookies', '$http', '$q'];

    function JhiTrackerService ($rootScope, $window, $cookies, $http, $q, $scope) {
        var stompClient = null;
        var subscriber = null;
        var listener = $q.defer();
        var connected = $q.defer();
        var alreadyConnectedOnce = false;

        var simpleChatSubscriber = null;
        var simpleChatListener = $q.defer();

        var subscriberToAvailable = null;
        var listenerToAvailable = $q.defer();

        var subscriberToSelf = null;
        var listenerToSelf = $q.defer();

        var subscriberToUser = null;
        var listenerToUser = $q.defer();

        var service = {
            connect: connect,
            disconnect: disconnect,
            receive: receive,
            sendActivity: sendActivity,
            subscribe: subscribe,
            unsubscribe: unsubscribe,
            receiveSimpleMessage: receiveSimpleMessage,
            subscribeSimpleMessage: subscribeSimpleMessage,
            unsubscribeSimpleMessage: unsubscribeSimpleMessage,
            sendSimpleMessage: sendSimpleMessage,

            sendSimpleMessageToUser: sendSimpleMessageToUser,

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
            $rootScope.myIdForChat = Math.round((Math.random() * 1000000) * 10);
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
                sendActivity();
                if (!alreadyConnectedOnce) {
                    stateChangeStart = $rootScope.$on('$stateChangeStart', function () {
                        sendActivity();
                    });
                    alreadyConnectedOnce = true;
                }
            });
            $rootScope.$on('$destroy', function () {
                if(angular.isDefined(stateChangeStart) && stateChangeStart !== null){
                    stateChangeStart();
                }
            });
        }

        function disconnect () {
            if (stompClient !== null) {
                stompClient.disconnect();
                stompClient = null;
            }
        }

        function receive () {
            return listener.promise;
        }

        function sendActivity() {
            if (stompClient !== null && stompClient.connected) {
                stompClient
                    .send('/topic/activity',
                    {},
                    angular.toJson({'page': $rootScope.toState.name}));
                if($rootScope.toState.name == 'chooseroom'){
                  stompClient
                      .send('/topic/rooms/send',
                      {},
                      angular.toJson({'page': $rootScope.toState.name, 'content': $rootScope.myIdForChat}));
                }
              }
        }

        function subscribe () {
            connected.promise.then(function() {
                subscriber = stompClient.subscribe('/topic/tracker', function(data) {
                    listener.notify(angular.fromJson(data.body));
                });
            }, null, null);
        }

        function unsubscribe () {
            if (subscriber !== null) {
                subscriber.unsubscribe();
            }
            listener = $q.defer();
        }

        function receiveSimpleMessage(){
          return simpleChatListener.promise;
        }

        function subscribeSimpleMessage(){
          connected.promise.then(function(){
            simpleChatSubscriber =  stompClient.subscribe('/topic/receivesimple', function(data) {
                simpleChatListener.notify(angular.fromJson(data.body));
            });
          }, null, null);
        }

        function unsubscribeSimpleMessage () {
            if (simpleChatSubscriber !== null) {
                simpleChatSubscriber.unsubscribe();
            }
            simpleChatListener = $q.defer();
        }

        function sendSimpleMessage(message) {
            if (stompClient !== null && stompClient.connected) {
                stompClient
                    .send('/topic/sendsimple',
                    {},
                    angular.toJson({'content': message}));
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
