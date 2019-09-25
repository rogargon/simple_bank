const ether = 10**18; // 1 ether = 1000000000000000000 wei

var SimpleBank = artifacts.require("SimpleBank");

module.exports = function(deployer) {
  deployer.deploy(SimpleBank, { value: 30 * ether });
};
