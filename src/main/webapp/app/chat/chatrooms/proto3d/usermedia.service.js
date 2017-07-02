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
        var backCamId = null;
        var fallBack = null;
        getAllDevices().then(function(allDevices){
          angular.forEach(allDevices, function(value, key){
            if(isBackCam(value)){
              backCamId = value.deviceId;
            }else{
              if(value.kind === 'videoinput'){
                fallBack = value.deviceId;
              }
            }
          });
          if(backCamId){
            deferred.resolve(getStream(backCamId));
          }else{
            deferred.resolve(getStream(fallBack));
          }
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
    }
})();
