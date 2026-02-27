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

// The route your dashboard calls
app.get('/api/spotify-stats', async (req, res) => {
    try {
        const token = await getSpotifyToken();
        
        // Fetch your live artist data
        const artistResponse = await axios.get(`https://api.spotify.com/v1/artists/${ARTIST_ID}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        res.json({
            followers: artistResponse.data.followers.total,
            popularity: artistResponse.data.popularity,
            name: artistResponse.data.name
        });
    } catch (error) {
        console.error('Error fetching Spotify data:', error.message);
        res.status(500).json({ error: 'Failed to fetch live Spotify data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
