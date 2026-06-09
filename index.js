const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// অল-ইন-ওয়ান ডিরেক্ট ডাউনলোডার সার্ভিস
app.post('/api/json', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ status: 'error', text: 'URL is required' });

    try {
        // একটি ওপেন-সোর্স গ্লোবাল ডাউনলোডার গেটওয়ে
        const targetUrl = `https://api.sandipbaruwal.com.np/api/autodownload?url=${encodeURIComponent(url)}`;
        
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (response.ok) {
            const result = await response.json();
            
            // ফেসবুক, টিকটক, ইনস্টাগ্রামের মিডিয়া ইউআরএল ফিল্টার করা
            if (result && result.data && result.data.url) {
                return res.json({
                    status: 'stream',
                    url: result.data.url,
                    text: result.data.title || 'Download Video'
                });
            }
            
            // বিকল্প এপিআই ফরমেট ম্যাচিং
            if (result && result.url) {
                return res.json({
                    status: 'stream',
                    url: result.url,
                    text: 'Download Link'
                });
            }
        }

        res.status(500).json({ status: 'error', text: 'Bypass engine busy. Try another link.' });

    } catch (error) {
        console.error('Bypass error:', error.message);
        res.status(500).json({ status: 'error', text: 'Connection timeout. Please retry.' });
    }
});

module.exports = app;
