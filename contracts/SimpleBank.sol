pragma solidity ^0.4.22;


contract SimpleBank {
    uint8 private clientCount;

    // Fill in the keyword. Hint: We want to protect our users balance from other contracts
    mapping (address => uint) private balances;

    // Let's make sure everyone knows who owns the bank. Use the appropriate keyword for this
    address public owner;

    // Events - publicize actions to external listeners
    // Add 2 arguments for this event, an accountAddress and an amount
    event LogDepositMade(address indexed accountAddress, uint amount);

    // Constructor, can receive one or many variables here; only one allowed
    // Initial funding of 30 required to reward the first 3 clients
    constructor() public payable {
        require(msg.value == 30 ether, "Initial funding of 30 ether required for rewards");
        /* Set the owner to the creator of this contract */
        owner = msg.sender;
        clientCount = 0;
    }

    // @notice Enroll a customer with the bank, giving the first 3 of them 10 token for free
    // @return The balance of the user after enrolling
    function enroll() public returns (uint) {
        if (clientCount < 3) {
            clientCount++;
            balances[msg.sender] = 10 ether;
        }
        return balances[msg.sender];
    }

    /// @notice Deposit ether into bank
    /// @return The balance of the user after the deposit is made
    /// Add the appropriate keyword so that this function can receive ether
    function deposit() public payable returns (uint) {
        /* Add the amount to the user's balance, call the event associated with a deposit,
          then return the balance of the user */
        balances[msg.sender] += msg.value;
        emit LogDepositMade(msg.sender, msg.value);
        return balances[msg.sender];
    }

    /// @notice Withdraw ether from bank
    /// @dev This does not return any excess ether sent to it
    /// @param withdrawAmount amount you want to withdraw
    /// @return The balance remaining for the user
    function withdraw(uint withdrawAmount) public returns (uint remainingBal) {
        /* If the sender's balance is at least the amount they want to withdraw,
           Subtract the amount from the sender's balance, and try to send that amount of ether
           to the user attempting to withdraw. IF the send fails, add the amount back to the user's balance
           return the user's balance.*/
        if (withdrawAmount <= balances[msg.sender]) {
            msg.sender.transfer(withdrawAmount);
            balances[msg.sender] -= withdrawAmount;
        }
        return balances[msg.sender];
    }

    /// @notice Get balance
    /// @return The balance of the user
    // A SPECIAL KEYWORD prevents function from editing state variables;
    // allows function to run locally/off blockchain
    function balance() public constant returns (uint) {
        /* Get the balance of the sender of this transaction */
        return balances[msg.sender];
    }

    function depositsBalance() public constant returns (uint) {
        return address(this).balance;
    }

    // Fallback function - Called if other functions don't match call or
    // sent ether without data
    // Typically, called when invalid data is sent
    // Added so ether sent to this contract is reverted if the contract fails
    // otherwise, the sender's money is transferred to contract
    function() public payable {
        revert(); //The same behaviour if made not payable or if fallback omitted
    }
}
