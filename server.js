require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Cowboy Clean's specific Spotify Artist ID
const ARTIST_ID = '6uiAnXipuNymu9Bd9ZYLN0';

// Function to securely get a temporary access token from Spotify
async function getSpotifyToken() {
    const authOptions = {
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: 'grant_type=client_credentials'
    };
    const response = await axios(authOptions);
    return response.data.access_token;
}

// Default test route
app.get('/', (req, res) => {
    res.send('Cowboy Clean Backend is running!');
});

// ROUTE 1: Fetch Live Artist Stats (Followers & Popularity)
app.get('/api/spotify-stats', async (req, res) => {
    try {
        const token = await getSpotifyToken();
        
        // Fetch your live artist data
        const artistResponse = await axios.get(`https://api.spotify.com/v1/artists/${ARTIST_ID}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        // Debugging log: This will show up in your Render logs so you can see exactly what Spotify sent
        console.log("Real Spotify Data Received:", artistResponse.data.name, "| Followers:", artistResponse.data.followers?.total);

        // Strictly pull the real data
        res.json({
            followers: artistResponse.data.followers?.total,
            popularity: artistResponse.data.popularity,
            name: artistResponse.data.name
        });
    } catch (error) {
        console.error('Error fetching Spotify stats:', error.message);
        res.status(500).json({ error: 'Failed to fetch live Spotify stats' });
    }
});

// ROUTE 2: Fetch Similar Artists for Tour Routing
app.get('/api/spotify-related', async (req, res) => {
    try {
        const token = await getSpotifyToken();
        
        // Fetch related artists based on Spotify's algorithm
        const relatedResponse = await axios.get(`https://api.spotify.com/v1/artists/${ARTIST_ID}/related-artists`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        res.json({
            artists: relatedResponse.data.artists
        });
    } catch (error) {
        console.error('Error fetching related artists:', error.message);
        
        // If Spotify blocks it because the app is in Dev Mode, send a clean error back (no fake data)
        if (error.response && error.response.status === 403) {
            return res.status(403).json({ 
                error: 'Spotify API Access Restricted. You need to request extension approval in the Spotify Developer Dashboard.' 
            });
        }
        
        res.status(500).json({ error: 'Failed to fetch related artists' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
