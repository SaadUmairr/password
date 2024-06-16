import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Schema, model } from "mongoose";
import { getAccessTokenSecret, getRefreshTokenSecret } from "../lib/secret.js";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            minLength: 3,
            lowercase: true,
            index: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            minLength: 3,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            select: false,
            minLength: 8,
            maxLength: 50,
        },
        avatar: {
            type: String,
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user",
            select: false,
        },
        refreshToken: {
            type: String,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 16);
    next();
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
    const accessTokenSecret = await getAccessTokenSecret();
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
        },
        accessTokenSecret,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

userSchema.methods.generateRefreshToken = async function () {
    const refreshTokenSecret = await getRefreshTokenSecret();
    return jwt.sign(
        {
            _id: this._id,
        },
        refreshTokenSecret,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

export const User = model("User", userSchema);
