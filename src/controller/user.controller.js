import jwt from "jsonwebtoken";
import { connectToDatabase } from "../db/client.js";
import { getRefreshTokenSecret } from "../lib/secret.js";
import { User } from "../models/User.model.js";
import { apiError, apiResponse } from "../utils/apiResponse.util.js";

const generateAccessAndRefreshToken = async (userID) => {
    try {
        const user = await User.findById(userID);

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        return next(
            new apiError(500, error.message || "Error generating Auth tokens")
        );
    }
};

const options = {
    httpOnly: true,
    secure: true,
};

// const registerUser = async (req, res, next) => {
//     const { username, email, phone, password } = req.body;
//     console.log(
//         `USER: ${username} EMAIL: ${email} PHONE: ${phone} PASSWORD: ${password}`
//     );
//     if (
//         [username, email, phone, password].some((field) => field?.trim() === "")
//     ) {
//         return next(new apiError(400, "All fields are required"));
//     }

//     try {
//         connectToDatabase().then(async () => {
//             const existingUser = await User.findOne({
//                 $or: [{ username }, { email }, { phone }],
//             });

//             if (existingUser) return next(new apiError(409, "User already exists"));

//             const user = await User.create({
//                 username,
//                 email,
//                 phone,
//                 password,
//             });

//             if (!user) return next(new apiError(500, "User not created"));
//             console.log(`USER: ${username} is created`);
//             res.status(201).json(
//                 new apiResponse(201, user, "User Registered Successfully")
//             );
//         });
//     } catch (error) {
//         next(new apiError(500, error.message || "Unable to create user"));
//     }
// };

const registerUser = async (req, res, next) => {
    const { username, email, phone, password } = req.body;
    console.log(
        `USER: ${username} EMAIL: ${email} PHONE: ${phone} PASSWORD: ${password}`
    );
    if (
        [username, email, phone, password].some((field) => field?.trim() === "")
    ) {
        return next(new apiError(400, "All fields are required"));
    }

    try {
        await connectToDatabase();
        const existingUser = await User.findOne({
            $or: [{ username }, { email }, { phone }],
        });

        if (existingUser) return next(new apiError(409, "User already exists"));

        const user = await User.create({ username, email, phone, password });

        if (!user) return next(new apiError(500, "User not created"));
        console.log(`USER: ${username} is created`);
        res.status(201).json(
            new apiResponse(201, user, "User Registered Successfully")
        );
    } catch (error) {
        next(new apiError(500, error.message || "Unable to create user"));
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;
    if ([username, password].some((field) => field.trim() === ""))
        return next(new apiError(400, "Please fill required fields"));
    connectToDatabase().then(async () => {
        try {
            const user = await User.findOne({ username }).select("+password");
            if (!user)
                return next(new apiError(404, `${username} does not exist`));
            const isPasswordCorrect = await user.comparePassword(password);
            if (!isPasswordCorrect)
                return next(new apiError(401, "Incorrect Password"));
            const { accessToken, refreshToken } =
                await generateAccessAndRefreshToken(user._id);

            return res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json(
                    new apiResponse(200, user, "User logged in successfully")
                );
        } catch (error) {
            return next(
                new apiError(500, error.message || "Unable to login user")
            );
        }
    });
};

const logoutUser = async (req, res) => {
    connectToDatabase().then(async () => {
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
            return next(
                new apiError(500, error.message || "Unable to logout user")
            );
        }
    });
};

const changeCurrentPassword = async (req, res) => {
    connectToDatabase().then(async () => {
        try {
            const { oldPassword, newPassword } = req.body;

            const user = await User.findById(req?.user._id).select("+password");
            if (!user) return next(new apiError(404, "User does not exist"));

            if (user.username !== req.user.username)
                return next(new apiError(401, "UNAUTHORIZED REQUEST"));
            const isPasswordCorrect = await user.comparePassword(oldPassword);

            if (!isPasswordCorrect)
                return next(new apiError(400, "Incorrect Old password"));

            user.password = newPassword;
            await user.save({ validateBeforeSave: false });

            return res
                .status(200)
                .json(
                    new apiResponse(200, {}, "Password changed successfully")
                );
        } catch (error) {
            return next(
                new apiError(500, error.message || "Unable to change password")
            );
        }
    });
};

const getCurrentUser = async (req, res) => {
    try {
        if (!req.user)
            return next(new apiError(400, "Request does not contain the user"));
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
        return next(
            new apiError(500, error.message || "Unable to fetch current user")
        );
    }
};

const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken)
        return next(new apiError(400, "User is not logged in "));

    const refreshTokenSecret = await getRefreshTokenSecret();

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            refreshTokenSecret
        );

        connectToDatabase().then(async () => {
            const user = await User.findById(decodedToken?._id).select(
                "+refreshToken"
            );
            if (!user) return next(new apiError(401, "Invalid refresh token"));

            if (incomingRefreshToken !== user?.refreshToken)
                return next(
                    new apiError(401, "Refresh token is expired or used")
                );
            const {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            } = await generateAccessAndRefreshToken(user._id);
            return res
                .status(200)
                .cookie("accessToken", newAccessToken, options)
                .cookie("refreshToken", newRefreshToken, options)
                .json(
                    new apiResponse(200, {}, "Auth token refresh successfull")
                );
        });
    } catch (error) {
        return next(
            new apiError(500, error.message || "Unable to refresh access token")
        );
    }
};

const emptyUserCollection = async (_, res) => {
    await connectToDatabase();
    try {
        await User.deleteMany({});
        return res
            .status(202)
            .json(new apiResponse(202, {}, "User collection emptied"));
    } catch (error) {}
};

export {
    changeCurrentPassword,
    emptyUserCollection,
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
};
