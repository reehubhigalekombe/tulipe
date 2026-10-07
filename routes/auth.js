import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Merchant from "../model/Merchant.js";

const router = express.Router();

router.post("/register",  async(req, res) => {
    try {
        const {fullName, businessName, phoneNumber, password, paymentMethod, shortcode, accountNumber,} = req.body;
        if(!fullName || !businessName || !phoneNumber || !password || !paymentMethod || !shortcode) {
            return res.status(400).json({
                message: "All fields are required for registartion"
            });    
        }

        if(paymentMethod === "paybill" & !accountNumber) {
            return res.status(400).json({
                message: "The Paybill account number is required"
            })
        }
         const existingPhone = await Merchant.findOne({phoneNumber});
      if(existingPhone) {
        return res.status(409).json({
            message: "This phone number is already registered"
        })
      };
const existingShortCode = await Merchant.findOne({
    "merchant.shortcode": shortcode
})
          if(existingShortCode) {
        return res.status(409).json({
            message: "This Till or Paybill is is already registered"
        })
      };

      const hashedPassword = await bcrypt.hash(password, 10);

      const merchant = await Merchant.create({
        fullName, businessName, phoneNumber, password: hashedPassword,
        merchant: {
            paymentMethod,
            shortcode, accountNumber: paymentMethod === " paybill"
            ? accountNumber: null
        }
      });

      res.status(201).json({
        message: "Merchant registered Sucessfully", 
            merchant: {
                id: merchant._id,
                fullName: merchant.fullName,
                businessName: merchant.businessName,
                phoneNumber: merchant.phoneNumber,
                paymentMethod: merchant.merchant.paymentMethod,
                shortcode: merchant.merchant.shortcode,
                accountNumber: merchant.merchant.accountNumber,
            }
        }
      )

    }catch(error) {
        console.error(
"Registration error: " , error
        )
        res.status(500).json({
            message: "Failed to register the Merchant"
        })
    }
});

router.post("/login", async(req, res) => {

try{
    const {phoneNumber, password }= req.body;
    if(!phoneNumber || !password) {
        return res.status(400).json({
            message: "phone number and password arer required"
        })
    };

    const merchant = await Merchant.findOne({
        phoneNumber
    })
    if(!merchant) {
        return res.status(401).json({
            message: "Invalid phone number or password"
        })
    }

    const passwordMatch = await bcrypt.compare(password, merchant.password)

    if(!passwordMatch) {
        return res.status(401).json({
            message: "Invalid phone number or password"
        })
    }

    const token = jwt.sign({
        merchantId: merchant._id
    }, 
process.env.JWT_SECRET, { expiresIn: "1d"});

    res.status(200).json({
        message: "Login Success",
        token,
        merchant: {
            id: merchant._id,
             fullName: merchant.fullName,
             businessName: merchant.businessName,
             phoneNumber: merchant.phoneNumber,
             paymentMethod: merchant.merchant.paymentMethod,
             shortcode: merchant.merchant.shortcode,
             accountNumber: merchant.merchant.accountNumber,
        }
    })
}catch(error) {
    console.error("Login error: ", error)
    res.status(500).json({
        message: "Login failed"
    })

}
})

export default router