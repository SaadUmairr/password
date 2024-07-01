import { Router } from "express";
import {
    changeCurrentPassword,
    emptyUserCollection,
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
} from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);

userRouter.route("/empty").post(emptyUserCollection);

// Secured Routes
userRouter.route("/get-currrent-user").get(verifyJWT, getCurrentUser);
userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter.route("/refresh-auth").post(refreshAccessToken);
userRouter.route("/change-password").patch(verifyJWT, changeCurrentPassword);

export default userRouter;
