const path = require('path');
const fs = require('fs');
const cors = require('cors');
const express = require('express');
const app = express();
const port = 3000;

// Convert Ripple time to JavaScript Date
function rippleTimeToDate(rippleTime) {
    const RIPPLE_EPOCH = 946684800; // seconds since Unix epoch
    return new Date((rippleTime + RIPPLE_EPOCH) * 1000);
}

app.use(cors());
app.use(express.static('public'));

app.get('/*.json', (req, res) => {
    const file = req.params[0];
    const filePath = path.join(__dirname, `${file}.json`);
    fs.readFile(filePath, { encoding: 'utf8' }, (err, data) => {
        if (err) {
            res.status(500).send("Error reading transaction data.");
            return;
        }
        const transactions = JSON.parse(data);
        const convertedData = transactions.map(tx => ({
            ...tx,
            date: rippleTimeToDate(tx.date)
        }));
        res.json(convertedData);
    });

});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
