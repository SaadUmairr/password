import jwt from "jsonwebtoken";
import { getAccessTokenSecret } from "../lib/secret.js";
import { User } from "../models/User.model.js";
import { apiError } from "../utils/apiResponse.util.js";

export const verifyJWT = async (req, _, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");
        if (!token) throw new apiError(401, "Unauthorized request");
        const accessTokenSecret = await getAccessTokenSecret();
        const decodedToken = jwt.verify(token, accessTokenSecret);
        const user = await User.findById(decodedToken?._id);
        if (!user) throw new apiError(404, "User does not exist");
        req.user = user;
        next();
    } catch (error) {
        throw new apiError(500, "Auth token verification failed");
    }
};
