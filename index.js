const express = require('express');
const axios = require('axios');
const router = express.Router();
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const pairPrice = require('./model');










async function updatePrice(pair) {
    const API_URL = `https://api.twelvedata.com/price?symbol=${pair}&apikey=0fe889445d934143856acb387e1ad821&source=docs`;

    try {
        const response = await axios.get(API_URL, {
            headers: { 'User-Agent': 'request' }
        });

        if (response.status !== 200) {
            console.log(`Failed to fetch data for ${pair}, Status:`, response.status);
            return;
        }

        const data = response.data;
        const price = data['price']; // Adjust based on actual API response

        console.log(`Updated Data for ${pair}:`, price);

        // Check if the pair exists in the database
        const existingPair = await pairPrice.findOne({ pair: pair });
        console.log(`Details of existing ${existingPair}`)

        if (existingPair) {
            // If pair exists, update the price
            await pairPrice.updateOne(
                { pair: pair },
                { $set: { price: price, timestamp: new Date() } }
            );
            console.log(`Updated price for ${pair} to ${price}`);
        } else {
            // If pair does not exist, create a new document
            await pairPrice.create({
                pair: pair,
                price: price,
                date_created: new Date()
            });
            console.log(`Created new entry for ${pair} with price ${price}`);
        }

    } catch (error) {
        console.error(`Error fetching price for ${pair}:`, error.message);
    }
}




async function cryptoupdatePrice(pair) {
    const API_URL = `https://api.huobi.pro/market/trade?symbol=${pair}`;

    try {
        const response = await axios.get(API_URL, {
            headers: { 'User-Agent': 'request' }
        });

        if (response.status !== 200) {
            console.log(`Failed to fetch data for ${pair}, Status:`, response.status);
            return;
        }

        const data = response.data;
        const pairUppercase = pair.toUpperCase()
        console.log(`Updated Data for ${pair}:`, data);
        const price =   data['tick']['data'][0]['price'];

        const existingPair = await pairPrice.findOne({ pair: pairUppercase });

        if (existingPair) {
            // If pair exists, update the price
            await pairPrice.updateOne(
                { pair: pairUppercase },
                { $set: { price: price, timestamp: new Date() } }
            );
            console.log(`Updated price for ${pairUppercase} to ${price}`);
        } else {
            await pairPrice.create({
                pair: pairUppercase,
                price: data['tick']['data'][0]['price'], // Adjust based on actual API response
                date_created: new Date()
            });
    
            console.log(`Created new entry for ${pair} with price ${price}`);
        }


        // Store the data in your database
      
        console.log(`Price for ${pair} saved successfully!`);

    } catch (error) {
        console.error(`Error fetching price for ${pair}:`, error.message);
    }
}





// Function to fetch data
const fetchData = () => {
    mongoose.connect("mongodb+srv://new_db:newdb1902@cluster0.9ll3qel.mongodb.net/FX_Signal_Trading"
    ).then(() =>{
        
        updatePrice("EUR/USD"); 
        updatePrice("GBP/USD");
        updatePrice("AUD/USD"); 
        updatePrice("USD/CAD"); 
        cryptoupdatePrice("btcusdt")
        console.log("Db Connected")
      
    }).catch(()=> console.log("Database error"));

};

// Fetch data every 10 minutes
setInterval(fetchData, 600000);

// Initial fetch when the server starts
fetchData();

// // Route to get the latest stored data
// router.get('/callprice', (req, res) => {
//   if (!latestData) {
//     return res.json({ status: 'fail', msg: 'Data not available yet' });
//   }
//   res.json({ status: 'success', data: latestData });
// });

// module.exports = router;
