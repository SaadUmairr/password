import { model, Schema } from "mongoose";

const creditCardSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Title field is required"],
            minLength: 3,
        },
        cardHolderName: {
            type: String,
            required: [true, "Card Holder name is required"],
        },
        cardType: {
            type: String,
            enum: [
                "Visa",
                "Mastercard",
                "American Express",
                "Diners Club",
                "Rupay",
            ],
            default: "Rupay",
        },
        cardNumber: {
            type: String,
            required: [true, "Card name is required"],
        },
        expiryDate: {
            type: Date,
            required: [true, "Expiry Date is required"],
        },
        validFrom: {
            type: Date,
            required: [true, "Start date is required"],
        },
        label: {
            type: String,
        },
        issuingBank: {
            type: String,
        },
        phone: {
            type: String,
        },
        altPhone: {
            type: String,
        },
        creditLimit: {
            type: Number,
        },
        cardPIN: {
            type: String,
        },
    },
    { timestamps: true }
);

export const CreditCard = model("CreditCard", creditCardSchema);
