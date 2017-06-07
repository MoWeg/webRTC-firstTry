(function() {
    'use strict';

    angular
        .module('simpleWebrtcServerApp')
        .controller('Proto1on1Controller', Proto1on1Controller);

    Proto1on1Controller.$inject = ['$rootScope','$cookies', '$http','JhiTrackerService', 'SdpService'];

    function Proto1on1Controller($rootScope, $cookies, $http, JhiTrackerService, SdpService) {
      //navigator.getUserMedia = navigator.getUserMedia ||
      //navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia ||
      navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia;

      var vm = this;
      //var isChannelReady;
      var isInitiator = $rootScope.isInitiator;
      var isStarted = false;
      var localStream;
      var pc;
      var remoteStream;
      var turnReady;

      //var pc_config = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'},{'url': 'stun:stun4.l.google.com:19302'},{'url': 'stun:stun1.l.google.com:19302'},{'url': 'stun:stun01.sipphone.com'},{'url': 'stun1.voiceeclipse.net'}]};
      var pc_config = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}; //, stun:stun4.l.google.com:19302, stun:stun1.l.google.com:19302, stun:stun01.sipphone.com
      var pc_constraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

      // Set up audio and video regardless of what devices are present.
      var sdpConstraints = {'mandatory': {
        'OfferToReceiveAudio':true,
        'OfferToReceiveVideo':true }};


      var localVideo = document.querySelector('#video');

    //Signaling
    /////////////////////////////////////////////

    function sendMessage(message){
        JhiTrackerService.sendSimpleMessageToJsonUser($rootScope.partnerIdForChat, message);
    }

    JhiTrackerService.receiveInvite().then(null, null, function(received) {
        handleContent(received);
    });

    function handleContent (message){
       console.log('Client received message:', message);
        if (message.type === 'answer' && isStarted) {
          pc.setRemoteDescription(new RTCSessionDescription(message));
        } else if (message.type === 'candidate' && isStarted) {
          var candidate = new RTCIceCandidate({
            sdpMLineIndex: message.label,
            candidate: message.candidate
        });
        pc.addIceCandidate(candidate);
        } else if (message.content === 'bye' && isStarted) {
          handleRemoteHangup();
        } else if (message.goal == 'canvas'){
          if(message.content == 'reset'){
              clearCanvas();
          }
          if(message.content == 'paint'){
            receivePaintingInfo(message);
          }
        }
    }

////////////////////////////////////////////////////
    function handleUserMedia(stream) {
      console.log('Adding local stream.');
      localVideo.src = window.URL.createObjectURL(stream);
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

    function handleUserMediaError(error){
      console.log('getUserMedia error: ', error);
    }

    //var constraints = {video: true};
    //navigator.getUserMedia(constraints, handleUserMedia, handleUserMediaError);
    var constraints = {video: {facingMode: { exact: "environment" }}};
    navigator.mediaDevices.getUserMedia(constraints).then(handleUserMedia).catch(handleUserMediaError);

    console.log('Getting user media with constraints', constraints);

    if (location.hostname != "localhost") {
      console.log('would request turn');
      //requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
    }

    window.onbeforeunload = function(e){
	     sendMessage({'content':'bye'});
     }

/////////////////////////////////////////////////////////

  function createPeerConnection() {
    try {
      pc = new RTCPeerConnection(pc_config);
      pc.onicecandidate = handleIceCandidate;
      pc.onaddstream = handleRemoteStreamAdded;
      pc.onremovestream = handleRemoteStreamRemoved;
      console.log('Created RTCPeerConnnection');
    } catch (e) {
      console.log('Failed to create PeerConnection, exception: ' + e.message);
      alert('Cannot create RTCPeerConnection object.');
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
        candidate: event.candidate.candidate});
      } else {
        console.log('End of candidates.');
      }
    }

    function handleRemoteStreamAdded(event) {
      console.log('Remote stream added.');
      //remoteVideo.src = window.URL.createObjectURL(event.stream);
      //remoteStream = event.stream;
    }

    function handleCreateOfferError(event){
      console.log('createOffer() error: ', e);
    }

    function handleCreateAnswerError(event){
      console.log('createAnswer() error: ', e);
    }

    function doCall() {
      console.log('Sending offer to peer.');
      pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
    }

    function doAnswer() {
      console.log('Sending answer to peer.');
      pc.createAnswer(setLocalAndSendMessage, handleCreateAnswerError, sdpConstraints);
    }

    function setLocalAndSendMessage(sessionDescription) {
      // Set Opus as the preferred codec in SDP if Opus is present.
      sessionDescription.sdp = preferOpus(sessionDescription.sdp);
      pc.setLocalDescription(sessionDescription);
      console.log('setLocalAndSendMessage sending message' , sessionDescription);
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
        xhr.onreadystatechange = function(){
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

function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
  remoteVideo.src = window.URL.createObjectURL(event.stream);
  remoteStream = event.stream;
}

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}

function hangup() {
  console.log('Hanging up.');
  stop();
  sendMessage('bye');
}

function handleRemoteHangup() {
//  console.log('Session terminated.');
  // stop();
  // isInitiator = false;
}

function stop() {
  isStarted = false;
  // isAudioMuted = false;
  // isVideoMuted = false;
    pc.close();
    pc = null;
  }

///////////////////////////////////////////

  function preferOpus(sdp){
    return SdpService.getOpus(spd);
  }
//////////////////////////////////////////////////////////////////////////////////
// canvas


      var canvasContext = initCanvasContext();


      function createCanvas() {
        var canvas = {};
        canvas.node = document.getElementById('drawingCanvas');
        canvas.context = canvas.node.getContext('2d');
        //parent.appendChild(canvas.node);
        return canvas;
      }


      function initCanvasContext() {
          var canvas = createCanvas();
          var ctx = canvas.context;
          // define a custom fillCircle method
          ctx.fillCircle = function(x, y, radius, fillColor) {
              this.fillStyle = fillColor;
              this.beginPath();
              this.moveTo(x, y);
              this.arc(x, y, radius, 0, Math.PI * 1, false);
              this.fill();
            };
            return ctx;
        }
        function receivePaintingInfo(message){
          console.log("should be drawing something");
          angular.forEach(message.paint, function(value, i){
            canvasContext.fillCircle(value.x, value.y, value.radius, value.fillColor);
          });
        }
        function clearCanvas() {
          console.log("should clear canvas");
          canvasContext.clearRect(0, 0, 640, 400);
          //canvasContext.restore();
          //canvasContext.fillRect(0, 0, 640, 400);
        }
    }
})();
