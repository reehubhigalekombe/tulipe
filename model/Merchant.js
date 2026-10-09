import mongoose from "mongoose";
const merchantSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim:  true
        },
        businessName: {
             type: String,
            required: true,
            trim:  true
        },
        phoneNumber: {
             type: String,
            required: true,
            trim:  true,
            unique: true,
        },
        password: {
             type: String,
            required: true,
        },
        merchant: {
            paymentMethod: {
                type: String,
                enum:["till", "paybill"], 
                required: true,
            },
            shortcode: {
            type: String,
            required: true,
            trim:  true,
            unique: true
            },
            accountNumber: {
                type: String,
                trim: true,
                default: null
            },
        },
    },
    {timestamps: true}
);
const Merchant = mongoose.model("Merchant", merchantSchema)
export default Merchant