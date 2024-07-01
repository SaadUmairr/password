import jwt from "jsonwebtoken";
import { connectToDatabase } from "../db/client.js";
import { getAccessTokenSecret } from "../lib/secret.js";
import { User } from "../models/User.model.js";
import { apiError } from "../utils/apiResponse.util.js";

export const verifyJWT = async (req, _, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");
        if (!token) return next(new apiError(401, "Unauthorized request"));
        const accessTokenSecret = await getAccessTokenSecret();
        const decodedToken = jwt.verify(token, accessTokenSecret);
        connectToDatabase().then(async () => {
            try {
                const user = await User.findById(decodedToken?._id);
                if (!user)
                    return next(new apiError(404, "User does not exist"));
                req.user = user;
                next();
            } catch (error) {
                return next(
                    new apiError(500, error.message || "Error finding user")
                );
            }
        });
    } catch (error) {
        return next(
            new apiError(500, error.message || "Auth token verification failed")
        );
    }
};
