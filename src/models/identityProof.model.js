import { model, Schema } from "mongoose";

const idSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title field is required"],
        minLength: 3,
    },
    idName: {
        type: String,
    },
    firstName: {
        type: String,
    },
    initials: {
        type: String,
    },
    lastName: {
        type: String,
    },
    DOB: {
        type: Date,
    },
    occupation: {
        type: String,
    },
    company: {
        type: String,
    },
    department: {
        type: String,
    },
    jobTitle: {
        type: String,
    },
    label: {
        type: String,
    },
    address: {
        type: String,
    },
    phone: {
        type: String,
    },
    homePhone: {
        type: String,
    },
    email: {
        type: String,
    },
    businessPhone: {
        type: String,
    },
    reminderQuestion: {
        type: [String],
    },
    reminderAnswer: {
        type: [String],
    },
    tags: {
        type: [String],
    },
});

export const IDSchema = model("Identity", idSchema);
