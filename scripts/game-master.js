//========== Constants ==========

const SERVER_HOST = 'vera.bassjansson.com';
const SERVER_PORT = 8888;

const LOCAL_NUMBER_ID = Math.floor(Math.random() * 9000) + 1000;
const LOCAL_PEER_ID = "gama" + LOCAL_NUMBER_ID.toString();

const LOCAL_STREAM_CONSTRAINTS = {
    audio: true,
    video: false
};


//========== Setup ==========

function setup()
{
    console.log("[Setup] Setting up Game Master.");

    $(function()
    {
        $('#button-retry-get-local-stream').click(getLocalStream);
        $('#button-connect').click(connectToVera);
        $('#button-disconnect').click(disconnectFromVera);
    })

    setupPeer();
}


//========== Setup Peer ==========

function setupPeer()
{
    console.log("[Peer] Setting up peer.");

    window.peer = new Peer(LOCAL_PEER_ID,
    {
        host: SERVER_HOST,
        port: SERVER_PORT
    });

    window.peer.on('open', function(id)
    {
        console.log("[Peer] Connected to peer server with ID: ", id);

        $('#span-game-master-id').text(LOCAL_NUMBER_ID);

        getLocalStream();
    });

    window.peer.on('disconnected', function()
    {
        console.log("[Peer] Disconnected from peer server, trying to reconnect.");

        peer.reconnect();
    });

    window.peer.on('error', function(error)
    {
        console.warn("[Peer] Received error: ", error);

        alert(error.message);
    });
}


//========== Setup MediaConnection ==========

function setupMediaConnection(mediaConnection)
{
    console.log("[MediaConnection] Setting up media connection.");

    showConnectedWithID(mediaConnection.peer);

    if (window.mediaConnection)
        window.mediaConnection.close();

    window.mediaConnection = mediaConnection;

    mediaConnection.on('stream', function(stream)
    {
        console.log("[MediaConnection] Received stream, setting stream of media object.");

        $('#span-connection-status').text("CONNECTED!");
        $('#span-connection-status').css('color', 'green');

        setStreamOfMediaObject(document.querySelector('#audio-vera'), stream);
    });

    mediaConnection.on('close', function()
    {
        console.log("[MediaConnection] Connection closed, trying to connect again.");

        showEstablishConnection();
    });

    mediaConnection.on('error', function(error)
    {
        console.warn("[MediaConnection] Received error: ", error);

        alert(error.message);
    });
}


//========== Connect to Vera ==========

function connectToVera()
{
    console.log("[Connect] Connecting to Vera.");

    $('#span-connection-status').text("CONNECTING...");
    $('#span-connection-status').css('color', 'red');

    var mediaConnection = window.peer.call("vera" + $('#input-vera-id').val(), window.localStream);

    setupMediaConnection(mediaConnection);
}

function disconnectFromVera()
{
    console.log("[Connect] Disconnecting from Vera.");

    window.mediaConnection.close();

    showEstablishConnection();
}


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

        console.log('[LocalStream] Got stream with constraints: ', LOCAL_STREAM_CONSTRAINTS);
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

function showGetLocalStream()
{
    $('#div-get-local-stream').show();
    $('#div-get-local-stream-error').hide();
    $('#div-establish-connection').hide();
    $('#div-connected').hide();
}

function showGetLocalStreamError()
{
    $('#div-get-local-stream-error').show();
}

function showEstablishConnection()
{
    $('#div-get-local-stream').hide();
    $('#div-establish-connection').show();
    $('#div-connected').hide();
}

function showConnectedWithID(id)
{
    $('#div-get-local-stream').hide();
    $('#div-establish-connection').hide();
    $('#div-connected').show();
    $('#span-vera-id').text(id);
}
