import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios"
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000
app.use(cors())
app.use(express.json());

app.get("/", (req, res) => {
    res.json({message: "TuLipe Backend server is running"})
});

app.get("/mpesa/token", async(req, res) => {
    try {
        const auth = Buffer.from(
            `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
        ).toString("base64");
        const response = await axios.get(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
                headers: {
                    Authorization: `Basic ${auth}`
                }
            }
        );
        res.json({access_token: response.data.access_token});
    }catch(error) {
        console.error("Mpesa token error: ", 
            error.response?.data || error.message
        );
        res.status(500).json({
            message: "Failed to obtain mpesa access token"
        })
    }
})

app.post("/mpesa/stkpush", async(req, res) => {
    try {
        const {phone, amount} = req.body;
        if(!phone || ! amount) {
            return res.status(400).json({
                message: "Phone number and amount is required"
            })
        }

        const auth = Buffer.from(
            `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
        ).toString("base64");

        const tokenResponce = await axios.get(
             "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
                headers: {
                    Authorization: `Basic ${auth}`
                }
             }
        );
        const accessToken = tokenResponce.data.access_token;
        let formattedPhone = phone.replace(/\D/g, "");
        if(formattedPhone.startsWith("0")) {
            formattedPhone = "254" + formattedPhone.substring(1)
        }

        if(!formattedPhone.startsWith("254")) {
        return res.status(400).json({
            message: "Enter a valid Kenyan Conatct"
        })
        };

        const date = new Date();
        const timeStamp = 
        date.getFullYear().toString() +
        String(date.getMonth() + 1).padStart(2, "0") +
          String(date.getDate()).padStart(2, "0") +
          String(date.getHours()).padStart(2, "0") +
          String(date.getMinutes()).padStart(2, "0") +
          String(date.getSeconds()).padStart(2, "0");


          const shortCode = 174379
          const password = Buffer.from(
            shortCode + process.env.MPESA_PASSKEY + 
            timeStamp
          ).toString("base64");
          const stkResponse = await axios.post(
             "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
             {
                BusinessShortCode: shortCode,
                Password: password,
                Timestamp: timeStamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: Number(amount),
                PartyA: formattedPhone,
                PartyB: shortCode,
                PhoneNumber: formattedPhone,
                CallBackURL: "https://tulipe.onrender.com/callback",
                AccountReference: "TuLipe",
                TransactionDesc: "Tulipe Payment"
             },
             {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
             }
          );
          res.json(stkResponse.data)
    }catch(error) {
        console.error(
            "STK push error: ", error.response?.data || error.message
        );
        res.status(500).json({
            message: "Failed to initiate the STK push",
            error: error.response?.data || error.message
        })
    }
})
app.post("/callback", (req, res) => {
    console.log("MPESA callBack was received");
    console.log(JSON.stringify(req.body, null, 2));
    res.json({
        ResultCode: 0,
        ResultDesc: "Accepted"
    })

})

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tulipe Backend is running on Port ${PORT}`)
})
