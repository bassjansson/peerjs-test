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
