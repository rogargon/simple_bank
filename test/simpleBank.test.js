var SimpleBank = artifacts.require("./SimpleBank.sol");

contract("SimpleBank - basic initialization", function(accounts) {
  const owner = accounts[0];
  const alice = accounts[1];
  const bob = accounts[2];

  it("should initialize all accounts with 0 balance", async () => {
    const bank = await SimpleBank.deployed();

    const aliceBalance = await bank.balance({from: alice});
    assert.equal(aliceBalance, 0, "initial balance is incorrect");

    const bobBalance = await bank.balance({from: bob});
    assert.equal(bobBalance, 0, "initial balance is incorrect");

    const ownerBalance = await bank.balance({from: owner});
    assert.equal(ownerBalance, 0, "initial balance is incorrect");

    const bankBalance = await bank.bankBalance();
    assert.equal(bankBalance, 0, "initial balance is incorrect");
  });

  it("should deposit correct amount", async () => {
    const bank = await SimpleBank.deployed();
    const deposit = 2;

    await bank.deposit({from: alice, value: web3.toBigNumber(deposit)});
    const balance = await bank.balance({from: alice});
    assert.equal(deposit, balance,
        "deposit amount incorrect, check deposit method");

    const expectedEventResult = {accountAddress: alice, amount: deposit};

    const LogDepositMade = await bank.allEvents();
    const log = await new Promise(function (resolve, reject) {
      LogDepositMade.watch(function (error, log) {
        resolve(log);
      });
    });

    const logAccountAddress = log.args.accountAddress;
    const logAmount = log.args.amount.toNumber();

    assert.equal(expectedEventResult.accountAddress, logAccountAddress,
        "LogDepositMade event accountAddress property not emitted");
    assert.equal(expectedEventResult.amount, logAmount,
        "LogDepositMade event amount property not emitted");
  });
});

contract("SimpleBank - proper withdrawal", function(accounts) {
  const alice = accounts[1];

  it("should withdraw correct amount", async () => {
    const bank = await SimpleBank.deployed();
    const deposit = 5;
    const initialAmount = 0;

    await bank.deposit({from: alice, value: web3.toBigNumber(deposit)});
    await bank.withdraw(web3.toBigNumber(deposit), {from: alice});

    const balance = await bank.balance({from: alice});
    assert.equal(deposit - deposit, balance, "withdraw amount incorrect");
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
    assert.equal(deposit, balance, "balance should be kept intact");
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

    const bankBalance = await bank.bankBalance();
    assert.equal("0", bankBalance.toString(), "balance should be kept intact");
  });
});
