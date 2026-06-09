const express = require('express');
const cors = require('cors');
const axios = require('axios'); 
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/json', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ status: 'error', text: 'URL is required' });

    try {
        // কোবাল্টের গ্লোবাল ওয়ার্কিং এপিআই এন্ডপয়েন্ট
        const response = await axios.post('https://api.cobalt.tools/', {
            url: url
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: 12000
        });

        if (response.data && response.data.url) {
            return res.json({ 
                status: 'stream', 
                url: response.data.url 
            });
        }
        
        res.status(500).json({ status: 'error', text: 'Link processing failed on server.' });

    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ status: 'error', text: 'Engine side error. Please retry.' });
    }
});

module.exports = app;
