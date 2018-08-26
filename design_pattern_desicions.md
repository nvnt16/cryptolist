Design Pattern Decisions
===================
A contract once deployed to the Ethereum blockchain, are essentially set in stone. This means if a serious bug or issue appears and your contracts aren’t designed in a way that will allow them to be upgraded in your Dapp seamlessly, you will leave you contract open to malicious use. By using common design patterns a programmer can ensure that formalized best practices in security, maintenance and ownership are being followed. Some of the common design patterns that CryptoList uses are:

----------

### Lock pragmas to specific compiler version

Contracts should be deployed with the same compiler version that they have been tested the most with. Locking the pragma helps ensure that contracts do not accidentally get deployed using the latest compiler which may have higher risks of undiscovered bugs. Contracts may also be deployed by others and the pragma indicates the compiler version intended by the original authors. Cryptolist uses solidity 0.4.24 .

```
pragma solidity 0.4.24;
```

### Ownership

Ownership pattern is implemented using a modifier which controls access to smart-contract. The onlyOwner modifier limits access to certain functions like pausing and killing the smart contract to only the owner of the contract. CryptoList implements this pattern to be able to pause or kill the contract at a future date.

```
modifier onlyOwner() {
    require (msg.sender == owner);
    _;
}
```

 ### Fail fast, fail often

Require statements and modifiers are used wherever possible in lieu of if statements. CryptoList implements this pattern to make use of Solidity modifiers and follow DRY (don't repeat yourself).

```
modifier counterNotZero() {
    require(itemCounter > 0);
    _;
}
```

### Mapping Iterator

Mappings in Solidity cannot be iterated and they only store values. CryptoList implements this pattern as it needs to keep track of items being bought/sold and iterate through the mapping when rendering the UI.

```
mapping (uint => Item) public items;
uint itemCounter;
```

### circuit breaker

The circuit breaker pattern allows the owner to disable or enable a contract by a runtime toggle. CryptoList implements this pattern to stop buying/selling of items in case it is spammed with unwanted/illegal items.

```
modifier isHalted() {
    require(isPaused == false);
    _;
}
```

```
function toggleContractActive() public onlyOwner {
    isPaused = !isPaused;
}
```

### Kill switch

This pattern is used for terminating a contract, which means removing it forever from the blockchain. Once destroyed, it’s not possible to invoke functions on the contract and no transactions will be logged in the ledger. CryptoList implements this pattern so that if any unwanted/illegal items are bought/sold and authorities want to take it down, the owner can pull the kill switch instantly.

```
function kill() public onlyOwner {
    selfdestruct(owner);
}
```
