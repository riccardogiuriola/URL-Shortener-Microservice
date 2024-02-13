const fs = require('fs');

async function appendToCSV(url) {
    let lastInsertedId = await getLastInsertedId();
    if (lastInsertedId === undefined) {
        lastInsertedId = 1;
    }
    console.log(lastInsertedId)
    const shortUrl = lastInsertedId + 1;
    const newData = [[shortUrl, url]];
    const csvContent = newData.map(row => row.join(',')).join('\n');
    fs.access('registry.csv', fs.constants.F_OK, (err) => {
        if (err) {
            // File does not exist, create it with header columns
            fs.writeFile('registry.csv', 'ID,URL\n', (err) => {
                if (err) throw err;
                console.log('CSV file has been created with header columns!');
                appendDataToCSV(csvContent);
            });
        } else {
            // File exists, append data
            appendDataToCSV(csvContent);
        }
    });
    return shortUrl;
}

// Function to append data to existing CSV file
function appendDataToCSV(csvContent) {
    fs.appendFile('registry.csv', '\n' + csvContent, (err) => {
        if (err) throw err;
        console.log('New data has been appended to CSV file!');
    });
}


async function readFromCSV(shortUrlToSearch, callback) {
    fs.readFile('registry.csv', 'utf8', async (err, csvData) => {
        if (err) throw err;

        // Search for the row with the specified url
        const resultRow = await searchByShortUrl(csvData, shortUrlToSearch);

        if (resultRow) {
            console.log('Row found:');
            console.log(resultRow);
            callback(resultRow);
        } else {
            console.log(`Row with shorturl "${shortUrlToSearch}" not found.`);
            callback(null);
        }
    });
}

async function getLastInsertedId() {
    try {
        // Read CSV file
        const csvData = await fs.promises.readFile('registry.csv', 'utf8');

        // Parse CSV data
        const rows = csvData.trim().split('\n').map(row => row.split(','));

        let maxId = -1; // Initialize maxId with a value lower than any valid ID

        // Iterate through rows to find the maximum ID
        for (let i = 1; i < rows.length; i++) { // Start from index 1 to skip header row
            const id = parseInt(rows[i][0]); // Assuming ID is in the first column (index 0)
            if (!isNaN(id) && id > maxId) {
                maxId = id;
            }
        }

        return maxId;
    } catch (err) {
        return undefined;
    }
}

async function searchByShortUrl(csvData, shorturl) {
    const rows = csvData.trim().split('\n').map(row => row.split(','));
    for (let i = 1; i < rows.length; i++) { // start from index 1 to skip header row
        if (rows[i][0] === shorturl) { // assuming email is in the third column (index 2)
            return rows[i];
        }
    }
    return null;
}

module.exports = { appendToCSV, readFromCSV }