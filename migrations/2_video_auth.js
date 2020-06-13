const VideoAuth = artifacts.require("./VideoAuth.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(VideoAuth, {from: accounts[0]});
};
