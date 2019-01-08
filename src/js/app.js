App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: async function() {
    
    return await App.initWeb3();
  },

  initWeb3: async function() {
    if (web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider); 
    } else {
        // Set the provider you want from Web3.providers
        App.web3Provider = new Web3.providers.HttpProvider("http://localhost:8545");
        web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {

    $.getJSON("ClaimHolderFactory.json", function(claimHolderFac){
      App.contracts.ClaimHolderFactory = TruffleContract(claimHolderFac);
      App.contracts.ClaimHolderFactory.setProvider(App.web3Provider);
    });

    return App.render();
  },

  render: function() {

    var networkId = parseInt(web3.currentProvider.networkVersion);
    
    
    
    if(networkId){
      switch (networkId) {
        case 1:
          network = 'mainnet';
          var networkDisplay = new Vue({
            el: '#networkDisplay',
            data: {network: 'Mainnet'}
          });
          
          break
        case 3:
          network = 'ropsten';
          var networkDisplay = new Vue({
            el: '#networkDisplay',
            data: {network: 'Ropsten'}
          });
          
          break
        case 4:
        network = 'rinkeby';
          var networkDisplay = new Vue({
            el: '#networkDisplay',
            data: {network: 'Rinkeby'}
          });
          break
        case 42:
          network = 'kovan';
          var networkDisplay = new Vue({
            el: '#networkDisplay',
            data: {network: 'Kovan'}
          });
            break
        default:
          network = 'localhost';
          var networkDisplay = new Vue({
            el: '#networkDisplay',
            data: {network: 'localhost'}
          });
      }
      
    }else{
      var networkDisplay = new Vue({
        el: '#networkDisplay',
        data: {network: 'No network'}
      });
    }
    

    web3.eth.getAccounts((err, res) => {
      if(res){
        if (res == ""){
          var networkDisplay = new Vue({
              el: '#diplayAccount',
              data: {ethAccount: "Can't found any account, please check your provider configuration"}
            });
        }else{
          account = res[0];
          var networkDisplay = new Vue({
              el: '#diplayAccount',
              data: {ethAccount: res[0]}
            }); 
        }
      }
    });
    // .then(function(){
    //   var url = '/getIdentityByEthAccount/' + network + '/' + account;

    //   $.ajax({
    //     url: url,
    //     type: 'GET',
    //     success: (data) => {
    //       for(var i = 0; i < data.length; i ++){
    //         var name = data[i].identity.name;
    //         var id = data[i]._id;
    //         var thumbnail = `<div class="idThumbnail" id="${id}" onclick="IdThumbnailClicked(this)"><div>${name}</div></div>`;
    //         $("#idArray").prepend(thumbnail);
    //       }
    //     }
    //   });

    // });

    return App.bindEvents();
  },

  bindEvents: function() {
    $("#addIdBtn").click(App.handleAddIdBtn);
    $("#overlay").click(App.overlayClicked);
    $("#idFormBtn").click(App.SendIdForm);
    $("#sayHello").click(App.SayHello)
  },

  handleAddIdBtn: function() {
    $("#IdentityFormContainer").css("display", "flex");
    $("#overlay").css("display", "block");
  },

  overlayClicked: function() {
    $("#overlay").css("display", "none");
    $("#IdentityFormContainer").css("display", "none");
    $("#IdName").val("");
  },

  SendIdForm: function() {

    var claimHolderFactoryInstance;
    var name = $("#IdName").val();
    $("#IdName").val("");
    $("#IdentityFormContainer").css("display", "none");
    $("#overlay").css("display", "none");

    if(!name){
      console.log("input your name!")
      $("#errorMsg").css("display", "block");
    }else{
      $("#loader").css("display", "flex");
      App.contracts.ClaimHolderFactory.deployed().then(function(instance){
        claimHolderFactoryInstance = instance;
        return claimHolderFactoryInstance.createClaimHolder();
      }).then(function(result){
        console.log("claimHolder address:" + result.receipt.logs[0].address);
        console.log("Management key:" + result.receipt.logs[0].topics[1]);
        $("#loader").css("display", "none");
      }).catch(function(err){
        console.log(err);
        $("#loader").css("display", "none");
      });
    }
  },

  SayHello: function() {

    $.ajax({
      url: "https://small-obi-1179.lolipop.io/sayHello",
      type: "GET",
      dataType: 'json',
      success: function(data){
        console.log(data);
      }
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
