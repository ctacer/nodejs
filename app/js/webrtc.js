
var VideoSharing = (function () {

	var exports = {};

  var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
	var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
	var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
	navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;

	var pc; // PeerConnection
  var socket = io('http://localhost:8000');
  var sharingWasStarted = false;

	function restoreVideoConnection (videoInputs) {

	}

	function gotStream(videoInputs, stream) {
	  document.getElementById("callButton").style.display = 'inline-block';
	  document.getElementById("localVideo").src = URL.createObjectURL(stream);

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

	function gotIceCandidate(event){
	  if (event.candidate) {
	    sendMessage({
	      type: 'candidate',
	      label: event.candidate.sdpMLineIndex,
	      id: event.candidate.sdpMid,
	      candidate: event.candidate.candidate
	    });
	  }
	}

	function gotRemoteStream(event){
	  document.getElementById("remoteVideo").src = URL.createObjectURL(event.stream);
	}


	////////////////////////////////////////////////
	// Socket.io

	var socket = io.connect('', {port: 1234});

	function sendMessage(message){
	  socket.emit('message', message);
	}

	socket.on('message', function (message){
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
	});



	exports.start = function (videoInputs) {
		if (sharingWasStarted) return restoreVideoConnections(videoInputs);

		navigator.getUserMedia(
		  { audio: true, video: true }, 
		  function (stream) {
		  	gotStream(videoInputs, stream)
		  }, 
		  function(error) { console.log(error) }
		);
	};

	exports.pause = function () {

	};

});

$(function () {

  "use strict";

  var videoInputs = {
  	me: $('#me'),
  	candidate: $('#candidate')
  };

	$('#video-chat-btn').click(function () {
		if ($(this).attr('data-progress')) return false;

		var $this = $(this);
		var action = $this.text();
		$this.attr('data-progress', true);

		if (action == 'Share Video') {
			$('#video-chat-content').fadeToggle({
		  	complete: function () {
		  		$this.text('Stop Sharing');
		  		$this.attr('data-progress', '');
		  		// VideoSharing.start(videoInputs);
		  	}
		  });
		}
		else if (action == 'Stop Sharing') {
			$('#video-chat-content').fadeToggle({
		  	complete: function () {
		  		$this.text('Share Video');
		  		$this.attr('data-progress', '');
		  		// VideoSharing.pause(videoInputs);
		  	}
		  });
		}
	  
	  return false;
	});

});