const puppeteer = require('puppeteer');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
//const axios = require('axios');
const PORT = 8000;

const app = express();
// This is required to handle requests that have a body or else they will return as defined and act ignorant.
app.use(express.json());

const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));

// Create script in package.json to run this backend file, specify by colon
// Start by npm run start:backend
app.post('/test', async(req, res) => {
    const { urlToLookAt } = req.body;
    //console.log(req.body);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(urlToLookAt); // URL is given by the "user" (your client-side application)
    //const screenshotBuffer = await page.screenshot();

    // Respond with the image
    // res.writeHead(200, {
    //     'Content-Type': 'image/png',
    //     'Content-Length': screenshotBuffer.length
    // });
    // res.end(screenshotBuffer);

    await browser.close();
   // res.json(`Puppeteer worked with the ${req.body.urlToLookAt}`);
  res.json({message: `Puppeteer was successfully called with the ${urlToLookAt}`});

})

app.listen(PORT, () => console.log(`Server is listening on PORT ${PORT}`));