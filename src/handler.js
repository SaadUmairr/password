import cookieParser from "cookie-parser";
import express from "express";
import serverless from "serverless-http";

const app = express();

app.use(
    express.json({
        limit: "16kb",
    })
);
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res, next) => {
    return res.status(200).json({
        message: "Hello from root!",
    });
});

app.get("/hello", (req, res, next) => {
    return res.status(200).json({
        message: "Hello from path!",
    });
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

const handler = serverless(app);

export { handler };
