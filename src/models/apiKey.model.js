import { model, Schema } from "mongoose";

const apiKeySchema = new Schema({});

export const ApiKey = mongoose.models.apiKey || model("apiKey", apiKeySchema);
