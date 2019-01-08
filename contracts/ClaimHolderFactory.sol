pragma solidity ^0.4.24;

import './ClaimHolder.sol';

contract ClaimHolderFactory {

  event newContractCreated(address contractAddress);

  function createClaimHolder()
  public
  returns (address)
  { 
    
    address newContractAddress = new ClaimHolder();
    
    return newContractAddress;
  }
}
