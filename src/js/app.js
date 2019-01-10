App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  network: '',
  serverDomain: 'https://small-obi-1179.lolipop.io/',
  claimHolderAddress: null,
  choosedThumbnail: null,

  init: async function() {
    $("#overlay").css("display", "block");
    $("#warningContainer").css("display", "block");
    return await App.initWeb3();
  },

  initWeb3: async function() {
    if (web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider); 
      $("#overlay").css("display", "none");
      $("#warningContainer").css("display", "none");
    } else {
      $("#overlay").css("display", "none");
      $("#warningContainer").css("display", "none");
      // Set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider("http://localhost:8545");
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {

    $.getJSON("ClaimHolder.json", function(claimHolder){
      App.contracts.ClaimHolder = TruffleContract(claimHolder);
      App.contracts.ClaimHolder.setProvider(App.web3Provider);
    });

    return App.render();
  },

  render: function() {

    var networkId = parseInt(web3.currentProvider.networkVersion);
    
    if(networkId){
      switch (networkId) {
        case 1:
          App.network = 'mainnet';
          var networkDisplay = new Vue({
            el: '#networkDisplay',
            data: {network: 'Mainnet'}
          });
          
          break
        case 3:
          App.network = 'ropsten';
          var networkDisplay = new Vue({
            el: '#networkDisplay',
            data: {network: 'Ropsten'}
          });
          
          break
        case 4:
          App.network = 'rinkeby';
          var networkDisplay = new Vue({
            el: '#networkDisplay',
            data: {network: 'Rinkeby'}
          });
          break
        case 42:
          App.network = 'kovan';
          var networkDisplay = new Vue({
            el: '#networkDisplay',
            data: {network: 'Kovan'}
          });
            break
        default:
          App.network = 'localhost';
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
    
    var url = App.serverDomain + 'getIdentityByEthAccount/' + App.network + '/' + web3.eth.coinbase;
    
    $.ajax({
      url: url,
      type: 'GET',
      success: (data) => {
        for(var i = 0; i < data.length; i ++){
          var name = data[i].identity.name;
          var id = data[i]._id;
          var thumbnail = `<div class="idThumbnail" id="${id}" onclick="App.IdThumbnailClicked(this)"><div>${name}</div></div>`;
          $("#idArray").prepend(thumbnail);
        }
      }
    });    
    
    return App.bindEvents();
  },

  bindEvents: function() {
    $("#addIdBtn").click(App.handleAddIdBtn);
    $("#overlay").click(App.overlayClicked);
    $("#idFormBtn").click(App.SendIdForm);
    $("#addKeyBtn").click(App.handleAddKeyBtn);
    $("#keyFormBtn").click(App.SendKeyForm);
    $("#addClaimBtn").click(App.handleAddClaimBtn);
    $("#claimFormBtn").click(App.SendClaimForm);
    // $("#sayHello").click(App.SayHello);

  },

  handleAddIdBtn: function() {
    $("#IdentityFormContainer").css("display", "flex");
    $("#overlay").css("display", "block");
  },

  overlayClicked: function() {
    $("#overlay").css("display", "none");
    $("#IdentityFormContainer").css("display", "none");
    $("#KeyFormContainer").css("display", "none");
    $("#ClaimFormContainer").css("display", "none");
    $("#IdName").val("");
  },

  SendIdForm: function() {


    var claimHolderInstance;
    var name = $("#IdName").val();

    $("#IdName").val("");
    $("#IdentityFormContainer").css("display", "none");
    $("#overlay").css("display", "none");
    $("#loader").css("display", "flex");

    App.contracts.ClaimHolder.new().then((inst) => {
      claimHolderInstance = inst;
      
      if(!name){
        console.log("input your name!")
        $("#errorMsg").css("display", "block");
      }else{
        $("#loader").css("display", "flex");

        var claimHolderAddress = claimHolderInstance.address;
        var IDdata = {
          "network": App.network,
          "ethAccount": web3.eth.coinbase,
          "identity": {
            "name": name,
            "claimHolderAddr": claimHolderAddress
          }
        };

        var url = App.serverDomain + 'storeId2DB';

        $.ajax({
          url: url,
          type: 'POST',
          data: IDdata,
          success: (result) => {
            var _id = result.createdId._id;
            var thumbnail = `<div class="idThumbnail" id="${_id}" onclick="App.IdThumbnailClicked(this)"><div>${name}</div></div>`;
            $("#idArray").prepend(thumbnail);

            return 
          }
        });

        $("#loader").css("display", "none");
      }

    }).catch((err) => {
      $("#loader").css("display", "none");
      console.log(err);
    });
    
  },

  IdThumbnailClicked: function(e){
    var tempid = App.choosedThumbnail;
    App.choosedThumbnail = e.id;
    var url = App.serverDomain + 'getDatasbyObjectId/' + App.choosedThumbnail;

    $("#" + tempid).css("background", "#fff");
    $("#" + App.choosedThumbnail).css("background", "#ccddee");

    $("#keyTable").html("");
    $("#claimTable").html("");

    $.ajax({
      url: url,
      type: 'GET',
      success: (data) => {
        App.claimHolderAddress = data.identity.claimHolderAddr;
        var claimHolderInstance = App.contracts.ClaimHolder.at(App.claimHolderAddress);

        claimHolderInstance.getKeysByPurpose(1).then((res) => {
          var key = res;

          for(var i = 0; i < key.length; i ++){
            var keyPurpose;
            var keyType;
            var keyData = key[i];
            
            var content = 
              `<tr class="keyRow">
                <td class="keyData">${keyData}</td>
              </tr>`;

            $("#keyTable").prepend(content);
          }

          // return claimHolderInstance.getKeysByPurpose(2);
        });

        claimHolderInstance.getKeysByPurpose(2).then((res) => {
          var key = res;

          for(var i = 0; i < key.length; i ++){
            var keyPurpose;
            var keyType;
            var keyData = key[i];
            
            var content = 
              `<tr class="keyRow">
                <td class="keyData">${keyData}</td>
              </tr>`;

            $("#keyTable").prepend(content);
          }
        });

        claimHolderInstance.getClaimIdsByTopic(1).then((res) => {
          var claim = res;

          for (var i = 0; i < claim.length; i++){

            var ClaimData = claim[i];

            var content = 
              `<tr class="claimRow">
                <td class="claimData">${ClaimData}</td>
              </tr>`;

            $("#claimTable").prepend(content);
          }
          
        }); 

        claimHolderInstance.getClaimIdsByTopic(2).then((res) => {
          var claim = res;

          for (var i = 0; i < claim.length; i++){

            var ClaimData = claim[i];

            var content = 
              `<tr class="keyRow">
                <td class="keyData">${ClaimData}</td>
              </tr>`;

            $("#claimTable").prepend(content);
          }
        }); 
      }
    });
          
    // claimHolderInstance.getKey(keyData).then((res) => {             
          
    //   var keyPurposeCode = res[0][0].c[0];
    //   var keyTypeCode = res[1].c[0];
      
    //   if (keyPurposeCode == 1){
    //       keyPurpose = "Management";
    //   }else if(keyPurposeCode == 2){
    //       keyPurpose = "Action";
    //   }

    //   if(keyTypeCode == 1){
    //     keyType = "ECDSA";
    //   }else if(keyTypeCode){
    //     keyType = "RSA";
    //   }

    // });

  },

  handleAddKeyBtn: function() {
    if(!App.claimHolderAddress){
      alert("Choose an Id!!");
    }else{
      $("#KeyFormContainer").css("display", "block");
      $("#overlay").css("display", "block");  
    }
    
  },

  SendKeyForm: function(){

    
    $("#KeyFormContainer").css("display", "none");
    $("#overlay").css("display", "none");
    $("#loader").css("display", "flex");
    
    var keyPurpose = parseInt($("#keyPurposeSelect").val());
    var keyType = parseInt($("#keyTypeSelect").val());
    var key = $("#keyData").val();

    if(key == ""){
      console.log("input keyData!");
      $("#loader").css("display", "none");
    }else{
      $("#keyData").val("");
      console.log(App.claimHolderAddress);
      var ClaimHolderInstance = App.contracts.ClaimHolder.at(App.claimHolderAddress);

      ClaimHolderInstance.addKey(web3.fromAscii(key), keyPurpose, keyType).then((res) => {
        console.log(res);
        var newKey = res.logs[0].args.key;
        var content = 
              `<tr class="keyRow">
                <td class="keyData">${newKey}</td>
              </tr>`;

            $("#keyTable").prepend(content);
        $("#loader").css("display", "none");
      }).catch((err) => {
        console.log(err);
        $("#loader").css("display", "none");
      });

    }

  },

  handleAddClaimBtn: function(){
    if(!App.claimHolderAddress){
      alert("Choose an Id!!");
    }else{
      $("#ClaimFormContainer").css("display", "block");
      $("#overlay").css("display", "block");  
    }
    
  },

  SendClaimForm: function(){
    
    var data = $("#dataData").val();
    $("#dataData").val("");
    
    $("#ClaimFormContainer").css("display", "none");
    $("#overlay").css("display", "none");
    $("#loader").css("display", "flex");

    try
    {
       var json = JSON.parse(data);
    }
    catch(e)
    {
       alert('invalid json');
       $("#loader").css("display", "none");
    }

    $("#dataData").val("");
    $("#uriData").val("");
    $("#KeyFormContainer").css("display", "none");
    $("#overlay").css("display", "none");
    $("#loader").css("display", "flex");

    if(!data){
      console.log("input your data!");
      $("#loader").css("display", "none");
    }else{
      // uint256 _topic, uint256 _scheme, address issuer, bytes _signature, bytes _data, string _uri
      data = JSON.stringify(data);

      var topic = parseInt($("#topicSelect").val());
      var scheme = parseInt($("#schemeSelect").val());
      var issuer = web3.eth.coinbase;
      var presign = issuer + topic + data;
      var signature = web3.sha3(presign);
      var uri = $("#uriData").val();
      $("#uriData").val("");
      

      var ClaimHolderInstance = App.contracts.ClaimHolder.at(App.claimHolderAddress);

      ClaimHolderInstance.addClaim(topic, scheme, issuer, signature, data, uri).then((res) => {
        console.log(res);
        var newClaimId = res.logs[0].args.claimId;
        var content = 
              `<tr class="keyRow">
                <td class="keyData">${newClaimId}</td>
              </tr>`;

            $("#claimTable").prepend(content);
        $("#loader").css("display", "none");
      }).catch((err) => {
        console.log(err);
        $("#loader").css("display", "none");
      });
      
    }
    
  },

  SayHello: function() {

    var url = App.serverDomain + 'sayHello';
    $.ajax({
      url: url,
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
