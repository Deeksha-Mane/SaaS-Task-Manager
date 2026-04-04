import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please add a task title"],
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },
    dueDate: {
        type: Date,
        default: null
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
            },
            completed: {
                type: Boolean,
                default: false
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        default: []
    },
    notes: {
        type: String,
        default: ""
    },
    order: {
        type: Number,
        default: 0
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringPattern: {
        type: String,
        enum: ["daily", "weekly", "monthly", ""],
        default: ""
    },
    lastRecurred: {
        type: Date,
        default: null
    },
    reminderEnabled: {
        type: Boolean,
        default: false
    },
    reminderDate: {
        type: Date,
        default: null
    },
    reminderSent: {
        type: Boolean,
        default: false
    },
    calendarEventId: {
        type: String,
        default: null
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
