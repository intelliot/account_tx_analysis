const xrpl = require('xrpl');
const fs = require('fs');

async function fetchTransactions(address, startDate) {
    const client = new xrpl.Client("wss://s.devnet.rippletest.net:51233");
    await client.connect();

    const transactions = [];
    let marker = undefined;
    const startRippleTime = xrpl.isoTimeToRippleTime(new Date(startDate).toISOString());

    do {
        const response = await client.request({
            command: "account_tx",
            account: address,
            ledger_index_min: -1,
            ledger_index_max: -1,
            limit: 400,
            marker: marker
        });

        // Variable to determine if transactions are still within the date range
        let withinDateRange = true;

        response.result.transactions.forEach(tx => {
            if (tx.tx.date >= startRippleTime) {
                transactions.push({
                    hash: tx.tx.hash,
                    delivered_amount: tx.meta.delivered_amount || 0,
                    Account: tx.tx.Account,
                    Destination: tx.tx.Destination,
                    date: tx.tx.date
                });
            } else {
                // If a transaction date is less than start date, we should stop fetching further
                withinDateRange = false;
            }
        });

        // Update the marker if still within the date range
        if (withinDateRange) {
            marker = response.result.marker;
        } else {
            marker = undefined; // This will stop the loop
        }
        console.log(`Fetched ${transactions.length} transactions so far.`);
        console.log(`Latest date: ${xrpl.rippleTimeToUnixTime(response.result.transactions[response.result.transactions.length - 1].tx.date)}`);

    } while (marker !== undefined);

    await client.disconnect();
    return transactions;
}

async function saveTransactions(address, startDate) {
    const transactions = await fetchTransactions(address, startDate);
    fs.writeFileSync(`transactions-${startDate}.json`, JSON.stringify(transactions, null, 2), 'utf8');
    console.log(`transactions-${startDate}.json`);
}

const address = 'rADDRESS_HERE'; // Replace with your actual XRP Ledger address
const startDate = '2024-04-15'; // Start date as YYYY-MM-DD

saveTransactions(address, startDate).catch(console.error);
