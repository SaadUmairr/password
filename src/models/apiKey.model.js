import { model, Schema } from "mongoose";

const apiKeySchema = new Schema({});

export const ApiKey = model("apiKey", apiKeySchema);
