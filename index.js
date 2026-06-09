const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/json', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ status: 'error', text: 'URL is required' });

    try {
        // সোর্স ১: অল-ইন-ওয়ান ডাউনলোডার গেটওয়ে
        const response = await fetch(`https://api.agatz.xyz/api/downloader?url=${encodeURIComponent(url)}`);
        
        if (response.ok) {
            const result = await response.json();
            if (result && result.status === 200 && result.data) {
                // বিভিন্ন প্ল্যাটফর্মের ডাটা ফরমেট চেক করা
                const videoUrl = result.data.url || result.data.hd || result.data.mp4 || result.data.watermark;
                if (videoUrl) {
                    return res.json({ status: 'stream', url: videoUrl });
                }
            }
        }

        // সোর্স ২ (ব্যাকআপ): যদি ১ম সোর্স কাজ না করে
        const backupResponse = await fetch(`https://api.alyachan.pro/api/downloader?url=${encodeURIComponent(url)}`);
        if (backupResponse.ok) {
            const backupResult = await backupResponse.json();
            if (backupResult && backupResult.status === 200 && backupResult.data) {
                const backupUrl = backupResult.data.url || backupResult.data.video;
                if (backupUrl) return res.json({ status: 'stream', url: backupUrl });
            }
        }

        res.status(500).json({ status: 'error', text: 'All server engines are busy. Try another link!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', text: 'Server response error. Please retry.' });
    }
});

module.exports = app;
