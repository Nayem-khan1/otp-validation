const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// const nodeFetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const OTP_LIMIT = 3;
const OTP_EXPIRY_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const otpDatabase = new Map(); // { phoneNumber: [{ otp, expiry }] }

app.use(cors());
app.use(bodyParser.json());


const uri = "mongodb+srv://login-validation:40st39gLEBCQCJGA@cluster0.msmcqlg.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  async function run() {
    try{

        await client.connect(); // Connect to the MongoDB database
        console.log("Connected to the database");
        const coursesCollection = client.db('login-pin').collection('pin-collection');

        app.post('/request-otp', (req, res) => {
            const phoneNumber = req.body.phoneNumber;
            const currentTime = Date.now();
          
            if (!otpDatabase.has(phoneNumber)) {
              otpDatabase.set(phoneNumber, []);
            }
          
            const userOtps = otpDatabase.get(phoneNumber);
            
            if (userOtps.length >= OTP_LIMIT) {
              return res.status(429).json({ error: 'OTP limit exceeded for today.' });
            }
          
            const otp = Math.floor(1000 + Math.random() * 9000);
            userOtps.push({ otp, expiry: currentTime + OTP_EXPIRY_DURATION });
            
            // integrate an SMS service to send the OTP to the user's phone here
            // For this example, we'll just send the OTP back to the frontend


            res.json({ otp });
          });
          
          app.post('/verify-otp', (req, res) => {
            const phoneNumber = req.body.phoneNumber;
            const otp = req.body.otp;
            const currentTime = Date.now();
          
            if (!otpDatabase.has(phoneNumber)) {
              return res.status(404).json({ error: 'No OTP found for this number.' });
            }
          
            const userOtps = otpDatabase.get(phoneNumber);
            const validOtp = userOtps.find(entry => entry.otp === otp && entry.expiry > currentTime);
          
            if (!validOtp) {
              return res.status(400).json({ error: 'Invalid OTP.' });
            }
          
            // Remove the validated OTP from the database
            const updatedOtps = userOtps.filter(entry => entry !== validOtp);
            otpDatabase.set(phoneNumber, updatedOtps);
          
            res.json({ message: 'OTP verified successfully.' });
          });
        
    
    } finally{

    }
  }
  run().catch((error) => console.error(error))


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



//Password: 40st39gLEBCQCJGA
//user : login-validation