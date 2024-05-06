const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

mongoose.connect('mongodb+srv://Prashik17:Pass123@url-shortner.7chtl80.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Database connection successful');
});

const Url = mongoose.model('Url', {
  originalUrl: String,
  shortUrl: String,
  clicks: { type: Number, default: 0 },
});

app.post('/api/shorten', async (req, res) => {
  const { originalUrl } = req.body;
  const shortUrl = shortid.generate();
  try {
    const url = await Url.create({ originalUrl, shortUrl });
    res.json(url);
  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({ error: 'Error shortening URL. Please try again.' });
  }
});

app.get('/api/urls', async (req, res) => {
  try {
    const urls = await Url.find();
    res.json(urls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/:shortUrl', async (req, res) => {
  try {
    const url = await Url.findOne({ shortUrl: req.params.shortUrl });
    if (!url) return res.sendStatus(404);
    url.clicks++;
    await url.save();
    
    const originalUrl = url.originalUrl;
    
    // Check if the original URL is an external link
    if (isExternalLink(originalUrl)) {
      return res.redirect(originalUrl);
    } else {
      // Redirect to the original URL
      return res.redirect(`/${originalUrl}`);
    }
  } catch (error) {
    console.error('Error accessing shortened URL:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

function isExternalLink(url) {
  const regex = /^(https?:)?\/\/([^\/]+\.)?([^\/]+\.[^\/]+)\/?/;
  const match = regex.exec(url);
  if (match && match[3] !== 'localhost') {
    // Matched a non-local URL
    return true;
  }
  return false;
}

// Route handler to update click count
app.put('/api/url/:id', async (req, res) => {
  try {
    const url = await Url.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } }, { new: true });
    res.json(url);
  } catch (error) {
    console.error('Error updating click count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
