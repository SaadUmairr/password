import { model, Schema } from "mongoose";

const secureNoteSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Title field is required"],
            minLength: 3,
        },
        note: {
            type: String,
            minLength: 3,
        },
        section: {
            type: String,
        },
        tags: {
            type: [String],
        },
    },
    { timestamps: true }
);

export const securedNoteSchema =
    mongoose.models.SecureNote || model("SecureNote", secureNoteSchema);
