const express = require('express');
const cors = require('cors');
// পুরোনো নোড ভার্সনের সাপোর্টের জন্য axios ব্যবহার করছি
const axios = require('axios'); 
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/json', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ status: 'error', text: 'URL is required' });

    try {
        // অফিশিয়াল Cobalt পাবলিক এপিআই ইঞ্জিন (সবচেয়ে স্টেবল)
        const response = await axios.post('https://api.cobalt.tools/api/json', {
            url: url,
            vQuality: '720', // ডিফল্ট ভিডিও কোয়ালিটি
            filenamePattern: 'basic'
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: 10000 // ১০ সেকেন্ড টাইমআউট লিমিট
        });

        // কোবাল্ট সাকসেস রেসপন্স পাঠালে ফ্রন্টএন্ডে পাস করা
        if (response.data && response.data.url) {
            return res.json({ 
                status: 'stream', 
                url: response.data.url 
            });
        }
        
        res.status(500).json({ status: 'error', text: 'Cobalt engine did not return a link.' });

    } catch (error) {
        console.error('API Error:', error.message);
        // নির্দিষ্ট করে এরর মেসেজ পাঠানো যাতে বুঝতে সুবিধা হয়
        const errorText = error.response ? `Engine Error (${error.response.status})` : 'Connection timeout with Cobalt server.';
        res.status(500).json({ status: 'error', text: errorText });
    }
});

module.exports = app;
