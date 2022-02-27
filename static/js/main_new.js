console.log('in main.js')

var mapPeers = {};

var usernameInput = document.querySelector('#username')
var btnJoin = document.querySelector('#btn-join')

var username;

var webSocket;

function webSocketOnMsg(event) {
    console.log('in webSocketOnMsg')

    var parsedData = JSON.parse(event.data);
    var msg = parsedData['message']
    
    console.log('message:', msg);
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
    // webSocket.addEventListener('open', (e) => {
    //     console.log('connection opened! from websocket');
    //     webSocket.send(JSON.stringify({'message':'this is a message'}));
    // });
    // webSocket.addEventListener('message', webSocketOnMsg);
    // webSocket.addEventListener('close', (e) => {
    //     console.log('connection closed!');
    // });
    // webSocket.addEventListener('error', (e) => {
    //     console.log('error occured!');
    // });

    webSocket.onopen = function (e) {
        webSocket.send(JSON.stringify({"message": 'Sending message to server'}));
    };
    webSocket.onmessage = webSocketOnMsg;
    webSocket.onclose = function (e) {
        console.error('Chat socket closed');
    };
});