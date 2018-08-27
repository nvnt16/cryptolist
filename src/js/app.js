App = {
  web3Provider: null,
  ipfsProvider: 'ipfs.infura.io',
  ipfs: null,
  contracts: {},
  account: 0x0,
  loading: false,
  imageUpload: $("#imageUpload"),

  init: function () {
    return App.initWeb3();
  },

  initIPFS: function () {
    App.ipfs = window.IpfsApi(App.ipfsProvider, '5001', { protocol: 'https' });
  },

  initWeb3: function () {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider(
        'http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }
    App.initIPFS();
    App.displayAccountInfo();
    App.uploadImage();
    return App.initContract();
  },

  displayAccountInfo: function () {
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#account").text(account);
        web3.eth.getBalance(account, function (err, balance) {
          if (err === null) {
            $("#accountBalance").text(web3.fromWei(balance, "ether") +
              " ETH");
          }
        });
      }
    });
  },

  initContract: function () {
    $.getJSON('./build/contracts/CryptoList.json', function (cryptoListArtifact) {
      // Get the necessary contract artifact file and use it to instantiate a truffle contract abstraction.
      App.contracts.CryptoList = TruffleContract(cryptoListArtifact);

      // Set the provider for our contract.
      App.contracts.CryptoList.setProvider(App.web3Provider);

      // Listen for events
      App.reloadItems();
      // Retrieve the item from the smart contract
      return App.listenToEvents();
    });

  },

  reloadItems: function () {
    // avoid reentry
    if (App.loading) {
      return;
    }
    App.loading = true;
    // refresh account information because the balance may have changed

    var cryptoListInstance;

    App.contracts.CryptoList.deployed().then(function (instance) {
      cryptoListInstance = instance;
      return cryptoListInstance.getItemsForSale();
    }).then(function (itemIds) {
      // Retrieve and clear the item placeholder
      var itemsRow = $('#itemsRow');
      itemsRow.empty();

      for (var i = itemIds.length; i >= 0; i--) {
        var itemId = itemIds[i];
        cryptoListInstance.items(itemId).then(function (item) {
          console.log(item);
          App.displayItem(
            item[0],
            item[1],
            item[3],
            item[4],
            item[5],
            item[6]
          );
        });
      }
      App.loading = false;
    }).catch(function (err) {
      console.log(err.message);
      App.loading = false;
    });
  },

  openImage: function (ipfshash) {
    var ipfsURL = "https://" + App.ipfsProvider + "/ipfs/" + ipfshash;
    window.open(ipfsURL, '_blank');
  },

  displayItem: function (id, seller, name, description, price, ipfsHash) {
    // Retrieve the item placeholder
    if(ipfsHash == "" || $.trim(ipfsHash).length < 46 ) {
      ipfsHash = "QmdrA4mUBg6bKnhhkTXBkbpEfEeqwTZLdBwi11Hx9Q5VhF";
    }
    var itemsRow = $('#itemsRow');

    var etherPrice = web3.fromWei(price, "ether");
    var ipfsUrl = "https://" + App.ipfsProvider + "/ipfs/" + ipfsHash;
    // Retrieve and fill the item template
    var itemTemplate = $('#itemTemplate');
    itemTemplate.find('.panel-title').text(name);
    itemTemplate.find("#uploadedImage").attr("src", ipfsUrl);
    itemTemplate.find("#uploadedImage").attr("onclick", 'App.openImage(' + '"' + ipfsHash + '"' + ')');
    itemTemplate.find('.item-description').text(description);
    itemTemplate.find('.item-price').text(etherPrice + " ETH");
    itemTemplate.find('.btn-buy').attr('onclick', 'App.buyItem(' + id  + ',' + etherPrice + ')');
    // itemTemplate.find('.btn-buy').attr('data-id', id);
    // itemTemplate.find('.btn-buy').attr('data-value', etherPrice);

    // seller?
    if (seller == App.account) {
      itemTemplate.find('.item-seller').text("You");
      itemTemplate.find('.btn-buy').hide();
    } else {
      itemTemplate.find('.item-seller').text(seller);
      itemTemplate.find('.btn-buy').show();
    }

    // add this new item
    itemsRow.append(itemTemplate.html());
  },

  uploadImage: function () {
    //image upload logic
    $("#imageUpload").on("change", function () {
      if ($("#imageUpload")[0].files.length != 0) {
        $.LoadingOverlay("show");
        let reader = new FileReader();
        reader.readAsArrayBuffer($("#imageUpload")[0].files[0]);
        reader.onloadend = function () {
          var buf = buffer.Buffer(reader.result);
          App.ipfs.files.add(buf, (err, result) => {
            console.log(result);
            $("#previewContainer").attr("src", "https://" + App.ipfsProvider + "/ipfs/" + result[0].hash);
            $("#previewContainer").attr('data-id', result[0].hash);
            hash = result[0].hash;
            $.LoadingOverlay("hide");
          });
        }
      }
    });
  },


  sellItem: function () {
    // retrieve details of the item
    var _item_name = $("#item_name").val();
    var _description = $("#item_description").val();
    var _price = web3.toWei(parseFloat($("#item_price").val() || 0),
      "ether");


    if ((_item_name.trim() == '') || (_price == 0)) {
      // nothing to sell
      return false;
    }
    App.contracts.CryptoList.deployed().then(function (instance) {
      return instance.sellItem(_item_name, _description, _price, $("#previewContainer").attr('data-id'), {
        from: App.account,
        gas: 500000
      });
    }).then(function (result) {

    }).catch(function (err) {
      console.error(err);
    });
  },

  clearSubmitForm: function () {
    //App.imageUpload.val('');
    $("#item_name").val('');
    $("#item_description").val('');
    $("#item_price").val('');
    var x = document.getElementById("snackbar");

    // Add the "show" class to DIV
    x.className = "show";

    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
  },
  // Listen for events raised from the contract
  listenToEvents: function () {
    App.contracts.CryptoList.deployed().then(function (instance) {
      instance.LogSellItem({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function (error, event) {
        $("#events").append('<li class="list-group-item">' + event.args
          ._name + ' is for sale' + '</li>');
        App.reloadItems();
      });

      instance.LogBuyItem({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function (error, event) {
        $("#events").append('<li class="list-group-item">' + event.args
          ._buyer + ' bought ' + event.args._name + '</li>');
        App.reloadItems();
      });
    });
  },

  buyItem: function (id, price) {

    // retrieve the item price
    var _itemId = id;
    var _price = parseFloat(price);

    App.contracts.CryptoList.deployed().then(function (instance) {
      return instance.buyItem(_itemId, {
        from: App.account,
        value: web3.toWei(_price, "ether"),
        gas: 500000
      });
    }).then(function (result) {

    }).catch(function (err) {
      console.error(err);
    });
  },
};

$(function () {
  $(window).ready(function (e) {
    App.init();
  });
});