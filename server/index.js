
const express = require('express'); // import express for server
const bodyParser = require('body-parser'); // import body parser to read json bodies
const cors = require('cors'); // cors to allow front-end to call backend
const formidable = require('formidable'); // formidable to parse formData from front-end

const app = express(); // create new server instance
app.use(cors());  // allow port :3000 to call our backend on :8080 
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json()); // parse json bodies

// POST endpoint handler to handle file uploads
app.post('/api/upload', (request, response) => {
    const form = new formidable.IncomingForm();

    // big buffer array to store all parts of the original file
    const parts = []

    // sequence number to keep ordering of chunks
    let partNum = 0;


    // overriding the form handling
    // formidable has a default handler for handling parts of files uploaded
    // these defaults store to a file, which we don't want
    // by overriding we keep the file in memory (RAM) inside on writing to the disk
    form.onPart = ((part) => {
        // if there's no filename, it isn't a request we want to deal with
        // tbh not sure, google it for more documentation
        if (!part.filename) {
            form.handlePart(part);
            return;
        };

        // Event handlers for "new data", i.e. a new data "chunk" from the front-end
        // this chunk makes up a portion of the larger file
        // we keep it in a buffer with a sequence count (I don't think the sequence id is necessary)
        part.on('data', data => {
            parts.push({
                Buffer: data, // the data buffer itself
                Id: partNum++ // the sequence number
            });
        });


        // Event handler for the end of the data stream, i.e. all chunks have been sent
        // no more data for us to handle (meaning .on('data') won't be called again for this file)
        part.on('end', () => {
            // concats all buffers into a single buffer
            // the big buffer represents the concatentation of all the chunks
            // and is the bit/byte representation of the original file
            const buff = Buffer.concat(parts.map(part => part.Buffer));
            const filename = part.filename; // we can use the original file name if we care

            // cast the buffer into a string
            // this is human readable if the internal data isn't encoded
            // i.e. *.txt file uploads will be readable, can't say the same for .docx and .pdf
            const contents = buff.toString();

            // logs the contents to console
            console.log(contents)

            // TODO: run the crypto hash function on the string
            // and put that hash onto the smart contract


            // send response back to front-end showing success
            response.status(200).json({
                response: "Upload success"
            });
        })
    });

    // after defining the form handlers, ask the form to parse the incoming request
    // keep in mind the form doesn't automatically know what to parse
    // so the code we ran above won't run if we don't the form to run it on the request
    form.parse(request);
})

// Binds server to port 8080
app.listen(8080, () => {
    console.log('Creating server running on port 8080');
})