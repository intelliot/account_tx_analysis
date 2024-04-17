const fs = require('fs');
const path = require('path');

function readAndSortTransactions(filePath) {
  const data = fs.readFileSync(filePath, { encoding: 'utf8' });
  const transactions = JSON.parse(data);

  // Sort the transactions by delivered_amount in descending order
  transactions.sort((a, b) => {
      // Convert to numbers to ensure proper numerical sorting
      return parseInt(b.delivered_amount) - parseInt(a.delivered_amount);
  });

  // Find and delete instances where the Destination sent at least 95% of the delivered_amount back to the Account
  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    const sender = tx.Account;
    const deliveredAmount = Number(tx.delivered_amount);

    // Find transactions where the Destination is the sender and the delivered_amount is at least 95% of the sender's delivered_amount
    const txToSender = transactions.find(t => t.Destination === sender && deliveredAmount >= Number(t.delivered_amount) * 0.95);
    if (txToSender) {
      // Remove the transaction from `transactions`
      transactions.splice(transactions.indexOf(txToSender), 1);
      // Remove the current transaction as well
        transactions.splice(i, 1);
        i--;
    }
  }

  // Sum up the total delivered_amount
  const totalDeliveredAmount = transactions.reduce((total, tx) => total + parseInt(tx.delivered_amount), 0);
  console.log('Total Delivered Amount:', totalDeliveredAmount);
  

  return transactions;
}

function main() {
  const filePath = path.join(__dirname, 'transactions-2024-04-15.json');
  const sortedTransactions = readAndSortTransactions(filePath);
  
  console.log(JSON.stringify(sortedTransactions, null, 2));
}

main();
