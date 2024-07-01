import mongoose from "mongoose";
import { getDatabaseURL } from "../lib/secret.js";
import { apiError } from "../utils/apiResponse.util.js";

mongoose.Promise = global.Promise;

let connected;

const dbURL = async () => {
    return await getDatabaseURL();
};

const connectToDatabase = async function () {
    if (connected) {
        console.log("EXISTING CONNECTION");
        return Promise.resolve();
    }
    const dbURI = await dbURL().catch(() => {
        return next(new apiError(500, "DB CREDENTIALS ERROR"));
    });
    console.log("NEW CONNECTION");
    return mongoose
        .connect(dbURI, { serverSelectionTimeoutMS: 5000 })
        .then((db) => {
            connected = db.connections[0].readyState;
        })
        .catch((error) => {
            return next(
                new apiError(500, `DB CONNECTION FAILED: ${error.message}`)
            );
        });
};

export { connectToDatabase };
