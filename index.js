const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// অল-ইন-ওয়ান ডাউনলোডার রাউট (সচল ও ফাস্ট ব্যাকএন্ড ইঞ্জিন)
app.post('/api/json', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ status: 'error', text: 'URL is required' });

    // Cobalt-এর ব্যাকআপ এবং সবচেয়ে সচল সার্ভার লিস্ট
    const cobaltInstances = [
        'https://co.wuk.sh/api/json',
        'https://cobalt.api.v0.wtf/api/json',
        'https://api.cobalt.tools/api/json'
    ];

    let success = false;
    let lastError = 'Target server busy';

    // একটি সার্ভার কাজ না করলে অটোমেটিক অন্যটি চেষ্টা করবে
    for (const apiUrl of cobaltInstances) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: url,
                    videoQuality: '720',
                    downloadMode: 'auto'
                })
            });

            if (response.ok) {
                const data = await response.json();
                res.json(data);
                success = true;
                break; // সফল হলে লুপ থেকে বের হয়ে যাবে
            }
        } catch (error) {
            console.error(`Failed to fetch from ${apiUrl}:`, error);
        }
    }

    if (!success) {
        res.status(500).json({ status: 'error', text: lastError });
    }
});

module.exports = app;
