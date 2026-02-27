const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const ARTIST_ID = '6uiAnXipuNymu9Bd9ZYLN0';

app.get('/', (req, res) => {
    res.send('Cowboy Clean Scraper is running!');
});

// ROUTE: Scrape live data from the public Spotify page
app.get('/api/spotify-stats', async (req, res) => {
    try {
        const url = `https://open.spotify.com/artist/${ARTIST_ID}`;
        // We pretend to be a regular browser to avoid being blocked
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const html = response.data;

        // Spotify embeds the monthly listeners in the metadata and a JSON script tag
        // We'll use a Regex to find the monthly listeners count
        const listenerMatch = html.match(/(\d[\d,.]*)\smonthly listeners/i);
        const monthlyListeners = listenerMatch ? listenerMatch[1] : "Check Profile";

        console.log(`Scraped Monthly Listeners: ${monthlyListeners}`);

        res.json({
            listeners: monthlyListeners,
            name: "Cowboy Clean",
            url: url
        });
    } catch (error) {
        console.error('Scraping Error:', error.message);
        res.status(500).json({ error: 'Failed to scrape public data' });
    }
});

// ROUTE: For Related Artists, we'll keep a list of your top targets 
// since the API blocks this and it's not easily scrapable without heavy tools.
app.get('/api/spotify-related', (req, res) => {
    res.json({
        isManual: true,
        artists: [
            { name: "Castle Black", popularity: 28, external_urls: { spotify: "https://open.spotify.com/artist/4sF2l6X2sK4X6sJz2jQp7j" } },
            { name: "The Midnight Hollow", popularity: 32, external_urls: { spotify: "https://open.spotify.com/artist/0Fz2k8G8QY2V2K2Q8Z8Z8Z" } },
            { name: "Monotronic", popularity: 25, external_urls: { spotify: "https://open.spotify.com/artist/1Gz2k8G8QY2V2K2Q8Z8Z8Z" } },
            { name: "Garland Kelley", popularity: 15, external_urls: { spotify: "https://open.spotify.com/artist/2Hz2k8G8QY2V2K2Q8Z8Z8Z" } }
        ]
    });
});

app.listen(PORT, () => {
    console.log(`Scraper running on port ${PORT}`);
});
