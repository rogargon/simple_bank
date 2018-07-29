var SimpleBank = artifacts.require("./SimpleBank.sol");

const reward = 10;
const initialDepositsBalance = 30;

contract("SimpleBank - basic initialization", function(accounts) {
  const alice = accounts[1];
  const bob = accounts[2];
  const charlie = accounts[3];
  const dave = accounts[4];

  it("should reward 3 first clients with 10 balance", async () => {
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
    const deposit = 2;

    await bank.deposit({from: alice, value: web3.toBigNumber(deposit)});

    const balance = await bank.balance({from: alice});
    assert.equal(balance, reward + deposit,
        "deposit amount incorrect, check deposit method");
    const depositsBalance = await bank.depositsBalance();
    assert.equal(depositsBalance, initialDepositsBalance+deposit,
        "bank deposits balance should be increased");

    const expectedEventResult = {accountAddress: alice, amount: deposit};

    const LogDepositMade = await bank.allEvents();
    const log = await new Promise(function (resolve, reject) {
      LogDepositMade.watch(function (error, log) {
        resolve(log);
      });
    });
    const logAccountAddress = log.args.accountAddress;
    const logAmount = log.args.amount.toNumber();
    assert.equal(logAccountAddress, expectedEventResult.accountAddress,
        "LogDepositMade event accountAddress property not emitted");
    assert.equal(logAmount, expectedEventResult.amount,
        "LogDepositMade event amount property not emitted");
  });
});

contract("SimpleBank - proper withdrawal", function(accounts) {
  const alice = accounts[1];

  it("should withdraw correct amount", async () => {
    const bank = await SimpleBank.deployed();
    const deposit = 5;

    await bank.deposit({from: alice, value: web3.toBigNumber(deposit)});
    await bank.withdraw(web3.toBigNumber(deposit), {from: alice});

    const balance = await bank.balance({from: alice});
    assert.equal(balance, deposit - deposit, "withdraw amount incorrect");
  });
});

contract("SimpleBank - incorrect withdrawal", function(accounts) {
  const alice = accounts[1];

  it("should keep balance unchanged if withdraw greater than balance", async() => {
    const bank = await SimpleBank.deployed();
    const deposit = 3;

    await bank.deposit({from: alice, value: web3.toBigNumber(deposit)});
    await bank.withdraw(web3.toBigNumber(deposit+1), {from: alice});

    const balance = await bank.balance({from: alice});
    assert.equal(balance, deposit, "balance should be kept intact");
  });
});

contract("SimpleBank - fallback works", function(accounts) {
  const alice = accounts[1];

  it("should revert ether sent to this contract through fallback", async() => {
    const bank = await SimpleBank.deployed();
    const deposit = 3;

    try {
      await bank.send(web3.toBigNumber(deposit), {from: alice});
    } catch(e) {
      assert(e, "Error: VM Exception while processing transaction: revert");
    }

    const depositsBalance = await bank.depositsBalance();
    assert.equal(depositsBalance, initialDepositsBalance, "balance should be kept intact");
  });
});
