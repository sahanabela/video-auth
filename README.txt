##################################################################################

To run this software using a simulated Ethereum blockchain
you will need 4 separate terminals open

##################################################################################

// Terminal 1

cd ~/video-auth/client
npm init
npm install react-with-firebase-auth
npm install firebase-config -g
npm install react react-dom
npm install axios
npm install react-scripts@1.1.1
npm start

// Terminal 2

# install ganache stuff https://www.trufflesuite.com/docs/ganache/quickstart
ganache-cli -p 8545

##################################################################################

Take note of one of the Available Accounts and 
its corresponding Private Key

##################################################################################

// Terminal 3

truffle migrate
truffle deploy
truffle console -p 8545

##################################################################################

Take note of one of the contract address. 
Go into the index.js file in the server folder 
and update the Available Account, Private Key, 
and Contract Address with the newly generated
ones

##################################################################################

// Terminal 4

npm install express
npm install body-parser
npm install cors
npm install formidable
npm install web3
npm install js-sha256
nodemon \index.js

##################################################################################

After uploading the file and pressing submit on 
localhost:3000, go to localhost:8088/api, and 
you should see the file's hash and whether or not 
the hash exists on the Ethereum blockchain. 

To verify, you can query the blockchain directly by 
going to Terminal 3 and entering the following:

instance=await VideoAuth.at(VideoAuth.address)
VideoAuth.deployed().then(function(instance){return instance.compare_hash.call("abc")})

##################################################################################
