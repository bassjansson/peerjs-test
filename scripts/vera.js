//========== Constants ==========

const SERVER_HOST = 'vera.bassjansson.com';
const SERVER_PORT = 8888;

const LOCAL_NUMBER_ID = Math.floor(Math.random() * 9000) + 1000;
const LOCAL_PEER_ID = "vera" + LOCAL_NUMBER_ID.toString();

const LOCAL_STREAM_CONSTRAINTS = {
    audio: true,
    video: true
};


//========== Setup ==========

function setup()
{
    console.log("[Setup] Setting up Vera.");

    $(function()
    {
        $('#button-retry-get-local-stream').click(getLocalStream);
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

        $('#span-vera-id').text(LOCAL_NUMBER_ID);

        getLocalStream();
    });

    window.peer.on('call', function(mediaConnection)
    {
        console.log("[Peer] Received media connection, setting up media connection.");

        mediaConnection.answer(window.localStream);

        setupMediaConnection();
    });

    window.peer.on('disconnected', function()
    {
        console.log("[Peer] Disconnected from peer server, trying to reconnect.");

        window.peer.reconnect();
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

        setStreamOfMediaObject($('#audio-game-master'), stream);
    });

    mediaConnection.on('close', function()
    {
        console.log("[MediaConnection] Connection closed, waiting for connecting again.");

        showWaitForConnection();
    });

    mediaConnection.on('error', function(error)
    {
        console.warn("[MediaConnection] Received error: ", error);

        alert(error.message);
    });
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

function showGetLocalStream()
{
    $('#div-get-local-stream').show();
    $('#div-get-local-stream-error').hide();
    $('#div-wait-for-connection').hide();
    $('#div-connected').hide();
}

function showGetLocalStreamError()
{
    $('#div-get-local-stream-error').show();
}

function showWaitForConnection()
{
    $('#div-get-local-stream').hide();
    $('#div-wait-for-connection').show();
    $('#div-connected').hide();
}

function showConnectedWithID(id)
{
    $('#div-get-local-stream').hide();
    $('#div-wait-for-connection').hide();
    $('#div-connected').show();
    $('#span-game-master-id').text(id);
}
