pragma solidity 0.4.24;

import "./ImportLibrary.sol";

contract LibraryDemo {
    function thatSum(uint256 a, uint256 b) public pure returns (uint256) {
        return ImportLibrary.sum(a, b);
    }

    function thisSum(uint256 a, uint256 b) public pure returns (uint256) {
        return a + b;
    }
}