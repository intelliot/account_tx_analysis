// http://localhost:3000/sorted-6.json

document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:3000/sorted-6.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const ctx = document.getElementById('transactionChart').getContext('2d');

            // Convert each transaction's date string to a Date object and parse amounts
            const transactions = data.map(tx => ({
                ...tx,
                date: new Date(tx.date), // Parse ISO date string to Date object
                delivered_amount: parseInt(tx.delivered_amount, 10) // Convert string to integer
            }));

            // Group transactions by hour
            const transactionsByHour = transactions.reduce((acc, tx) => {
                const hour = tx.date.getHours();
                const day = tx.date.toISOString().substring(0, 10); // ISO date without time
                const dateStr = `${day} ${hour}:00`; // Create a label string for each hour
                acc[dateStr] = (acc[dateStr] || 0) + 1; // Increment count for each hour
                return acc;
            }, {});

            // Extract labels and counts for the chart
            const labels = Object.keys(transactionsByHour).sort();
            const counts = labels.map(label => transactionsByHour[label]);

            // Log labels and counts for debugging
            console.log("Labels:", labels);
            console.log("Counts:", counts);

            // Configure and create the chart
            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Transactions per Hour',
                        data: counts,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        },
                        x: {
                            type: 'time',
                            time: {
                                unit: 'hour',
                                parser: 'yyyy-MM-dd HH:mm', // Adjusted parser for "yyyy-MM-dd HH:00"
                                tooltipFormat: 'MMM dd, yyyy h:mm a',
                                displayFormats: {
                                    hour: 'MMM dd, h a'
                                }
                            },
                            ticks: {
                                autoSkip: true,
                                maxTicksLimit: 20
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        })
        .catch(error => {
            console.error('Error loading the data:', error);
            const output = document.getElementById('data-output'); // Ensure you have a div with this id for error messages
            output.innerHTML = `<p style="color: red;">Error fetching data: ${error.message}</p>`;
        });
});
