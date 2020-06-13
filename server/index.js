const express = require('express'); // import express for server
const bodyParser = require('body-parser'); // import body parser to read json bodies
const cors = require('cors'); // cors to allow front-end to call backend
const formidable = require('formidable'); // formidable to parse formData from front-end

// added by Jason begin:

// .env file for private key management
const env = require('dotenv').config();
const privateKey = process.env.PRIVATE_KEY;
const myAccount = process.env.MY_ACCOUNT;
// importing sha-256
const sha256  = require('js-sha256');
// importintg web3 for smart contracts
const web3 = require('web3');
// sets up our HTTP connection to our local blockchain
const provider = new web3.providers.HttpProvider('http://localhost:8545');

// sets up web3 to use that http connection (aka provider)
const web3Conn = new web3(provider);

const account = web3Conn.eth.accounts.privateKeyToAccount("") // from ganache-cli terminal "Private Keys" or metamask/.env file
web3Conn.eth.accounts.wallet.add(account);
web3Conn.eth.defaultAccount = account.address;

// using the filesystem module to read in the json interface for our smart contract
const fs = require('fs');

// json interface is a byte buffer (Buffer object)
const jsonInterface = fs.readFileSync('../build/contracts/VideoAuth.json');

// convert the Buffer into a JSON string
const jsonString = jsonInterface.toString();

// parsing our jsonString into an object interface to pass to web3
const jsonObject = JSON.parse(jsonString);

// create a RPC to the actual smart contract called videoAuth using contract ABI
const videoAuth = new web3Conn.eth.Contract(jsonObject.abi, "0x2eA802Ed11B849723bB73Ff8C006D6C29d0a7650"); // from truffele migrate contract address or Rinkeby

// console.log(videoAuth.methods);

// added by Jason end

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
            //console.log(contents)

            // TODO: run the crypto hash function on the string
            // and put that hash onto the smart contract
            try{            
                const video_hash = sha256(contents);
                console.log(video_hash);

                    app.get("/api", async (req, res) => {
                        //console.log("Inside app.get"); // does not come here automatically, must hit Enter in the localhost:8080/api URL bar
                        compare_hash = await videoAuth.methods.compare_hash(video_hash).call();
                        console.log(compare_hash);
                        if(compare_hash == 0){
                        const store_hash = await videoAuth.methods.store_hash(video_hash).send({ // will fail without provided gas
                            from: "", // from ganache-cli terminal "Available Accounts" or metamask/.env file
                            gas: "250000", // not quite sure how to calculate these numbers
                            gasPrice: "20000000" // not quite sure how to calculate these numbers
                        }); 
                        console.log("Stored");
                    }
                    else{
                        console.log("Video is authentic\n");
                    }
                        res.status(200).json({ // 200 means success
                            response: compare_hash
                        })
                    })
                }
                catch(err){
                    response.status(400).json({
                        response: "Upload not successful"
                    });
                }
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