import cookieParser from "cookie-parser";
import express from "express";
import serverless from "serverless-http";
import { apiResponse } from "./utils/apiResponse.util.js";

const app = express();

app.use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use(cookieParser())
    .use(express.static("public"));

app.get("/", (_, res) => {
    return res.status(200).json(new apiResponse(200, {}, "Hello!"));
});

// Routes Import
import { BASE_URL } from "./constant.js";
import userRouter from "./routes/userRouter.routes.js";

// Routes Declaration
app.use(`${BASE_URL}/user`, userRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        statusCode: err.statusCode,
        error: err.message || "Internal Server Error",
        success: false,
    });
});

app.use((req, res, next) => {
    return res.status(404).json({
        error: "Not Found",
    });
});

export const handler = serverless(app);

// export const handler = serverless(app, {
//     request: (request, event, context) => {
//         context.callbackWaitsForEmptyEventLoop = false;
//     },
// });
