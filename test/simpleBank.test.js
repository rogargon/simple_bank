var SimpleBank = artifacts.require("./SimpleBank.sol");

const ether = 10**18; // 1 ether = 1000000000000000000 wei
const reward = 1 * ether;
const initialDepositsBalance = 3 * ether;

contract("SimpleBank - basic initialization", function(accounts) {
  const alice = accounts[1];
  const bob = accounts[2];
  const charlie = accounts[3];
  const dave = accounts[4];

  it("should reward 3 first clients with 1 balance", async () => {
    const bank = await SimpleBank.deployed();

    await bank.enroll({from: alice});
    const aliceBalance = await bank.balance({from: alice});
    assert.equal(aliceBalance, reward, "initial balance is incorrect");

    await bank.enroll({from: bob});
    const bobBalance = await bank.balance({from: bob});
    assert.equal(bobBalance, reward, "initial balance is incorrect");

    await bank.enroll({from: charlie});
    const charlieBalance = await bank.balance({from: charlie});
    assert.equal(charlieBalance, reward, "initial balance is incorrect");

    await bank.enroll({from: dave});
    const daveBalance = await bank.balance({from: dave});
    assert.equal(daveBalance, 0, "initial balance is incorrect");

    const depositsBalance = await bank.depositsBalance();
    assert.equal(depositsBalance, initialDepositsBalance, "initial balance is incorrect");
  });

  it("should deposit correct amount", async () => {
    const bank = await SimpleBank.deployed();
    const deposit = 0.2 * ether;

    await bank.deposit({from: alice, value: web3.utils.toBN(deposit)});

    const balance = await bank.balance({from: alice});
    assert.equal(balance, reward + deposit,
        "deposit amount incorrect, check deposit method");
    const depositsBalance = await bank.depositsBalance();
    assert.equal(depositsBalance, initialDepositsBalance+deposit,
        "bank deposits balance should be increased");

    const expectedEventResult = {accountAddress: alice, amount: deposit};

    const log = await new Promise(function (resolve, reject) {
      bank.getPastEvents('LogDepositMade', function (error, events) {
        resolve(events[0].returnValues);
      });
    });
    assert.equal(log.accountAddress, expectedEventResult.accountAddress,
        "LogDepositMade event accountAddress property not emitted");
    assert.equal(log.amount, expectedEventResult.amount,
        "LogDepositMade event amount property not emitted");
  });
});

contract("SimpleBank - proper withdrawal", function(accounts) {
  const alice = accounts[1];

  it("should withdraw correct amount", async () => {
    const bank = await SimpleBank.deployed();
    const deposit = 0.1 * ether;

    await bank.deposit({from: alice, value: web3.utils.toBN(deposit)});
    await bank.withdraw(web3.utils.toBN(deposit), {from: alice});

    const balance = await bank.balance({from: alice});
    assert.equal(balance, deposit - deposit, "withdraw amount incorrect");
  });
});

contract("SimpleBank - incorrect withdrawal", function(accounts) {
  const alice = accounts[1];

  it("should keep balance unchanged if withdraw greater than balance", async() => {
    const bank = await SimpleBank.deployed();
    const deposit = 0.1 * ether;

    await bank.deposit({from: alice, value: web3.utils.toBN(deposit)});
    await bank.withdraw(web3.utils.toBN(deposit * 1.01), {from: alice});

    const balance = await bank.balance({from: alice});
    assert.equal(balance, deposit, "balance should be kept intact");
  });
});

contract("SimpleBank - fallback works", function(accounts) {
  const alice = accounts[1];

  it("should revert ether sent to this contract through fallback", async() => {
    const bank = await SimpleBank.deployed();
    const deposit = 0.1 * ether;

    try {
      await bank.send(web3.toBigNumber(deposit), {from: alice});
    } catch(e) {
      assert(e, "Error: VM Exception while processing transaction: revert");
    }

    const depositsBalance = await bank.depositsBalance();
    assert.equal(depositsBalance, initialDepositsBalance, "balance should be kept intact");
  });
});
