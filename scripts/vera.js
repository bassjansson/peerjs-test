//========== Variables ==========

const SERVER_HOST = '/';
const SERVER_PORT = 8888;

const LOCAL_NUMBER_ID = Math.floor(Math.random() * 9000) + 1000;
const LOCAL_FULL_ID = "vera" + LOCAL_NUMBER_ID.toString();

const LOCAL_STREAM_CONSTRAINTS = {
    audio: true,
    video: true
};

var audioGameMaster = $('#audio-game-master');

var divGetLocalStream = $('#div-get-local-stream');
var divGetLocalStreamError = $('#div-get-local-stream-error');
var divWaitForConnection = $('#div-wait-for-connection');
var divConnected = $('#div-connected');

var spanVeraID = $('#span-vera-id');
var spanGameMasterID = $('#span-game-master-id');

var buttonRetryGetLocalStream = $('#button-retry-get-local-stream');

var peer = null;


//========== Setup ==========

function setup()
{
    console.log("[Setup] Starting setup.");

    showSetup();

    spanVeraID.text(LOCAL_NUMBER_ID);

    peer = new Peer(LOCAL_FULL_ID,
    {
        host: SERVER_HOST,
        port: SERVER_PORT
    });

    peer.on('open', onPeerOpen);
    peer.on('call', onPeerMediaConnection);
    peer.on('disconnected', onPeerDisconnected);
    peer.on('error', onPeerError);

    buttonRetryGetLocalStream.addEventListener('click', getLocalStream);

    console.log("[Setup] Setup finished.");
}


//========== Peer Events ==========

var onPeerOpen = function()
{
    console.log("[Peer] Connected to peer server.");

    getLocalStream();
};

var onPeerMediaConnection = function(mediaConnection)
{
    console.log("[Peer] Received media connection.");

    if (window.mediaConnection)
        window.mediaConnection.close();

    window.mediaConnection = mediaConnection;

    mediaConnection.answer(window.localStream);
    mediaConnection.on('stream', onMediaConnectionStream);
    mediaConnection.on('close', onMediaConnectionClose);
    mediaConnection.on('error', onMediaConnectionError);

    spanGameMasterID.text(mediaConnection.peer);

    showConnected();
};

var onPeerDisconnected = function()
{
    console.log("[Peer] Disconnected from peer server.");

    peer.reconnect();
};

var onPeerError = function(error)
{
    console.warn("[Peer] Received error: ", error);

    alert(error.message);
};


//========== MediaConnection Events ==========

var onMediaConnectionStream = function(stream)
{
    console.log("[MediaConnection] Received stream.");

    setStreamOfMediaObject(audioGameMaster, stream);
};

var onMediaConnectionClose = function()
{
    console.log("[MediaConnection] Connection closed.");

    showWaitForConnection();
};

var onMediaConnectionError = function(error)
{
    console.warn("[MediaConnection] Received error: ", error);

    alert(error.message);
};


//========== Get Local Stream ==========

function getLocalStream()
{
    showGetLocalStream();

    function handleSuccess(stream)
    {
        window.localStream = stream;

        stream.oninactive = function()
        {
            console.log('[LocalStream] Stream got inactive.');
        };

        console.log('[LocalStream] Got stream with constraints: ', stream.constraints);
        console.log('[LocalStream] Stream uses audio device: ', stream.getAudioTracks()[0].label);

        showWaitForConnection();
    }

    function handleError(error)
    {
        console.log('[LocalStream] Error while getting stream: ', error);

        showGetLocalStreamError();
    }

    navigator.mediaDevices
        .getUserMedia(LOCAL_STREAM_CONSTRAINTS)
        .then(handleSuccess)
        .catch(handleError);
}


//========== Show HTML Elements ==========

function showSetup()
{
    divGetLocalStream.hide();
    divWaitForConnection.hide();
    divConnected.hide();
}

function showGetLocalStream()
{
    divGetLocalStream.show();
    divGetLocalStreamError.hide();
    divWaitForConnection.hide();
    divConnected.hide();
}

function showGetLocalStreamError()
{
    divGetLocalStreamError.show();
}

function showWaitForConnection()
{
    divGetLocalStream.hide();
    divWaitForConnection.show();
    divConnected.hide();
}

function showConnected()
{
    divGetLocalStream.hide();
    divWaitForConnection.hide();
    divConnected.show();
}


//========== Utils ==========

function setStreamOfMediaObject(mediaObject, stream)
{
    // Older browsers may not have srcObject
    if ("srcObject" in mediaObject)
    {
        mediaObject.srcObject = stream;
    }
    else
    {
        // Avoid using this in new browsers, as it is going away
        mediaObject.src = window.URL.createObjectURL(stream);
    }
}
