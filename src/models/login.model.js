import { model, Schema } from "mongoose";

const loginSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Title field is required"],
            minLength: 3,
        },
        username: {
            type: String,
            required: [true, "Username is required"],
            minLength: 3,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        website: {
            type: String,
            required: [true, "Website is required"],
        },
        notes: {
            type: String,
        },
    },
    { timestamps: true }
);

export const LoginSchema = mongoose.models.Login || model("Login", loginSchema);
