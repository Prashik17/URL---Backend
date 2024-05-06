const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const cors = require('cors');
const bodyParser = require('body-parser'); // Import body-parser

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(bodyParser.json()); // Add this line

// Connect to MongoDB
mongoose.connect('mongodb+srv://Prashik17:Pass123@url-shortner.7chtl80.mongodb.net/', {
  useNewUrlParser: true, // Remove this option
  useUnifiedTopology: true, // Remove this option
});

// Define URL model
const Url = mongoose.model('Url', {
  originalUrl: String,
  shortUrl: String,
});

// Create shortened URL
app.post('/api/url', async (req, res) => {
  const { originalUrl } = req.body;
  const shortUrl = shortid.generate();

  await Url.create({ originalUrl, shortUrl });

  res.json({ originalUrl, shortUrl });
});

// Redirect to original URL
app.get('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;
  const url = await Url.findOne({ shortUrl });

  if (!url) {
    return res.sendStatus(404);
  }

  res.redirect(url.originalUrl);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
