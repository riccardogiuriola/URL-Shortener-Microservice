require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { appendToCSV, readFromCSV } = require('./utils/csv');

// Basic Configuration
const port = process.env.PORT || 3000;

const allowedOrigin = 'https://www.freecodecamp.org'; // Change this to your allowed origin
app.use(cors({
  origin: allowedOrigin
}));
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', async function (req, res) {
  const url = req.body.url;
  const urlCheck = /^https?:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*\/?.*$/.test(url);
  if (!urlCheck) {
    return res.json({ error: 'invalid url' })
  }

  const shortUrl = await appendToCSV(url);
  console.log({ original_url: url, short_url: shortUrl })

  return res.status(201).json({ original_url: url, short_url: shortUrl });
});

app.get('/api/shorturl/:shorturl', async function (req, res) {
  const shorturl = req.params.shorturl;

  try {
    const data = await new Promise((resolve, reject) => {
      readFromCSV(shorturl, (result) => {
        resolve(result);
      });
    });

    return res.status(301).redirect(data[1]);
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).send("Internal Server Error");
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
