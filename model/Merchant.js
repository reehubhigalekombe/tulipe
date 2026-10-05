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
            shortcode: {
            type: String,
            required: true,
            trim:  true,
            unique: true
            },
        },
    },
    {timestamps: true}
);
const Merchant = mongoose.model("Merchant", merchantSchema)
export default Merchant