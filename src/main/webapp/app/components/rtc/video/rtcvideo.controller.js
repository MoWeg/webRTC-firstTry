(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('RtcVideoController', RtcVideoController);

    RtcVideoController.$inject = ['$rootScope', '$scope', 'SdpService', 'UserMediaService'];

    function RtcVideoController($rootScope, $scope, SdpService, UserMediaService) {
        var vm = this;
        var isStarted = false;
        var gotOffer = false;
        var gotAnswer = false;
        var isInitiator = $scope.isinitiator;
        var video = document.querySelector("#rtcvideo");
        var localStream;
        var gotAnswer, gotOffer;
        var pc;
        var storedOffer, storedAnswer;

        var canResize = false;
        var oldVideoHeight = 0;
        var oldVideoWidth = 0;

        function init() {
            if (isInitiator) {
                UserMediaService.getBackCameraAsPromise().then(handleUserMedia).catch(handleUserMediaError);
            }
        }
        init();

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
        $scope.$on('rtc-hangup', function() {
            hangup();
        });
        $scope.$on('check-resize', function() {
            checkResize();
        });
        video.addEventListener('loadedmetadata', function() {
            canResize = true;
            checkResize();
        })
        video.addEventListener('resize', checkResize());

        function sendMessage(message) {
            $rootScope.$broadcast('send-message', message);
        }

        function resize3dModell(size) {
            $rootScope.$broadcast('just-resize', size);
        }

        function checkResize() {
            if (canResize) {
                var height = video.videoHeight;
                var width = video.videoWidth;
                if (height != oldVideoHeight || width != oldVideoWidth) {
                    if (!height) {
                        height = oldVideoHeight;
                    }
                    if (!width) {
                        width = oldVideoWidth;
                    }
                    if (height != 0 || width != 0) {
                        oldVideoHeight = height;
                        oldVideoWidth = width;
                        var size = {
                            height: height,
                            width: width
                        };
                        resize3dModell(size);
                    }
                }
            }
        }


        function handleContent(message) {
            if (message.type === 'offer') {
                if (!gotOffer) {
                    gotOffer = true;
                    if (!isStarted) {
                        maybeStart();
                    }
                    pc.setRemoteDescription(new RTCSessionDescription(message));
                    doAnswer();
                }
            } else if (message.type === 'answer' && isStarted) {
                if (!gotAnswer) {
                    gotAnswer = true;
                    pc.setRemoteDescription(new RTCSessionDescription(message));
                }
            } else if (message.type === 'candidate') {
                if (isStarted && gotOffer) {
                    var candidate = new RTCIceCandidate({
                        sdpMLineIndex: message.label,
                        candidate: message.candidate
                    });
                    pc.addIceCandidate(candidate);
                } else {
                    if (!isStarted) {
                        maybeStart();
                    }
                    if (!gotOffer && !isInitiator) {
                        sendMessage({
                            goal: 'rtc',
                            content: 'needOffer'
                        });
                    }
                    if (!gotAnswer && isInitiator) {
                        sendMessage({
                            goal: 'rtc',
                            content: 'needAnswer'
                        })
                    }
                }
            } else if (message.content === 'bye' && isStarted) {
                handleRemoteHangup();
            } else if (message.content == 'needOffer') {
                sendMessage(storedOffer);
            } else if (message.content == 'needAnwser') {
                sendMessage(storedOffer);
            }
        }

        ////////////////////////////////////////////////////
        function maybeStart() {
            if (!isStarted) {
                createPeerConnection();
                isStarted = true;
            }
        }

        function handleUserMedia(stream) {
            video.src = window.URL.createObjectURL(stream);
            localStream = stream;
            if (!isStarted && typeof localStream != 'undefined') {
                createPeerConnection();
                pc.addStream(localStream);
                isStarted = true;
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
            } catch (e) {
                console.log('Failed to create PeerConnection, exception: ' + e.message);
                //alert('Cannot create RTCPeerConnection object.');
                return;
            }
        }

        function handleIceCandidate(event) {
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
            video.src = window.URL.createObjectURL(event.stream);
        }

        function handleRemoteStreamRemoved(event) {
            // console.log('Remote stream removed. Event: ', event);
            handleRemoteHangup();
        }

        function handleCreateOfferError(event) {
            console.log('createOffer() error: ', e);
        }


        function doCall() {
            pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
        }

        function doAnswer() {
            pc.createAnswer(setLocalAndSendMessage, handleCreateAnswerError, sdpConstraints);
        }

        function handleCreateAnswerError(event) {
            console.log('createAnswer() error: ', e);
        }

        function setLocalAndSendMessage(sessionDescription) {
            // Set Opus as the preferred codec in SDP if Opus is present.
            if (sessionDescription.sdp != null && angular.isDefined(sessionDescription.sdp)) {
                var oldSdp = sessionDescription.sdp
                sessionDescription.sdp = preferOpus(oldSdp);
            }
            pc.setLocalDescription(sessionDescription);
            if (isInitiator) {
                storedOffer = sessionDescription;
            } else {
                storedAnswer = sessionDescription;
            }
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
            sendMessage({
                goal: 'rtc',
                content: 'bye'
            });
            stop();
        }

        function handleRemoteHangup() {
            stop();
            $rootScope.$broadcast('rtc-hung-up');
            // isInitiator = false;
        }

        function stop() {
            isStarted = false;
            // isAudioMuted = false;
            // isVideoMuted = false;
            pc.close();
            pc = null;
            if (isInitiator) {
                video.pause();
                video.src = "";
                UserMediaService.closeAllStreams(localStream);
            }
        }

        function preferOpus(sdp) {
            return SdpService.getOpus(sdp);
        }

    }
})();