const erc725 = artifacts.require("ERC725");
const erc735 = artifacts.require("ERC735");
const claimHolderLibrary = artifacts.require("ClaimHolderLibrary");
const keyHolderLibrary = artifacts.require("KeyHolderLibrary");
const claimHolder = artifacts.require("ClaimHolder");
const keyHolder = artifacts.require("KeyHolder");



module.exports = function (deployer, network, accounts) 
{
  // deploy keyHolderLibrary -> claimHolderLibrary -> keyHolder -> claimHolder

  return deployer
  .then(() => {
    return deployer.deploy(keyHolderLibrary);
  })
  .then(() => {
    deployer.link(keyHolderLibrary, keyHolder);
    return deployer.deploy(keyHolder);
  })
  .then(() => {
    deployer.link(keyHolderLibrary, claimHolderLibrary);
    return deployer.deploy(claimHolderLibrary);
  }).then(() => {
    deployer.link(keyHolderLibrary, claimHolder);
    deployer.link(claimHolderLibrary, claimHolder);
    return deployer.deploy(claimHolder);
  });
  

  // return deployer.deploy(claimHolderFactory);
}