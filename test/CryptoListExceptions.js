// contract to be tested
var CryptoList = artifacts.require("./CryptoList.sol");

// test suite
contract( "CryptoList", function(accounts){
  var cryptoListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var itemName = "item 1";
  var itemDescription = "Description for item 1";
  var itemPrice = 10;
  var itemIPFSHash = "qwertyuiop";

  // no item for sale yet
  it("function buyItem(): Should throw an exception if you try to buy an item when there is no item for sale yet", function() {
    return CryptoList.deployed().then(function(instance) {
      cryptoListInstance = instance;
      return cryptoListInstance.buyItem(1, {
        from: buyer,
        value: web3.toWei(itemPrice, "ether")
      });
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return cryptoListInstance.getNumberOfItems();
    }).then(function(data) {
      assert.equal(data.toNumber(), 0, "number of items must be 0");
    });
  });

  // buy an item that does not exist
  it("functions buyItem(), sellItem(): Should throw an exception if you try to buy an item that does not exist", function(){
    return CryptoList.deployed().then(function(instance){
      cryptoListInstance = instance;
      return cryptoListInstance.sellItem(itemName, itemDescription, web3.toWei(itemPrice, "ether"), itemIPFSHash, { from: seller });
    }).then(function(receipt){
      return cryptoListInstance.buyItem(2, {from: seller, value: web3.toWei(itemPrice, "ether")});
    }).then(assert.fail)
    .catch(function(error) {
      assert(true);
    }).then(function() {
      return cryptoListInstance.items(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "item id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], itemName, "item name must be " + itemName);
      assert.equal(data[4], itemDescription, "item description must be " + itemDescription);
      assert.equal(data[5].toNumber(), web3.toWei(itemPrice, "ether"), "item price must be " + web3.toWei(itemPrice, "ether"));
      assert.equal(data[6], itemIPFSHash, "item IPFS hash must be " + itemIPFSHash);
    });
  });

  // buying an item you are selling
  it("function buyItem(): Should throw an exception if you try to buy your own item", function() {
    return CryptoList.deployed().then(function(instance){
      cryptoListInstance = instance;

      return cryptoListInstance.buyItem(1, {from: seller, value: web3.toWei(itemPrice, "ether")});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return cryptoListInstance.items(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "item id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], itemName, "item name must be " + itemName);
      assert.equal(data[4], itemDescription, "item description must be " + itemDescription);
      assert.equal(data[5].toNumber(), web3.toWei(itemPrice, "ether"), "item price must be " + web3.toWei(itemPrice, "ether"));
      assert.equal(data[6], itemIPFSHash, "item IPFS hash must be " + itemIPFSHash);
    });
  });

  // incorrect value
  it("function buyItem(): Should throw an exception if you try to buy an item for a value different from its price", function() {
    return CryptoList.deployed().then(function(instance){
      cryptoListInstance = instance;
      return cryptoListInstance.buyItem(1, {from: buyer, value: web3.toWei(itemPrice + 1, "ether")});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return cryptoListInstance.items(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "item id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], itemName, "item name must be " + itemName);
      assert.equal(data[4], itemDescription, "item description must be " + itemDescription);
      assert.equal(data[5].toNumber(), web3.toWei(itemPrice, "ether"), "item price must be " + web3.toWei(itemPrice, "ether"));
      assert.equal(data[6], itemIPFSHash, "item IPFS hash must be " + itemIPFSHash);
    });
  });

  // item has already been sold
  it("function buyItem(): Should throw an exception if you try to buy an item that has already been sold", function() {
    return CryptoList.deployed().then(function(instance){
      cryptoListInstance = instance;
      return cryptoListInstance.buyItem(1, {from: buyer, value: web3.toWei(itemPrice, "ether")});
    }).then(function(){
      return cryptoListInstance.buyItem(1, {from: web3.eth.accounts[0], value: web3.toWei(itemPrice, "ether")});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return cryptoListInstance.items(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "item id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], buyer, "buyer must be " + buyer);
      assert.equal(data[3], itemName, "item name must be " + itemName);
      assert.equal(data[4], itemDescription, "item description must be " + itemDescription);
      assert.equal(data[5].toNumber(), web3.toWei(itemPrice, "ether"), "item price must be " + web3.toWei(itemPrice, "ether"));
      assert.equal(data[6], itemIPFSHash, "item IPFS hash must be " + itemIPFSHash);
    });
  });
});
