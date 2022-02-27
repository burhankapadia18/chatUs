console.log('in main.js')

var mapPeers = {};

var usernameInput = document.querySelector('#username')
var btnJoin = document.querySelector('#btn-join')

var username;

var webSocket;

function webSocketOnMsg(event) {
    console.log('in webSocketOnMsg')

    var parsedData = JSON.parse(event.data);
    var peerUsername = parsedData['peer']
    var action = parsedData['action']

    if(username == peerUsername) {
        return;
    }

    reciever_channel_name = parsedData['msg']['reciever_channel_name'];
    if(action == 'new-peer') {
        createOfferer(peerUsername,reciever_channel_name);
    }

    if(action == 'new-offer') {
        var offer = parsedData['msg']['sdp']
        createAnswer(offer,peerUsername,reciever_channel_name);
    }

    if(action == 'new-answer') {
        var answer = parsedData['msg']['sdp'];

        var peer = mapPeers[peerUsername][0];

        peer.setRemoteDescription(answer);

        return;
    }
}

btnJoin.addEventListener('click', () => {
    username = usernameInput.value;

    console.log('username: ', username);

    if( username == '') {
        return;
    }

    usernameInput.value = '';
    usernameInput.disabled = true;
    usernameInput.style.visibility = 'hidden';

    btnJoin.disabled = true;
    btnJoin.style.visibility = 'hidden';

    var labelUsername = document.querySelector('#label-username')
    labelUsername.innerHTML = username;

    var loc = window.location;
    var wsStart = 'ws://';
    if(loc.protocol == 'https:') {
        wsStart = 'wss://';
    }

    var endpoint = wsStart + loc.host + loc.pathname;
    
    console.log('endpoint: ', endpoint);

    webSocket = new WebSocket(endpoint);

    webSocket.addEventListener('open', (e) => {
        console.log('connection opened! from websocket');
        sendSignal('new-peer',{});
    });
    webSocket.addEventListener('message', webSocketOnMsg);
    webSocket.addEventListener('close', (e) => {
        console.log('connection closed!');
    });
    webSocket.addEventListener('error', (e) => {
        console.log('error occured!');
    });
});

var localStream = new MediaStream();

const constraints = {
    'video':true,
    'audio':true
}

const localVideo = document.querySelector('#local-video');

const btnToggleAudio = document.querySelector('#btn-toggle-audio');
const btnToggleVideo = document.querySelector('#btn-toggle-video');

var userMedia = navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        localStream = stream;
        localVideo.srcObject = localStream;
        localVideo.muted = true;

        var audioTracks = stream.getAudioTracks();
        var videoTracks = stream.getVideoTracks();

        audioTracks[0].enabled = true;
        videoTracks[0].enabled = true;

        btnToggleAudio.addEventListener('click', () => {
            audioTracks[0].enabled = !audioTracks[0].enabled;
            if(audioTracks[0].enabled) {
                btnToggleAudio.innerHTML = 'Audio Mute';
                return;
            }
            btnToggleAudio.innerHTML = 'Audio Unmute';
        });

        btnToggleVideo.addEventListener('click', () => {
            videoTracks[0].enabled = !videoTracks[0].enabled;
            if(videoTracks[0].enabled) {
                btnToggleVideo.innerHTML = 'Video Off';
                return;
            }
            btnToggleVideo.innerHTML = 'Video On';
        });
    })
    .catch(error => {
        console.log('error accessing media devices. ',error);
    });

var btnSendMsg = document.querySelector('#btn-send-msg');

btnSendMsg.addEventListener('click', sendMsgOnclick);
var msgList = document.querySelector('#message-list');
var msgInput = document.querySelector('#msg');

function sendMsgOnclick() {
    var message = msgInput.value;

    var li = document.createElement('li');
    li.appendChild(document.createTextNode('Me: '+message));
    msgList.appendChild(li);

    var datachannels = getDataChannels();

    message = username + ': '+message;

    for(index in datachannels) {
        datachannels[index].send(message);
    }

    msgInput.value = '';
}

function sendSignal(action, msg) {
    console.log("in send signal !!")
    var jsonstr = JSON.stringify({
        'peer':username,
        'action':action,
        'msg':msg,
    });
    console.log(jsonstr)
    webSocket.send(jsonstr);
}

const iceConfiguration = {
    iceServers: [
        {
            urls: 'turn:my-turn-server.mycompany.com:19403',
            username: 'optional-username',
            credentials: 'auth-token'
        }
    ]
}
function createOfferer(peerUsername, reciever_channel_name) {
    console.log("in createOfferer!")
    var peer = new RTCPeerConnection(null);
    addLocalTracks(peer);
    var dc = peer.createDataChannel('channel');
    dc.addEventListener('open', () => {
        console.log('connection opened! from webRTC');
    });
    dc.addEventListener('msg', dcOnMessage);

    var remoteVideo = createVideo(peerUsername);
    setOnTrack(peer,remoteVideo);

    mapPeers[peerUsername] = [track, dc];

    peer.addEventListener('iceconnectionstatechange', () => {
        var iceConnectionState = peer.iceConnectionState;
        if(iceConnectionState == 'failed' || iceConnectionState == 'disconnected' || iceConnectionState == 'closed') {
            delete mapPeers[peerUsername];
            if(iceConnectionState != 'closed') {
                peer.close();
            }
            removeVideo(remoteVideo);
        }
    });

    peer.addEventListener('icecandidate', (event) => {
        if(event.candidate) {
            console.log('new ice candidate', JSON.stringify(peer.localDescription));
            return;
        }
        sendSignal('new-offer', {
            'sdp':peer.localDescription,
            'reciever_channel_name':reciever_channel_name
        });
    });

    peer.createOffer()
        .then(o => peer.setLocalDescription(o))
        .then(() => {
            console.log('local description set successfully');
        });
}

function createAnswer(offer, peerUsername, reciever_channel_name) {
    var peer = new RTCPeerConnection(null);

    addLocalTracks(peer);

    var remoteVideo = createVideo(peerUsername);
    setOnTrack(peer,remoteVideo);

    peer.addEventListener('datachannel', e => {
        peer.dc = e.channel;
        peer.dc.addEventListener('open', () => {
            console.log('connecton opened!');
        });
        dc.addEventListener('msg', dcOnMessage);
        mapPeers[peerUsername] = [peer, peer.dc];
    });

    mapPeers[peerUsername] = [track, dc];

    peer.addEventListener('iceconnectionstatechange', () => {
        var iceConnectionState = peer.iceConnectionState;
        if(iceConnectionState == 'failed' || iceConnectionState == 'disconnected' || iceConnectionState == 'closed') {
            delete mapPeers[peerUsername];
            if(iceConnectionState != 'closed') {
                peer.close();
            }
            removeVideo(remoteVideo);
        }
    });

    peer.addEventListener('icecandidate', (event) => {
        if(event.candidate) {
            console.log('new ice candidate', JSON.stringify(peer.localDescription));
            return;
        }
        sendSignal('new-answer', {
            'sdp':peer.localDescription,
            'reciever_channel_name':reciever_channel_name
        });
    });

    peer.setRemoteDescription(offer)
        .then(() => {
            console.log('remote description set successfully for person %s.',peerUsername);
            
            return peer.createAnswer();
        })
        .then(a => {
            console.log('answer created!');

            peer.setLocalDescription(a);
        })
}

function addLocalTracks(peer) {
    localStream.getTracks().forEach(track => {
        peer.addTrack(track,localStream);
    });
    return;
}

function dcOnMessage(event) {
    var msg = event.data;

    var li = document.createElement('li');
    li.appendChild(document.createTextNode(msg));
    msgList.appendChild(li);
}

function createVideo(peerUsername) {
    var videoContainer = document.querySelector('#video-container');

    var remoteVideo = document.createElement('video');
    remoteVideo.id = peerUsername + '-video';
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;

    var videoWrapper = document.createElement('div');

    videoContainer.appendChild(videoWrapper);

    videoWrapper.appendChild(remoteVideo);

    return remoteVideo;
}

function setOnTrack(peer, remoteVideo) {
    var remoteStream = new MediaStream();

    remoteVideo.srcObject = remoteStream;

    peer.addEventListener('track',async (event) => {
        remoteStream.addTrack(event.track, remoteStream);
    });
}

function removeVideo(video) {
    var videoWrapper = video.parentNode;
    videoWrapper.parentNode.removeChild(videoWrapper);
}

function getDataChannels() {
    var datachannels = [];

    for(peerUsername in mapPeers) {
        var datachannel = mapPeers[peerUsername][1];
        datachannels.push(datachannel);
    }

    return datachannels;
}