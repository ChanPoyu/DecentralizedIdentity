const erc725 = artifacts.require("ERC725");
const erc735 = artifacts.require("ERC735");
const claimHolderLibrary = artifacts.require("ClaimHolderLibrary");
const keyHolderLibrary = artifacts.require("KeyHolderLibrary");
const claimHolder = artifacts.require("ClaimHolder");
const keyHolder = artifacts.require("KeyHolder");
const claimHolderFactory = artifacts.require("ClaimHolderFactory");


module.exports = function (deployer, network, accounts) 
{
  // deploy keyHolderLibrary -> claimHolderLibrary -> keyHolder -> claimHolder

  return deployer
  .then(() => {
    return deployer.deploy(keyHolderLibrary);
  })
  .then(() => {
    deployer.link(keyHolderLibrary, claimHolderLibrary);
    return deployer.deploy(claimHolderLibrary);
  })
  .then(() => {
    deployer.link(claimHolderLibrary, claimHolderFactory);
    deployer.link(keyHolderLibrary, claimHolderFactory);
    return deployer.deploy(claimHolderFactory);
  });

  // return deployer.deploy(claimHolderFactory);
}