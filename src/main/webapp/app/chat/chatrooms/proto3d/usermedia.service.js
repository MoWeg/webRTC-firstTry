(function() {
    'use strict';
    /* globals SockJS, Stomp */

    angular
        .module('simpleWebrtcServerApp')
        .factory('UserMediaService', UserMediaService);

    UserMediaService.$inject = ['$q'];

    function UserMediaService ($q) {
      navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia ||
      navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia;

      var service = {
        getBackCameraAsPromise: getBackCamera,
        getStreamByDeviceIdAsPromise: getStream,
        closeAllStreams: closeAllStreams
      };
      return service;

      function getAllDevices(){
        return navigator.mediaDevices.enumerateDevices();
      }

      function getStream(videoId){
        var constraints = {
          // audio: {
          //   optional: [{
          //     sourceId: audioSelect.value
          //   }]
          // },
          video: {
            optional: [{
              sourceId: videoId
            }]
          }
        };

        return navigator.mediaDevices.getUserMedia(constraints);
      }

      function getBackCamera(){
        var deferred = $q.defer();
        getAllDevices().then(function(allDevices){
          var backCamId = null;
          angular.forEach(allDevices, function(value, key){
            if(isBackCam(value)){
              backCamId = value.deviceId;
              return;
            } else {
              if(value.kind === 'videoinput'){
                backCamId = value.deviceId;
              }
            }
          });
          deferred.resolve(getStream(backCamId));
        });
        return deferred.promise;
      }

      function isBackCam(deviceInfo){
        if (deviceInfo.kind === 'videoinput'){
          if(deviceInfo.label.toLowerCase().indexOf('back') !== -1){
              return true;
          }
        }
        return false;
      }

      function closeAllStreams(stream){
        angular.forEach(stream.getTracks(), function(value, key){
          value.stop();
        });
      }
    }
})();
