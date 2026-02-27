require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// This allows your Canvas HTML dashboard to talk to this server securely
app.use(cors());

// A test route to make sure it works
app.get('/', (req, res) => {
    res.send('Cowboy Clean Backend is running!');
});

// The route your Canvas dashboard will eventually call
app.get('/api/spotify-stats', (req, res) => {
    // Later, we will put the real Spotify API connection here
    // For now, it will just send this placeholder data back
    res.json({
        listeners: 13500, // Slightly updated number to prove it's coming from the server
        message: "Data successfully fetched from Render!"
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
