var CryptoList = artifacts.require("./CryptoList.sol");

// test suite
contract('CryptoList', function(accounts){
  var cryptoListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var itemName1 = "item 1";
  var itemDescription1 = "Description for item 1";
  var itemPrice1 = 10;
  var itemIPFSHash1 = "qwertyuiop";
  var itemName2 = "item 2";
  var itemDescription2 = "Description for item 2";
  var itemPrice2 = 20;
  var itemIPFSHash2= "asdfghjkl";
  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  it("functions getNumberOfItems(), getItemsForSale(): Should be initialized with empty values", function() {
    return CryptoList.deployed().then(function(instance) {
      cryptoListInstance = instance;
      return cryptoListInstance.getNumberOfItems();
    }).then(function(data) {
      assert.equal(data.toNumber(), 0, "number of items must be zero");
      return cryptoListInstance.getItemsForSale();
    }).then(function(data){
      assert.equal(data.length, 0, "there shouldn't be any item for sale");
    });
  });

  // sell a first item
  it("functions sellItem(), getNumberOfItems(), getItemsForSale(): Should let us sell a first item", function() {
    return CryptoList.deployed().then(function(instance){
      cryptoListInstance = instance;
      return cryptoListInstance.sellItem(
        itemName1,
        itemDescription1,
        web3.toWei(itemPrice1, "ether"),
        itemIPFSHash1,
        {from: seller}
      );
    }).then(function(receipt){
      // check event
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellItem", "event should be LogSellItem");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._name, itemName1, "event item name must be " + itemName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(itemPrice1, "ether"), "event item price must be " + web3.toWei(itemPrice1, "ether"));
      assert.equal(receipt.logs[0].args._ipfsHash, itemIPFSHash1, "event item IPFS hash must be " + itemIPFSHash1);

      return cryptoListInstance.getNumberOfItems();
    }).then(function(data) {
      assert.equal(data, 1, "number of items must be one");

      return cryptoListInstance.getItemsForSale();
    }).then(function(data) {
      assert.equal(data.length, 1, "there must be one item for sale");
      assert.equal(data[0].toNumber(), 1, "item id must be 1");

      return cryptoListInstance.items(data[0]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "item id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], itemName1, "item name must be " + itemName1);
      assert.equal(data[4], itemDescription1, "item description must be " + itemDescription1);
      assert.equal(data[5].toNumber(), web3.toWei(itemPrice1, "ether"), "item price must be " + web3.toWei(itemPrice1, "ether"));
      assert.equal(data[6], itemIPFSHash1, "item IPFS hash must be " + itemIPFSHash1);
    });
  });

  // sell a second item
  it("functions sellItem(), getNumberOfItems(), getItemsForSale(): Should let us sell a second item", function() {
    return CryptoList.deployed().then(function(instance){
      cryptoListInstance = instance;
      return cryptoListInstance.sellItem(
        itemName2,
        itemDescription2,
        web3.toWei(itemPrice2, "ether"),
        itemIPFSHash2,
        {from: seller}
      );
    }).then(function(receipt){
      // check event
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellItem", "event should be LogSellItem");
      assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id must be 2");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._name, itemName2, "event item name must be " + itemName2);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(itemPrice2, "ether"), "event item price must be " + web3.toWei(itemPrice2, "ether"));
      assert.equal(receipt.logs[0].args._ipfsHash, itemIPFSHash2, "event item IPFS hash must be " + itemIPFSHash2);

      return cryptoListInstance.getNumberOfItems();
    }).then(function(data) {
      assert.equal(data, 2, "number of items must be two");

      return cryptoListInstance.getItemsForSale();
    }).then(function(data) {
      assert.equal(data.length, 2, "there must be two items for sale");
      assert.equal(data[1].toNumber(), 2, "item id must be 2");

      return cryptoListInstance.items(data[1]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 2, "item id must be 2");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], itemName2, "item name must be " + itemName2);
      assert.equal(data[4], itemDescription2, "item description must be " + itemDescription2);
      assert.equal(data[5].toNumber(), web3.toWei(itemPrice2, "ether"), "item price must be " + web3.toWei(itemPrice2, "ether"));
      assert.equal(data[6], itemIPFSHash2, "item IPFS hash must be " + itemIPFSHash2);
    });
  });

  // buy the first item
  it("functions buyItem(), getNumberOfItems(), getItemsForSale(): Should buy an item", function(){
    return CryptoList.deployed().then(function(instance) {
      cryptoListInstance = instance;
      // record balances of seller and buyer before the buy
      sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();
      return cryptoListInstance.buyItem(1, {
        from: buyer,
        value: web3.toWei(itemPrice1, "ether")
      });
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogBuyItem", "event should be LogBuyItem");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "item id must be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._buyer, buyer, "event buyer must be " + buyer);
      assert.equal(receipt.logs[0].args._name, itemName1, "event item name must be " + itemName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(itemPrice1, "ether"), "event item price must be " + web3.toWei(itemPrice1, "ether"));
      assert.equal(receipt.logs[0].args._ipfsHash, itemIPFSHash1, "event item IPFS hash must be " + itemIPFSHash1);

      // record balances of buyer and seller after the buy
      sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      // check the effect of buy on balances of buyer and seller, accounting for gas
      assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + itemPrice1, "seller should have earned " + itemPrice1 + " ETH");
      assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - itemPrice1, "buyer should have spent " + itemPrice1 + " ETH");

      return cryptoListInstance.getItemsForSale();
    }).then(function(data){
      assert.equal(data.length, 1, "there should now be only 1 item left for sale");
      assert.equal(data[0].toNumber(), 2, "item 2 should be the only item left for sale");

      return cryptoListInstance.getNumberOfItems();
    }).then(function(data){
      assert.equal(data.toNumber(), 2, "there should still be 2 items in total");
    });
  });
});
