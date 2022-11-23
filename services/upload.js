if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const { BlockBlobClient } = require('@azure/storage-blob')
    , getStream = require('into-stream')
    , containerName = process.env.AZURE_STORAGE_CONTAINER_NAME
    ;

const uploadFile = async (req, name) => {
    const blobName = name;
    const blobService = new BlockBlobClient(process.env.AZURE_STORAGE_CONNECTION_STRING, containerName, blobName);
    try {
        const stream = getStream(req.file.buffer);
        const streamLength = req.file.buffer.length;
        await blobService.uploadStream(stream, streamLength);
        
    } catch (error) {
        console.log(error);
    }
}

module.exports = uploadFile;
