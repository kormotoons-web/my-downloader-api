const express = require('express');
const cors = require('cors');
const instagramGetUrl = require('instagram-url-direct'); 
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/json', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ status: 'error', text: 'URL is required' });

    try {
        // কোনো থার্ড পার্টি এপিআই ছাড়া সরাসরি স্ক্র্যাপ করা
        if (url.includes('instagram.com')) {
            const links = await instagramGetUrl(url);
            
            if (links && links.url_list && links.url_list.length > 0) {
                return res.json({ 
                    status: 'stream', 
                    url: links.url_list[0] 
                });
            }
        } 
        
        // যদি অন্য কোনো প্ল্যাটফর্মের লিঙ্ক হয়, সেটার জন্য একটা ডিরেক্ট ওপেন গেটওয়ে
        const directProxy = `https://api.vkrhost.xyz/api/download?url=${encodeURIComponent(url)}`;
        const response = await fetch(directProxy);
        if (response.ok) {
            const result = await response.json();
            if (result && result.data && result.data.stream) {
                return res.json({ status: 'stream', url: result.data.stream });
            }
        }

        res.status(500).json({ status: 'error', text: 'Video link could not be parsed. Try another post!' });

    } catch (error) {
        console.error('Scraper Error:', error.message);
        res.status(500).json({ status: 'error', text: 'Server processing failed. Retry once.' });
    }
});

module.exports = app;
