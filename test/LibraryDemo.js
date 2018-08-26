var LibraryDemo = artifacts.require("./LibraryDemo.sol");

contract('LibraryDemo', function(accounts){

const owner = accounts[0];
const num1 = 4;
const num2 = 9;
const result = 13;

var contract;

beforeEach(function() {
   return LibraryDemo.new({from: owner})
   .then(function(instance) {
      contract = instance;
   });
});

it("thatSum(): Sums up two numbers using the library function", async () => {
  contract.thatSum(num1, num2)
    .then(data => {assert.equal(data.toNumber(), result, 'Summing up 9 and 4 should equal 13 with library');});
});

it("thisSum(): Sums up two numbers using normal addition", async () => {
  contract.thisSum(num1, num2)
    .then(data => {assert.equal(data.toNumber(), result, 'Summing up 9 and 4 should equal 13 without library as well');});
});

});