$(function () {

	"use strict";

  var videoInputs = {
  	call: $('#video-chat-btn'),
    answer: $('#answer-call-btn'),
    notification: $('#video-chat-notification'),
    decline: $('#decline-call-btn'),
    terminame: $('#terminame-call-btn'),
  	me: $('#me'),
  	meLabel: $('#localimg'),
  	candidate: $('#candidate'),
  	candidateLabel: $('#remoteimg')
  };

  var makeACall = function () {
  	videoInputs.me.show();
  	videoInputs.meLabel.hide();
  	videoInputs.call.hide();
  	videoInputs.answer.hide();
  	videoInputs.terminame.hide();
  };

  var makeAnAnswer = function () {
  	videoInputs.call.hide();
  	videoInputs.notification.hide();
  	videoInputs.answer.show();
  	videoInputs.decline.show();
  };

  var answerACall = function () {
  	videoInputs.me.show();
  	videoInputs.meLabel.hide();
  	videoInputs.candidate.show();
  	videoInputs.candidateLabel.hide();
  	videoInputs.answer.hide();
  	videoInputs.decline.hide();
  	videoInputs.terminame.show();
  };

  var declineACall = function () {
  	videoInputs.me.hide();
  	videoInputs.candidate.hide();
  	videoInputs.meLabel.show();
  	videoInputs.candidateLabel.show();
  	videoInputs.call.show();
  	videoInputs.terminame.hide();
  	videoInputs.decline.hide();
  	videoInputs.answer.hide();
  	videoInputs.notification.hide();
  };

  var terminateACall = function () {
  	declineACall();
  };

	var VideoSharing = (function () {

		var exports = {};

	  var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
		var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
		var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
		navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;

		var pc; // PeerConnection
		var localStream;
		var remoteStream;
	  var socket = io('http://localhost:8000');
	  var sharingWasStarted = false;

		function restoreVideoConnection () {

		}

		function gotStream(stream) {
		  videoInputs.me.get(0).src = URL.createObjectURL(stream);
		  localStream = stream;

		  pc = new PeerConnection(null);
		  pc.addStream(stream);
		  pc.onicecandidate = gotIceCandidate;
		  pc.onaddstream = gotRemoteStream;
		}


		// Step 2. createOffer
		function createOffer() {
		  pc.createOffer(
		    gotLocalDescription, 
		    function(error) { console.log(error) }, 
		    { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } }
		  );
		}


		// Step 3. createAnswer
		function createAnswer() {
		  pc.createAnswer(
		    gotLocalDescription,
		    function(error) { console.log(error) }, 
		    { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } }
		  );
		}


		function gotLocalDescription(description){
		  pc.setLocalDescription(description);
		  sendMessage(description);
		}

		var mediaDescription = null;

		function gotIceCandidate(event) {
		  if (event.candidate) {
		    mediaDescription = {
		      type: 'candidate',
		      label: event.candidate.sdpMLineIndex,
		      id: event.candidate.sdpMid,
		      candidate: event.candidate.candidate
		    }
		    sendMessage(mediaDescription);
		  }
		}

		function gotRemoteStream(event){
		  videoInputs.candidate.get(0).src = URL.createObjectURL(event.stream);
		  remoteStream = event.stream;
		}


		////////////////////////////////////////////////
		// Socket.io

		var socket = io('http://localhost:8000');

		function sendMessage(message){
			message.room = global.room.name,
		  socket.emit('message', message);
		}

		socket.on('watingForAnswer', function () {			
			makeAnAnswer();
		});

		socket.on('message', function (message){
			console.log(message);
		  if (message.type === 'offer') {
		    pc.setRemoteDescription(new SessionDescription(message));
		    createAnswer();
		  } 
		  else if (message.type === 'answer') {
		    pc.setRemoteDescription(new SessionDescription(message));
		  } 
		  else if (message.type === 'candidate') {
		    var candidate = new IceCandidate({sdpMLineIndex: message.label, candidate: message.candidate});
		    pc.addIceCandidate(candidate);
		  }
		  else if (message.type === 'terminateCall') {
		    terminateACall();
		    terminate();
		  }
		});

		function shareMyCam () {
			navigator.getUserMedia(
			  { audio: true, video: true }, 
			  gotStream, 
			  function(error) { console.log(error) }
			);
		};

		function terminate () {
			if (pc && pc.close) {
				pc.close();
			}
			if (remoteStream && remoteStream.stop) {
				remoteStream.stop();
			}
			if (localStream && localStream.stop) {
				localStream.stop();
			}
			videoInputs.me.get(0).src = "";
			videoInputs.candidate.get(0).src = "";
		}

		exports.call = function () {
			if (sharingWasStarted) return restoreVideoConnections();

			shareMyCam();

		  socket.emit('initiateCall', { room: global.room.name });
		};

		exports.terminame = function () {
			sendMessage({ type: 'terminateCall' });
			terminate();
		};

		exports.answer = function () {
			navigator.getUserMedia(
			  { audio: true, video: true }, 
			  function (stream) {
			  	gotStream(stream);
			  	createOffer();

/*			  	mediaDescription.type = 'candidate';
			  	sendMessage(mediaDescription);*/
			  }, 
			  function(error) { console.log(error) }
			);
		}

		return exports;

	}) ();


	videoInputs.call.click(function () {
		VideoSharing.call();
		makeACall();
	  
	  return false;
	});

	videoInputs.answer.click(function () {
		VideoSharing.answer();
		answerACall();

		return false;
	});

	videoInputs.terminame.click(function () {
		VideoSharing.terminame();
		terminateACall();

		return false;
	});

	videoInputs.decline.click(function () {
		VideoSharing.terminame();
		declineACall();

		return false;
	});

});