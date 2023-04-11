const express = require('express');
const bodyParser = require('body-parser');
const bwipjs = require('bwip-js'); //barcode package
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const apiKeys = new Set(); // Create a set to store the API keys

// Load the API keys from Azure and add them to the set
apiKeys.add(process.env.API_KEY_1);
apiKeys.add(process.env.API_KEY_2);

// API key middleware
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.get('X-API-KEY') || req.query.apiKey; // Get the API key from the request header or query parameter
  if (apiKeys.has(apiKey)) {
    next(); // API key is valid, proceed to the next middleware/handler
  } else {
    res.status(401).send('Unauthorized'); // API key is not valid, send a 401 Unauthorized error
  }
};

// API 1 with API key middleware
app.post('/api/generateBarcode', apiKeyMiddleware, async (req, res) => {
  //Post request to generate barcode, takes in barcodeNumber from body of the api call 
  const barcodeNumber = req.body.barcodeNumber;
  if(!barcodeNumber){
    //if statment to check if the barcodeNumber is in the body of the call, if its not return 400 error
    return res.sendStatus(400);
  }
  const barcodeOptions = {
      bcid:'code128',
      text:barcodeNumber,
      width:600,
      height:200
  };
  const pngBuffer =  await bwipjs.toBuffer(barcodeOptions);
  // Convert the barcode image to a base64-encoded string
  const base64Image = pngBuffer.toString('base64');

  res.status(201).json({
    body: base64Image
  })
});

// API 2 with API key middleware
app.post('/api/generateQRCode', apiKeyMiddleware, async (req, res) => {
  //Post request to generate a QR Code, takes in qrCodeText from body of the api call 
  const qrcodeText = req.body.qrcodeText;
  if(!qrcodeText){
    //if statment to check if the qrcodeText is in the body of the call, if its not return 400 error
    return res.sendStatus(400);
  }
  const qrCodeOptions = {
    bcid:'qrcode',
    text:qrcodeText,
    width:400,
    height:400
  };
  const pngBuffer =  await bwipjs.toBuffer(qrCodeOptions);
  // Convert the qrcode image to a base64-encoded string
  const base64Image = pngBuffer.toString('base64');

  res.status(201).json({
    body: base64Image
  })
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
