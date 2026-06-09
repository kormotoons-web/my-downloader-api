const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/json', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ status: 'error', text: 'URL is required' });

    try {
        // একটি প্রিমিয়াম অল্টারনেটিভ গেটওয়ে যা সরাসরি ব্রাউজার রেসপন্স দিয়ে লিংক টানে
        const apiUrl = `https://api.vkrhost.xyz/api/download?url=${encodeURIComponent(url)}`;
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (response.ok) {
            const result = await response.json();
            
            // বিভিন্ন এপিআই রেসপন্স ফরমেট অনুযায়ী লিংক খোঁজা
            let downloadLink = null;
            if (result && result.data) {
                downloadLink = result.data.stream || result.data.url || (result.data.media && result.data.media[0]?.url);
            }

            if (downloadLink) {
                return res.json({ 
                    status: 'stream', 
                    url: downloadLink 
                });
            }
        }
        
        // ব্যাকআপ গেটওয়ে ২: যদি প্রথমটা মিস করে
        const backupUrl = `https://imput.net/api/v1/stream?url=${encodeURIComponent(url)}`;
        const backupResp = await fetch(backupUrl);
        if (backupResp.ok) {
            const backupData = await backupResp.json();
            if (backupData && backupData.url) {
                return res.json({ status: 'stream', url: backupData.url });
            }
        }

        res.status(500).json({ status: 'error', text: 'All backend engines failed. Try a different video link.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', text: 'System process timeout. Please try again.' });
    }
});

module.exports = app;
