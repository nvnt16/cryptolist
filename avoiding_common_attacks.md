Avoiding Common Attacks
===================

Now that Solidity has been distributed to a large audience around the world and has been adopted by a plathora of Smart Contracts, developers have learnt their lessons time and time again about leaving their code vulnerable to attacks. Listed below are some of the pitfalls and ways how CryptoList avoids them:

----------

### Re-Entrancy

Since external calls to a contract can be hijacked by attackers and they can in turn force the contract to execute further code through a fallback function or call backs to itself, this type of attack "re-enters" the code execution of the contract. The DAO hack is an infamous example of this type of attack. CryptoList does not make use of external calls for any functionality thus avoiding this common attack.

### Cross-function

Similar to Re-Entrancy, an attacker can also hijack a contract when more than one function share the same state. Only way to avoid these is to finish the internal work before calling an external function. Calling external functions within internal functions is also a strict no-no. CryptoList does not make use of external calls for any functionality thus avoiding this common attack.

### Over/Under Flows

Only 90s kids will remember trying to overflow an 8-byte-long string into the next variable stored in the memory. Well, only the the 90s kids and everyone else because turns out you can over/under flow data types on the EVM and it's as straight forward to do so as it was in C back in the 90s. Turns out you can avoid this by using a mathematical library which replaces the standard math operators. Or you can be like CryptoList which does not make use of any math operations(except incrementations) and avoids this common attack.

### DoS with Block Gas Limit

Block gas limits are the maximum amount of gas allowed in a block to determine how many transactions can fit into a block. An infinite loop will quickly hit the block gas limit and then halt with an out of gas exception. CryptoList loops through a limited number of items thus avoiding this common attack.

### Logic Bugs

Simple programming mistakes can cause the contract to behave differently to its stated rules, especially on 'edge cases'. CryptoList mitigates these risks by:

- Following Solidity coding standards and general coding best practices for safety-critical software.
- Avoiding overly complex rules (even at the cost of some functionality).
- Avoiding complicated implementation (even at the cost of some gas).

### Exposed Secrets

All code and data on the blockchain is visible by anyone, even if not marked as "public" in Solidity. Contracts that attempt to rely on keeping keys or behaviour secret are in for a surpsise. CryptoList mitigates these risks by ensuring that the contracts do not rely on any secret information.