import { connectToDatabase } from "../db/client.js";
import { apiError } from "./apiResponse.util.js";

const dbConnection = (functionHandler) => {
    return connectToDatabase()
        .then(() => functionHandler())
        .catch((error) => {
            throw new apiError(500, error.message || "Unable to connect to DB");
        });
};

export { dbConnection };
