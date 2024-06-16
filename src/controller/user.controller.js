import jwt from "jsonwebtoken";
import { getRefreshTokenSecret } from "../lib/secret.js";
import { User } from "../models/User.model.js";
import { apiError, apiResponse } from "../utils/apiResponse.util.js";
import { dbConnection } from "../utils/dbConnection.util.js";

const generateAccessAndRefreshToken = async (userID) => {
    try {
        const user = await User.findById(userID);

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new apiError(
            500,
            error.message || "Error generating Auth tokens"
        );
    }
};

const options = {
    httpOnly: true,
    secure: true,
};

const registerUser = async (req, res, next) => {
    const { username, email, password } = req.body;
    if ([username, email, password].some((field) => field?.trim() === "")) {
        return next(new apiError(400, "All fields are required"));
    }

    try {
        await dbConnection(async () => {
            const existedUser = await User.findOne({
                $or: [{ username }, { email }],
            });

            if (existedUser) throw new apiError(409, "User already exists");

            const user = await User.create({ username, email, password });

            if (!user) throw new apiError(500, "User not created");

            res.status(201).json(
                new apiResponse(201, user, "User Registered Successfully")
            );
        });
    } catch (error) {
        next(new apiError(500, error.message || "Unable to create user"));
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;
    if ([username, password].some((field) => field.trim() === ""))
        throw new apiError(400, "Please fill required fields");
    try {
        const user = await User.findOne({ username }).select("+password");
        if (!user) throw new apiError(404, `${username} does not exist`);
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) throw new apiError(401, "Incorrect Password");
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new apiResponse(200, user, "User logged in successfully"));
    } catch (error) {
        throw new apiError(500, error.message || "Unable to login user");
    }
};

const logoutUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1,
                },
            },
            {
                new: true,
            }
        );
        return res
            .status(200)
            .clearCookie("accessToken")
            .clearCookie("refreshToken")
            .json(new apiResponse(200, {}, "User logged out"));
    } catch (error) {
        throw new apiError(500, error.message || "Unable to logout user");
    }
};

const changeCurrentPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req?.user._id);
        const isPasswordCorrect = await user.comparePassword(oldPassword);

        if (!isPasswordCorrect)
            throw new apiError(400, "Incorrect Old password");

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        return res
            .status(200)
            .json(new apiResponse(200, {}, "Password changed successfully"));
    } catch (error) {
        throw new apiError(500, error.message || "Unable to change password");
    }
};

const getCurrentUser = async (req, res) => {
    try {
        if (!req.user)
            throw new apiError(400, "Request does not contain the user param");
        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    req.user,
                    "Current user fetched successfully"
                )
            );
    } catch (error) {
        throw new apiError(
            500,
            error.message || "Unable to fetch current user"
        );
    }
};

const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refrshToken;
    if (!incomingRefreshToken)
        throw new apiError(400, "Request does not contain token");
    const refreshTokenSecret = await getRefreshTokenSecret();
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            refreshTokenSecret
        );

        const user = await User.findById(decodedToken?._id);
        if (!user) throw new apiError(401, "Invalid refresh token");

        if (incomingRefreshToken !== user?.refreshToken)
            throw new apiError(401, "Refresh token is expired or used");
        const { accessToken, refreshToken: newRefreshToken } =
            await generateAccessAndRefreshToken(user._id);
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new apiResponse(200, {}, "Auth token refresh successfull"));
    } catch (error) {
        throw new apiError(
            500,
            error.message || "Unable to refresh access token"
        );
    }
};

export {
    changeCurrentPassword,
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
};
