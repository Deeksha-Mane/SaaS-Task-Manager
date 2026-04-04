import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"]
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please add a password"]
    },
    googleId: {
        type: String,
        default: null
    },
    githubId: {
        type: String,
        default: null
    },
    calendarTokens: {
        type: Object,
        default: null
    },
    calendarConnected: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// The "Mastery" Hook: Hashes the password BEFORE saving to the database
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model("User", userSchema);