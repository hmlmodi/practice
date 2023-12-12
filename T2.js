// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB

mongoose.connect('mongodb://localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
console.log('MongoDB Connected');

// Define News schema and model
const newsSchema = new mongoose.Schema({
    title: String,
    content: String,
    category: String,
});

const News = mongoose.model('News', newsSchema);

// Fetch and store news articles from a third-party API
async function fetchAndStoreNews() {
    try {
        const response = await axios.get('http://eventregistry.org/api/v1/article/getArticles', {
            // apiKey: 'd5269260-b1e5-4263-8f38-9adfd202f901',
            params: {
                "action": "getArticles",
                "keyword": "Barack Obama",
                "articlesPage": 1,
                "articlesCount": 100,
                "articlesSortBy": "date",
                "articlesSortByAsc": false,
                "articlesArticleBodyLen": -1,
                "resultType": "articles",
                "dataType": [
                    "news",
                    "pr"
                ],
                "apiKey": "d5269260-b1e5-4263-8f38-9adfd202f901",
                "forceMaxDataTimeWindow": 31
            }


        });
        console.log("🚀 ~ file: T2.js:36 ~ fetchAndStoreNews ~ response:", response.data)

        const articles = response.data.articles.results;
        await News.insertMany(articles);
        console.log('News articles fetched and stored successfully.');
    } catch (error) {
        console.error('Error fetching or storing news articles:', error.message);
    }
}

// Endpoint for fetching all news articles
app.get('/api/news', async (req, res) => {
    try {
        const allNews = await News.find();
        res.json(allNews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint for creating a new news article
app.post('/api/news', async (req, res) => {
    try {
        const newNews = new News(req.body);
        await newNews.save();
        res.json(newNews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint for updating a news article by ID
app.put('/api/news/:id', async (req, res) => {
    fetchAndStoreNews()

    try {
        const updatedNews = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedNews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint for deleting a news article by ID
app.delete('/api/news/:id', async (req, res) => {
    fetchAndStoreNews()

    try {
        const deletedNews = await News.findByIdAndDelete(req.params.id);
        res.json(deletedNews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Fetch and store news articles on server startup
fetchAndStoreNews();
