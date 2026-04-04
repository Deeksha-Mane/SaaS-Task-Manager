import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a template name"],
        trim: true
    },
    title: {
        type: String,
        required: [true, "Please add a task title"],
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },
    tags: {
        type: [String],
        default: []
    },
    subtasks: {
        type: [{
            text: {
                type: String,
                required: true
            }
        }],
        default: []
    },
    notes: {
        type: String,
        default: ""
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

export default mongoose.model("Template", templateSchema);
