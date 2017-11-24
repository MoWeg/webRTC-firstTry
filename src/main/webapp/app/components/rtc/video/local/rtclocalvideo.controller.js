(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('RtcLocalVideoController', RtcLocalVideoController);

    RtcLocalVideoController.$inject = ['$rootScope', '$scope', '$element', 'SdpService', 'UserMediaService'];

    function RtcLocalVideoController($rootScope, $scope, $element, SdpService, UserMediaService) {
        var vm = this;
        var isStarted = false;
        var gotOffer = false;
        var video = $element[0].childNodes[0];
        var localStream;
        var pc;

        var oldVideoHeight = 0;
        var oldVideoWidth = 0;

        UserMediaService.getBackCameraAsPromise().then(handleUserMedia).catch(handleUserMediaError);
        //var pc_config = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'},{'url': 'stun:stun4.l.google.com:19302'},{'url': 'stun:stun1.l.google.com:19302'},{'url': 'stun:stun01.sipphone.com'},{'url': 'stun1.voiceeclipse.net'}]};
        var pc_config = {
            'iceServers': [{
                'urls': 'stun:stun.l.google.com:19302'
            }]
        }; //, stun:stun4.l.google.com:19302, stun:stun1.l.google.com:19302, stun:stun01.sipphone.com
        var pc_constraints = {
            'optional': [{
                'DtlsSrtpKeyAgreement': true
            }]
        };

        // Set up audio and video regardless of what devices are present.
        var sdpConstraints = {
            'mandatory': {
                'OfferToReceiveAudio': true,
                'OfferToReceiveVideo': true
            }
        };

        $scope.$on('rtc-message', function(event, args) {
            handleContent(args);
        });
        $scope.$on('$destroy', function() {
            hangup();
        });
        $scope.$on('check-resize', function() {
            var newSize = checkResize();
            if (newSize) {
                resize3dModell(newSize);
            }
        });
        video.addEventListener('resize', resize3dModell({
            height: video.videoHeight,
            width: video.videoWidth
        }));

        function sendMessage(message) {
            $rootScope.$broadcast('send-message', message);
        }

        function resize3dModell(size) {
            $rootScope.$broadcast('just-resize', size)
        }

        function checkResize() {
            var height = video.videoHeight;
            var width = video.videoWidth;
            if (height != oldVideoHeight || width != oldVideoWidth) {
                if (!height) {
                    height = oldVideoHeight;
                    if (!width) {
                        width = oldVideoWidth;
                    }
                    oldVideoHeight = height;
                    oldVideoWidth = width;
                    return {
                        height: height,
                        width: width
                    };
                }
            }
        }

        function handleContent(message) {
            if (message.type === 'answer' && isStarted) {
                pc.setRemoteDescription(new RTCSessionDescription(message));
                gotAnswer = true;
            } else if (message.type === 'candidate' && isStarted && gotAnswer) {
                var candidate = new RTCIceCandidate({
                    sdpMLineIndex: message.label,
                    candidate: message.candidate
                });
                pc.addIceCandidate(candidate);
            } else if (message.content === 'bye' && isStarted && gotAnswer) {
                handleRemoteHangup();
            } else if (message.content == 'needOffer') {
                sendMessage(storedOffer);
            } else if (message.goal == '3d') {
                handleMessageWith3dGoal(message);
            }
        }

        ////////////////////////////////////////////////////
        function handleUserMedia(stream) {
            console.log('initializing 3D model');

            console.log('Adding local stream.');
            video.src = window.URL.createObjectURL(stream);
            localStream = stream;
            if (!isStarted && typeof localStream != 'undefined') {
                createPeerConnection();
                pc.addStream(localStream);
                isStarted = true;
                console.log('isInitiator', isInitiator);
                if (isInitiator) {
                    doCall();
                }
            }
        }

        function handleUserMediaError(error) {
            console.log('getUserMedia error: ', error);
        }

        if (location.hostname != "localhost") {
            console.log('would request turn');
            //requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
        }

        function createPeerConnection() {
            try {
                pc = new RTCPeerConnection(pc_config);
                pc.onicecandidate = handleIceCandidate;
                pc.onaddstream = handleRemoteStreamAdded;
                pc.onremovestream = handleRemoteStreamRemoved;
                console.log('Created RTCPeerConnnection');
            } catch (e) {
                console.log('Failed to create PeerConnection, exception: ' + e.message);
                //alert('Cannot create RTCPeerConnection object.');
                return;
            }
        }

        function handleIceCandidate(event) {
            console.log('handleIceCandidate event: ', event);
            if (event.candidate) {
                sendMessage({
                    type: 'candidate',
                    label: event.candidate.sdpMLineIndex,
                    id: event.candidate.sdpMid,
                    candidate: event.candidate.candidate
                });
            } else {
                console.log('End of candidates.');
            }
        }

        function handleRemoteStreamAdded(event) {
            console.log('Remote stream added.');
            //remoteVideo.src = window.URL.createObjectURL(event.stream);
            //remoteStream = event.stream;
        }

        function handleCreateOfferError(event) {
            console.log('createOffer() error: ', e);
        }


        function doCall() {
            console.log('Sending offer to peer.');
            pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
        }

        function setLocalAndSendMessage(sessionDescription) {
            // Set Opus as the preferred codec in SDP if Opus is present.
            if (sessionDescription.sdp != null && angular.isDefined(sessionDescription.sdp)) {
                var oldSdp = sessionDescription.sdp
                sessionDescription.sdp = preferOpus(oldSdp);
            }
            pc.setLocalDescription(sessionDescription);
            console.log('setLocalAndSendMessage sending message', sessionDescription);
            storedOffer = sessionDescription;
            sendMessage(sessionDescription);
        }

        function requestTurn(turn_url) {
            var turnExists = false;
            for (var i in pc_config.iceServers) {
                if (pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {
                    turnExists = true;
                    turnReady = true;
                    break;
                }
            }
            if (!turnExists) {
                console.log('Getting TURN server from ', turn_url);
                // No TURN server. Get one from computeengineondemand.appspot.com:
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var turnServer = JSON.parse(xhr.responseText);
                        console.log('Got TURN server: ', turnServer);
                        pc_config.iceServers.push({
                            'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
                            'credential': turnServer.password
                        });
                        turnReady = true;
                    }
                };
                xhr.open('GET', turn_url, true);
                xhr.send();
            }
        }

        function hangup() {
            console.log('Hanging up.');
            sendMessage({
                goal: 'rtc',
                content: 'bye'
            });
            stop();
        }

        function handleRemoteHangup() {
            console.log('Session terminated.');
            stop();

            $state.go('chooseroom');
            // isInitiator = false;
        }

        function stop() {
            isStarted = false;
            // isAudioMuted = false;
            // isVideoMuted = false;
            pc.close();
            pc = null;
            video.pause();
            video.src = "";
            UserMediaService.closeAllStreams(localStream);
        }

        function preferOpus(sdp) {
            return SdpService.getOpus(sdp);
        }
    }
})();