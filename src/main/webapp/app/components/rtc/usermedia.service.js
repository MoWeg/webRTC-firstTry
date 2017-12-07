(function() {
    'use strict';
    /* globals SockJS, Stomp */

    angular
        .module('simpleWebrtcServerApp')
        .factory('UserMediaService', UserMediaService);

    UserMediaService.$inject = ['$q'];

    function UserMediaService($q) {
        navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia ||
            navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia;

        var service = {
            getMediaAsPromise: getMediaAsPromise,
            getBackCameraAsPromise: getBackCamera,
            getStreamByDeviceIdAsPromise: getStream,
            closeAllStreams: closeAllStreams
        };
        return service;

        function getAllDevices() {
            return navigator.mediaDevices.enumerateDevices();
        }

        function getStream(constraints) {
            return navigator.mediaDevices.getUserMedia(constraints);
        }

        function getBackCamera() {
            var deferred = $q.defer();
            getAllDevices().then(function(allDevices) {
                var backCamId = null;
                angular.forEach(allDevices, function(value, key) {
                    if (isBackCam(value)) {
                        backCamId = value.deviceId;
                        return;
                    } else {
                        if (value.kind === 'videoinput') {
                            backCamId = value.deviceId;
                        }
                    }
                });
                var constraints = getVideoContraints(backCamId);
                deferred.resolve(getStream(constraints));
            });
            return deferred.promise;
        }

        function getVideoContraints(camId) {
            return {
                video: {
                    optional: [{
                        sourceId: videoId
                    }]
                }
            };
        }

        function isBackCam(deviceInfo) {
            if (deviceInfo.kind === 'videoinput') {
                if (deviceInfo.label.toLowerCase().indexOf('back') !== -1) {
                    return true;
                }
            }
            return false;
        }

        function getMediaAsPromise(audio, video) {
            var deferred = $q.defer();
            getAllDevices().then(function(allDevices) {
                var constraints = {};
                if (audio) {
                    var audioDevice = allDevices.find(function(element) {
                        return element.kind === 'audioinput';
                    });
                    if (audioDevice) {
                        var audioId = audioDevice.deviceId;
                        constraints.audio = getContraints(audioId);
                    }
                }
                if (video) {
                    var backCam = allDevices.find(function(element) {
                        return element.kind === 'videoinput' && element.label.toLowerCase().indexOf('back') !== -1;
                    });
                    if (!backCam) {
                        backCam = allDevices.find(function(element) {
                            return element.kind === 'videoinput';
                        });
                    }
                    if (backCam) {
                        var videoId = backCam.deviceId;
                        constraints.video = getContraints(videoId);
                    }
                }
                deferred.resolve(getStream(constraints));
            });
            return deferred.promise;
        }

        function getContraints(id) {
            return {
                optional: [{
                    sourceId: id
                }]
            };
        }


        function closeAllStreams(stream) {
            angular.forEach(stream.getTracks(), function(value, key) {
                value.stop();
            });
        }
    }
})();