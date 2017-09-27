//========== Variables ==========

const SERVER_HOST = 'vera.bassjansson.com';
const SERVER_PORT = 8888;

const LOCAL_NUMBER_ID = Math.floor(Math.random() * 9000) + 1000;
const LOCAL_PEER_ID = "game-master" + LOCAL_NUMBER_ID.toString();

const LOCAL_STREAM_CONSTRAINTS = {
    audio: true,
    video: false
};

var videoVera = $('#video-vera');

var divGetLocalStream = $('#div-get-local-stream');
var divGetLocalStreamError = $('#div-get-local-stream-error');
var divEstablishConnection = $('#div-establish-connection');
var divConnected = $('#div-connected');

var spanGameMasterID = $('#span-game-master-id');
var spanVeraID = $('#span-vera-id');
var spanConnectionStatus = $('#span-connection-status');

var buttonRetryGetLocalStream = $('#button-retry-get-local-stream');
var buttonConnect = $('#button-connect');
var buttonDisconnect = $('#button-disconnect');

var inputVeraID = $('#input-vera-id');

var peer = null;


//========== Setup ==========

function setup()
{
    console.log("[Setup] Starting setup.");

    showSetup();

    peer = new Peer(LOCAL_PEER_ID,
    {
        host: SERVER_HOST,
        port: SERVER_PORT
    });

    peer.on('open', onPeerOpen);
    peer.on('call', onPeerMediaConnection);
    peer.on('disconnected', onPeerDisconnected);
    peer.on('error', onPeerError);

    buttonRetryGetLocalStream.addEventListener('click', getLocalStream);
    buttonConnect.addEventListener('click', connectToVera);
    buttonDisconnect.addEventListener('click', disconnectFromVera);

    console.log("[Setup] Setup finished.");
}


//========== Peer Events ==========

var onPeerOpen = function(id)
{
    console.log("[Peer] Connected to peer server.");

    spanGameMasterID.text(id);

    getLocalStream();
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


//========== Connect to Vera ==========

var connectToVera = function()
{
    console.log("[Connect] Connecting to Vera.");

    var mediaConnection = peer.call(inputVeraID.val(), window.localStream);

    setupMediaConnection(mediaConnection);
}

var disconnectFromVera = function()
{
    console.log("[Connect] Disconnecting from Vera.");

    window.mediaConnection.close();

    showEstablishConnection();
}


//========== Setup MediaConnection ==========

function setupMediaConnection(mediaConnection)
{
    console.log("[MediaConnection] Setup media connection.");

    if (window.mediaConnection)
        window.mediaConnection.close();

    window.mediaConnection = mediaConnection;

    mediaConnection.on('stream', onMediaConnectionStream);
    mediaConnection.on('close', onMediaConnectionClose);
    mediaConnection.on('error', onMediaConnectionError);

    spanVeraID.text(mediaConnection.peer);

    showConnected();
}


//========== MediaConnection Events ==========

var onMediaConnectionStream = function(stream)
{
    console.log("[MediaConnection] Received stream, setting stream of media object.");

    spanConnectionStatus.text("CONNECTED!");
    spanConnectionStatus.style.color('green');

    setStreamOfMediaObject(videoVera, stream);
};

var onMediaConnectionClose = function()
{
    console.log("[MediaConnection] Connection closed, trying to connect again.");

    spanConnectionStatus.text("RECONNECTING...");
    spanConnectionStatus.style.color('red');

    connectToVera();
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

        showEstablishConnection();
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
    divEstablishConnection.hide();
    divConnected.hide();
}

function showGetLocalStream()
{
    divGetLocalStream.show();
    divGetLocalStreamError.hide();
    divEstablishConnection.hide();
    divConnected.hide();
}

function showGetLocalStreamError()
{
    divGetLocalStreamError.show();
}

function showEstablishConnection()
{
    divGetLocalStream.hide();
    divEstablishConnection.show();
    divConnected.hide();
}

function showConnected()
{
    divGetLocalStream.hide();
    divEstablishConnection.hide();
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
