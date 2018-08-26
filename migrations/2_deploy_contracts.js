
var CryptoList = artifacts.require("./CryptoList.sol");
var LibraryDemo = artifacts.require("./LibraryDemo.sol");
var ImportLibrary = artifacts.require("./ImportLibrary.sol");

module.exports = function(deployer) {
  deployer.deploy(CryptoList);
  deployer.deploy(ImportLibrary).then(() => {
    deployer.deploy(LibraryDemo);
  });
  deployer.link(ImportLibrary, LibraryDemo); 
}; 
